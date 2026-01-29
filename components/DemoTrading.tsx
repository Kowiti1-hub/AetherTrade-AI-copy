
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { User, TradeType, OrderExecutionType, PendingOrderType, PendingOrder } from '../types';

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
  { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', basePrice: 1.0842, volatility: 0.0005, precision: 5, payout: 0.92, spread: 0.00015, pipSize: 0.0001 },
  { symbol: 'GBP/JPY', displayName: 'British Pound / Yen', basePrice: 190.45, volatility: 0.05, precision: 2, payout: 0.85, spread: 0.03, pipSize: 0.01 },
  { symbol: 'XAU/USD', displayName: 'Gold / US Dollar', basePrice: 2142.50, volatility: 1.5, precision: 2, payout: 0.78, spread: 0.45, pipSize: 0.01 },
  { symbol: 'BTC/USD', displayName: 'Bitcoin / USD', basePrice: 68400, volatility: 45, precision: 2, payout: 0.82, spread: 15.0, pipSize: 1.0 },
];

const LEVERAGE_OPTIONS = [10, 50, 100, 200, 500];
const EXPIRATION_OPTIONS = [
  { label: '5s', value: 5 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
];

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const DemoTrading: React.FC<DemoTradingProps> = ({ user }) => {
  const [tradeType, setTradeType] = useState<TradeType>('FOREX');
  const [execType, setExecType] = useState<OrderExecutionType>('MARKET');
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [demoPrice, setDemoPrice] = useState(TRADING_PAIRS[0].basePrice);
  const [history, setHistory] = useState<{ time: string, price: number }[]>([]);
  
  // Account Matrix
  const [totalDemoProfit, setTotalDemoProfit] = useState(0);
  const equity = (user.demoBalance || 50000) + totalDemoProfit;
  
  // Orders State
  const [position, setPosition] = useState<{ 
    entry: number, 
    size: number, 
    type: 'BUY' | 'SELL', 
    pair: string, 
    leverage: number,
    sl?: number,
    tp?: number,
    expiration?: number 
  } | null>(null);

  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [pnl, setPnl] = useState(0);
  const [amount, setAmount] = useState(100);
  const [selectedLeverage, setSelectedLeverage] = useState(100);
  const [selectedExpiration, setSelectedExpiration] = useState(15);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // SL / TP / Pending Prices
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [pendingType, setPendingType] = useState<PendingOrderType>('BUY_LIMIT');

  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Bid / Ask derived from mid price
  const bidPrice = demoPrice - (selectedPair.spread / 2);
  const askPrice = demoPrice + (selectedPair.spread / 2);

  // Initialize simulation data
  useEffect(() => {
    const initial = Array.from({ length: 50 }, (_, i) => ({
      time: i.toString(),
      price: selectedPair.basePrice + (Math.random() - 0.5) * (selectedPair.basePrice * 0.005)
    }));
    setHistory(initial);
    setDemoPrice(selectedPair.basePrice);
  }, [selectedPair]);

  // Handle auto-liquidation, SL/TP, and Pending Triggers
  useEffect(() => {
    // 1. Pending Order Triggers
    pendingOrders.forEach(order => {
      let triggered = false;
      if (order.type === 'BUY_LIMIT' && askPrice <= order.triggerPrice) triggered = true;
      if (order.type === 'SELL_LIMIT' && bidPrice >= order.triggerPrice) triggered = true;
      if (order.type === 'BUY_STOP' && askPrice >= order.triggerPrice) triggered = true;
      if (order.type === 'SELL_STOP' && bidPrice <= order.triggerPrice) triggered = true;

      if (triggered && !position) {
        setPendingOrders(prev => prev.filter(p => p.id !== order.id));
        executeOrder(order.type.includes('BUY') ? 'BUY' : 'SELL', order.triggerPrice, order.size, order.leverage, order.sl, order.tp);
        addNotification(`Pending ${order.type} triggered at ${order.triggerPrice}`, 'success');
      }
    });

    if (position) {
      // 2. Binary Mode Expiration
      if (tradeType === 'BINARY' && timeLeft === 0) {
        const isWin = position.type === 'BUY' ? bidPrice > position.entry : askPrice < position.entry;
        const profit = isWin ? position.size * selectedPair.payout : -position.size;
        finalizeTrade(profit, isWin ? 'Target Reached' : 'Expired Out of Money');
      }
      
      // 3. Forex Mode SL/TP
      if (tradeType === 'FOREX') {
        if (position.sl && ((position.type === 'BUY' && bidPrice <= position.sl) || (position.type === 'SELL' && askPrice >= position.sl))) {
          finalizeTrade(pnl, 'Stop Loss Triggered');
        }
        if (position.tp && ((position.type === 'BUY' && bidPrice >= position.tp) || (position.type === 'SELL' && askPrice <= position.tp))) {
          finalizeTrade(pnl, 'Take Profit Hit');
        }
      }

      // 4. Margin Call Logic (Stop Out at 30%)
      const marginUsed = (position.size * position.entry) / position.leverage;
      const currentEquity = equity + pnl;
      const marginLevel = (currentEquity / marginUsed) * 100;
      if (marginLevel < 30) {
        finalizeTrade(pnl, 'Stop Out: Margin Level < 30%');
      }
    }
  }, [timeLeft, position, bidPrice, askPrice, pnl, tradeType, pendingOrders, equity]);

  // Price simulation loop
  useEffect(() => {
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
            const isWinning = position.type === 'BUY' ? (newPrice - (selectedPair.spread/2)) > position.entry : (newPrice + (selectedPair.spread/2)) < position.entry;
            setPnl(isWinning ? position.size * selectedPair.payout : -position.size);
          } else {
            // Forex P&L: (Price Difference / PipSize) * LotSize * Leverage Scaling
            // Longs close at Bid, Shorts close at Ask
            const closePrice = position.type === 'BUY' ? (newPrice - (selectedPair.spread/2)) : (newPrice + (selectedPair.spread/2));
            const diff = position.type === 'BUY' ? (closePrice - position.entry) : (position.entry - closePrice);
            const pipProfit = (diff / selectedPair.pipSize) * (position.size / 100);
            setPnl(pipProfit * position.leverage);
          }
        }
        return newPrice;
      });
    }, 400);

    countdownRef.current = window.setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [position, selectedPair, tradeType]);

  const executeOrder = (type: 'BUY' | 'SELL', entryPrice: number, size: number, leverage: number, sl?: number, tp?: number) => {
    setPosition({ 
      entry: entryPrice, 
      size, 
      type, 
      pair: selectedPair.symbol,
      leverage,
      sl,
      tp,
      expiration: selectedExpiration
    });
    if (tradeType === 'BINARY') setTimeLeft(selectedExpiration);
  };

  const handleTradeAction = (type: 'BUY' | 'SELL') => {
    if (position) return;

    const entry = type === 'BUY' ? askPrice : bidPrice;
    const marginNeeded = (amount * entry) / selectedLeverage;

    if (marginNeeded > equity) {
      addNotification('Insufficient Margin for this trade', 'error');
      return;
    }

    if (execType === 'MARKET') {
      executeOrder(type, entry, amount, selectedLeverage, slPrice ? parseFloat(slPrice) : undefined, tpPrice ? parseFloat(tpPrice) : undefined);
      addNotification(`${type} Market Order Filled at ${entry.toFixed(selectedPair.precision)}`, 'success');
    } else {
      const pOrder: PendingOrder = {
        id: Math.random().toString(36).substr(2, 9),
        pair: selectedPair.symbol,
        type: pendingType,
        triggerPrice: parseFloat(triggerPrice),
        size: amount,
        leverage: selectedLeverage,
        sl: slPrice ? parseFloat(slPrice) : undefined,
        tp: tpPrice ? parseFloat(tpPrice) : undefined
      };
      setPendingOrders(prev => [...prev, pOrder]);
      addNotification(`Pending ${pendingType} set at ${pOrder.triggerPrice}`, 'info');
      setTriggerPrice('');
    }
  };

  const finalizeTrade = (profit: number, reason: string) => {
    setTotalDemoProfit(prev => prev + profit);
    setPosition(null);
    setTimeLeft(null);
    setPnl(0);
    setSlPrice('');
    setTpPrice('');
    addNotification(`${reason}: Realized ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`, profit >= 0 ? 'success' : 'error');
  };

  const cancelPending = (id: string) => {
    setPendingOrders(prev => prev.filter(p => p.id !== id));
    addNotification('Pending order cancelled', 'info');
  };

  const marginUsed = position ? (position.size * position.entry) / position.leverage : 0;
  const currentEquity = equity + pnl;
  const marginLevel = marginUsed > 0 ? (currentEquity / marginUsed) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 relative">
      
      {/* Toast Notifications */}
      <div className="fixed top-20 right-8 z-[60] flex flex-col space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-md flex items-center space-x-3 ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : n.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'}`}></div>
            <span className="text-xs font-black uppercase tracking-widest">{n.message}</span>
          </div>
        ))}
      </div>

      {/* Account Matrix Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Equity', value: `$${currentEquity.toLocaleString()}`, color: 'sky' },
          { label: 'Unrealized P/L', value: `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()}`, color: pnl >= 0 ? 'emerald' : 'rose' },
          { label: 'Margin Used', value: `$${marginUsed.toLocaleString()}`, color: 'slate' },
          { label: 'Free Margin', value: `$${(currentEquity - marginUsed).toLocaleString()}`, color: 'emerald' },
          { label: 'Margin Level', value: `${marginLevel > 0 ? marginLevel.toFixed(1) + '%' : '∞'}`, color: marginLevel < 100 && marginLevel > 0 ? 'rose' : 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
             <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</div>
             <div className={`text-xl font-mono font-black text-${stat.color}-500`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Controls Section */}
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
                  {tradeType === 'BINARY' ? `${(pair.payout * 100).toFixed(0)}%` : `Spread: ${(pair.spread / pair.pipSize).toFixed(1)} Pips`}
                </span>
              </button>
            ))}
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
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="text-rose-400">BID: {bidPrice.toFixed(selectedPair.precision)}</span>
                    <span className="text-slate-800 dark:text-slate-600">|</span>
                    <span className="text-emerald-400">ASK: {askPrice.toFixed(selectedPair.precision)}</span>
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
                    {position.sl && <ReferenceLine y={position.sl} stroke="#f43f5e" strokeDasharray="3 3" />}
                    {position.tp && <ReferenceLine y={position.tp} stroke="#10b981" strokeDasharray="3 3" />}
                  </>
                )}
                {pendingOrders.filter(o => o.pair === selectedPair.symbol).map(o => (
                  <ReferenceLine key={o.id} y={o.triggerPrice} stroke="#0ea5e9" strokeDasharray="10 5" strokeOpacity={0.4} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Execution Cabinet Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Terminal</h3>
               <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                 <button onClick={() => setExecType('MARKET')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${execType === 'MARKET' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Market</button>
                 <button onClick={() => setExecType('PENDING')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${execType === 'PENDING' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Pending</button>
               </div>
            </div>
            
            <div className="space-y-6">
              {execType === 'PENDING' && !position && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Order Type</label>
                  <select 
                    value={pendingType}
                    onChange={(e) => setPendingType(e.target.value as PendingOrderType)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-sky-500"
                  >
                    <option value="BUY_LIMIT">Buy Limit</option>
                    <option value="SELL_LIMIT">Sell Limit</option>
                    <option value="BUY_STOP">Buy Stop</option>
                    <option value="SELL_STOP">Sell Stop</option>
                  </select>
                  <input 
                    type="number" 
                    step={selectedPair.pipSize} 
                    value={triggerPrice}
                    onChange={e => setTriggerPrice(e.target.value)}
                    placeholder="Trigger Price"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-4 text-xl font-mono focus:border-sky-500 outline-none"
                  />
                </div>
              )}

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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lot / Investment Size</label>
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
                       {position.type} ACTIVE
                     </span>
                     {tradeType === 'BINARY' && <div className="text-xs font-mono font-black text-amber-500">{timeLeft}s</div>}
                  </div>
                  <div className={`text-4xl font-mono font-black leading-none mb-2 ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Real-time P/L</div>
                  <button 
                    onClick={() => finalizeTrade(pnl, 'Manual Close')}
                    className="w-full mt-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20"
                  >
                    Close Position
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => handleTradeAction('BUY')}
                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center group transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="mb-1 group-hover:-translate-y-1 transition-transform"><path d="m18 15-6-6-6 6"/></svg>
                    <span className="text-sm uppercase tracking-[0.2em]">Buy @ {askPrice.toFixed(selectedPair.precision)}</span>
                  </button>
                  <button 
                    onClick={() => handleTradeAction('SELL')}
                    className="w-full py-6 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 flex flex-col items-center justify-center group transition-all active:scale-95"
                  >
                    <span className="text-sm uppercase tracking-[0.2em]">Sell @ {bidPrice.toFixed(selectedPair.precision)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="mt-1 group-hover:translate-y-1 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Pending Orders List */}
          {pendingOrders.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Stack ({pendingOrders.length})</h4>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {pendingOrders.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl group relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-sky-500">{p.type}</span>
                      <button onClick={() => cancelPending(p.id)} className="text-rose-500 hover:text-rose-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{p.triggerPrice.toFixed(selectedPair.precision)}</div>
                      <div className="text-[9px] text-slate-400">{p.size} Units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoTrading;
