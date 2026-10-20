import React from 'react';
import { Transaction } from '../types/atm';
import { formatCurrency } from '../utils/fileOperations';
import { AUTHOR_NAME, COPYRIGHT_NOTICE, ATM_BANK_NAME, ATM_TERMINAL_ID } from '../data/initialData';
import { Printer, Download, X } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const text = `
========================================
           ${ATM_BANK_NAME}
           İŞLEM MAKBUZU / DEKONT
========================================
Terminal ID   : ${ATM_TERMINAL_ID}
Tarih/Saat    : ${transaction.timestamp}
Referans No   : ${transaction.referenceNo}
Müşteri       : ${transaction.userName}
Kart No       : ${transaction.userCardMasked}
İşlem Türü    : ${transaction.title}
Tutar         : ${formatCurrency(transaction.amount)}
İşlem Ücreti  : ${formatCurrency(transaction.fee)}
Kalan Bakiye  : ${formatCurrency(transaction.balanceAfter)}
Durum         : ${transaction.status}
Açıklama      : ${transaction.description}
----------------------------------------
Sistem Mimarı : ${AUTHOR_NAME}
Telif Hakkı   : ${COPYRIGHT_NOTICE}
========================================
Bizi tercih ettiğiniz için teşekkür ederiz.
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dekont_${transaction.referenceNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            ATM Bilgi Fişi (Dekont)
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Slip */}
        <div className="p-6 font-mono text-xs leading-relaxed space-y-3 bg-[#fdfdfc]">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-sm font-bold tracking-tight text-slate-900">{ATM_BANK_NAME}</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">ATM TERMİNALİ: {ATM_TERMINAL_ID}</p>
            <p className="text-[10px] text-slate-500">{transaction.timestamp}</p>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex justify-between">
              <span className="text-slate-500">REF NO:</span>
              <span className="font-semibold text-slate-800">{transaction.referenceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MÜŞTERİ:</span>
              <span className="font-semibold text-slate-800">{transaction.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">KART:</span>
              <span className="font-semibold text-slate-800">{transaction.userCardMasked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">İŞLEM:</span>
              <span className="font-semibold text-slate-800">{transaction.title}</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-slate-300 py-2.5 my-2 space-y-1.5">
            <div className="flex justify-between text-sm font-bold">
              <span>İŞLEM TUTARI:</span>
              <span className="text-slate-900">{formatCurrency(transaction.amount)}</span>
            </div>
            {transaction.fee > 0 && (
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>KOMİSYON / ÜCRET:</span>
                <span>{formatCurrency(transaction.fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-700 pt-1">
              <span>GÜNCEL BAKİYE:</span>
              <span className="font-bold">{formatCurrency(transaction.balanceAfter)}</span>
            </div>
          </div>

          {transaction.description && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
              <span className="font-semibold block text-slate-700">Açıklama:</span>
              {transaction.description}
            </div>
          )}

          {/* Barcode representation */}
          <div className="pt-2 text-center">
            <div className="h-9 flex items-center justify-center tracking-widest text-lg font-bold select-none text-slate-800 opacity-80">
              ||| | |||| | ||| |||| | |||||| || |
            </div>
            <p className="text-[9px] text-slate-400 font-sans tracking-wide mt-1">
              GELİŞTİRİCİ: {AUTHOR_NAME.toUpperCase()}
            </p>
            <p className="text-[8px] text-slate-400 font-sans">
              {COPYRIGHT_NOTICE}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleDownloadText}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Dekontu İndir (.txt)</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
};
