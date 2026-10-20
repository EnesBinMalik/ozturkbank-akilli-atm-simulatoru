import React from 'react';
import { ShieldCheck, Volume2, VolumeX, FileSpreadsheet, Lock } from 'lucide-react';
import { AUTHOR_NAME, COPYRIGHT_NOTICE, ATM_BANK_NAME, ATM_TERMINAL_ID } from '../data/initialData';

interface AtmHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenEOD: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onEjectCard: () => void;
  fraudAlertCount: number;
}

export const AtmHeader: React.FC<AtmHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenEOD,
  isLoggedIn,
  userName,
  onEjectCard,
  fraudAlertCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950 text-slate-100">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
          Ö
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
            {ATM_BANK_NAME}
          </span>
          <span className="text-[11px] text-emerald-400/90 font-medium tracking-wide">
            Sistem Mimarı: {AUTHOR_NAME}
          </span>
        </div>
      </div>

      {/* Zone 2: ATM Status / Telemetry Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Terminal:</span>
          <span className="text-slate-200 font-mono">{ATM_TERMINAL_ID}</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-200">Güvenlik Senaryosu Simülasyonu</span>
        </div>
        {fraudAlertCount > 0 && (
          <>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-amber-400 font-medium">
              <span>{fraudAlertCount} Güvenlik Uyarısı</span>
            </div>
          </>
        )}
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span className="text-slate-400 whitespace-nowrap">{COPYRIGHT_NOTICE}</span>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
        </button>

        {isLoggedIn && (
          <button
            onClick={onEjectCard}
            className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            Kartı İade Et ({userName?.split(' ')[0]})
          </button>
        )}

        <button
          onClick={onOpenEOD}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md shadow-emerald-950/40 whitespace-nowrap"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>GÜN SONU (EOD)</span>
        </button>
      </div>
    </header>
  );
};
