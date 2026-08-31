import React, { useState } from 'react';
import { X, Calculator, DollarSign, Percent, TrendingUp, AlertCircle } from 'lucide-react';

export default function DealCalculatorModal({ isOpen, onClose }) {
  const [debtAmount, setDebtAmount] = useState(2500000);
  const [currentSharePrice, setCurrentSharePrice] = useState(0.25);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [existingShares, setExistingShares] = useState(50000000);

  if (!isOpen) return null;

  const effectiveIssuePrice = currentSharePrice * (1 - discountPercent / 100);
  const newSharesToIssue = effectiveIssuePrice > 0 ? Math.round(debtAmount / effectiveIssuePrice) : 0;
  const postRestructuringShares = existingShares + newSharesToIssue;
  const funderOwnershipPercent = postRestructuringShares > 0 ? ((newSharesToIssue / postRestructuringShares) * 100).toFixed(2) : 0;
  const impliedMarketCap = (postRestructuringShares * currentSharePrice).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0c1324] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">German StaRUG & Debt-to-Equity Calculator</h2>
            <p className="text-xs text-slate-400">Model claim conversions, subscription rights exclusions (§ 186 AktG), and post-plan equity ownership.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Creditor Claim / Debt (€EUR)
            </label>
            <input
              type="number"
              value={debtAmount}
              onChange={(e) => setDebtAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Share Price (€EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={currentSharePrice}
              onChange={(e) => setCurrentSharePrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Conversion Discount to VWAP (%)
            </label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Existing Shares (*Grundkapital*)
            </label>
            <input
              type="number"
              value={existingShares}
              onChange={(e) => setExistingShares(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Results Output */}
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">Effective Issue Price per Share:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              €{effectiveIssuePrice.toFixed(4)} EUR
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">New Shares to Issue (Debt-Equity-Swap):</span>
            <span className="font-mono font-bold text-teal-300 text-sm">
              {newSharesToIssue.toLocaleString()} shares
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">Creditor Ownership Stake:</span>
            <span className="font-mono font-bold text-purple-400 text-sm">
              {funderOwnershipPercent}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Implied Post-Deal Market Cap:</span>
            <span className="font-mono font-bold text-white text-sm">
              €{impliedMarketCap} EUR
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
