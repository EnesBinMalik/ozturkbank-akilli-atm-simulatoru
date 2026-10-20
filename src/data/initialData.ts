import { UserAccount, Transaction, FraudLog, BillPaymentOption } from '../types/atm';

export const ATM_TERMINAL_ID = 'ATM-IST-3401';
export const ATM_BANK_NAME = 'ÖZTÜRK BANK A.Ş.';
export const AUTHOR_NAME = 'Enes Öztürk';
export const COPYRIGHT_NOTICE = '© 2026 Enes Öztürk. Tüm Hakları Saklıdır.';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_001',
    fullName: 'Enes Öztürk',
    cardNumber: '4543 **** **** 6789',
    fullCardNumber: '4543890123456789',
    pin: '1923',
    tcKimlikNo: '28471938402',
    iban: 'TR32 0006 1005 1234 5678 9012 34',
    accountNumber: '1005-1234567',
    balance: 52450.00,
    dailyWithdrawalLimit: 20000.00,
    dailyWithdrawnAmount: 1500.00,
    isBlocked: false,
    failedPinAttempts: 0,
    cardType: 'Debit (Banka Kartı)',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'usr_002',
    fullName: 'Ahmet Yılmaz',
    cardNumber: '5421 **** **** 1099',
    fullCardNumber: '5421000000001099',
    pin: '1453',
    tcKimlikNo: '19028374650',
    iban: 'TR45 0006 1005 9876 5432 1098 76',
    accountNumber: '1005-9876543',
    balance: 14800.00,
    dailyWithdrawalLimit: 10000.00,
    dailyWithdrawnAmount: 0.00,
    isBlocked: false,
    failedPinAttempts: 0,
    cardType: 'Debit (Banka Kartı)',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'usr_003',
    fullName: 'Zeynep Kaya',
    cardNumber: '4921 **** **** 5566',
    fullCardNumber: '4921112233445566',
    pin: '2024',
    tcKimlikNo: '34810293841',
    iban: 'TR12 0006 1005 1122 3344 5566 77',
    accountNumber: '1005-1122334',
    balance: 8350.00,
    dailyWithdrawalLimit: 7500.00,
    dailyWithdrawnAmount: 600.00,
    isBlocked: false,
    failedPinAttempts: 0,
    cardType: 'Credit (Kredi Kartı)',
    avatarBg: 'bg-purple-600',
  },
  {
    id: 'usr_004',
    fullName: 'Can Demir',
    cardNumber: '5526 **** **** 7788',
    fullCardNumber: '5526334455667788',
    pin: '9876',
    tcKimlikNo: '48291048291',
    iban: 'TR89 0006 1005 3344 5566 7788 99',
    accountNumber: '1005-3344556',
    balance: 31200.00,
    dailyWithdrawalLimit: 15000.00,
    dailyWithdrawnAmount: 0.00,
    isBlocked: false,
    failedPinAttempts: 0,
    cardType: 'Debit (Banka Kartı)',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'usr_005',
    fullName: 'Mehmet Öz (Bloke Kart)',
    cardNumber: '4000 **** **** 9999',
    fullCardNumber: '4000123456789999',
    pin: '0000',
    tcKimlikNo: '58192038472',
    iban: 'TR66 0006 1005 4000 1234 5678 99',
    accountNumber: '1005-4000123',
    balance: 2100.00,
    dailyWithdrawalLimit: 5000.00,
    dailyWithdrawnAmount: 0.00,
    isBlocked: true,
    failedPinAttempts: 3,
    cardType: 'Debit (Banka Kartı)',
    avatarBg: 'bg-rose-600',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_101',
    referenceNo: 'OZTRK-20261020-09142',
    timestamp: '2026-10-20 09:14:22',
    userId: 'usr_001',
    userName: 'Enes Öztürk',
    userCardMasked: '4543 **** **** 6789',
    type: 'PARA_CEKME',
    title: 'Nakit Para Çekme',
    amount: 1500.00,
    fee: 0.00,
    balanceAfter: 52450.00,
    status: 'BASARILI',
    description: 'ATM Kasa 1 Üzerinden Nakit Çekim (5x200₺, 5x100₺)',
    details: { 'Banknot Dağılımı': '5x 200₺, 5x 100₺', 'Kanal': 'ATM-IST-3401' }
  },
  {
    id: 'tx_102',
    referenceNo: 'OZTRK-20261020-10221',
    timestamp: '2026-10-20 10:22:15',
    userId: 'usr_003',
    userName: 'Zeynep Kaya',
    userCardMasked: '4921 **** **** 5566',
    type: 'FATURA_ODEME',
    title: 'Elektrik Faturası Ödeme',
    amount: 450.00,
    fee: 3.50,
    balanceAfter: 8350.00,
    status: 'BASARILI',
    description: 'BEDAŞ Abone No: 9481029 - Otomatik Dekontlu',
    details: { 'Kurum': 'BEDAŞ', 'Abone No': '9481029', 'Dönem': '10/2026' }
  },
  {
    id: 'tx_103',
    referenceNo: 'OZTRK-20261020-10450',
    timestamp: '2026-10-20 10:45:08',
    userId: 'usr_002',
    userName: 'Ahmet Yılmaz',
    userCardMasked: '5421 **** **** 1099',
    type: 'PARA_YATIRMA',
    title: 'Hesaba Nakit Yatırma',
    amount: 5000.00,
    fee: 0.00,
    balanceAfter: 14800.00,
    status: 'BASARILI',
    description: 'Para Yatırma Haznesi Üzerinden Bakiye Girişi',
    details: { 'Yatırılan Adet': '20x 200₺, 10x 100₺', 'Hesap': '1005-9876543' }
  },
  {
    id: 'tx_104',
    referenceNo: 'OZTRK-20261020-11104',
    timestamp: '2026-10-20 11:10:44',
    userId: 'usr_004',
    userName: 'Can Demir',
    userCardMasked: '5526 **** **** 7788',
    type: 'FAST_TRANSFER',
    title: 'FAST 7/24 Para Transferi',
    amount: 1850.00,
    fee: 4.20,
    balanceAfter: 31200.00,
    status: 'BASARILI',
    description: 'Alıcı: Selim Vural (TR55 0006 1005 8899 7766 5544 33)',
    details: { 'Alıcı': 'Selim Vural', 'Açıklama': 'Kira Ödemesi', 'Tip': 'FAST Anlık' }
  },
  {
    id: 'tx_105',
    referenceNo: 'OZTRK-20261020-11301',
    timestamp: '2026-10-20 11:30:19',
    userId: 'usr_003',
    userName: 'Zeynep Kaya',
    userCardMasked: '4921 **** **** 5566',
    type: 'PARA_CEKME',
    title: 'Nakit Para Çekme',
    amount: 600.00,
    fee: 0.00,
    balanceAfter: 8350.00,
    status: 'BASARILI',
    description: 'ATM Nakit Dağıtıcı (3x200₺)',
    details: { 'Banknot': '3x 200₺' }
  }
];

export const INITIAL_FRAUD_LOGS: FraudLog[] = [
  {
    id: 'frd_001',
    timestamp: '2026-10-20 03:41:12',
    attemptedIdentifier: '9845 **** **** 1290 (Tanımsız)',
    failureReason: 'Sistemde Kayıtlı Olmayan Manyetik Kart Okutuldu',
    threatLevel: 'YUKSEK',
    terminalId: ATM_TERMINAL_ID,
    ipAddress: '10.34.12.89',
    status: 'ENGEL_ATILDI',
    details: 'Geçersiz banka BIN kodu ve kayıt dışı kullanıcı hash kontrolü başarısız oldu.'
  },
  {
    id: 'frd_002',
    timestamp: '2026-10-20 07:18:55',
    attemptedIdentifier: '4000 **** **** 9999 (Mehmet Öz)',
    failureReason: '3 Kez Üst Üste Hatalı PIN Girişi - Güvenlik İhlali',
    threatLevel: 'KRITIK',
    terminalId: ATM_TERMINAL_ID,
    ipAddress: '10.34.12.89',
    status: 'KART_BLOKE',
    details: 'Kullanıcı hesabı ve kartı fraud şüphesi nedeniyle otomatik olarak bloke edildi.'
  },
  {
    id: 'frd_003',
    timestamp: '2026-10-20 08:52:03',
    attemptedIdentifier: '5421 **** **** 1099 (Ahmet Yılmaz)',
    failureReason: '1. PIN Denemesi Hatalı',
    threatLevel: 'DUSUK',
    terminalId: ATM_TERMINAL_ID,
    ipAddress: '10.34.12.89',
    status: 'UYARI_KAYDEDILDI',
    details: 'Tekil yanlış şifre denemesi, bir sonraki denemede doğru şifre ile giriş yapıldı.'
  }
];

export const INITIAL_VAULT_DENOMINATIONS: Record<number, number> = {
  200: 450, // 90,000 TL
  100: 720, // 72,000 TL
  50: 500,  // 25,000 TL
  20: 400,  // 8,000 TL
  10: 400   // 4,000 TL
};

export const BILL_PROVIDERS: BillPaymentOption[] = [
  { id: 'bp_1', category: 'Elektrik', provider: 'Enerjisa / BEDAŞ Elektrik Dağıtım', subscriberNoPrompt: '10 Haneli Abone / Tesisat No', sampleAmount: 485.50 },
  { id: 'bp_2', category: 'Su', provider: 'İSKİ İstanbul Su ve Kanalizasyon', subscriberNoPrompt: '8 Haneli Mukavele No', sampleAmount: 230.00 },
  { id: 'bp_3', category: 'Doğalgaz', provider: 'İGDAŞ İstanbul Gaz Dağıtım A.Ş.', subscriberNoPrompt: '12 Haneli Sözleşme No', sampleAmount: 760.25 },
  { id: 'bp_4', category: 'İnternet', provider: 'Türk Telekom Evde İnternet / Fiber', subscriberNoPrompt: 'Hizmet / Müşteri Numarası', sampleAmount: 399.90 },
  { id: 'bp_5', category: 'GSM', provider: 'Turkcell Fatura & Paket Yükleme', subscriberNoPrompt: 'Başında Sıfır Olmadan Cep Telefonu (5xx)', sampleAmount: 285.00 },
  { id: 'bp_6', category: 'GSM', provider: 'Vodafone GSM Fatura Ödemesi', subscriberNoPrompt: 'Başında Sıfır Olmadan Cep Telefonu (5xx)', sampleAmount: 250.00 },
];
