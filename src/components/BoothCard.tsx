import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  ChevronDown, 
  Accessibility, 
  Droplets, 
  Zap, 
  Armchair, 
  Bath, 
  Umbrella, 
  Signpost,
  Edit2,
  Check,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { PollingBooth, FacilityKey, FacilityStatus } from '../types';
import { MANDATORY_FACILITIES } from '../data/initialData';

interface BoothCardProps {
  booth: PollingBooth;
  onUpdateFacility: (boothNo: string, facilityKey: FacilityKey, newStatus: FacilityStatus, rowIndex?: number) => void;
  onOpenEdit?: (booth: PollingBooth) => void;
  onUpdateRemark?: (boothNo: string, newRemarks: string, rowIndex?: number) => void;
  onSaveOrUpdate?: (booth: PollingBooth) => void;
}

export const BoothCard: React.FC<BoothCardProps> = ({
  booth,
  onUpdateFacility,
  onUpdateRemark,
  onSaveOrUpdate
}) => {
  const [activeDropdown, setActiveDropdown] = useState<FacilityKey | null>(null);
  const [isEditingRemark, setIsEditingRemark] = useState<boolean>(false);
  const [remarkInput, setRemarkInput] = useState<string>(booth.remarks || '');

  React.useEffect(() => {
    setRemarkInput(booth.remarks || '');
  }, [booth.remarks]);

  // Facility status helper
  const getFacilityIcon = (key: FacilityKey) => {
    switch (key) {
      case 'ramp': return <Accessibility className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'furniture': return <Armchair className="w-4 h-4" />;
      case 'toilet': return <Bath className="w-4 h-4" />;
      case 'shed': return <Umbrella className="w-4 h-4" />;
      case 'signage': return <Signpost className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: FacilityStatus) => {
    switch (status) {
      case 'उपलब्ध':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          label: 'उपलब्ध'
        };
      case 'मरम्मत योग्य':
      case 'कार्य प्रगति पर':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
          label: status
        };
      case 'अनुपलब्ध':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
          label: 'अनुपलब्ध'
        };
    }
  };

  // Readiness count
  const facilitiesList: FacilityKey[] = ['ramp', 'water', 'electricity', 'furniture', 'toilet', 'shed', 'signage'];
  const availableCount = facilitiesList.filter(f => booth[f] === 'उपलब्ध').length;
  const readinessPercent = Math.round((availableCount / facilitiesList.length) * 100);
  const is100Percent = readinessPercent === 100;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
      is100Percent ? 'border-slate-200 hover:border-emerald-300' : 'border-amber-200 hover:border-amber-400 ring-1 ring-amber-100'
    }`}>
      
      {/* Top Banner / Booth Identification Header */}
      <div>
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
          
          <div className="flex items-start justify-between gap-3">
            {/* Left: Booth Number and Village */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono font-bold text-sm shadow-xs">
                  बूथ सं० {booth.boothNo}
                </span>
                
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  <MapPin className="w-3 h-3 text-amber-700" />
                  {booth.village}
                </span>

                {booth.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    भौतिक सत्यापित
                  </span>
                )}
              </div>

              {/* Polling Station Name */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug pt-1 flex items-start gap-2">
                <Building2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <span>{booth.boothName}</span>
              </h3>
            </div>

            {/* Right: Readiness Indicator Badge */}
            <div className="shrink-0 text-right">
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${
                is100Percent 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : readinessPercent >= 70 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {availableCount}/{facilitiesList.length} सुविधाएं ({readinessPercent}%)
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                is100Percent ? 'bg-emerald-600' : readinessPercent >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

        </div>

        {/* 7 Mandatory Facilities Grid */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <span>बुनियादी सुविधाएं स्थिति (AMF Status)</span>
              <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                सभी 7 अनिवार्य *
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">क्लिक करके स्थिति बदलें</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MANDATORY_FACILITIES.map(facility => {
              const currentStatus = booth[facility.key];
              const badge = getStatusBadge(currentStatus);
              const isDropdownOpen = activeDropdown === facility.key;

              return (
                <div 
                  key={facility.key}
                  className="relative group border border-slate-200/90 rounded-lg p-2.5 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-2"
                >
                  {/* Facility Label */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      {getFacilityIcon(facility.key)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-0.5">
                        <span>{facility.hindiName}</span>
                        <span className="text-rose-600 font-extrabold text-sm" title="यह सुविधा अनिवार्य है">*</span>
                      </p>
                      <p className="text-[10px] text-slate-600 truncate">
                        {facility.englishName}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Status Switcher */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : facility.key)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${badge.bg}`}
                      title="स्थिति बदलने हेतु क्लिक करें"
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                    </button>

                    {/* Dropdown Menu for Quick Status Change */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateFacility(booth.boothNo, facility.key, 'उपलब्ध', booth.rowIndex);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>उपलब्ध (Ready)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateFacility(booth.boothNo, facility.key, 'मरम्मत योग्य', booth.rowIndex);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-amber-800 font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>मरम्मत योग्य</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateFacility(booth.boothNo, facility.key, 'अनुपलब्ध', booth.rowIndex);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-800 font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>अनुपलब्ध (Missing)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editable Remarks / Inspection Note */}
          <div className="p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-lg text-xs text-slate-700 transition-all">
            {isEditingRemark ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>टिप्पणी संपादित करें (Edit Remarks):</span>
                  </span>
                </div>
                <textarea
                  value={remarkInput}
                  onChange={(e) => setRemarkInput(e.target.value)}
                  placeholder="सुविधा संबंधी भौतिक निरीक्षण टिप्पणी दर्ज करें..."
                  className="w-full p-2 bg-white border border-amber-400 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRemarkInput(booth.remarks || '');
                      setIsEditingRemark(false);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateRemark) {
                        onUpdateRemark(booth.boothNo, remarkInput, booth.rowIndex);
                      }
                      setIsEditingRemark(false);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>सुरक्षित करें</span>
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingRemark(true)}
                className="cursor-pointer group/rem flex items-start justify-between gap-2"
                title="टिप्पणी संपादित करने के लिए क्लिक करें"
              >
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <span className="font-bold text-slate-800 shrink-0">टिप्पणी:</span>
                  <span className={booth.remarks ? "italic text-slate-700 break-words" : "text-slate-400 italic"}>
                    {booth.remarks || '+ टिप्पणी जोड़ें (क्लिक करें)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingRemark(true);
                  }}
                  className="opacity-60 group-hover/rem:opacity-100 text-slate-500 hover:text-amber-700 p-0.5 rounded transition-all cursor-pointer shrink-0"
                  title="टिप्पणी संपादित करें"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Submit or Update Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-slate-500">
              {booth.hasExistingData ? (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>शीट में डेटा मौजूद है (Ready for Update)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>नया डेटा दर्ज करें (First-time Submit)</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSaveOrUpdate && onSaveOrUpdate(booth)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                booth.hasExistingData 
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white' 
                  : 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white'
              }`}
            >
              {booth.hasExistingData ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>अपडेट करें (Update)</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>सबमिट करें (Submit)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
