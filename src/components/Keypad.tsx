import React from 'react';
import { soundManager } from '../utils/sound';
import { CornerDownLeft, Delete, XCircle } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onClear,
  onEnter,
  onCancel,
  disabled = false,
}) => {
  const handleKey = (key: string) => {
    if (disabled) return;
    soundManager.playKeyBeep();
    onKeyPress(key);
  };

  const handleClear = () => {
    if (disabled) return;
    soundManager.playKeyBeep();
    onClear();
  };

  const handleEnter = () => {
    if (disabled) return;
    soundManager.playKeyBeep();
    onEnter();
  };

  const handleCancel = () => {
    if (disabled) return;
    soundManager.playKeyBeep();
    onCancel();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Güvenli Tuş Takımı (EPP)
        </span>
        <span className="text-[10px] text-slate-500 font-mono">ENCRYPTION ACTIVE</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {/* Row 1 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('1')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          1
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('2')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          2
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('3')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          3
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleCancel}
          className="h-12 bg-rose-900/60 hover:bg-rose-800/80 active:scale-95 text-rose-200 text-xs font-semibold rounded-xl border-b-2 border-rose-950 transition-all shadow flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          title="İptal / Vazgeç"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>İPTAL</span>
        </button>

        {/* Row 2 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('4')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          4
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('5')}
          className="relative h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          5
          {/* Tactile dot for 5 */}
          <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-slate-400/80" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('6')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          6
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleClear}
          className="h-12 bg-amber-900/60 hover:bg-amber-800/80 active:scale-95 text-amber-200 text-xs font-semibold rounded-xl border-b-2 border-amber-950 transition-all shadow flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          title="Düzelt / Sil"
        >
          <Delete className="w-3.5 h-3.5 text-amber-400" />
          <span>DÜZELT</span>
        </button>

        {/* Row 3 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('7')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          7
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('8')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          8
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('9')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          9
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleEnter}
          className="row-span-2 h-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-emerald-100 text-xs font-bold rounded-xl border-b-2 border-emerald-950 transition-all shadow flex flex-col items-center justify-center gap-1 disabled:opacity-50"
          title="Onayla / Giriş"
        >
          <CornerDownLeft className="w-4 h-4 text-emerald-200" />
          <span>GİRİŞ</span>
        </button>

        {/* Row 4 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('00')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-sm rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          00
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('0')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('.')}
          className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-lg rounded-xl border-b-2 border-slate-950 transition-all shadow flex items-center justify-center disabled:opacity-50"
        >
          ,
        </button>
      </div>
    </div>
  );
};
