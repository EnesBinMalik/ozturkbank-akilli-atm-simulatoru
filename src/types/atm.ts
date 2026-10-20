export interface UserAccount {
  id: string;
  cardNumber: string; // e.g. "4543 **** **** 6789"
  fullCardNumber: string; // "4543890123456789"
  pin: string; // "1923"
  fullName: string;
  tcKimlikNo: string;
  iban: string;
  accountNumber: string;
  balance: number;
  dailyWithdrawalLimit: number;
  dailyWithdrawnAmount: number;
  isBlocked: boolean;
  failedPinAttempts: number;
  cardType: 'Debit (Banka Kartı)' | 'Credit (Kredi Kartı)';
  avatarBg: string;
}

export type TransactionType =
  | 'PARA_CEKME'
  | 'PARA_YATIRMA'
  | 'FATURA_ODEME'
  | 'KREDI_KARTI_ODEME'
  | 'FAST_TRANSFER'
  | 'HAVALE_EFT'
  | 'SIFRE_DEGISTIRME'
  | 'BAKIYE_SORGULAMA';

export interface Transaction {
  id: string;
  referenceNo: string;
  timestamp: string; // ISO string or "YYYY-MM-DD HH:mm:ss"
  userId: string;
  userName: string;
  userCardMasked: string;
  type: TransactionType;
  title: string;
  amount: number;
  fee: number;
  balanceAfter: number;
  status: 'BASARILI' | 'BASARISIZ' | 'IPTAL';
  description: string;
  details?: Record<string, string | number>;
}

export interface FraudLog {
  id: string;
  timestamp: string;
  attemptedIdentifier: string; // Card number or TC entered
  failureReason: string;
  threatLevel: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  terminalId: string;
  ipAddress: string;
  status: 'ENGEL_ATILDI' | 'KART_BLOKE' | 'UYARI_KAYDEDILDI';
  details: string;
}

export interface CashDenomination {
  value: number; // 200, 100, 50, 20, 10
  count: number;
}

export interface CashVault {
  denominations: Record<number, number>; // value -> count
  totalCash: number;
}

export interface BillPaymentOption {
  id: string;
  category: 'Elektrik' | 'Su' | 'Doğalgaz' | 'İnternet' | 'GSM';
  provider: string;
  subscriberNoPrompt: string;
  sampleAmount: number;
}

export interface EODReport {
  terminalId: string;
  reportDate: string; // DD.MM.YYYY
  reportTime: string; // HH:mm:ss
  fileName: string; // EOD_DDMMYYYY.txt
  author: string; // "Enes Öztürk"
  copyright: string;
  totalTransactionsCount: number;
  successfulTransactionsCount: number;
  failedTransactionsCount: number;
  totalWithdrawn: number;
  totalDeposited: number;
  totalPayments: number;
  totalFeesCollected: number;
  initialVaultCash: number;
  currentVaultCash: number;
  vaultDenominations: Record<number, number>;
  transactions: Transaction[];
  fraudLogs: FraudLog[];
}
