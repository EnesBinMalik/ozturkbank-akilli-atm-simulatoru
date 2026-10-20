import React from 'react';
import { CreditCard, CheckCircle2, AlertOctagon, UserPlus } from 'lucide-react';
import { UserAccount } from '../types/atm';
import { soundManager } from '../utils/sound';

interface CardSlotProps {
  insertedCard: UserAccount | null;
  registeredUsers: UserAccount[];
  onInsertCard: (user: UserAccount | null, customCardNumber?: string) => void;
  onEjectCard: () => void;
  disabled?: boolean;
}

export const CardSlot: React.FC<CardSlotProps> = ({
  insertedCard,
  registeredUsers,
  onInsertCard,
  onEjectCard,
  disabled = false,
}) => {
  const [showManualInput, setShowManualInput] = React.useState(false);
  const [manualCardNo, setManualCardNo] = React.useState('');

  const handleQuickInsert = (user: UserAccount) => {
    if (disabled) return;
    soundManager.playCardInsert();
    onInsertCard(user);
  };

  const handleTestUnregisteredCard = () => {
    if (disabled) return;
    soundManager.playCardInsert();
    // Insert an unknown card to test system fraud detection!
    onInsertCard(null, '9988 7766 5544 3322');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCardNo.trim() || disabled) return;
    soundManager.playCardInsert();
    const cleanNo = manualCardNo.replace(/\s+/g, '');
    const matched = registeredUsers.find(
      (u) => u.fullCardNumber === cleanNo || u.cardNumber.replace(/\s+/g, '') === cleanNo
    );
    if (matched) {
      onInsertCard(matched);
    } else {
      onInsertCard(null, manualCardNo);
    }
    setManualCardNo('');
    setShowManualInput(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Kart Okuyucu / EMV Chip Slot
        </span>
        <span className="text-[10px] text-emerald-400 font-mono">SİMÜLASYON MODU</span>
      </div>

      {/* Physical Card Slot Visual */}
      <div className="relative mb-4">
        <div
          className={`h-5 w-full rounded-md border-2 transition-all flex items-center justify-center ${
            insertedCard
              ? 'bg-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-500/10 animate-pulse'
          }`}
        >
          {/* LED Slot Light */}
          <div
            className={`h-1.5 w-3/4 rounded-full transition-all ${
              insertedCard ? 'bg-emerald-500' : 'bg-emerald-400 animate-pulse'
            }`}
          />
        </div>

        {/* Card Insertion Label */}
        <div className="text-center mt-1.5">
          {insertedCard ? (
            <span className="text-[11px] text-emerald-400 font-medium">
              Kart Yerleştirildi: {insertedCard.fullName}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Lütfen banka/kredi kartınızı takınız
            </span>
          )}
        </div>
      </div>

      {/* Card In Slot Display or Quick Card Selectors */}
      {insertedCard ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">{insertedCard.fullName}</p>
                <p className="text-[11px] font-mono text-slate-400">{insertedCard.cardNumber}</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playCardInsert();
                onEjectCard();
              }}
              className="px-2.5 py-1 text-xs text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors"
            >
              Kartı Çıkar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
            <span>Test Kartı Tak (Sistemde Kayıtlı):</span>
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>{showManualInput ? 'Listeye Dön' : 'Manuel Kart No'}</span>
            </button>
          </div>

          {!showManualInput ? (
            <div className="grid grid-cols-2 gap-2">
              {registeredUsers.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickInsert(user)}
                  disabled={disabled}
                  className="flex flex-col items-start p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      {user.fullName}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-900 text-slate-400">
                      PIN: {user.pin}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {user.cardNumber}
                  </span>
                </button>
              ))}

              {/* Special Button: Test Unregistered Card for Fraud Log */}
              <button
                onClick={handleTestUnregisteredCard}
                disabled={disabled}
                className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 transition-all text-left"
                title="Sistemde olmayan kart takarak fraud korumasını ve hata logunu tetikleyin"
              >
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-amber-200 block">
                      Kayıtsız / Tanımsız Kart Testi (Fraud Denemesi)
                    </span>
                    <span className="text-[10px] text-amber-400/80">
                      Kayıtsız kart no gönderip fraud uyarısı üretir
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded border border-amber-700/60">
                  Dene
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="16 Haneli Kart No veya 11 Haneli TC"
                value={manualCardNo}
                onChange={(e) => setManualCardNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  Kartı Okut
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
