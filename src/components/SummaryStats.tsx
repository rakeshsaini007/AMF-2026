import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Accessibility, 
  Droplets, 
  Zap, 
  Armchair, 
  Bath, 
  Umbrella, 
  Signpost 
} from 'lucide-react';
import { PollingBooth, FacilityKey } from '../types';

interface SummaryStatsProps {
  selectedVillage: string;
  filteredBooths: PollingBooth[];
  totalAllBooths: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  selectedVillage,
  filteredBooths,
  totalAllBooths
}) => {
  const totalInScope = filteredBooths.length;

  const fullyEquippedCount = filteredBooths.filter(b => {
    const facilities = [b.ramp, b.water, b.electricity, b.furniture, b.toilet, b.shed, b.signage];
    return facilities.every(f => f === 'उपलब्ध');
  }).length;

  const deficientCount = totalInScope - fullyEquippedCount;
  const overallPercentage = totalInScope > 0 ? Math.round((fullyEquippedCount / totalInScope) * 100) : 0;

  // Facility-by-facility availability
  const facilityStats: { key: FacilityKey; name: string; icon: React.ReactNode; count: number }[] = [
    { key: 'ramp', name: 'रैम्प', icon: <Accessibility className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.ramp === 'उपलब्ध').length },
    { key: 'water', name: 'पीने का पानी', icon: <Droplets className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.water === 'उपलब्ध').length },
    { key: 'electricity', name: 'विद्युत व्यवस्था', icon: <Zap className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.electricity === 'उपलब्ध').length },
    { key: 'furniture', name: 'फर्नीचर', icon: <Armchair className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.furniture === 'उपलब्ध').length },
    { key: 'toilet', name: 'शौचालय', icon: <Bath className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.toilet === 'उपलब्ध').length },
    { key: 'shed', name: 'शेड', icon: <Umbrella className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.shed === 'उपलब्ध').length },
    { key: 'signage', name: 'साइनेज', icon: <Signpost className="w-3.5 h-3.5" />, count: filteredBooths.filter(b => b.signage === 'उपलब्ध').length },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Total Booths */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>कुल मतदान केंद्र</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalInScope}</span>
            <span className="text-xs text-slate-500">
              {selectedVillage === 'all' ? 'समस्त केंद्र' : `गाँव: ${selectedVillage}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            कुल मतदान संख्या का {Math.round((totalInScope / (totalAllBooths || 1)) * 100)}% हिस्सा
          </p>
        </div>

        {/* 100% AMF Ready */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>100% सुसज्जित केंद्र</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{fullyEquippedCount}</span>
            <span className="text-xs font-bold text-emerald-700">{overallPercentage}% पूर्ण</span>
          </div>
          <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500" 
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Deficient / Needs Attention */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>मरम्मत / पूर्ति योग्य</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{deficientCount}</span>
            <span className="text-xs text-amber-700">बूथों में ध्यान आवश्यक</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">
            समय रहते संबंधित विभागों को निर्देश जारी करें
          </p>
        </div>

      </div>

      {/* Facility Breakdown Progress Bars */}
      <div className="pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          अनिवार्य 7 सुविधाएं तत्परता (7 Assured Minimum Facilities Compliance):
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {facilityStats.map(f => {
            const pct = totalInScope > 0 ? Math.round((f.count / totalInScope) * 100) : 0;
            const isAll = pct === 100;
            return (
              <div 
                key={f.key} 
                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                  isAll 
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold truncate flex items-center gap-1">
                    {f.icon}
                    {f.name}
                  </span>
                  <span className={`text-[11px] font-bold ${isAll ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {f.count}/{totalInScope}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isAll ? 'bg-emerald-600' : pct > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>{pct}% उपलब्ध</span>
                  {totalInScope - f.count > 0 && (
                    <span className="text-rose-600 font-semibold">{totalInScope - f.count} शेष</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
