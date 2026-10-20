import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  Transaction,
  BillPaymentOption,
} from '../types/atm';
import { formatCurrency } from '../utils/fileOperations';
import { soundManager } from '../utils/sound';
import { BILL_PROVIDERS, AUTHOR_NAME, COPYRIGHT_NOTICE, ATM_BANK_NAME, ATM_TERMINAL_ID } from '../data/initialData';
import {
  ArrowRight,
  ArrowLeft,
  Banknote,
  Send,
  Receipt,
  FileCheck2,
  KeyRound,
  FileSpreadsheet,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Zap,
} from 'lucide-react';

export type ScreenState =
  | 'WELCOME'
  | 'PIN_ENTRY'
  | 'MAIN_MENU'
  | 'WITHDRAW'
  | 'WITHDRAW_CUSTOM'
  | 'DEPOSIT'
  | 'BILL_SELECT'
  | 'BILL_DETAILS'
  | 'TRANSFER'
  | 'BALANCE_STATEMENT'
  | 'PIN_CHANGE'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR';

interface AtmScreenProps {
  screenState: ScreenState;
  setScreenState: (state: ScreenState) => void;
  currentUser: UserAccount | null;
  onVerifyPin: (pin: string) => boolean;
  onWithdraw: (amount: number, printReceipt: boolean) => void;
  onDeposit: (amount: number, targetIban?: string) => void;
  onPayBill: (provider: BillPaymentOption, subscriberNo: string, amount: number) => void;
  onTransfer: (recipientName: string, recipientIban: string, amount: number, description: string) => void;
  onChangePin: (oldPin: string, newPin: string) => boolean;
  onEjectCard: () => void;
  onOpenEOD: () => void;
  lastTransaction: Transaction | null;
  onViewReceipt: () => void;
  errorMessage: string;
  pinInput: string;
  setPinInput: (val: string) => void;
}

export const AtmScreen: React.FC<AtmScreenProps> = ({
  screenState,
  setScreenState,
  currentUser,
  onVerifyPin,
  onWithdraw,
  onDeposit,
  onPayBill,
  onTransfer,
  onChangePin,
  onEjectCard,
  onOpenEOD,
  lastTransaction,
  onViewReceipt,
  errorMessage,
  pinInput,
  setPinInput,
}) => {
  // Local state for forms
  const [customAmount, setCustomAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedBiller, setSelectedBiller] = useState<BillPaymentOption | null>(null);
  const [subscriberNo, setSubscriberNo] = useState('');
  const [billQueriedAmount, setBillQueriedAmount] = useState<number | null>(null);
  
  // Transfer form
  const [transferName, setTransferName] = useState('');
  const [transferIban, setTransferIban] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  // Pin Change form
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeErr, setPinChangeErr] = useState('');

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('tr-TR'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePinSubmit = () => {
    if (pinInput.length !== 4) return;
    const ok = onVerifyPin(pinInput);
    if (!ok) {
      setPinInput('');
    }
  };

  const handleQuickWithdraw = (amount: number) => {
    onWithdraw(amount, true);
  };

  const handleCustomWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customAmount);
    if (val > 0 && val % 10 === 0) {
      onWithdraw(val, true);
      setCustomAmount('');
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(depositAmount);
    if (val > 0) {
      onDeposit(val);
      setDepositAmount('');
    }
  };

  const handleQueryBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberNo || !selectedBiller) return;
    setBillQueriedAmount(selectedBiller.sampleAmount);
  };

  const handleConfirmBillPayment = () => {
    if (!selectedBiller || !billQueriedAmount) return;
    onPayBill(selectedBiller, subscriberNo, billQueriedAmount);
    setSubscriberNo('');
    setBillQueriedAmount(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferAmount);
    if (amt > 0 && transferName && transferIban) {
      onTransfer(transferName, transferIban, amt, transferDesc || 'FAST Para Transferi');
      setTransferName('');
      setTransferIban('');
      setTransferAmount('');
      setTransferDesc('');
    }
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeErr('');
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setPinChangeErr('Yeni şifre 4 haneli rakam olmalıdır.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeErr('Girdiğiniz yeni şifreler uyuşmuyor.');
      return;
    }
    const success = onChangePin(oldPin, newPin);
    if (success) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinChangeErr('Mevcut şifreniz hatalı!');
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] min-h-[460px] md:min-h-[520px] bg-gradient-to-b from-slate-950 via-[#07131b] to-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl p-5 flex flex-col justify-between overflow-hidden text-slate-100 select-none">
      {/* CRT Scanline and Glow subtle effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_75%)]" />

      {/* ATM Screen Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-emerald-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-emerald-400">
            {ATM_BANK_NAME}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">| {ATM_TERMINAL_ID}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          {currentUser && (
            <span className="text-emerald-300 font-sans font-semibold">
              {currentUser.fullName}
            </span>
          )}
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Screen Main Center Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-4">
        {/* 1. WELCOME SCREEN */}
        {screenState === 'WELCOME' && (
          <div className="text-center space-y-6 max-w-lg mx-auto animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/70 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                ÖztürkBank Akıllı ATM'ye Hoş Geldiniz
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                İşlem yapmak için lütfen kartınızı takınız veya sağdaki test kartlarından birini seçiniz.
                Kullanıcı doğrulama ve fraud denetimi aktiftir.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenEOD}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>GÜN SONU (EOD) İŞLEMLERİ</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Geliştirici & Sistem Mimarı: {AUTHOR_NAME}
            </div>
          </div>
        )}

        {/* 2. PIN ENTRY SCREEN */}
        {screenState === 'PIN_ENTRY' && (
          <div className="text-center space-y-6 max-w-md mx-auto animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Lütfen PIN Şifrenizi Giriniz</h2>
              {currentUser ? (
                <p className="text-xs text-emerald-400 mt-1 font-semibold">
                  Müşteri: {currentUser.fullName} ({currentUser.cardNumber})
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Kart okundu. 4 haneli şifrenizi tuşlayınız.</p>
              )}
            </div>

            {/* PIN Dots Display */}
            <div className="flex items-center justify-center gap-4 py-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                      filled
                        ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50 scale-110'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {filled && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400">
              Fiziksel tuş takımından veya klavyenizden şifreyi girip <strong className="text-emerald-400">GİRİŞ</strong> tuşuna basınız.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handlePinSubmit}
                disabled={pinInput.length !== 4}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow disabled:opacity-40"
              >
                GİRİŞ (Enter)
              </button>
              <button
                onClick={onEjectCard}
                className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-xl transition-colors"
              >
                Kartı İptal Et
              </button>
            </div>
          </div>
        )}

        {/* 3. MAIN MENU SCREEN */}
        {screenState === 'MAIN_MENU' && currentUser && (
          <div className="space-y-4 animate-fade-in">
            {/* User Greeting & Balance Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div>
                <span className="text-[11px] text-slate-400 block">Hoş Geldiniz,</span>
                <span className="text-sm font-bold text-white">{currentUser.fullName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Kullanılabilir Bakiye:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatCurrency(currentUser.balance)}
                </span>
              </div>
            </div>

            {/* ATM 8-Button Matrix Layout */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Left Column */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setScreenState('WITHDRAW')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        Para Çekme
                      </span>
                      <span className="text-[10px] text-slate-400">Hızlı nakit çekim</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setScreenState('DEPOSIT')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        Para Yatırma
                      </span>
                      <span className="text-[10px] text-slate-400">Hesaba nakit giriş</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setScreenState('BILL_SELECT')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        Fatura & Ödemeler
                      </span>
                      <span className="text-[10px] text-slate-400">Elektrik, Su, Gaz, GSM</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setScreenState('TRANSFER')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        FAST & Havale / EFT
                      </span>
                      <span className="text-[10px] text-slate-400">7/24 Anlık Transfer</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Right Column */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setScreenState('BALANCE_STATEMENT')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        Bakiye & Hesap Özeti
                      </span>
                      <span className="text-[10px] text-slate-400">Limitler ve hareketler</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setScreenState('PIN_CHANGE')}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                        Şifre Değiştirme
                      </span>
                      <span className="text-[10px] text-slate-400">PIN güncelleme</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={onOpenEOD}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">
                        GÜN SONU (EOD)
                      </span>
                      <span className="text-[10px] text-slate-400">Loglar & Dosyaya Yazma</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={onEjectCard}
                  className="w-full p-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/60 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-300 block">
                        Kart İade & Çıkış
                      </span>
                      <span className="text-[10px] text-rose-400/80">Oturumu sonlandır</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. WITHDRAW SCREEN */}
        {screenState === 'WITHDRAW' && currentUser && (
          <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Nakit Para Çekme</h3>
                <p className="text-xs text-slate-400">
                  Bakiye: {formatCurrency(currentUser.balance)} · Kalan Günlük Limit:{' '}
                  {formatCurrency(currentUser.dailyWithdrawalLimit - currentUser.dailyWithdrawnAmount)}
                </p>
              </div>
              <button
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Menü</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[100, 200, 500, 1000, 1500, 2000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickWithdraw(amt)}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-600 text-left transition-all group"
                >
                  <span className="text-base font-bold font-mono text-white group-hover:text-emerald-400 block">
                    {amt} ₺
                  </span>
                  <span className="text-[10px] text-slate-500">Hazır Hızlı Çekim</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setScreenState('WITHDRAW_CUSTOM')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Farklı Bir Tutar Girmek İstiyorum
            </button>
          </div>
        )}

        {/* 4b. CUSTOM WITHDRAW SCREEN */}
        {screenState === 'WITHDRAW_CUSTOM' && currentUser && (
          <form onSubmit={handleCustomWithdrawSubmit} className="space-y-4 max-w-sm mx-auto text-center animate-fade-in">
            <h3 className="text-base font-bold text-white">Farklı Tutar Çekme</h3>
            <p className="text-xs text-slate-400">Lütfen 10 TL ve katları bir tutar giriniz.</p>

            <div className="relative">
              <input
                type="number"
                step="10"
                min="10"
                placeholder="Örn: 750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-bold">₺</span>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!customAmount || Number(customAmount) <= 0 || Number(customAmount) % 10 !== 0}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-40"
              >
                Parayı Çek
              </button>
              <button
                type="button"
                onClick={() => setScreenState('WITHDRAW')}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Geri
              </button>
            </div>
          </form>
        )}

        {/* 5. DEPOSIT SCREEN */}
        {screenState === 'DEPOSIT' && currentUser && (
          <form onSubmit={handleDepositSubmit} className="space-y-4 max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Hesaba Para Yatırma</h3>
                <p className="text-xs text-slate-400">Yatırılan tutar anında hesabınıza geçer</p>
              </div>
              <button
                type="button"
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Menü</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2500].map((quick) => (
                <button
                  type="button"
                  key={quick}
                  onClick={() => setDepositAmount(quick.toString())}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
                >
                  +{quick} ₺
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Yatırılacak Nakit Tutar:</label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  step="10"
                  placeholder="Örn: 2000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-3 text-slate-400 font-bold">₺</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * ATM para yatırma haznesi katlanmış, yırtık veya madeni paraları kabul etmemektedir.
            </p>

            <button
              type="submit"
              disabled={!depositAmount || Number(depositAmount) <= 0}
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow disabled:opacity-40"
            >
              Hazneye Parayı Yerleştir ve Yatır
            </button>
          </form>
        )}

        {/* 6. BILL SELECTION SCREEN */}
        {screenState === 'BILL_SELECT' && (
          <div className="space-y-4 max-w-lg mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Fatura ve Kurum Ödemeleri</h3>
                <p className="text-xs text-slate-400">Lütfen ödeme yapacağınız kurumu seçiniz</p>
              </div>
              <button
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Menü</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {BILL_PROVIDERS.map((biller) => (
                <button
                  key={biller.id}
                  onClick={() => {
                    setSelectedBiller(biller);
                    setScreenState('BILL_DETAILS');
                  }}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600 text-left transition-all group"
                >
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase block">
                    {biller.category}
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 block truncate">
                    {biller.provider}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Örnek Borç: {formatCurrency(biller.sampleAmount)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6b. BILL DETAILS & CONFIRM */}
        {screenState === 'BILL_DETAILS' && selectedBiller && currentUser && (
          <div className="space-y-4 max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                  {selectedBiller.category} Faturası
                </span>
                <h3 className="text-base font-bold text-white">{selectedBiller.provider}</h3>
              </div>
              <button
                onClick={() => setScreenState('BILL_SELECT')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kurum Seçimi</span>
              </button>
            </div>

            {!billQueriedAmount ? (
              <form onSubmit={handleQueryBill} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {selectedBiller.subscriberNoPrompt}:
                  </label>
                  <input
                    type="text"
                    placeholder="Abone / Tesisat Numarası"
                    value={subscriberNo}
                    onChange={(e) => setSubscriberNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                >
                  Borç Sorgula
                </button>
              </form>
            ) : (
              <div className="space-y-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Abone No:</span>
                  <span className="font-mono text-white font-semibold">{subscriberNo}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Son Ödeme:</span>
                  <span className="font-mono text-white">28.10.2026</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">İşlem Komisyonu:</span>
                  <span className="font-mono text-slate-300">3,50 ₺</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-emerald-400">Ödenecek Tutar:</span>
                  <span className="text-white font-mono">{formatCurrency(billQueriedAmount)}</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleConfirmBillPayment}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                  >
                    Faturayı Öde ve Dekont Al
                  </button>
                  <button
                    onClick={() => setBillQueriedAmount(null)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. FAST / HAVALE SCREEN */}
        {screenState === 'TRANSFER' && currentUser && (
          <form onSubmit={handleTransferSubmit} className="space-y-3 max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">FAST & Havale / EFT</h3>
                <p className="text-[11px] text-slate-400">7/24 Anlık Fon Transferi (TCMB FAST)</p>
              </div>
              <button
                type="button"
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Menü</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Alıcı IBAN:</label>
                <input
                  type="text"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={transferIban}
                  onChange={(e) => setTransferIban(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Alıcı Adı Soyadı:</label>
                <input
                  type="text"
                  placeholder="Örn: Selim Vural"
                  value={transferName}
                  onChange={(e) => setTransferName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Tutar (TL):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Örn: 1000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Açıklama:</label>
                  <input
                    type="text"
                    placeholder="Kira vb."
                    value={transferDesc}
                    onChange={(e) => setTransferDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors mt-2"
            >
              FAST İle Gönder
            </button>
          </form>
        )}

        {/* 8. BALANCE STATEMENT SCREEN */}
        {screenState === 'BALANCE_STATEMENT' && currentUser && (
          <div className="space-y-4 max-w-lg mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Hesap ve Bakiye Özeti</h3>
                <p className="text-xs text-slate-400">ÖztürkBank Vadesiz TL Hesabı</p>
              </div>
              <button
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Menü</span>
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hesap Sahibi:</span>
                <span className="font-semibold text-white">{currentUser.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">IBAN:</span>
                <span className="font-mono text-slate-200">{currentUser.iban}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hesap No:</span>
                <span className="font-mono text-slate-200">{currentUser.accountNumber}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2 flex justify-between text-sm font-bold">
                <span className="text-slate-300">Kullanılabilir Bakiye:</span>
                <span className="text-emerald-400 font-mono">
                  {formatCurrency(currentUser.balance)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Günlük Para Çekme Limiti:</span>
                <span className="font-mono">
                  {formatCurrency(currentUser.dailyWithdrawalLimit)} (Kalan:{' '}
                  {formatCurrency(currentUser.dailyWithdrawalLimit - currentUser.dailyWithdrawnAmount)})
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onViewReceipt}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hesap Bilgi Fişi Yazdır</span>
              </button>
              <button
                onClick={() => setScreenState('MAIN_MENU')}
                className="px-4 py-2 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800"
              >
                Tamam
              </button>
            </div>
          </div>
        )}

        {/* 9. PIN CHANGE SCREEN */}
        {screenState === 'PIN_CHANGE' && (
          <form onSubmit={handlePinChangeSubmit} className="space-y-3 max-w-sm mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Kart Şifresi Değiştirme</h3>
              <button
                type="button"
                onClick={() => setScreenState('MAIN_MENU')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
            </div>

            {pinChangeErr && (
              <div className="p-2 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs text-center">
                {pinChangeErr}
              </div>
            )}

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Mevcut Şifreniz:</label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="****"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Yeni 4 Haneli Şifre:</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="****"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Yeni Şifre Tekrar:</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="****"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors mt-1"
            >
              Şifreyi Değiştir
            </button>
          </form>
        )}

        {/* 10. PROCESSING SCREEN */}
        {screenState === 'PROCESSING' && (
          <div className="text-center space-y-4 max-w-sm mx-auto animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
            <div>
              <h3 className="text-base font-bold text-white">İşleminiz Gerçekleştiriliyor</h3>
              <p className="text-xs text-slate-400 mt-1">Lütfen bekleyiniz, banka bağlantısı kuruluyor...</p>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* 11. SUCCESS SCREEN */}
        {screenState === 'SUCCESS' && (
          <div className="text-center space-y-4 max-w-md mx-auto animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">İşleminiz Başarıyla Tamamlandı</h3>
              {lastTransaction && (
                <p className="text-xs text-slate-300 mt-1">
                  {lastTransaction.title} · Referans: <span className="font-mono">{lastTransaction.referenceNo}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
              {lastTransaction && (
                <button
                  onClick={onViewReceipt}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dekont Görüntüle</span>
                </button>
              )}

              <button
                onClick={() => setScreenState('MAIN_MENU')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
              >
                Başka İşlem Yap
              </button>

              <button
                onClick={onEjectCard}
                className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 rounded-xl border border-rose-800 transition-colors"
              >
                Kartımı Ver
              </button>
            </div>
          </div>
        )}

        {/* 12. ERROR SCREEN */}
        {screenState === 'ERROR' && (
          <div className="text-center space-y-4 max-w-md mx-auto animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">İşlem Gerçekleştirilemedi</h3>
              <p className="text-xs text-rose-300 mt-1 max-w-sm mx-auto">
                {errorMessage || 'Bilinmeyen bir hata oluştu veya yetkilendirme başarısız.'}
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setScreenState(currentUser ? 'MAIN_MENU' : 'WELCOME')}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Geri Dön
              </button>
              {!currentUser && (
                <button
                  onClick={onEjectCard}
                  className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950 hover:bg-rose-900 rounded-xl border border-rose-800 transition-colors"
                >
                  Kartı Çıkar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ATM Screen Footer Bezel */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
        <span>Geliştirici & Sistem Mimarı: {AUTHOR_NAME}</span>
        <span>{COPYRIGHT_NOTICE}</span>
      </div>
    </div>
  );
};
