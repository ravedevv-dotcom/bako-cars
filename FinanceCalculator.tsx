/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Landmark, ArrowRight, ShieldAlert, BadgeDollarSign, Sparkles } from 'lucide-react';
import { FINANCING_INTELLIGENCE } from './data';

export default function FinanceCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(85000);
  const [downPayment, setDownPayment] = useState(17000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [loanTerm, setLoanTerm] = useState(60); // months
  const [creditTierIdx, setCreditTierIdx] = useState(0); // Excellent (740+)

  const activeRate = FINANCING_INTELLIGENCE.tiers[creditTierIdx].rate;
  const principal = Math.max(0, vehiclePrice - downPayment - tradeInValue);
  const monthlyRate = (activeRate / 100) / 12;
  const numberOfPayments = loanTerm;

  const estimatedPayment = 
    principal > 0 && monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : principal / numberOfPayments;

  const totalPayments = estimatedPayment * numberOfPayments;
  const totalInterest = Math.max(0, totalPayments - principal);

  const formatCurrency = (val: number) => {
    return '₦' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="glass shadow-2xl rounded-none p-6 sm:p-8 glow" id="calculator-section-container">
      <div className="text-center md:text-left mb-8 border-b border-white/10 pb-5">
        <Landmark className="w-6 h-6 text-white mb-2 mx-auto md:mx-0" />
        <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">FINANCE PLANNER</h2>
        <p className="text-xs font-mono text-white/40 mt-1 tracking-widest uppercase">COMPUTE PRESTIGE ACQUISITION BUDGETS AT LIVE RATES</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Input Segment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vehicle Value */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price-slider" className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ACQUISITION VALUE</label>
              <span className="font-mono text-sm text-white font-bold">{formatCurrency(vehiclePrice)}</span>
            </div>
            <input
              id="price-slider"
              type="range"
              min={25000}
              max={350000}
              step={5000}
              className="w-full h-1 bg-black appearance-none accent-white border border-white/15 cursor-pointer rounded-none"
              value={vehiclePrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setVehiclePrice(val);
                // Clamp down payment if it exceeds the price
                if (downPayment > val) setDownPayment(val);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Down Payment */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="downpayment-slider" className="text-[10px] font-mono text-white/40 uppercase tracking-widest">DOWN PAYMENT</label>
                <span className="font-mono text-xs text-white/80 font-semibold">{formatCurrency(downPayment)} ({Math.round((downPayment / Math.max(1, vehiclePrice)) * 100)}%)</span>
              </div>
              <input
                id="downpayment-slider"
                type="range"
                min={0}
                max={vehiclePrice * 0.9}
                step={1000}
                className="w-full h-1 bg-black appearance-none accent-white border border-white/15 cursor-pointer rounded-none"
                value={downPayment}
                onChange={(e) => setDownPayment(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Trade In value */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="tradein-slider" className="text-[10px] font-mono text-white/40 uppercase tracking-widest">TRADE-IN VALUATION</label>
                <span className="font-mono text-xs text-white/80 font-semibold">{formatCurrency(tradeInValue)}</span>
              </div>
              <input
                id="tradein-slider"
                type="range"
                min={0}
                max={150000}
                step={2000}
                className="w-full h-1 bg-black appearance-none accent-white border border-white/15 cursor-pointer rounded-none"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          {/* Grid Selection for Loan Term */}
          <div>
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">LOAN PLAN TERM</span>
            <div className="grid grid-cols-4 gap-2">
              {[36, 48, 60, 72].map((months) => (
                <button
                  key={months}
                  onClick={() => setLoanTerm(months)}
                  className={`py-3 text-xs font-mono rounded-none border transition-colors cursor-pointer ${
                    loanTerm === months
                      ? 'border-white bg-white/15 text-white font-bold'
                      : 'border-white/10 bg-black text-white/50 hover:text-white hover:border-white/20'
                  }`}
                  id={`calc-term-btn-${months}`}
                >
                  {months} Months
                </button>
              ))}
            </div>
          </div>

          {/* Credit Tier Grid / Box */}
          <div>
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 font-medium">CREDIT SCORE ASSESSMENT</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FINANCING_INTELLIGENCE.tiers.map((tier, idx) => (
                <button
                  key={tier.name}
                  onClick={() => setCreditTierIdx(idx)}
                  className={`p-3 border rounded-none text-left transition-all cursor-pointer ${
                    creditTierIdx === idx
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-black text-white/50 hover:border-white/20 hover:text-white'
                  }`}
                  id={`calc-credit-tier-${idx}`}
                >
                  <span className="block text-[8px] font-mono uppercase text-white/40">TIER 0{idx + 1}</span>
                  <span className="block text-xs font-sans font-bold mt-0.5 text-white">{tier.name.split(' (')[0]}</span>
                  <span className="block text-[9px] font-mono text-white/70 uppercase mt-1">{tier.rate}% APR</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Computed Outputs Segment */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-black border border-white/10 p-6 rounded-none space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">
                ESTIMATED MONTHLY INVOICE
              </span>
              <span className="font-sans text-4xl font-extrabold text-white tracking-wider block py-1-none">
                {formatCurrency(estimatedPayment)}
              </span>
              <span className="inline-flex items-center space-x-1 font-mono text-[9px] text-white/70 bg-white/5 px-2.5 py-1 rounded-none border border-white/10">
                <Sparkles className="w-3 h-3 text-white" />
                <span>EXCELLENT TIER {activeRate}% RATE INSTATED</span>
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wide">Principal Loan Sum</span>
                <span className="font-mono text-xs text-white/80 font-semibold">{formatCurrency(principal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wide">Computed Term Years</span>
                <span className="font-mono text-xs text-white/80 font-semibold">{loanTerm / 12} Years ({loanTerm} Months)</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wide">Computed Cumulative Interest</span>
                <span className="font-mono text-xs text-white/80 font-semibold">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wide">Total Overall Payments</span>
                <span className="font-mono text-sm text-white font-bold">{formatCurrency(totalPayments)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[9px] font-mono text-white/30 leading-relaxed text-center uppercase tracking-widest">
              * Calculations are estimates based on active tier models. Final contract rates may vary.
            </div>
          </div>

          <div className="mt-4 p-4 border border-white/10 bg-white/5 rounded-none flex items-start space-x-3 text-xs leading-relaxed text-white/70">
            <ShieldAlert className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
            <p className="uppercase tracking-wide text-[10px] text-white/60">
              Bako Cars features structured, clear contract schedules. <span className="text-white font-bold">No hidden documentation fees</span>, <span className="text-white font-bold">transparent interest tables</span>, and private secure funding advisors at key local banks in Nigeria.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
