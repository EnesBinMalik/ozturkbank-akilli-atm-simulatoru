import React, { useState, useMemo } from 'react';
import {
  UserAccount,
  Transaction,
  FraudLog,
  CashVault,
  EODReport,
  BillPaymentOption,
} from './types/atm';
import {
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_FRAUD_LOGS,
  INITIAL_VAULT_DENOMINATIONS,
  ATM_TERMINAL_ID,
  AUTHOR_NAME,
  COPYRIGHT_NOTICE,
  ATM_BANK_NAME,
} from './data/initialData';
import { AtmHeader } from './components/AtmHeader';
import { AtmScreen, ScreenState } from './components/AtmScreen';
import { Keypad } from './components/Keypad';
import { CardSlot } from './components/CardSlot';
import { CashSlot } from './components/CashSlot';
import { ReceiptModal } from './components/ReceiptModal';
import { EODModal } from './components/EODModal';
import { soundManager } from './utils/sound';
import {
  getFormattedDateDotted,
  getFormattedTime,
  generateEODFileName,
} from './utils/fileOperations';

export default function App() {
  // Accounts & System State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [insertedCardUser, setInsertedCardUser] = useState<UserAccount | null>(null);

  // Screen & Navigation
  const [screenState, setScreenState] = useState<ScreenState>('WELCOME');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Data Stores
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>(INITIAL_FRAUD_LOGS);
  const [vaultDenominations, setVaultDenominations] = useState<Record<number, number>>(INITIAL_VAULT_DENOMINATIONS);

  // Physical ATM Hardware Slot States
  const [isDispensingCash, setIsDispensingCash] = useState<boolean>(false);
  const [dispensedAmount, setDispensedAmount] = useState<number>(0);
  const [dispensedBreakdown, setDispensedBreakdown] = useState<Record<number, number>>({});
  const [cashStatusText, setCashStatusText] = useState<string>('');

  // Modals
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showEODModal, setShowEODModal] = useState<boolean>(false);

  // Starting Cash for EOD Accounting
  const initialVaultCash = useMemo(() => {
    return Object.entries(INITIAL_VAULT_DENOMINATIONS).reduce((acc, [k, v]) => acc + Number(k) * v, 0);
  }, []);

  // Current Total Cash in Vault
  const currentVaultCash = useMemo(() => {
    return Object.entries(vaultDenominations).reduce((acc, [k, v]) => acc + Number(k) * v, 0);
  }, [vaultDenominations]);

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  // 1. CARD INSERTION & USER REGISTRATION CHECK
  const handleInsertCard = (user: UserAccount | null, customCardNumber?: string) => {
    setPinInput('');
    setErrorMessage('');

    // If registered user was identified
    if (user) {
      if (user.isBlocked) {
        soundManager.playError();
        // Record fraud attempt for inserting a blocked card
        const newFraud: FraudLog = {
          id: `frd_${Date.now()}`,
          timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
          attemptedIdentifier: `${user.cardNumber} (${user.fullName})`,
          failureReason: 'Bloke Edilmiş Kart İle ATM Giriş Teşebbüsü',
          threatLevel: 'KRITIK',
          terminalId: ATM_TERMINAL_ID,
          ipAddress: '10.34.12.89',
          status: 'KART_BLOKE',
          details: 'Kart güvenlik tedbiri nedeniyle alıkonuldu ve işlem engellendi.',
        };
        setFraudLogs((prev) => [newFraud, ...prev]);
        setErrorMessage('Bu kart daha önce güvenlik nedeniyle bloke edilmiştir. Kartınıza el konulmuştur.');
        setScreenState('ERROR');
        return;
      }

      setInsertedCardUser(user);
      setScreenState('PIN_ENTRY');
      soundManager.playCardInsert();
      return;
    }

    // UNREGISTERED / UNRECOGNIZED CARD -> FRAUD DETECTION TRIGGER!
    soundManager.playError();
    const unknownCardLabel = customCardNumber || 'Tanımsız Manyetik Kart';
    const newFraud: FraudLog = {
      id: `frd_${Date.now()}`,
      timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
      attemptedIdentifier: unknownCardLabel,
      failureReason: 'Sistemde Kayıtlı Olmayan Geçersiz Kart Okutuldu',
      threatLevel: 'YUKSEK',
      terminalId: ATM_TERMINAL_ID,
      ipAddress: '10.34.12.89',
      status: 'ENGEL_ATILDI',
      details: 'Kart veri tabanında eşleşmedi. Fraud izleme sistemine kayıt düşüldü.',
    };

    setFraudLogs((prev) => [newFraud, ...prev]);
    setErrorMessage('Girdiğiniz kart sistemde kayıtlı değildir! Güvenlik nedeniyle işlem reddedildi.');
    setScreenState('ERROR');
  };

  // 2. PIN VERIFICATION
  const handleVerifyPin = (pin: string): boolean => {
    if (!insertedCardUser) return false;

    if (pin === insertedCardUser.pin) {
      // Success Login
      soundManager.playSuccess();
      const updatedUser = { ...insertedCardUser, failedPinAttempts: 0 };
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setInsertedCardUser(updatedUser);
      setCurrentUser(updatedUser);
      setScreenState('MAIN_MENU');
      return true;
    }

    // Wrong PIN
    soundManager.playError();
    const newAttempts = insertedCardUser.failedPinAttempts + 1;
    const isNowBlocked = newAttempts >= 3;

    const updatedUser = {
      ...insertedCardUser,
      failedPinAttempts: newAttempts,
      isBlocked: isNowBlocked,
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setInsertedCardUser(updatedUser);

    // Record Fraud Log
    const newFraud: FraudLog = {
      id: `frd_${Date.now()}`,
      timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
      attemptedIdentifier: `${insertedCardUser.cardNumber} (${insertedCardUser.fullName})`,
      failureReason: isNowBlocked
        ? '3 Kez Üst Üste Hatalı PIN Girişi (Kart Bloke Edildi)'
        : `${newAttempts}. Hatalı PIN Denemesi`,
      threatLevel: isNowBlocked ? 'KRITIK' : 'ORTA',
      terminalId: ATM_TERMINAL_ID,
      ipAddress: '10.34.12.89',
      status: isNowBlocked ? 'KART_BLOKE' : 'UYARI_KAYDEDILDI',
      details: isNowBlocked
        ? 'Hesap güvenliği için kart askıya alındı. Şubeden kimlik teyidi gereklidir.'
        : `Kalan şifre deneme hakkı: ${3 - newAttempts}`,
    };

    setFraudLogs((prev) => [newFraud, ...prev]);

    if (isNowBlocked) {
      setErrorMessage(
        'Kartınız 3 kez hatalı şifre girildiği için güvenlik sebebiyle BLOKE EDİLMİŞTİR.'
      );
      setScreenState('ERROR');
    } else {
      setErrorMessage(`Hatalı şifre! Kalan deneme hakkınız: ${3 - newAttempts}`);
      setScreenState('ERROR');
    }

    return false;
  };

  // 3. WITHDRAWAL OPERATION
  const handleWithdraw = (amount: number, printReceipt: boolean) => {
    if (!currentUser) return;

    // Check balance
    if (currentUser.balance < amount) {
      soundManager.playError();
      setErrorMessage(
        `Yetersiz bakiye! Çekilmek istenen: ${amount} TL, Mevcut Bakiye: ${currentUser.balance} TL`
      );
      setScreenState('ERROR');
      return;
    }

    // Check daily limit
    const remainingLimit = currentUser.dailyWithdrawalLimit - currentUser.dailyWithdrawnAmount;
    if (amount > remainingLimit) {
      soundManager.playError();
      setErrorMessage(
        `Günlük para çekme limitiniz aşıldı! Çekilebilir kalan limit: ${remainingLimit} TL`
      );
      setScreenState('ERROR');
      return;
    }

    // Check ATM Cash Vault
    if (amount > currentVaultCash) {
      soundManager.playError();
      setErrorMessage('ATM kasasında yeterli nakit bulunmamaktadır. Lütfen daha küçük bir tutar deneyiniz.');
      setScreenState('ERROR');
      return;
    }

    // Calculate Banknotes Distribution
    let remaining = amount;
    const breakdown: Record<number, number> = {};
    const updatedVault = { ...vaultDenominations };

    const denominations = [200, 100, 50, 20, 10];
    for (const d of denominations) {
      if (remaining >= d && updatedVault[d] > 0) {
        const countNeeded = Math.floor(remaining / d);
        const countGiven = Math.min(countNeeded, updatedVault[d]);
        if (countGiven > 0) {
          breakdown[d] = countGiven;
          remaining -= countGiven * d;
          updatedVault[d] -= countGiven;
        }
      }
    }

    if (remaining > 0) {
      soundManager.playError();
      setErrorMessage('ATM kasasında bu tutarı tam verecek uygun banknot kombinasyonu kalmadı.');
      setScreenState('ERROR');
      return;
    }

    // Transition to Processing
    setScreenState('PROCESSING');
    soundManager.playCashDispenser();

    setTimeout(() => {
      // Deduct balance and update user
      const newBalance = currentUser.balance - amount;
      const updatedUser: UserAccount = {
        ...currentUser,
        balance: newBalance,
        dailyWithdrawnAmount: currentUser.dailyWithdrawnAmount + amount,
      };

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      setVaultDenominations(updatedVault);

      // Create Transaction
      const refNo = `OZTRK-${Date.now().toString().slice(-8)}`;
      const breakdownText = Object.entries(breakdown)
        .map(([val, cnt]) => `${cnt}x ${val}₺`)
        .join(', ');

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNo: refNo,
        timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userCardMasked: currentUser.cardNumber,
        type: 'PARA_CEKME',
        title: 'Nakit Para Çekme',
        amount: amount,
        fee: 0,
        balanceAfter: newBalance,
        status: 'BASARILI',
        description: `Nakit Çekim (${breakdownText})`,
        details: { Banknotlar: breakdownText, Terminal: ATM_TERMINAL_ID },
      };

      setTransactions((prev) => [newTx, ...prev]);
      setReceiptTx(newTx);

      // Open Cash Slot
      setDispensedAmount(amount);
      setDispensedBreakdown(breakdown);
      setCashStatusText('Lütfen paranızı hazneden alınız');
      setIsDispensingCash(true);

      soundManager.playSuccess();
      setScreenState('SUCCESS');

      if (printReceipt) {
        setShowReceiptModal(true);
      }
    }, 1200);
  };

  // 4. DEPOSIT OPERATION
  const handleDeposit = (amount: number, targetIban?: string) => {
    if (!currentUser) return;

    setScreenState('PROCESSING');
    soundManager.playCashDispenser();

    setTimeout(() => {
      // Add cash to user balance
      const newBalance = currentUser.balance + amount;
      const updatedUser: UserAccount = {
        ...currentUser,
        balance: newBalance,
      };

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);

      // Add bills to vault (simulated mix)
      setVaultDenominations((prev) => ({
        ...prev,
        200: prev[200] + Math.floor(amount / 400),
        100: prev[100] + Math.floor((amount % 400) / 100),
      }));

      // Create Transaction
      const refNo = `OZTRK-${Date.now().toString().slice(-8)}`;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNo: refNo,
        timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userCardMasked: currentUser.cardNumber,
        type: 'PARA_YATIRMA',
        title: 'Hesaba Nakit Yatırma',
        amount: amount,
        fee: 0,
        balanceAfter: newBalance,
        status: 'BASARILI',
        description: targetIban ? `IBAN'a Yatırma: ${targetIban}` : 'Kendi Vadesiz Hesabına Yatırma',
        details: { Hesap: currentUser.accountNumber, Kanal: ATM_TERMINAL_ID },
      };

      setTransactions((prev) => [newTx, ...prev]);
      setReceiptTx(newTx);

      soundManager.playSuccess();
      setScreenState('SUCCESS');
      setShowReceiptModal(true);
    }, 1200);
  };

  // 5. BILL PAYMENT OPERATION
  const handlePayBill = (provider: BillPaymentOption, subNo: string, amount: number) => {
    if (!currentUser) return;
    const fee = 3.50;
    const totalDeduction = amount + fee;

    if (currentUser.balance < totalDeduction) {
      soundManager.playError();
      setErrorMessage(
        `Yetersiz bakiye! Fatura + Komisyon: ${totalDeduction.toFixed(2)} TL, Bakiyeniz: ${currentUser.balance.toFixed(2)} TL`
      );
      setScreenState('ERROR');
      return;
    }

    setScreenState('PROCESSING');

    setTimeout(() => {
      const newBalance = currentUser.balance - totalDeduction;
      const updatedUser: UserAccount = {
        ...currentUser,
        balance: newBalance,
      };

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);

      const refNo = `OZTRK-${Date.now().toString().slice(-8)}`;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNo: refNo,
        timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userCardMasked: currentUser.cardNumber,
        type: 'FATURA_ODEME',
        title: `${provider.category} Faturası Ödeme`,
        amount: amount,
        fee: fee,
        balanceAfter: newBalance,
        status: 'BASARILI',
        description: `${provider.provider} - Abone: ${subNo}`,
        details: { Kurum: provider.provider, Abone: subNo, Komisyon: `${fee} TL` },
      };

      setTransactions((prev) => [newTx, ...prev]);
      setReceiptTx(newTx);

      soundManager.playSuccess();
      setScreenState('SUCCESS');
      setShowReceiptModal(true);
    }, 1200);
  };

  // 6. FAST / TRANSFER OPERATION
  const handleTransfer = (
    recipientName: string,
    recipientIban: string,
    amount: number,
    description: string
  ) => {
    if (!currentUser) return;
    const fee = 4.20;
    const totalDeduction = amount + fee;

    if (currentUser.balance < totalDeduction) {
      soundManager.playError();
      setErrorMessage(
        `Yetersiz bakiye! Transfer + Masraf: ${totalDeduction.toFixed(2)} TL, Bakiyeniz: ${currentUser.balance.toFixed(2)} TL`
      );
      setScreenState('ERROR');
      return;
    }

    setScreenState('PROCESSING');

    setTimeout(() => {
      const newBalance = currentUser.balance - totalDeduction;
      const updatedUser: UserAccount = {
        ...currentUser,
        balance: newBalance,
      };

      // If recipient is another registered user, credit their account
      const cleanIban = recipientIban.replace(/\s+/g, '');
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) return updatedUser;
          if (u.iban.replace(/\s+/g, '') === cleanIban) {
            return { ...u, balance: u.balance + amount };
          }
          return u;
        })
      );
      setCurrentUser(updatedUser);

      const refNo = `OZTRK-${Date.now().toString().slice(-8)}`;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNo: refNo,
        timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userCardMasked: currentUser.cardNumber,
        type: 'FAST_TRANSFER',
        title: 'FAST Anlık Para Transferi',
        amount: amount,
        fee: fee,
        balanceAfter: newBalance,
        status: 'BASARILI',
        description: `Alıcı: ${recipientName} (${recipientIban})`,
        details: { Alıcı: recipientName, IBAN: recipientIban, Açıklama: description },
      };

      setTransactions((prev) => [newTx, ...prev]);
      setReceiptTx(newTx);

      soundManager.playSuccess();
      setScreenState('SUCCESS');
      setShowReceiptModal(true);
    }, 1200);
  };

  // 7. PIN CHANGE OPERATION
  const handleChangePin = (oldP: string, newP: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.pin !== oldP) {
      soundManager.playError();
      return false;
    }

    const updatedUser = { ...currentUser, pin: newP };
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    const refNo = `OZTRK-${Date.now().toString().slice(-8)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNo: refNo,
      timestamp: `${getFormattedDateDotted()} ${getFormattedTime()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userCardMasked: currentUser.cardNumber,
      type: 'SIFRE_DEGISTIRME',
      title: 'Kart Şifresi Güncelleme',
      amount: 0,
      fee: 0,
      balanceAfter: currentUser.balance,
      status: 'BASARILI',
      description: 'Müşteri tarafından ATM üzerinden şifre başarıyla değiştirildi.',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setReceiptTx(newTx);

    soundManager.playSuccess();
    setScreenState('SUCCESS');
    return true;
  };

  // EJECT CARD & LOGOUT
  const handleEjectCard = () => {
    soundManager.playCardInsert();
    setCurrentUser(null);
    setInsertedCardUser(null);
    setPinInput('');
    setScreenState('WELCOME');
    setIsDispensingCash(false);
  };

  // KEYPAD ACTIONS
  const handleKeypadPress = (val: string) => {
    if (screenState === 'PIN_ENTRY') {
      if (pinInput.length < 4 && !isNaN(Number(val))) {
        setPinInput((prev) => prev + val);
      }
    }
  };

  const handleKeypadClear = () => {
    if (screenState === 'PIN_ENTRY') {
      setPinInput('');
    }
  };

  const handleKeypadEnter = () => {
    if (screenState === 'PIN_ENTRY') {
      handleVerifyPin(pinInput);
    }
  };

  const handleKeypadCancel = () => {
    if (screenState === 'PIN_ENTRY' || screenState === 'WELCOME') {
      handleEjectCard();
    } else {
      setScreenState('MAIN_MENU');
    }
  };

  // Close Cash Slot
  const handleCollectCash = () => {
    soundManager.playCardInsert();
    setIsDispensingCash(false);
    setDispensedAmount(0);
    setDispensedBreakdown({});
  };

  // Current Dynamic EOD Report
  const currentEODReport: EODReport = useMemo(() => {
    const totalWithdrawn = transactions
      .filter((t) => t.type === 'PARA_CEKME' && t.status === 'BASARILI')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDeposited = transactions
      .filter((t) => t.type === 'PARA_YATIRMA' && t.status === 'BASARILI')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalPayments = transactions
      .filter((t) => (t.type === 'FATURA_ODEME' || t.type === 'FAST_TRANSFER') && t.status === 'BASARILI')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalFeesCollected = transactions
      .filter((t) => t.status === 'BASARILI')
      .reduce((acc, t) => acc + t.fee, 0);

    const successfulCount = transactions.filter((t) => t.status === 'BASARILI').length;
    const failedCount = transactions.filter((t) => t.status !== 'BASARILI').length;

    return {
      terminalId: ATM_TERMINAL_ID,
      reportDate: getFormattedDateDotted(),
      reportTime: getFormattedTime(),
      fileName: generateEODFileName(),
      author: AUTHOR_NAME,
      copyright: COPYRIGHT_NOTICE,
      totalTransactionsCount: transactions.length,
      successfulTransactionsCount: successfulCount,
      failedTransactionsCount: failedCount,
      totalWithdrawn,
      totalDeposited,
      totalPayments,
      totalFeesCollected,
      initialVaultCash,
      currentVaultCash,
      vaultDenominations,
      transactions,
      fraudLogs,
    };
  }, [transactions, fraudLogs, vaultDenominations, initialVaultCash, currentVaultCash]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar adhering to frontend design Top Bar Contract */}
      <AtmHeader
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenEOD={() => setShowEODModal(true)}
        isLoggedIn={Boolean(currentUser)}
        userName={currentUser?.fullName}
        onEjectCard={handleEjectCard}
        fraudAlertCount={fraudLogs.filter((f) => f.threatLevel === 'KRITIK' || f.threatLevel === 'YUKSEK').length}
      />

      {/* Main ATM Physical Console Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center">
        {/* ATM Casing Bezel */}
        <div className="w-full max-w-5xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl relative">
          {/* Top Metallic Branding Strip */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
              <div>
                <span className="text-sm font-bold tracking-tight text-white block">
                  {ATM_BANK_NAME}
                </span>
                <span className="text-[11px] text-slate-400">
                  Etkileşimli ATM İşlem Simülasyonu
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400 block font-mono">
                {AUTHOR_NAME}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {COPYRIGHT_NOTICE}
              </span>
            </div>
          </div>

          {/* Grid Layout: Left Screen, Right Hardware Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Screen Column (7 cols) */}
            <div className="lg:col-span-7 w-full">
              <AtmScreen
                screenState={screenState}
                setScreenState={setScreenState}
                currentUser={currentUser}
                onVerifyPin={handleVerifyPin}
                onWithdraw={handleWithdraw}
                onDeposit={handleDeposit}
                onPayBill={handlePayBill}
                onTransfer={handleTransfer}
                onChangePin={handleChangePin}
                onEjectCard={handleEjectCard}
                onOpenEOD={() => setShowEODModal(true)}
                lastTransaction={receiptTx}
                onViewReceipt={() => setShowReceiptModal(true)}
                errorMessage={errorMessage}
                pinInput={pinInput}
                setPinInput={setPinInput}
              />
            </div>

            {/* Hardware Controls Column (5 cols): Card Slot, Keypad, Cash Slot */}
            <div className="lg:col-span-5 w-full space-y-4">
              {/* Card Slot */}
              <CardSlot
                insertedCard={insertedCardUser}
                registeredUsers={users}
                onInsertCard={handleInsertCard}
                onEjectCard={handleEjectCard}
                disabled={screenState === 'PROCESSING'}
              />

              {/* Physical Keypad */}
              <Keypad
                onKeyPress={handleKeypadPress}
                onClear={handleKeypadClear}
                onEnter={handleKeypadEnter}
                onCancel={handleKeypadCancel}
                disabled={screenState === 'PROCESSING'}
              />

              {/* Cash Dispenser Shutter Slot */}
              <CashSlot
                isDispensing={isDispensingCash}
                dispensedAmount={dispensedAmount}
                dispensedBreakdown={dispensedBreakdown}
                onCollectCash={handleCollectCash}
                statusText={cashStatusText}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          ÖztürkBank Akıllı ATM Sistemi · Geliştirici ve Sistem Mimarı:{' '}
          <strong className="text-slate-300 font-semibold">{AUTHOR_NAME}</strong> ·{' '}
          {COPYRIGHT_NOTICE}
        </p>
      </footer>

      {/* Thermal Receipt Print Modal */}
      {showReceiptModal && (
        <ReceiptModal
          transaction={receiptTx}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* End of Day (EOD) Modal with File Write & Read */}
      {showEODModal && (
        <EODModal
          isOpen={showEODModal}
          onClose={() => setShowEODModal(false)}
          report={currentEODReport}
        />
      )}
    </div>
  );
}
