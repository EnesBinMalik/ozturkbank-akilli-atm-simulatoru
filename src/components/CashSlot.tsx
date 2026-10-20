import React from 'react';
import { Banknote, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/fileOperations';

interface CashSlotProps {
  isDispensing: boolean;
  dispensedAmount: number;
  dispensedBreakdown?: Record<number, number>;
  onCollectCash: () => void;
  statusText?: string;
}

export const CashSlot: React.FC<CashSlotProps> = ({
  isDispensing,
  dispensedAmount,
  dispensedBreakdown,
  onCollectCash,
  statusText,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Para Verme / Yatırma Haznesi
        </span>
        <span className="text-[10px] text-emerald-400 font-mono">
          {isDispensing ? 'HAZNE AÇIK' : 'HAZNE KİLİTLİ'}
        </span>
      </div>

      {/* Shutter Door Visual */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 p-3 min-h-[90px] flex flex-col items-center justify-center">
        {/* Shutter slit */}
        <div
          className={`w-full h-3 rounded bg-slate-900 border transition-all duration-500 mb-2 ${
            isDispensing ? 'border-emerald-500 shadow-md shadow-emerald-500/20 bg-emerald-950/40' : 'border-slate-800'
          }`}
        />

        {isDispensing && dispensedAmount > 0 ? (
          <div className="flex flex-col items-center animate-fade-in w-full text-center">
            {/* Visual Banknotes Stack */}
            <div className="flex items-center justify-center -space-x-4 mb-2">
              {dispensedBreakdown &&
                Object.entries(dispensedBreakdown).map(([valStr, count]) => {
                  const val = Number(valStr);
                  if (count <= 0) return null;
                  const color =
                    val === 200
                      ? 'bg-rose-900/80 border-rose-500/80 text-rose-200'
                      : val === 100
                      ? 'bg-blue-900/80 border-blue-500/80 text-blue-200'
                      : val === 50
                      ? 'bg-amber-900/80 border-amber-500/80 text-amber-200'
                      : 'bg-emerald-900/80 border-emerald-500/80 text-emerald-200';
                  return (
                    <div
                      key={val}
                      className={`px-3 py-1.5 rounded border text-xs font-mono font-bold shadow-md transform hover:-translate-y-1 transition-transform ${color}`}
                    >
                      {count}x {val} ₺
                    </div>
                  );
                })}
            </div>

            <p className="text-xs font-semibold text-emerald-400 mb-1">
              {statusText || 'Lütfen Paranızı Hazneden Alınız'}
            </p>
            <p className="text-lg font-bold text-white font-mono mb-2">
              {formatCurrency(dispensedAmount)}
            </p>

            <button
              onClick={onCollectCash}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Parayı Aldım (Hazneyi Kapat)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Banknote className="w-4 h-4 text-slate-600" />
            <span>Nakit işlemi sırasında para haznesi otomatik olarak açılır</span>
          </div>
        )}
      </div>
    </div>
  );
};
