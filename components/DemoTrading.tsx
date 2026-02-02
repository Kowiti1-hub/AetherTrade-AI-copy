
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { User, TradeType, OrderExecutionType, PendingOrderType, PendingOrder, Transaction } from '../types';

interface DemoTradingProps {
  user: User;
  isDemoMode: boolean;
  onUpdateUser: (user: User) => void;
  onAddTransaction: (tx: Transaction) => void;
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
  category: 'Forex' | 'Crypto' | 'Commodities' | 'Stocks';
}

const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', basePrice: 1.0842, volatility: 0.0005, precision: 5, payout: 0.92, spread: 0.00015, pipSize: 0.0001, category: 'Forex' },
  { symbol: 'GBP/JPY', displayName: 'British Pound / Yen', basePrice: 190.45, volatility: 0.05, precision: 2, payout: 0.85, spread: 0.03, pipSize: 0.01, category: 'Forex' },
  { symbol: 'USD/JPY', displayName: 'US Dollar / Yen', basePrice: 151.22, volatility: 0.02, precision: 3, payout: 0.88, spread: 0.015, pipSize: 0.01, category: 'Forex' },
  { symbol: 'XAU/USD', displayName: 'Gold / US Dollar', basePrice: 2142.50, volatility: 1.5, precision: 2, payout: 0.78, spread: 0.45, pipSize: 0.01, category: 'Commodities' },
  { symbol: 'BTC/USD', displayName: 'Bitcoin / USD', basePrice: 68400, volatility: 45, precision: 2, payout: 0.82, spread: 15.0, pipSize: 1.0, category: 'Crypto' },
  { symbol: 'ETH/USD', displayName: 'Ethereum / USD', basePrice: 3820, volatility: 8.5, precision: 2, payout: 0.84, spread: 1.2, pipSize: 1.0, category: 'Crypto' },
  { symbol: 'AAPL/USD', displayName: 'Apple Inc.', basePrice: 172.62, volatility: 0.45, precision: 2, payout: 0.75, spread: 0.08, pipSize: 0.01, category: 'Stocks' },
  { symbol: 'TSLA/USD', displayName: 'Tesla Inc.', basePrice: 175.22, volatility: 1.2, precision: 2, payout: 0.72, spread: 0.15, pipSize: 0.01, category: 'Stocks' },
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

const DemoTrading: React.FC<DemoTradingProps> = ({ user, isDemoMode, onUpdateUser, onAddTransaction }) => {
  const [tradeType, setTradeType] = useState<TradeType>('FOREX');
  const [execType, setExecType] = useState<OrderExecutionType>('MARKET');
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [demoPrice, setDemoPrice] = useState(TRADING_PAIRS[0].basePrice);
  const [history, setHistory] = useState<{ time: string, price: number }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [totalDemoProfit, setTotalDemoProfit] = useState(0);
  const currentBalance = isDemoMode ? (user.demoBalance || 50000) + totalDemoProfit : (user.balance || 0);
  const equity = currentBalance;
  
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
  
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [pendingType, setPendingType] = useState<PendingOrderType>('BUY_LIMIT');

  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const bidPrice = demoPrice - (selectedPair.spread / 2);
  const askPrice = demoPrice + (selectedPair.spread / 2);

  useEffect(() => {
    const initial = Array.from({ length: 50 }, (_, i) => ({
      time: i.toString(),
      price: selectedPair.basePrice + (Math.random() - 0.5) * (selectedPair.basePrice * 0.005)
    }));
    setHistory(initial);
    setDemoPrice(selectedPair.basePrice);
    setSearchQuery('');
  }, [selectedPair]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
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
      if (tradeType === 'BINARY' && timeLeft === 0) {
        const isWin = position.type === 'BUY' ? bidPrice > position.entry : askPrice < position.entry;
        const profit = isWin ? position.size * selectedPair.payout : -position.size;
        finalizeTrade(profit, isWin ? 'Target Reached' : 'Expired Out of Money');
      }
      if (tradeType === 'FOREX') {
        if (position.sl && ((position.type === 'BUY' && bidPrice <= position.sl) || (position.type === 'SELL' && askPrice >= position.sl))) {
          finalizeTrade(pnl, 'Stop Loss Triggered');
        }
        if (position.tp && ((position.type === 'BUY' && bidPrice >= position.tp) || (position.type === 'SELL' && askPrice <= position.tp))) {
          finalizeTrade(pnl, 'Take Profit Hit');
        }
      }
      const marginUsed = (position.size * position.entry) / position.leverage;
      const currentEquity = equity + pnl;
      const marginLevel = (currentEquity / marginUsed) * 100;
      if (marginLevel < 30) {
        finalizeTrade(pnl, 'Stop Out: Margin Level < 30%');
      }
    }
  }, [timeLeft, position, bidPrice, askPrice, pnl, tradeType, pendingOrders, equity]);

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
    if (!isDemoMode) {
      const margin = (size * entryPrice) / leverage;
      onUpdateUser({ ...user, balance: (user.balance || 0) - margin });
      onAddTransaction({
        id: `TX-${Math.floor(Math.random()*100000)}`,
        userId: user.id,
        username: user.username,
        amount: margin,
        type: 'TRADE_OPEN',
        status: 'COMPLETED',
        timestamp: Date.now(),
        details: `Live Entry: ${type} ${selectedPair.symbol} @ ${entryPrice.toFixed(selectedPair.precision)}`
      });
    }

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
    if (position) {
      finalizeTrade(pnl, 'Manual Exit');
      return;
    }

    const entry = type === 'BUY' ? askPrice : bidPrice;
    const marginNeeded = (amount * entry) / selectedLeverage;

    if (marginNeeded > equity) {
      addNotification('Insufficient Real Balance. Please deposit via Paybill to open live positions.', 'error');
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
    if (isDemoMode) {
      setTotalDemoProfit(prev => prev + profit);
    } else {
      if (position) {
        const margin = (position.size * position.entry) / position.leverage;
        const totalReturn = margin + profit;
        onUpdateUser({ ...user, balance: (user.balance || 0) + totalReturn });
        onAddTransaction({
          id: `TX-${Math.floor(Math.random()*100000)}`,
          userId: user.id,
          username: user.username,
          amount: totalReturn,
          type: 'TRADE_CLOSE',
          status: 'COMPLETED',
          timestamp: Date.now(),
          details: `Live Exit: ${position.type} ${position.pair} (${reason}). P/L: $${profit.toFixed(2)}`
        });
      }
    }
    setPosition(null);
    setTimeLeft(null);
    setPnl(0);
    setSlPrice('');
    setTpPrice('');
    addNotification(`${reason}: Realized ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`, profit >= 0 ? 'success' : 'error');
  };

  const cancelPending = (id: string) => {
    setPendingOrders(prev => prev.filter(p => p.id !== id));
    addNotification('Order revoked', 'info');
  };

  const filteredPairs = TRADING_PAIRS.filter(p => 
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const marginUsed = position ? (position.size * position.entry) / position.leverage : 0;
  const currentEquity = equity + pnl;
  const marginLevel = marginUsed > 0 ? (currentEquity / marginUsed) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 relative">
      <div className="fixed top-20 right-8 z-[60] flex flex-col space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-md flex items-center space-x-3 ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : n.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'}`}></div>
            <span className="text-xs font-black uppercase tracking-widest">{n.message}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Equity Balance', value: `$${currentEquity.toLocaleString()}`, color: 'sky' },
          { label: 'Running P/L', value: `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()}`, color: pnl >= 0 ? 'emerald' : 'rose' },
          { label: 'Total Exposure', value: `$${marginUsed.toLocaleString()}`, color: 'slate' },
          { label: 'Unused Margin', value: `$${(currentEquity - marginUsed).toLocaleString()}`, color: 'emerald' },
          { label: 'Safety Factor', value: `${marginLevel > 0 ? marginLevel.toFixed(1) + '%' : '∞'}`, color: marginLevel < 100 && marginLevel > 0 ? 'rose' : 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
             <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</div>
             <div className={`text-xl font-mono font-black text-${stat.color}-500`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-50">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 flex items-center shadow-sm relative" ref={dropdownRef}>
           <button 
            onClick={() => !position && setIsDropdownOpen(!isDropdownOpen)}
            disabled={!!position}
            className={`flex items-center space-x-4 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 transition-all w-full lg:w-auto ${position ? 'opacity-50' : ''}`}
           >
             <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center font-black text-sky-500 uppercase">{selectedPair.symbol[0]}</div>
             <div className="text-left">
               <div className="text-xs font-black uppercase tracking-widest text-slate-400">Trade Configuration</div>
               <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                 {selectedPair.symbol} 
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
               </div>
             </div>
           </button>

           {isDropdownOpen && (
             <div className="absolute top-full left-0 mt-2 w-full lg:w-[450px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top-2 z-[100] backdrop-blur-xl">
               <div className="relative mb-4">
                 <input 
                  type="text" 
                  autoFocus
                  placeholder="Find assets..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none"
                 />
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               </div>
               <div className="max-h-[350px] overflow-y-auto space-y-1 pr-1">
                 {filteredPairs.map(pair => (
                   <button 
                    key={pair.symbol}
                    onClick={() => { setSelectedPair(pair); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedPair.symbol === pair.symbol ? 'bg-sky-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                   >
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] bg-sky-500/10 text-sky-500">{pair.symbol[0]}</div>
                       <div className="text-left">
                         <div className="text-xs font-bold">{pair.symbol}</div>
                         <div className="text-[10px] text-slate-500">{pair.displayName}</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-xs font-mono font-bold">${pair.basePrice.toLocaleString()}</div>
                       <div className="text-[9px] font-black uppercase text-sky-500">{pair.category}</div>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           )}

           <div className="hidden lg:flex items-center space-x-6 ml-8 pl-8 border-l border-slate-100 dark:border-slate-800">
             <div className="text-center">
               <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Spread</div>
               <div className="text-xs font-mono font-bold text-sky-500">{(selectedPair.spread / selectedPair.pipSize).toFixed(1)} Pips</div>
             </div>
             <div className="text-center">
               <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Leverage</div>
               <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">Up to 1:{LEVERAGE_OPTIONS[LEVERAGE_OPTIONS.length-1]}</div>
             </div>
           </div>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                <Area type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={3} fill="url(#tradeGradient)" isAnimationActive={false} />
                {position && (
                  <ReferenceLine y={position.entry} stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'right', value: `ENTRY: ${position.entry.toFixed(selectedPair.precision)}`, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Terminal</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Size</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono font-black focus:border-sky-500 outline-none transition-all"
                />
              </div>

              {position && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full ${position.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {position.type} EXECUTED
                     </span>
                  </div>
                  <div className={`text-4xl font-mono font-black leading-none mb-2 ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => handleTradeAction('BUY')}
                  className={`w-full py-6 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center group ${position ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}
                >
                  <span className="text-sm uppercase tracking-[0.2em]">
                    {position ? 'Close Position' : `Buy @ ${askPrice.toFixed(selectedPair.precision)}`}
                  </span>
                </button>
                <button 
                  onClick={() => handleTradeAction('SELL')}
                  className={`w-full py-6 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center group ${position ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white'}`}
                >
                  <span className="text-sm uppercase tracking-[0.2em]">
                    {position ? 'Close Position' : `Sell @ ${bidPrice.toFixed(selectedPair.precision)}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTrading;
