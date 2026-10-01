import React from 'react';
import { MapPin } from 'lucide-react';
import { PollingBooth } from '../types';

interface VillageFilterProps {
  villages: string[];
  selectedVillage: string;
  onSelectVillage: (village: string) => void;
  booths: PollingBooth[];
}

export const VillageFilter: React.FC<VillageFilterProps> = ({
  villages,
  selectedVillage,
  onSelectVillage,
  booths
}) => {
  // Count booths per village
  const villageCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    booths.forEach(b => {
      map[b.village] = (map[b.village] || 0) + 1;
    });
    return map;
  }, [booths]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="space-y-2">
        <label 
          htmlFor="village-select" 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider"
        >
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>गांव का नाम चुनें (Select Village Name):</span>
        </label>
        <div className="relative">
          <select
            id="village-select"
            value={selectedVillage}
            onChange={(e) => onSelectVillage(e.target.value)}
            className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-lg px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer shadow-xs"
          >
            <option value="all">📍 सभी गांव (समस्त {booths.length} मतदान केंद्र)</option>
            {villages.map(v => (
              <option key={v} value={v}>
                {v} ({villageCounts[v] || 0} मतदान केंद्र)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
