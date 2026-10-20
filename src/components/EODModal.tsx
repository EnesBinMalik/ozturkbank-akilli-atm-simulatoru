import React, { useState } from 'react';
import {
  EODReport,
  Transaction,
  FraudLog,
} from '../types/atm';
import {
  writeEODToFile,
  readEODFromFile,
  ParsedEODFile,
  formatCurrency,
  generateEODTextContent,
  generateEODFileName,
} from '../utils/fileOperations';
import { AUTHOR_NAME, COPYRIGHT_NOTICE, ATM_BANK_NAME, ATM_TERMINAL_ID } from '../data/initialData';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  ShieldAlert,
  ListOrdered,
  Vault,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Search,
  Check,
} from 'lucide-react';

interface EODModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: EODReport;
}

export const EODModal: React.FC<EODModalProps> = ({ isOpen, onClose, report }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'fraud' | 'export' | 'import'>('summary');
  const [saveStatus, setSaveStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedEODFile | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [txSearch, setTxSearch] = useState('');
  const [fraudSearch, setFraudSearch] = useState('');

  if (!isOpen) return null;

  const rawEODContent = generateEODTextContent(report);
  const expectedFileName = report.fileName;

  const handleWriteToFile = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await writeEODToFile(report, (msg, isErr) => {
        setSaveStatus({ message: msg, isError: isErr });
      });
      if (res.success) {
        setSaveStatus({
          message: `EOD Dosyası başarıyla yazıldı! (${res.pathOrMethod})`,
          isError: false,
        });
      }
    } catch (err: any) {
      setSaveStatus({ message: `Hata oluştu: ${err.message}`, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsReadingFile(true);
    setFileReadError(null);
    try {
      const result = await readEODFromFile(file);
      setParsedFile(result);
    } catch (err: any) {
      setFileReadError(`Dosya okuma başarısız: ${err.message}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(rawEODContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTransactions = report.transactions.filter(
    (tx) =>
      tx.referenceNo.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.userName.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.title.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.type.toLowerCase().includes(txSearch.toLowerCase())
  );

  const filteredFraud = report.fraudLogs.filter(
    (f) =>
      f.attemptedIdentifier.toLowerCase().includes(fraudSearch.toLowerCase()) ||
      f.failureReason.toLowerCase().includes(fraudSearch.toLowerCase()) ||
      f.threatLevel.toLowerCase().includes(fraudSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  GÜN SONU (END OF DAY / EOD) DENETİM RAPORU
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  {expectedFileName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ATM_BANK_NAME} · {ATM_TERMINAL_ID} · {report.reportDate} {report.reportTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWriteToFile}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Yazılıyor...' : 'Dosyaya Yaz (.txt İndir)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/60 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Vault className="w-3.5 h-3.5" />
            <span>Kasa & Mutabakat</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>İşlem Logları ({report.transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'fraud'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fraud & Güvenlik Logları ({report.fraudLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dosyaya Yazma (EOD_*.txt)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Dosyadan Okuma & Doğrulama</span>
          </button>
        </div>

        {/* Notification Status Banner */}
        {saveStatus && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between shrink-0 ${
              saveStatus.isError
                ? 'bg-rose-950/80 text-rose-200 border-b border-rose-800'
                : 'bg-emerald-950/80 text-emerald-200 border-b border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {saveStatus.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{saveStatus.message}</span>
            </div>
            <button
              onClick={() => setSaveStatus(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* TAB 1: SUMMARY & VAULT */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Açılış Kasa Nakdi</span>
                  <span className="text-lg font-bold text-slate-200 font-mono mt-1 block">
                    {formatCurrency(report.initialVaultCash)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Sabah Kasa Devri</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Toplam Nakit Yatırma</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
                    +{formatCurrency(report.totalDeposited)}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 mt-1 block">Kasaya Giren Nakit</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Toplam Nakit Çekme</span>
                  <span className="text-lg font-bold text-rose-400 font-mono mt-1 block">
                    -{formatCurrency(report.totalWithdrawn)}
                  </span>
                  <span className="text-[10px] text-rose-500/80 mt-1 block">Kasadan Çıkan Nakit</span>
                </div>

                <div className="bg-slate-950/70 border border-emerald-900/60 p-4 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Kapanış Kasa Mevcudu</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block">
                    {formatCurrency(report.currentVaultCash)}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Mutabakat: 0.00 TL Fark</span>
                </div>
              </div>

              {/* Banknotes Breakdown */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Kasa Banknot Sayımı ve Dağılımı</h3>
                    <p className="text-slate-400 text-[11px]">
                      ATM kasetlerindeki fiziksel Türk Lirası banknot envanteri
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 rounded-md">
                    Kaset Durumu: Optimum
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(report.vaultDenominations).map(([denomStr, count]) => {
                    const denom = Number(denomStr);
                    const subtotal = denom * count;
                    return (
                      <div
                        key={denom}
                        className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{denom} ₺</span>
                          <span className="text-[11px] font-mono text-slate-400">{count} Adet</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/60 text-right">
                          <span className="text-xs font-semibold text-slate-300 font-mono">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signature and Copyright Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    EÖ
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Yazılım ve Sistem Mimarı: {AUTHOR_NAME}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ÖztürkBank ATM Simülatörü · Demo Gün Sonu Raporu
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {COPYRIGHT_NOTICE}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Dijital Mühür: HASH-SHA256-OZTRK-VERIFIED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS TABLE */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gün İçinde Yapılan İşlemler (Pre-Defined ve Canlı Loglar)
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Toplam {report.transactions.length} işlem kaydı bulundu.
                  </p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="İşlem veya kullanıcı ara..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-3">Zaman</th>
                      <th className="py-2.5 px-3">Referans No</th>
                      <th className="py-2.5 px-3">İşlem Türü</th>
                      <th className="py-2.5 px-3">Kullanıcı / Kart</th>
                      <th className="py-2.5 px-3 text-right">Tutar</th>
                      <th className="py-2.5 px-3 text-center">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                          Aramaya uygun işlem kaydı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3 text-slate-400 text-[11px]">
                            {tx.timestamp.split(' ')[1] || tx.timestamp}
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-medium">{tx.referenceNo}</td>
                          <td className="py-2 px-3 text-slate-200 font-sans">
                            <span className="font-semibold block">{tx.title}</span>
                            <span className="text-[10px] text-slate-500">{tx.description}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-sans">
                            <div>{tx.userName || 'Bilinmiyor'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{tx.userCardMasked}</div>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-white">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                tx.status === 'BASARILI'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FRAUD & SECURITY LOGS */}
          {activeTab === 'fraud' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Güvenlik ve Fraud / Hatalı Giriş Denemeleri Logları</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Sistem tarafından tespit edilen şüpheli, hatalı veya bloke edilen kart denemeleri
                  </p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Fraud loglarında ara..."
                    value={fraudSearch}
                    onChange={(e) => setFraudSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-3">Zaman</th>
                      <th className="py-2.5 px-3">Tehdit Seviyesi</th>
                      <th className="py-2.5 px-3">Denenen Kart / Kimlik</th>
                      <th className="py-2.5 px-3">Hata Sebebi & Açıklama</th>
                      <th className="py-2.5 px-3">Sistem Aksiyonu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                    {filteredFraud.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          Kayıtlı fraud / hatalı deneme bulunmamaktadır.
                        </td>
                      </tr>
                    ) : (
                      filteredFraud.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {f.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                f.threatLevel === 'KRITIK'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : f.threatLevel === 'YUKSEK'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {f.threatLevel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                            {f.attemptedIdentifier}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-100 block">
                              {f.failureReason}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {f.details}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FILE EXPORT (DOSYAYA YAZMA) */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Dosyaya Yazma (EOD_{report.reportDate.replace(/\./g, '')}.txt)</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Bu işlem gün sonu raporunu, gün içerisindeki tüm transaction logları ve fraud logları
                    ile birlikte istemcinin bilgisayarındaki belirlenen bir konuma dosya olarak yazar.
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    İmza: {AUTHOR_NAME} · {COPYRIGHT_NOTICE}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyClipboard}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
                  </button>
                  <button
                    onClick={handleWriteToFile}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Yazılıyor...' : 'Dosyaya Yaz ve Kaydet'}</span>
                  </button>
                </div>
              </div>

              {/* Live File Preview with ASCII formatting */}
              <div className="relative">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400">
                  <span className="font-mono">{expectedFileName} - Önizleme</span>
                  <span>{rawEODContent.length} karakter</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-300 max-h-[360px] select-all">
                  {rawEODContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: FILE IMPORT & VERIFY (DOSYADAN OKUMA) */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Dosyadan Okuma ve İmza Doğrulama Motoru</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Daha önce bilgisayarınıza kaydedilmiş olan herhangi bir <code className="text-emerald-400 font-mono">EOD_*.txt</code> dosyasını
                  sisteme yükleyip içindeki verileri, işlem sayılarını, kasa durumunu ve <strong className="text-white">Enes Öztürk</strong> imzasını
                  otomatik olarak okuyup doğrulayabilirsiniz.
                </p>

                {/* File input dropzone */}
                <div className="mt-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-900/50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-xs font-semibold text-emerald-400 hover:underline">
                      Bilgisayarınızdan EOD .txt Dosyası Seçin
                    </span>
                    <span className="text-slate-500 text-xs block mt-1">veya dosyayı buraya bırakın</span>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {isReadingFile && (
                <div className="text-center py-4 text-emerald-400 text-xs animate-pulse">
                  Dosya okunuyor ve dijital imza doğrulanıyor...
                </div>
              )}

              {fileReadError && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                  {fileReadError}
                </div>
              )}

              {parsedFile && (
                <div className="space-y-4 animate-fade-in">
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      parsedFile.isValid
                        ? 'bg-emerald-950/40 border-emerald-800/80'
                        : 'bg-amber-950/40 border-amber-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {parsedFile.isValid ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {parsedFile.isValid
                            ? 'EOD Dosyası Başarıyla Okundu ve Doğrulandı'
                            : 'Dosya Okundu (İmza Uyarısı)'}
                        </h4>
                        <p className="text-xs text-slate-300">
                          Okunan Dosya: <span className="font-mono">{parsedFile.fileName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span
                        className={`px-2.5 py-1 rounded font-bold ${
                          parsedFile.hasEnesOzturkSignature
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                            : 'bg-rose-900/80 text-rose-200 border border-rose-700'
                        }`}
                      >
                        {parsedFile.hasEnesOzturkSignature
                          ? 'ENES ÖZTÜRK İMZASI GEÇERLİ'
                          : 'İMZA BULUNAMADI'}
                      </span>
                    </div>
                  </div>

                  {/* Parsed Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase">Rapor Tarihi</span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                        {parsedFile.reportDate || 'Belirtilmemiş'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase">Terminal No</span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                        {parsedFile.terminalId || 'Belirtilmemiş'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase">Toplam İşlem</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                        {parsedFile.totalTransactionsCount ?? 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase">Fraud Uyarısı</span>
                      <span className="text-xs font-bold text-rose-400 font-mono mt-0.5 block">
                        {parsedFile.fraudLogsCount ?? 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Raw read text preview */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 mb-1.5">
                      Dosyadan Okunan Ham Metin İçeriği:
                    </h5>
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-300 max-h-[220px]">
                      {parsedFile.rawText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{AUTHOR_NAME}</span>
            <span>·</span>
            <span>{COPYRIGHT_NOTICE}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
