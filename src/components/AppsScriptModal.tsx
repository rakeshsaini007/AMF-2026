import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileCode, 
  Link2,
  RefreshCw,
  Database
} from 'lucide-react';
import { isValidAppsScriptUrl } from '../config';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (url: string) => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string }>;
}

const APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * 🗳️ बूथ सुविधा दर्पण (Polling Station Facilities AMF Dashboard) - Google Apps Script
 * ==============================================================================
 */

const SHEET_NAME = ""; // यदि खाली है तो पहली शीट उपयोग होगी

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    
    if (!sheet) {
      return createJsonResponse({ status: "error", message: "Sheet not found" });
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length < 2) {
      return createJsonResponse({ status: "success", total: 0, villages: [], data: [] });
    }

    const headers = values[0].map(h => String(h).trim());
    
    const findIndex = (possibleNames) => {
      return headers.findIndex(h => {
        const clean = h.toLowerCase().replace(/[\\s\\-_.]/g, "");
        return possibleNames.some(p => clean.includes(p.toLowerCase().replace(/[\\s\\-_.]/g, "")));
      });
    };

    const idxBoothNo = findIndex(["बूथ सं", "बूथ नं", "booth no", "booth"]);
    const idxVillage = findIndex(["गांव का नाम", "गाँव का नाम", "ग्राम", "village"]);
    const idxBoothName = findIndex(["बूथ का नाम", "मतदान केंद्र", "polling station", "booth name"]);
    const idxRamp = findIndex(["रैम्प", "रैंप", "ramp"]);
    const idxWater = findIndex(["पीने का पानी", "पेयजल", "drinking water", "water"]);
    const idxElectricity = findIndex(["पर्याप्त विद्युत", "विद्युत व्यवस्था", "electricity"]);
    const idxFurniture = findIndex(["पर्याप्त फर्नीचर", "फर्नीचर", "furniture"]);
    const idxToilet = findIndex(["शौचालय", "टॉयलेट", "toilet"]);
    const idxShed = findIndex(["शेड", "छाया", "shed"]);
    const idxSignage = findIndex(["प्रॉपर साइनेज", "साइनेज", "signage"]);

    const rows = [];
    const villageSet = new Set();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const isRowEmpty = row.every(c => c === "" || c === null || c === undefined);
      if (isRowEmpty) continue;

      const boothNo = idxBoothNo !== -1 ? row[idxBoothNo] : i;
      const village = idxVillage !== -1 && row[idxVillage] ? String(row[idxVillage]).trim() : "अज्ञात";
      const boothName = idxBoothName !== -1 && row[idxBoothName] ? String(row[idxBoothName]).trim() : ("बूथ सं० " + boothNo);

      if (village) villageSet.add(village);

      const parseStatus = (val) => {
        if (val === true || val === 1 || val === "1") return "उपलब्ध";
        if (!val) return "अनुपलब्ध";
        const str = String(val).trim().toLowerCase();
        if (["उपलब्ध", "हाँ", "हा", "yes", "y", "ok", "true", "✓", "✔"].includes(str)) return "उपलब्ध";
        if (["कार्य प्रगति पर", "मरम्मत योग्य", "आंशिक", "repair"].includes(str)) return "मरम्मत योग्य";
        return "अनुपलब्ध";
      };

      const record = {
        rowIndex: i + 1,
        boothNo: String(boothNo).trim(),
        village: village,
        boothName: boothName,
        ramp: idxRamp !== -1 ? parseStatus(row[idxRamp]) : "अनुपलब्ध",
        water: idxWater !== -1 ? parseStatus(row[idxWater]) : "अनुपलब्ध",
        electricity: idxElectricity !== -1 ? parseStatus(row[idxElectricity]) : "अनुपलब्ध",
        furniture: idxFurniture !== -1 ? parseStatus(row[idxFurniture]) : "अनुपलब्ध",
        toilet: idxToilet !== -1 ? parseStatus(row[idxToilet]) : "अनुपलब्ध",
        shed: idxShed !== -1 ? parseStatus(row[idxShed]) : "अनुपलब्ध",
        signage: idxSignage !== -1 ? parseStatus(row[idxSignage]) : "अनुपलब्ध"
      };

      rows.push(record);
    }

    let filteredRows = rows;
    if (params.village && params.village !== "all" && params.village !== "सभी") {
      filteredRows = rows.filter(r => r.village.toLowerCase() === params.village.toLowerCase());
    }

    return createJsonResponse({
      status: "success",
      sheetTitle: ss.getName(),
      lastUpdated: new Date().toISOString(),
      villages: Array.from(villageSet).sort(),
      data: filteredRows
    });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const postData = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
    if (!postData) return createJsonResponse({ status: "error", message: "No data payload" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    const { boothNo, facilityKey, newStatus, rowIndex } = postData;

    if (rowIndex && rowIndex > 1) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const colMap = {
        ramp: ["रैम्प", "रैंप", "ramp"],
        water: ["पीने का पानी", "पेयजल", "drinking water"],
        electricity: ["पर्याप्त विद्युत व्यवस्था", "विद्युत व्यवस्था", "electricity"],
        furniture: ["पर्याप्त फर्नीचर", "furniture"],
        toilet: ["शौचालय", "toilet"],
        shed: ["शेड", "shed"],
        signage: ["प्रॉपर साइनेज", "साइनेज", "signage"]
      };

      const targetAliases = colMap[facilityKey] || [facilityKey];
      const colIndex = headers.findIndex(h => {
        const clean = String(h).toLowerCase().replace(/[\\s\\-_.]/g, "");
        return targetAliases.some(p => clean.includes(p.toLowerCase().replace(/[\\s\\-_.]/g, "")));
      });

      if (colIndex !== -1) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(newStatus);
        return createJsonResponse({ status: "success", message: "Updated successfully" });
      }
    }
    return createJsonResponse({ status: "error", message: "Row or column not matched" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  onTestConnection
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'code' | 'guide'>('url');
  const [inputUrl, setInputUrl] = useState<string>(currentUrl);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(inputUrl.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'परीक्षण विफल' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveUrl(inputUrl.trim());
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Google Apps Script एकीकरण (Setup & Deploy URL)</h2>
              <p className="text-xs text-slate-300">अपनी गूगल स्प्रेडशीट को रियल-टाइम डैशबोर्ड से जोड़ें</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-md font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Deploy URL कॉन्फ़िगर करें</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-md font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>code.js देखें व कॉपी करें</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-md font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>तैनाती चरण (Deploy Guide)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm space-y-4">
          
          {/* TAB 1: URL CONFIGURATION */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                  Google Apps Script Web App URL दर्ज करें:
                </p>
                <p className="mt-1 text-amber-800">
                  जब आप अपनी गूगल शीट में Apps Script को "Web app" (Who has access: "Anyone") के रूप में तैनात करते हैं, 
                  तो मिलने वाला URL नीचे पेस्ट करें। डैशबोर्ड सीधे आपकी गूगल शीट से रियल-टाइम डेटा लोड करेगा।
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Apps Script Deployment URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setTestResult(null);
                    }}
                    className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleTest}
                    disabled={isTesting || !inputUrl}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>परीक्षण (Test)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  URL का प्रारूप: <code className="text-amber-700 font-mono">https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec</code>
                </p>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">{testResult.success ? 'सफलतापूर्वक कनेक्टेड:' : 'कनेक्शन विफल:'} </span>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}

              {/* Status info */}
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-slate-500">वर्तमान स्थिति:</span>
                  <span className="font-semibold text-slate-800">
                    {isValidAppsScriptUrl(currentUrl) ? 'कस्टम गूगल शीट से लाइव लिंक' : 'सैंपल / ऑफलाइन डेटा सक्रिय'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">कोर्स (CORS) समर्थन:</span>
                  <span className="font-semibold text-emerald-700">सक्रिय (ContentService JSON)</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CODE.JS VIEWER & COPY */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Google Apps Script (code.js)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    यह कोड प्रोजेक्ट रूट में <code className="font-mono text-amber-700">code.js</code> के रूप में भी उपलब्ध है।
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'कोड कॉपी हो गया!' : 'पूरा कोड कॉपी करें'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto text-xs font-mono max-h-80 border border-slate-800">
                <pre>{APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP DEPLOY GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 text-sm">
                गूगल शीट से 2 मिनट में वेब ऐप तैनात करने के चरण:
              </h3>

              <ol className="space-y-3 list-decimal list-inside bg-slate-50 p-4 rounded-lg border border-slate-200">
                <li className="leading-relaxed">
                  <strong>गूगल शीट खोलें:</strong> अपनी वही स्प्रेडशीट खोलें जिसमें कॉलम <span className="text-amber-800 font-semibold">बूथ सं०, गांव का नाम, बूथ का नाम, रैम्प, पीने का पानी...</span> आदि मौजूद हैं।
                </li>
                <li className="leading-relaxed">
                  <strong>Apps Script खोलें:</strong> ऊपर मेन्यू बार में <strong className="text-slate-900">Extensions (एक्सटेंशन)</strong> → <strong className="text-slate-900">Apps Script</strong> पर क्लिक करें।
                </li>
                <li className="leading-relaxed">
                  <strong>कोड पेस्ट करें:</strong> एडिटर में पहले से लिखे कोड को मिटाएं और यहाँ दिए गए <strong className="text-amber-700">code.js</strong> का कोड पेस्ट करें। फाइल को सेव (Ctrl+S) करें।
                </li>
                <li className="leading-relaxed">
                  <strong>नया डिप्लॉयमेंट बनाएं:</strong> ऊपर दाईं ओर नीले बटन <strong className="text-blue-700">Deploy (तैनात करें)</strong> → <strong className="text-blue-700">New deployment (नई तैनाती)</strong> पर क्लिक करें।
                </li>
                <li className="leading-relaxed">
                  <strong>वेब ऐप चुनें:</strong> बाईं ओर गियर आइकन (⚙️) से <strong className="text-slate-900">Web app</strong> चुनें।
                </li>
                <li className="leading-relaxed bg-amber-50 p-2 rounded border border-amber-200">
                  <strong className="text-amber-900">अति महत्वपूर्ण सेटिंग्स:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                    <li><strong>Execute as:</strong> "Me (आपका जीमेल खाता)"</li>
                    <li><strong>Who has access:</strong> <span className="text-emerald-700 font-bold underline">"Anyone (कोई भी)"</span> (यह अनिवार्य है ताकि डैशबोर्ड सुरक्षित रूप से डेटा फेच कर सके)।</li>
                  </ul>
                </li>
                <li className="leading-relaxed">
                  <strong>Deploy पर क्लिक करें:</strong> गूगल आपसे अनुमतियां मांग सकता है। "Review Permissions" → अपना जीमेल चुनें → "Advanced" → "Go to Untitled project (unsafe)" → "Allow" करें।
                </li>
                <li className="leading-relaxed">
                  <strong>URL कॉपी करें:</strong> आपको <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">https://script.google.com/macros/s/.../exec</code> जैसा वेब ऐप URL मिलेगा। उसे यहाँ पहले टैब में पेस्ट करके 'सुरक्षित करें' पर क्लिक करें!
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setInputUrl('');
              onSaveUrl('');
              setTestResult(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            सैंपल डेटा पर रीसेट करें
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              सुरक्षित व लागू करें
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
