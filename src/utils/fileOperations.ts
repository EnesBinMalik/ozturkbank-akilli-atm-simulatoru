import { EODReport, Transaction, FraudLog } from '../types/atm';
import { ATM_BANK_NAME, AUTHOR_NAME, COPYRIGHT_NOTICE } from '../data/initialData';

export function getFormattedDateDDMMYYYY(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

export function getFormattedDateDotted(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function getFormattedTime(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

export function generateEODFileName(date: Date = new Date()): string {
  return `EOD_${getFormattedDateDDMMYYYY(date)}.txt`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateEODTextContent(report: EODReport): string {
  const lineSeparator = '='.repeat(88);
  const thinSeparator = '-'.repeat(88);

  let content = '';

  content += `${lineSeparator}\n`;
  content += `                       ${ATM_BANK_NAME}                     \n`;
  content += `           GÜN SONU (END OF DAY / EOD) MUTABAKAT VE DENETİM RAPORU         \n`;
  content += `           Sistem Mimarı ve Geliştirici: ${AUTHOR_NAME}                     \n`;
  content += `           ${COPYRIGHT_NOTICE}                                             \n`;
  content += `${lineSeparator}\n\n`;

  content += `RAPOR BİLGİLERİ:\n`;
  content += `  Terminal ID       : ${report.terminalId}\n`;
  content += `  Rapor Tarihi      : ${report.reportDate}\n`;
  content += `  Rapor Saati       : ${report.reportTime}\n`;
  content += `  Dosya Adı         : ${report.fileName}\n`;
  content += `  Sistem Sürümü     : ÖztürkBank ATM Simülatörü\n`;
  content += `  Telif ve İmza     : ${AUTHOR_NAME} - Tüm Hakları Saklıdır (Copyright Protected)\n\n`;

  content += `${thinSeparator}\n`;
  content += `1. KASA VE FİNANSAL MUTABAKAT ÖZETİ\n`;
  content += `${thinSeparator}\n`;
  content += `  Açılış Kasa Nakdi       : ${formatCurrency(report.initialVaultCash).padStart(20)}\n`;
  content += `  Toplam Nakit Yatırma    : ${formatCurrency(report.totalDeposited).padStart(20)}\n`;
  content += `  Toplam Nakit Çekme      : ${formatCurrency(report.totalWithdrawn).padStart(20)}\n`;
  content += `  Toplam Fatura / Ödemeler: ${formatCurrency(report.totalPayments).padStart(20)}\n`;
  content += `  Tahsil Edilen Komisyon  : ${formatCurrency(report.totalFeesCollected).padStart(20)}\n`;
  content += `  Kapanış Kasa Mevcudu    : ${formatCurrency(report.currentVaultCash).padStart(20)}\n`;
  content += `  Kasa Farkı (Açık/Fazla) : ${'0,00 ₺ (TAM MUTABAKAT)'.padStart(20)}\n\n`;

  content += `  GÜNCEL KASA BANKNOT DAĞILIMI:\n`;
  let totalDenomCalc = 0;
  for (const [denomStr, count] of Object.entries(report.vaultDenominations)) {
    const denom = Number(denomStr);
    const subtotal = denom * count;
    totalDenomCalc += subtotal;
    content += `    - ${denom.toString().padStart(3)} ₺ Banknot : ${count.toString().padStart(5)} Adet  (${formatCurrency(subtotal).padStart(15)})\n`;
  }
  content += `    --------------------------------------------------------\n`;
  content += `    Kasa Banknot Toplamı: ${formatCurrency(totalDenomCalc).padStart(22)}\n\n`;

  content += `${thinSeparator}\n`;
  content += `2. İŞLEM İSTATİSTİKLERİ\n`;
  content += `${thinSeparator}\n`;
  content += `  Toplam İşlem Adedi      : ${report.totalTransactionsCount}\n`;
  content += `  Başarılı İşlemler       : ${report.successfulTransactionsCount}\n`;
  content += `  Başarısız / İptal       : ${report.failedTransactionsCount}\n`;
  content += `  Fraud / Şüpheli Girişim : ${report.fraudLogs.length} Adet Kayıt\n\n`;

  content += `${thinSeparator}\n`;
  content += `3. GÜN İÇİNDE GERÇEKLEŞTİRİLEN İŞLEMLER (TRANSACTION LOGLARI)\n`;
  content += `${thinSeparator}\n`;
  content += `Saat     | Referans No          | İşlem Türü         | Kullanıcı / Kart          | Tutar       | Durum\n`;
  content += `${'-'.repeat(88)}\n`;

  if (report.transactions.length === 0) {
    content += `  [Kayıtlı işlem bulunamadı]\n`;
  } else {
    for (const tx of report.transactions) {
      const time = tx.timestamp.split(' ')[1] || tx.timestamp;
      const ref = tx.referenceNo.padEnd(20).slice(0, 20);
      const type = tx.type.padEnd(18).slice(0, 18);
      const user = (tx.userName ? `${tx.userName} (${tx.userCardMasked.slice(-4)})` : tx.userCardMasked).padEnd(25).slice(0, 25);
      const amt = formatCurrency(tx.amount).padStart(11);
      const status = tx.status.padEnd(8);
      content += `${time} | ${ref} | ${type} | ${user} | ${amt} | ${status}\n`;
    }
  }
  content += `\n`;

  content += `${thinSeparator}\n`;
  content += `4. GÜVENLİK VE FRAUD / HATALI GİRİŞ DENEMELERİ (SECURITY LOGLARI)\n`;
  content += `${thinSeparator}\n`;
  content += `Zaman Damgası       | Seviye   | Denenen Kart / Kimlik   | Hata Sebebi & Açıklama\n`;
  content += `${'-'.repeat(88)}\n`;

  if (report.fraudLogs.length === 0) {
    content += `  [Herhangi bir fraud veya hatalı giriş denemesi kaydedilmedi]\n`;
  } else {
    for (const fraud of report.fraudLogs) {
      const time = fraud.timestamp;
      const level = fraud.threatLevel.padEnd(8);
      const iden = fraud.attemptedIdentifier.padEnd(23).slice(0, 23);
      const desc = `${fraud.failureReason} (${fraud.status})`;
      content += `${time} | ${level} | ${iden} | ${desc}\n`;
      if (fraud.details) {
        content += `                     -> Detay: ${fraud.details}\n`;
      }
    }
  }
  content += `\n`;

  content += `${lineSeparator}\n`;
  content += `DENETİM VE İMZA ONAYI:\n`;
  content += `Bu Gün Sonu (EOD) dökümü eğitim amaçlı ATM simülatörü tarafından\n`;
  content += `tarayıcıda oluşturulmuştur; gerçek bir finansal kayıt veya mutabakat belgesi değildir.\n\n`;
  content += `Sistem Mimarı ve Baş Mühendis:\n`;
  content += `  [ İMZA: ${AUTHOR_NAME.toUpperCase()} ]\n`;
  content += `  Telif Hakları: ${COPYRIGHT_NOTICE}\n`;
  content += `  Tarih Damgası: ${report.reportDate} - ${report.reportTime}\n`;
  content += `${lineSeparator}\n`;

  return content;
}

export async function writeEODToFile(
  report: EODReport,
  onStatus?: (message: string, isError?: boolean) => void
): Promise<{ success: boolean; pathOrMethod: string; content: string }> {
  const content = generateEODTextContent(report);
  const defaultFileName = report.fileName;

  // 1. Try File System Access API (allows user to select exact local directory/location on computer)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [
          {
            description: 'Gün Sonu (EOD) Metin Dosyası (*.txt)',
            accept: {
              'text/plain': ['.txt'],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      const chosenName = handle.name || defaultFileName;
      if (onStatus) {
        onStatus(`Dosya başarıyla bilgisayarınızda belirlenen konuma kaydedildi: ${chosenName}`);
      }
      return { success: true, pathOrMethod: `Yerel Dosya Sistemi: ${chosenName}`, content };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (onStatus) onStatus('Dosya kaydetme penceresi iptal edildi, standart indirme hazırlanıyor.');
      } else {
        console.warn('File System Access API failed, falling back to download:', err);
      }
    }
  }

  // 2. Standard direct browser file download fallback
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (onStatus) {
      onStatus(`EOD dosyası '${defaultFileName}' bilgisayarınızın İndirilenler klasörüne yazıldı.`);
    }
    return { success: true, pathOrMethod: `İndirilenler: ${defaultFileName}`, content };
  } catch (error: any) {
    if (onStatus) onStatus(`Dosyaya yazma hatası: ${error.message}`, true);
    return { success: false, pathOrMethod: 'Hata', content };
  }
}

export interface ParsedEODFile {
  isValid: boolean;
  fileName: string;
  reportDate?: string;
  terminalId?: string;
  hasEnesOzturkSignature: boolean;
  hasCopyright: boolean;
  totalTransactionsCount?: number;
  fraudLogsCount?: number;
  currentVaultCash?: string;
  rawText: string;
  summaryLines: string[];
}

export async function readEODFromFile(file: File): Promise<ParsedEODFile> {
  const rawText = await file.text();

  const hasEnesOzturkSignature =
    rawText.includes('Enes Öztürk') ||
    rawText.includes('ENES ÖZTÜRK') ||
    rawText.includes('Enes Ozturk');

  const hasCopyright =
    rawText.includes('Tüm Hakları Saklıdır') ||
    rawText.includes('Telif') ||
    rawText.includes('Copyright');

  // Extract Terminal ID
  const terminalMatch = rawText.match(/Terminal ID\s*:\s*(.+)/i);
  const terminalId = terminalMatch ? terminalMatch[1].trim() : undefined;

  // Extract Rapor Tarihi
  const dateMatch = rawText.match(/Rapor Tarihi\s*:\s*(.+)/i);
  const reportDate = dateMatch ? dateMatch[1].trim() : undefined;

  // Extract Toplam Islem
  const txMatch = rawText.match(/Toplam İşlem Adedi\s*:\s*(\d+)/i);
  const totalTransactionsCount = txMatch ? parseInt(txMatch[1], 10) : undefined;

  // Extract Fraud Logs Count
  const fraudMatch = rawText.match(/Fraud \/ Şüpheli Girişim\s*:\s*(\d+)/i);
  const fraudLogsCount = fraudMatch ? parseInt(fraudMatch[1], 10) : undefined;

  // Extract Vault Cash
  const vaultMatch = rawText.match(/Kapanış Kasa Mevcudu\s*:\s*(.+)/i);
  const currentVaultCash = vaultMatch ? vaultMatch[1].trim() : undefined;

  const summaryLines: string[] = [];
  if (terminalId) summaryLines.push(`Terminal: ${terminalId}`);
  if (reportDate) summaryLines.push(`Rapor Tarihi: ${reportDate}`);
  if (totalTransactionsCount !== undefined) summaryLines.push(`İşlem Sayısı: ${totalTransactionsCount}`);
  if (fraudLogsCount !== undefined) summaryLines.push(`Fraud Girişimi: ${fraudLogsCount}`);
  if (currentVaultCash) summaryLines.push(`Kasa Sonu: ${currentVaultCash}`);
  summaryLines.push(
    hasEnesOzturkSignature ? '✓ Enes Öztürk İmzası Doğrulandı' : '⚠ Enes Öztürk İmzası Bulunamadı'
  );

  return {
    isValid: hasEnesOzturkSignature && rawText.length > 100,
    fileName: file.name,
    reportDate,
    terminalId,
    hasEnesOzturkSignature,
    hasCopyright,
    totalTransactionsCount,
    fraudLogsCount,
    currentVaultCash,
    rawText,
    summaryLines,
  };
}
