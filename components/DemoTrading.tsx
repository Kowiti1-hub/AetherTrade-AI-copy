import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface DemoTradingProps {
  user: User;
}

interface TradingPair {
  symbol: string;
  basePrice: number;
  volatility: number;
  precision: number;
}

const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'BTC/USD', basePrice: 68400, volatility: 65, precision: 2 },
  { symbol: 'ETH/USD', basePrice: 3450, volatility: 8, precision: 2 },
  { symbol: 'EUR/USD', basePrice: 1.0842, volatility: 0.0005, precision: 5 },
  { symbol: 'XAU/USD', basePrice: 2142.50, volatility: 2, precision: 2 },
];

const DemoTrading: React.FC<DemoTradingProps> = ({ user }) => {
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [demoPrice, setDemoPrice] = useState(TRADING_PAIRS[0].basePrice);
  const [history, setHistory] = useState<{ time: string, price: number }[]>([]);
  const [position, setPosition] = useState<{ entry: number, size: number, type: 'BUY' | 'SELL', pair: string } | null>(null);
  const [pnl, setPnl] = useState(0);
  const [totalDemoProfit, setTotalDemoProfit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lotSize, setLotSize] = useState(1);
  
  const timerRef = useRef<number | null>(null);

  // Initialize history when pair changes
  useEffect(() => {
    const initial = Array.from({ length: 30 }, (_, i) => ({
      time: i.toString(),
      price: selectedPair.basePrice + (Math.random() - 0.5) * (selectedPair.basePrice * 0.01)
    }));
    setHistory(initial);
    setDemoPrice(selectedPair.basePrice);
    
    // Auto-close position if pair changes to avoid logic conflicts (Standard Demo behavior)
    if (position && position.pair !== selectedPair.symbol) {
      setPosition(null);
      setPnl(0);
    }
  }, [selectedPair]);

  useEffect(() => {
    if (isSimulating) {
      timerRef.current = window.setInterval(() => {
        setDemoPrice(prev => {
          // Adjust change based on the specific pair's volatility
          const change = (Math.random() - 0.495) * selectedPair.volatility; 
          const newPrice = prev + change;
          
          setHistory(h => {
            const newHistory = [...h, { time: Date.now().toString(), price: newPrice }].slice(-30);
            return newHistory;
          });

          if (position && position.pair === selectedPair.symbol) {
            const currentPnl = position.type === 'BUY' 
              ? (newPrice - position.entry) * position.size
              : (position.entry - newPrice) * position.size;
            
            // For EUR/USD specifically, pips/lots are usually calculated differently, 
            // but for this demo academy we keep it simple: (Price Diff * Size)
            // Scaling for Forex pairs so P&L is visible
            const scale = selectedPair.symbol === 'EUR/USD' ? 10000 : 1;
            setPnl(currentPnl * scale);
          }

          return newPrice;
        });
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSimulating, position, selectedPair]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (position) {
      setTotalDemoProfit(prev => prev + pnl);
      setPosition(null);
      setPnl(0);
    } else {
      setPosition({ entry: demoPrice, size: lotSize, type, pair: selectedPair.symbol });
    }
  };

  const handlePairChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pair = TRADING_PAIRS.find(p => p.symbol === e.target.value);
    if (pair) setSelectedPair(pair);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center shadow-xl shadow-amber-500/5 transition-colors">
        <div>
          <h1 className="text-3xl font-black text-amber-400">Trader Academy</h1>
          <p className="text-slate-400 mt-1">Master institutional-grade execution in a zero-risk simulated environment.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-6">
           <div className="text-right">
             <div className="text-[10px] text-amber-500/50 font-black uppercase tracking-widest">Available Demo Funds</div>
             <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">${(user.demoBalance || 50000).toLocaleString()}.00</div>
           </div>
           <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isSimulating ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'}`}
           >
             {isSimulating ? 'Kill Simulator' : 'Engage Simulator'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md transition-colors shadow-sm dark:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="font-bold flex items-center text-slate-900 dark:text-slate-200">
                <span className={`w-2 h-2 rounded-full mr-3 ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                Live Market Matrix
              </h3>
              <select 
                value={selectedPair.symbol}
                onChange={handlePairChange}
                disabled={!!position}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
              >
                {TRADING_PAIRS.map(p => (
                  <option key={p.symbol} value={p.symbol}>{p.symbol}</option>
                ))}
              </select>
            </div>
            <div className="text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">
              ${demoPrice.toLocaleString(undefined, { 
                minimumFractionDigits: selectedPair.precision, 
                maximumFractionDigits: selectedPair.precision 
              })}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="demoColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid #1e293b', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={3} fill="url(#demoColor)" animationDuration={300} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md transition-colors shadow-sm dark:shadow-none">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Execution Panel</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Academy P/L Balance</div>
                <div className={`text-2xl font-mono font-bold ${totalDemoProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {totalDemoProfit >= 0 ? '+' : ''}${totalDemoProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trade Size (Base Units)</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={lotSize}
                  onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.01)}
                  disabled={!!position}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:border-amber-500 outline-none text-slate-900 dark:text-white transition-colors disabled:opacity-50"
                />
              </div>

              {position && (
                <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${position.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                      ACTIVE {position.type} ({position.size} Units)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Pair: {position.pair}</span>
                  </div>
                  <div className={`text-3xl font-mono font-black ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleTrade('BUY')}
                disabled={!isSimulating || (position && position.type !== 'BUY')}
                className={`py-4 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center ${
                  position?.type === 'BUY' 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'
                } disabled:opacity-20`}
              >
                <span>{position?.type === 'BUY' ? 'CLOSE BUY' : 'BUY'}</span>
                {!position && <span className="text-[8px] opacity-60">Go Long</span>}
              </button>
              <button 
                onClick={() => handleTrade('SELL')}
                disabled={!isSimulating || (position && position.type !== 'SELL')}
                className={`py-4 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center ${
                  position?.type === 'SELL' 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                } disabled:opacity-20`}
              >
                <span>{position?.type === 'SELL' ? 'CLOSE SELL' : 'SELL'}</span>
                {!position && <span className="text-[8px] opacity-60">Go Short</span>}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-500 text-center uppercase font-bold tracking-widest">
              {isSimulating ? 'Neural Link Engaged' : 'Awaiting Deployment'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
           <h4 className="font-bold mb-2 text-slate-900 dark:text-slate-200">Academy Strategy: "Multi-Asset Scalping"</h4>
           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
             Switching pairs helps you understand market volatility relative to asset classes. Crypto (BTC/ETH) offers high range, while Forex (EUR/USD) requires higher precision. Try catching the breakout on <strong>XAU/USD</strong> during simulation spikes.
           </p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-4 transition-colors">
           <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
           </div>
           <div>
              <div className="font-bold text-amber-500">Demo Environment</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-tighter italic">P/L is for educational demonstration only.</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTrading;
