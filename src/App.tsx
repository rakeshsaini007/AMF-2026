/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { VillageFilter } from './components/VillageFilter';
import { SummaryStats } from './components/SummaryStats';
import { BoothCard } from './components/BoothCard';
import { InspectionModal } from './components/InspectionModal';
import { ActionAlertModal } from './components/ActionAlertModal';
import { INITIAL_BOOTHS, ALL_41_VILLAGES } from './data/initialData';
import { PollingBooth, FacilityKey, FacilityStatus } from './types';
import { getAppsScriptUrl } from './config';
import { 
  fetchBoothsFromAppsScript, 
  saveOrUpdateBoothInAppsScript 
} from './services/appsScriptApi';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export default function App() {
  const [booths, setBooths] = useState<PollingBooth[]>(INITIAL_BOOTHS);
  const [villages, setVillages] = useState<string[]>(() => {
    const set = new Set<string>();
    ALL_41_VILLAGES.forEach(v => set.add(v.trim()));
    INITIAL_BOOTHS.forEach(b => set.add(b.village.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'hi'));
  });
  
  // Default selected village: empty by default so dropdown shows "गांव का नाम चुनें (Select Village Name)"
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  
  // Apps Script state
  const [scriptUrl] = useState<string>(getAppsScriptUrl);
  const [sheetTitle, setSheetTitle] = useState<string>('Google Sheet: मतदेय स्थलो पर न्यूनतम सुविधाएँ (AMF)');
  
  // Edit Modal
  const [editingBooth, setEditingBooth] = useState<PollingBooth | null>(null);

  // Action Alert Dialog (Save vs Update vs Validation)
  const [actionAlert, setActionAlert] = useState<{
    isOpen: boolean;
    type: 'save' | 'update' | 'validation';
    boothNo: string;
    message: string;
  } | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load data from Apps Script
  const loadData = useCallback(async () => {
    try {
      const res = await fetchBoothsFromAppsScript(scriptUrl);
      if (res.booths && res.booths.length > 0) {
        setBooths(res.booths);
        const combined = new Set<string>();
        ALL_41_VILLAGES.forEach(v => combined.add(v.trim()));
        (res.villages || []).forEach(v => combined.add(v.trim()));
        res.booths.forEach(b => combined.add(b.village.trim()));
        const fullVillages = Array.from(combined).sort((a, b) => a.localeCompare(b, 'hi'));
        
        setVillages(fullVillages);
        setSelectedVillage(prev => {
          if (!prev) return '';
          if (prev === 'all') return 'all';
          if (fullVillages.includes(prev)) return prev;
          return '';
        });
        if (res.sheetTitle) setSheetTitle(res.sheetTitle);
      }
    } catch (err: any) {
      console.error(err);
    }
  }, [scriptUrl]);

  // Initial fetch
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  // Handle Save or Update Booth (Submit vs Update Button action)
  const handleSaveOrUpdateBooth = async (booth: PollingBooth) => {
    // Check mandatory 7 facilities
    const mandatoryFacilities: { key: FacilityKey; name: string }[] = [
      { key: 'ramp', name: 'रैम्प' },
      { key: 'water', name: 'पीने का पानी' },
      { key: 'electricity', name: 'पर्याप्त विद्युत व्यवस्था' },
      { key: 'furniture', name: 'पर्याप्त फर्नीचर' },
      { key: 'toilet', name: 'शौचालय' },
      { key: 'shed', name: 'शेड' },
      { key: 'signage', name: 'प्रॉपर साइनेज' }
    ];

    const missing = mandatoryFacilities.filter(f => !booth[f.key] || String(booth[f.key]).trim() === '');
    if (missing.length > 0) {
      const missingNames = missing.map(m => m.name).join(', ');
      setActionAlert({
        isOpen: true,
        type: 'validation',
        boothNo: booth.boothNo,
        message: `सभी 7 सुविधाएं अनिवार्य हैं (All fields are mandatory)! कृपया निम्नलिखित सुविधाएं भरें: ${missingNames}`
      });
      showToast(`सभी 7 सुविधाएं अनिवार्य हैं!`, 'error');
      return;
    }

    const isUpdate = Boolean(booth.hasExistingData);
    const actionType: 'save' | 'update' = isUpdate ? 'update' : 'save';

    // 1. Mark hasExistingData as true in local state
    setBooths(prev => prev.map(b => b.boothNo === booth.boothNo ? { ...b, hasExistingData: true } : b));

    // 2. Trigger prominent Alert
    const alertMsg = isUpdate
      ? `बूथ सं० ${booth.boothNo} (${booth.village}) का डेटा सफलतापूर्वक अपडेट (Update) किया गया!`
      : `बूथ सं० ${booth.boothNo} (${booth.village}) का डेटा सफलतापूर्वक सुरक्षित (Save) किया गया!`;

    setActionAlert({
      isOpen: true,
      type: actionType,
      boothNo: booth.boothNo,
      message: alertMsg
    });

    showToast(alertMsg, 'success');

    // 3. Sync to Google Apps Script
    if (scriptUrl) {
      try {
        await saveOrUpdateBoothInAppsScript(scriptUrl, {
          rowIndex: booth.rowIndex || 2,
          boothNo: booth.boothNo,
          facilities: {
            ramp: booth.ramp,
            water: booth.water,
            electricity: booth.electricity,
            furniture: booth.furniture,
            toilet: booth.toilet,
            shed: booth.shed,
            signage: booth.signage
          },
          remarks: booth.remarks,
          wasExisting: isUpdate
        });
      } catch (err) {
        console.warn('Sync failed:', err);
      }
    }
  };

  // Handle Facility Update
  const handleUpdateFacility = async (
    boothNo: string, 
    facilityKey: FacilityKey, 
    newStatus: FacilityStatus, 
    rowIndex?: number
  ) => {
    const targetBooth = booths.find(b => b.boothNo === boothNo);
    const isUpdate = Boolean(targetBooth?.hasExistingData);
    const actionType: 'save' | 'update' = isUpdate ? 'update' : 'save';

    // 1. Optimistic local state update
    setBooths(prev => prev.map(b => {
      if (b.boothNo === boothNo) {
        return { ...b, [facilityKey]: newStatus, hasExistingData: true };
      }
      return b;
    }));

    const alertMsg = isUpdate
      ? `बूथ सं० ${boothNo} की सुविधा स्थिति सफलतापूर्वक अपडेट (Update) की गई!`
      : `बूथ सं० ${boothNo} की सुविधा स्थिति सफलतापूर्वक सुरक्षित (Save) की गई!`;

    setActionAlert({
      isOpen: true,
      type: actionType,
      boothNo: boothNo,
      message: alertMsg
    });

    showToast(alertMsg, 'success');

    // 2. Sync to Google Apps Script
    if (scriptUrl) {
      try {
        await saveOrUpdateBoothInAppsScript(scriptUrl, {
          rowIndex: rowIndex || 2,
          boothNo,
          facilityKey,
          newStatus,
          wasExisting: isUpdate
        });
      } catch (err) {
        console.warn('Sync failed:', err);
      }
    }
  };

  // Handle Remark Update
  const handleUpdateRemark = async (boothNo: string, newRemarks: string, rowIndex?: number) => {
    const targetBooth = booths.find(b => b.boothNo === boothNo);
    const isUpdate = Boolean(targetBooth?.hasExistingData);
    const actionType: 'save' | 'update' = isUpdate ? 'update' : 'save';

    setBooths(prev => prev.map(b => b.boothNo === boothNo ? { ...b, remarks: newRemarks, hasExistingData: true } : b));

    const alertMsg = isUpdate
      ? `बूथ सं० ${boothNo} की टिप्पणी सफलतापूर्वक अपडेट (Update) की गई!`
      : `बूथ सं० ${boothNo} की टिप्पणी सफलतापूर्वक सुरक्षित (Save) की गई!`;

    setActionAlert({
      isOpen: true,
      type: actionType,
      boothNo: boothNo,
      message: alertMsg
    });

    showToast(alertMsg, 'success');

    if (scriptUrl) {
      try {
        await saveOrUpdateBoothInAppsScript(scriptUrl, {
          rowIndex: rowIndex || targetBooth?.rowIndex || 2,
          boothNo,
          remarks: newRemarks,
          wasExisting: isUpdate
        });
      } catch (err) {
        console.warn('Sync failed:', err);
      }
    }
  };

  // Handle Full Booth Edit Save
  const handleSaveBoothInspection = async (updatedBooth: PollingBooth) => {
    const isUpdate = Boolean(updatedBooth.hasExistingData);
    setBooths(prev => prev.map(b => b.boothNo === updatedBooth.boothNo ? { ...updatedBooth, hasExistingData: true } : b));
    
    const alertMsg = isUpdate
      ? `बूथ सं० ${updatedBooth.boothNo} का विवरण सफलतापूर्वक अपडेट (Update) हुआ`
      : `बूथ सं० ${updatedBooth.boothNo} का विवरण सफलतापूर्वक सुरक्षित (Save) हुआ`;

    setActionAlert({
      isOpen: true,
      type: isUpdate ? 'update' : 'save',
      boothNo: updatedBooth.boothNo,
      message: alertMsg
    });

    showToast(alertMsg, 'success');
  };

  // Normalization helper to prevent any whitespace or unicode mismatch
  const normalizeVillage = (v?: string) => {
    if (!v) return '';
    return v
      .trim()
      .toLowerCase()
      .normalize('NFC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ');
  };

  // Filtered Booths calculation: purely by selected village
  const filteredBooths = useMemo(() => {
    if (!selectedVillage || selectedVillage === 'all') {
      return booths;
    }
    const target = normalizeVillage(selectedVillage);
    return booths.filter(b => normalizeVillage(b.village) === target);
  }, [booths, selectedVillage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div className={`px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border-emerald-500' 
              : 'bg-rose-900 text-white border-rose-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header sheetTitle={sheetTitle} />

      {/* Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Village Selection Card (Above Card) */}
        <VillageFilter
          villages={villages}
          selectedVillage={selectedVillage}
          onSelectVillage={setSelectedVillage}
          booths={booths}
        />

        {/* If no village is selected yet */}
        {!selectedVillage ? (
          <div className="bg-white border-2 border-dashed border-amber-300 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
              <Layers className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                गांव का नाम चुनें (Select Village Name)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                मतदान केंद्रों (Polling Booths) के विवरण और उनकी 7 अनिवार्य सुविधाएं देखने हेतु कृपया ऊपर दिए गए ड्रॉपडाउन मेनू से <strong>गांव का नाम चुनें</strong>।
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Section Heading & Result Counter - Directly Below Village Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600 shrink-0" />
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedVillage === 'all' ? (
                    <span>समस्त {villages.length} ग्राम पंचायतों के सभी मतदान केंद्र ({filteredBooths.length})</span>
                  ) : (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span>चयनित गांव: <strong className="text-amber-700 underline decoration-amber-300 font-extrabold text-xl">{selectedVillage}</strong></span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        कुल {filteredBooths.length} मतदान केंद्र कार्ड
                      </span>
                    </span>
                  )}
                </h2>
              </div>

              <span className="text-xs text-slate-500">
                प्रत्येक कार्ड में अनिवार्य 7 सुविधाएं: <strong>रैम्प, पेयजल, विद्युत, फर्नीचर, शौचालय, शेड, साइनेज</strong>
              </span>
            </div>

            {/* All Booth Cards Grid - Displayed Directly Below Select Village Name Card */}
            {filteredBooths.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">कोई मतदान केंद्र नहीं मिला</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  चयनित गांव के अनुसार कोई बूथ प्रदर्शित नहीं हो सका। कृपया अन्य गांव चुनें।
                </p>
                <button
                  onClick={() => setSelectedVillage('all')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  सभी गांव देखें
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredBooths.map(booth => (
                  <BoothCard
                    key={booth.boothNo}
                    booth={booth}
                    onUpdateFacility={handleUpdateFacility}
                    onUpdateRemark={handleUpdateRemark}
                    onSaveOrUpdate={handleSaveOrUpdateBooth}
                    onOpenEdit={(b) => setEditingBooth(b)}
                  />
                ))}
              </div>
            )}

            {/* Aggregate Analytics & Compliance Bar (Below the booth cards) */}
            <SummaryStats
              selectedVillage={selectedVillage}
              filteredBooths={filteredBooths}
              totalAllBooths={booths.length}
            />
          </>
        )}

      </main>

      {/* Edit Inspection Modal */}
      <InspectionModal
        booth={editingBooth}
        isOpen={!!editingBooth}
        onClose={() => setEditingBooth(null)}
        onSave={handleSaveBoothInspection}
      />

      {/* Action Alert Modal (Data Saved / Data Updated) */}
      {actionAlert && (
        <ActionAlertModal
          isOpen={actionAlert.isOpen}
          onClose={() => setActionAlert(null)}
          type={actionAlert.type}
          boothNo={actionAlert.boothNo}
          message={actionAlert.message}
        />
      )}

    </div>
  );
}
