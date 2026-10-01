import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Save, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  FileText,
  Accessibility,
  Droplets,
  Zap,
  Armchair,
  Bath,
  Umbrella,
  Signpost
} from 'lucide-react';
import { PollingBooth, FacilityKey, FacilityStatus } from '../types';
import { MANDATORY_FACILITIES } from '../data/initialData';

interface InspectionModalProps {
  booth: PollingBooth | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBooth: PollingBooth) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  booth,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !booth) return null;

  const [formData, setFormData] = useState<PollingBooth>({ ...booth });

  const handleFacilityChange = (key: FacilityKey, status: FacilityStatus) => {
    setFormData(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const getFacilityIcon = (key: FacilityKey) => {
    switch (key) {
      case 'ramp': return <Accessibility className="w-4 h-4 text-amber-700" />;
      case 'water': return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'electricity': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'furniture': return <Armchair className="w-4 h-4 text-slate-700" />;
      case 'toilet': return <Bath className="w-4 h-4 text-emerald-600" />;
      case 'shed': return <Umbrella className="w-4 h-4 text-indigo-600" />;
      case 'signage': return <Signpost className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-xs">
                बूथ सं० {booth.boothNo}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {booth.village}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-1 text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{booth.boothName}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
          
          {/* Facility Status Radio/Button Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-1">
              7 अनिवार्य सुविधाएं स्थिति (7 Assured Minimum Facilities):
            </h3>

            <div className="space-y-2">
              {MANDATORY_FACILITIES.map(facility => {
                const current = formData[facility.key];
                return (
                  <div 
                    key={facility.key}
                    className="p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2">
                      {getFacilityIcon(facility.key)}
                      <div>
                        <span className="font-bold text-slate-900">{facility.hindiName}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5 hidden sm:inline">({facility.englishName})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFacilityChange(facility.key, 'उपलब्ध')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                          current === 'उपलब्ध'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        उपलब्ध
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFacilityChange(facility.key, 'मरम्मत योग्य')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                          current === 'मरम्मत योग्य'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        मरम्मत योग्य
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFacilityChange(facility.key, 'अनुपलब्ध')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                          current === 'अनुपलब्ध'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        अनुपलब्ध
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Polling Station Details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-1">
              मतदान केंद्र व अधिकारी विवरण (Officers & Remarks):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  बीएलओ (BLO) का नाम:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.bloName || ''}
                    onChange={(e) => setFormData({ ...formData, bloName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  बीएलओ संपर्क नंबर:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.bloPhone || ''}
                    onChange={(e) => setFormData({ ...formData, bloPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                सेक्टर मजिस्ट्रेट / नोडल अधिकारी:
              </label>
              <input
                type="text"
                value={formData.sectorMagistrate || ''}
                onChange={(e) => setFormData({ ...formData, sectorMagistrate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                सुविधा संबंधी भौतिक निरीक्षण टिप्पणी:
              </label>
              <textarea
                rows={2}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="उदा. हैंडपंप चालू है, रैम्प की ढलान सही है..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-verified-check"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <label htmlFor="is-verified-check" className="text-xs font-medium text-slate-800 cursor-pointer">
                इस केंद्र का भौतिक सत्यापन (Physical Verification) पूर्ण हो चुका है
              </label>
            </div>
          </div>

          {/* Footer buttons inside form */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>विवरण सुरक्षित करें</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
