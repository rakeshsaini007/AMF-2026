import React, { useMemo } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
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
  // Ensure completely deduplicated and Hindi-locale sorted list of all unique villages
  const uniqueVillages = useMemo(() => {
    const set = new Set<string>();
    villages.forEach(v => {
      const clean = v?.trim();
      if (clean) set.add(clean);
    });
    booths.forEach(b => {
      const clean = b.village?.trim();
      if (clean) set.add(clean);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'hi'));
  }, [villages, booths]);

  // Count booths per village
  const villageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    booths.forEach(b => {
      const v = b.village?.trim();
      if (v) {
        map[v] = (map[v] || 0) + 1;
      }
    });
    return map;
  }, [booths]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label 
            htmlFor="village-select" 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider"
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>गांव का नाम चुनें (Select Village Name):</span>
          </label>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            कुल {uniqueVillages.length} गांव उपलब्ध (All {uniqueVillages.length} Villages)
          </span>
        </div>

        <div className="relative">
          <select
            id="village-select"
            value={selectedVillage}
            onChange={(e) => onSelectVillage(e.target.value)}
            className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-lg px-4 py-3 pr-10 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer shadow-xs"
          >
            <option value="">गांव का नाम चुनें (Select Village Name)</option>
            {uniqueVillages.map((v, idx) => (
              <option key={v} value={v}>
                {idx + 1}. {v} ({villageCounts[v] || 0} मतदान केंद्र)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronDown className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
