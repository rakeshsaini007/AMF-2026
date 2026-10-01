import React from 'react';

interface HeaderProps {
  sheetTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sheetTitle
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Govt Accent Stripe */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand & Administrative Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0 border border-slate-800">
              ECI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
                  Booth Facilities Dashboard
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  AMF 2026
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>मतदान केंद्र बुनियादी सुविधाएं (Assured Minimum Facilities) डैशबोर्ड</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">{sheetTitle || 'Google Sheet Real-Time'}</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
