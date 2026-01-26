
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { User, TradeType } from '../types';

interface DemoTradingProps {
  user: User;
}

interface TradingPair {
  symbol: string;
  basePrice: number;
  volatility: number;
  precision: number;
  displayName: string;
  payout: number;
  spread: number;
  pipSize: number;
}

const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', basePrice: 1.0842, volatility: 0.0005, precision: 5, payout: 0.92, spread: 0.0001, pipSize: 0.0001 },
  { symbol: 'GBP/JPY', displayName: 'British Pound / Yen', basePrice: 190.45, volatility: 0.05, precision: 2, payout: 0.85, spread: 0.02, pipSize: 0.01 },
  { symbol: 'XAU/USD', displayName: 'Gold / US Dollar', basePrice: 2142.50, volatility: 1.5, precision: 2, payout: 0.78, spread: 0.35, pipSize: 0.01 },
  { symbol: 'BTC/USD', displayName: 'Bitcoin / USD', basePrice: 68400, volatility: 45, precision: 2, payout: 0.82, spread: 12.0, pipSize: 1.0 },
];

const LEVERAGE_OPTIONS = [10, 50, 100, 200, 500];
const EXPIRATION_OPTIONS = [
  { label: '5s', value: 5 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
];

const DemoTrading: React.FC<DemoTradingProps> = ({ user }) => {
  const [tradeType, setTradeType] = useState<TradeType>('FOREX');
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [demoPrice, setDemoPrice] = useState(TRADING_PAIRS[0].basePrice);
  const [history, setHistory] = useState<{ time: string, price: number }[]>([]);
  
  // Active Trade State
  const [position, setPosition] = useState<{ 
    entry: number, 
    size: number, 
    type: 'BUY' | 'SELL', 
    pair: string, 
    leverage?: number,
    sl?: number,
    tp?: number,
    expiration?: number 
  } | null>(null);

  const [pnl, setPnl] = useState(0);
  const [totalDemoProfit, setTotalDemoProfit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [amount, setAmount] = useState(100);
  const [selectedLeverage, setSelectedLeverage] = useState(100);
  const [selectedExpiration, setSelectedExpiration] = useState(15);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // SL / TP States
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // Initialize simulation data
  useEffect(() => {
    const initial = Array.from({ length: 50 }, (_, i) => ({
      time: i.toString(),
      price: selectedPair.basePrice + (Math.random() - 0.5) * (selectedPair.basePrice * 0.005)
    }));
    setHistory(initial);
    setDemoPrice(selectedPair.basePrice);
  }, [selectedPair]);

  // Handle auto-liquidation (Binary & Forex SL/TP)
  useEffect(() => {
    if (position) {
      // Binary Mode Expiration
      if (tradeType === 'BINARY' && timeLeft === 0) {
        const isWin = position.type === 'BUY' ? demoPrice > position.entry : demoPrice < position.entry;
        const profit = isWin ? position.size * selectedPair.payout : -position.size;
        finalizeTrade(profit);
      }
      
      // Forex Mode SL/TP
      if (tradeType === 'FOREX') {
        if (position.sl && ((position.type === 'BUY' && demoPrice <= position.sl) || (position.type === 'SELL' && demoPrice >= position.sl))) {
          finalizeTrade(pnl);
        }
        if (position.tp && ((position.type === 'BUY' && demoPrice >= position.tp) || (position.type === 'SELL' && demoPrice <= position.tp))) {
          finalizeTrade(pnl);
        }
      }
    }
  }, [timeLeft, position, demoPrice, pnl, tradeType]);

  // Price simulation loop
  useEffect(() => {
    if (isSimulating) {
      timerRef.current = window.setInterval(() => {
        setDemoPrice(prev => {
          const change = (Math.random() - 0.5) * selectedPair.volatility; 
          const newPrice = prev + change;
          
          setHistory(h => {
            const newHistory = [...h, { time: new Date().toLocaleTimeString(), price: newPrice }].slice(-50);
            return newHistory;
          });

          if (position) {
            if (tradeType === 'BINARY') {
              const isWinning = position.type === 'BUY' ? newPrice > position.entry : newPrice < position.entry;
              setPnl(isWinning ? position.size * selectedPair.payout : -position.size);
            } else {
              // Forex P&L: (Price Difference / PipSize) * LotSize * Leverage Scaling
              const diff = position.type === 'BUY' ? (newPrice - position.entry) : (position.entry - newPrice);
              const pipProfit = (diff / selectedPair.pipSize) * (position.size / 100);
              setPnl(pipProfit * (position.leverage || 1));
            }
          }
          return newPrice;
        });
      }, 400);

      countdownRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isSimulating, position, selectedPair, tradeType]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (position) return;
    
    setPosition({ 
      entry: demoPrice, 
      size: amount, 
      type, 
      pair: selectedPair.symbol,
      leverage: selectedLeverage,
      expiration: selectedExpiration,
      sl: slPrice ? parseFloat(slPrice) : undefined,
      tp: tpPrice ? parseFloat(tpPrice) : undefined
    });

    if (tradeType === 'BINARY') setTimeLeft(selectedExpiration);
  };

  const finalizeTrade = (profit: number) => {
    setTotalDemoProfit(prev => prev + profit);
    setPosition(null);
    setTimeLeft(null);
    setPnl(0);
    setSlPrice('');
    setTpPrice('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* Trading Cabinet Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 flex items-center justify-between shadow-sm overflow-x-auto">
          <div className="flex items-center space-x-2">
            {TRADING_PAIRS.map(pair => (
              <button 
                key={pair.symbol}
                onClick={() => setSelectedPair(pair)}
                disabled={!!position}
                className={`px-5 py-3 rounded-2xl flex flex-col items-start transition-all border ${selectedPair.symbol === pair.symbol ? 'bg-sky-500/10 border-sky-500/50 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'} disabled:opacity-50`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{pair.symbol}</span>
                <span className="text-xs font-bold font-mono">
                  {tradeType === 'BINARY' ? `${(pair.payout * 100).toFixed(0)}%` : `Spread: ${pair.spread.toFixed(pair.precision)}`}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden sm:flex flex-col items-end px-6">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Equity (Demo)</span>
            <span className={`text-2xl font-black ${(user.demoBalance || 0) + totalDemoProfit + pnl >= (user.demoBalance || 0) ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${((user.demoBalance || 50000) + totalDemoProfit + pnl).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Trade Type Switcher */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 flex items-center shadow-sm">
           <button 
            onClick={() => { setTradeType('FOREX'); setPosition(null); }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tradeType === 'FOREX' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400'}`}
           >
             Forex CFD
           </button>
           <button 
            onClick={() => { setTradeType('BINARY'); setPosition(null); }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tradeType === 'BINARY' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400'}`}
           >
             Fixed Time
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Real-time Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center font-black text-sky-500">{selectedPair.symbol[0]}</div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedPair.displayName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Precision Feed</span>
                  </div>
               </div>
             </div>
             <div className="text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">
               {demoPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.precision, maximumFractionDigits: selectedPair.precision })}
             </div>
          </div>

          <div className="h-[480px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="tradeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  fill="url(#tradeGradient)" 
                  isAnimationActive={false}
                />
                
                {position && (
                  <>
                    <ReferenceLine 
                      y={position.entry} 
                      stroke="#64748b" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ position: 'right', value: `ENTRY: ${position.entry.toFixed(selectedPair.precision)}`, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    />
                    {position.sl && (
                      <ReferenceLine 
                        y={position.sl} 
                        stroke="#f43f5e" 
                        strokeDasharray="3 3"
                        label={{ position: 'left', value: `SL`, fill: '#f43f5e', fontSize: 10 }}
                      />
                    )}
                    {position.tp && (
                      <ReferenceLine 
                        y={position.tp} 
                        stroke="#10b981" 
                        strokeDasharray="3 3"
                        label={{ position: 'left', value: `TP`, fill: '#10b981', fontSize: 10 }}
                      />
                    )}
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Execution Cabinet Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
              {tradeType === 'BINARY' ? 'Binary Execution' : 'Forex Execution'}
            </h3>
            
            <div className="space-y-6">
              {/* Conditional Controls */}
              {tradeType === 'BINARY' ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPIRATION_OPTIONS.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => setSelectedExpiration(opt.value)}
                        disabled={!!position}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border ${selectedExpiration === opt.value ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Leverage</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVERAGE_OPTIONS.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setSelectedLeverage(opt)}
                        disabled={!!position}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border ${selectedLeverage === opt ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        1:{opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Investment Lot/Size</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  disabled={!!position}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono font-black focus:border-sky-500 outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* SL / TP for Forex */}
              {tradeType === 'FOREX' && !position && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Stop Loss</label>
                    <input 
                      type="number" 
                      step={selectedPair.pipSize} 
                      value={slPrice}
                      onChange={e => setSlPrice(e.target.value)}
                      placeholder="None"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Take Profit</label>
                    <input 
                      type="number" 
                      step={selectedPair.pipSize} 
                      value={tpPrice}
                      onChange={e => setTpPrice(e.target.value)}
                      placeholder="None"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Execution State */}
              {position ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full ${position.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {position.type} {tradeType} ACTIVE
                     </span>
                     {tradeType === 'BINARY' && <div className="text-xs font-mono font-black text-amber-500">{timeLeft}s</div>}
                  </div>
                  <div className={`text-4xl font-mono font-black leading-none mb-2 ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Real-time P/L Projection</div>
                  <button 
                    onClick={() => finalizeTrade(pnl)}
                    className="w-full mt-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20"
                  >
                    Close Position
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => handleTrade('BUY')}
                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center group transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="mb-1 group-hover:-translate-y-1 transition-transform"><path d="m18 15-6-6-6 6"/></svg>
                    <span className="text-sm uppercase tracking-[0.2em]">{tradeType === 'BINARY' ? 'Higher' : 'Buy / Long'}</span>
                  </button>
                  <button 
                    onClick={() => handleTrade('SELL')}
                    className="w-full py-6 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 flex flex-col items-center justify-center group transition-all active:scale-95"
                  >
                    <span className="text-sm uppercase tracking-[0.2em]">{tradeType === 'BINARY' ? 'Lower' : 'Sell / Short'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="mt-1 group-hover:translate-y-1 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-sky-500/5 border border-sky-500/10 rounded-3xl">
             <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-sky-500 tracking-widest">Market Feed: Nominal</span>
             </div>
             <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
               Margin requirements are recalculated in real-time. Minimum lot size: 0.01. Execution latency: 12ms.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTrading;
