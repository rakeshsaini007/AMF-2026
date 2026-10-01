import React from 'react';
import { PollingBooth } from '../types';
import { Printer, X } from 'lucide-react';

interface PrintReportViewProps {
  booths: PollingBooth[];
  selectedVillage: string;
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  booths,
  selectedVillage,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 sm:p-10 text-slate-900">
      {/* Non-printed action controls */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900">प्रिंट व भौतिक सत्यापन रिपोर्ट पूर्वावलोकन</h2>
          <p className="text-xs text-slate-500">प्रिंट करने के लिए 'प्रिंट रिपोर्ट' बटन दबाएं या Ctrl + P दबाएं</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट रिपोर्ट (Print / PDF)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="mt-4 text-center space-y-1 border-b-2 border-slate-900 pb-4">
        <h1 className="text-xl font-bold font-serif uppercase tracking-wider">
          भारत निर्वाचन आयोग / बेसिक शिक्षा विभाग
        </h1>
        <h2 className="text-base font-semibold">
          मतदान केंद्र न्यूनतम आवश्यक सुविधाएं (Assured Minimum Facilities - AMF) भौतिक सत्यापन पंजीका
        </h2>
        <div className="flex justify-center items-center gap-6 text-xs text-slate-600 pt-1">
          <span>चयनित क्षेत्र/गांव: <strong>{selectedVillage === 'all' ? 'समस्त गांव' : selectedVillage}</strong></span>
          <span>·</span>
          <span>कुल बूथ संख्या: <strong>{booths.length}</strong></span>
          <span>·</span>
          <span>रिपोर्ट तिथि: <strong>{new Date().toLocaleDateString('hi-IN')}</strong></span>
        </div>
      </div>

      {/* Table view */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-center">
              <th className="border border-slate-300 p-2 w-12">बूथ सं०</th>
              <th className="border border-slate-300 p-2">गांव का नाम</th>
              <th className="border border-slate-300 p-2 text-left">बूथ का नाम (विद्यालय / भवन)</th>
              <th className="border border-slate-300 p-1.5 w-16">रैम्प</th>
              <th className="border border-slate-300 p-1.5 w-16">पीने का पानी</th>
              <th className="border border-slate-300 p-1.5 w-16">विद्युत</th>
              <th className="border border-slate-300 p-1.5 w-16">फर्नीचर</th>
              <th className="border border-slate-300 p-1.5 w-16">शौचालय</th>
              <th className="border border-slate-300 p-1.5 w-16">शेड</th>
              <th className="border border-slate-300 p-1.5 w-16">साइनेज</th>
              <th className="border border-slate-300 p-2 text-left">बीएलओ व संपर्क</th>
              <th className="border border-slate-300 p-2 w-28 text-left">हस्ताक्षर / रिमार्क</th>
            </tr>
          </thead>
          <tbody>
            {booths.map((b) => (
              <tr key={b.boothNo} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="border border-slate-300 p-2 font-mono font-bold text-center">{b.boothNo}</td>
                <td className="border border-slate-300 p-2 font-medium">{b.village}</td>
                <td className="border border-slate-300 p-2 font-semibold">{b.boothName}</td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.ramp === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.ramp}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.water === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.water}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.electricity === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.electricity}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.furniture === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.furniture}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.toilet === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.toilet}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.shed === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.shed}
                </td>
                <td className={`border border-slate-300 p-1.5 text-center font-bold ${b.signage === 'उपलब्ध' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.signage}
                </td>
                <td className="border border-slate-300 p-2">
                  <div className="font-medium">{b.bloName || '-'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{b.bloPhone || '-'}</div>
                </td>
                <td className="border border-slate-300 p-2 text-slate-400 italic text-[10px]">
                  {b.remarks ? b.remarks.substring(0, 30) + '...' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Official Signatures footer */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center text-xs font-semibold pt-8 border-t border-slate-300">
        <div>
          <div className="h-10 border-b border-dashed border-slate-400 mb-2" />
          <p>हस्ताक्षर बीएलओ (BLO)</p>
          <p className="text-[10px] text-slate-500 font-normal">मतदान केंद्र स्तरीय अधिकारी</p>
        </div>
        <div>
          <div className="h-10 border-b border-dashed border-slate-400 mb-2" />
          <p>हस्ताक्षर खंड शिक्षा अधिकारी / नोडल</p>
          <p className="text-[10px] text-slate-500 font-normal">बेसिक शिक्षा विभाग</p>
        </div>
        <div>
          <div className="h-10 border-b border-dashed border-slate-400 mb-2" />
          <p>हस्ताक्षर सेक्टर मजिस्ट्रेट / सहायक निर्वाचन अधिकारी</p>
          <p className="text-[10px] text-slate-500 font-normal">तहसील / जिला प्रशासन</p>
        </div>
      </div>
    </div>
  );
};
