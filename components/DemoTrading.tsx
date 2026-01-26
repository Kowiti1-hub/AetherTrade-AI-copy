
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface DemoTradingProps {
  user: User;
}

const DemoTrading: React.FC<DemoTradingProps> = ({ user }) => {
  const [demoPrice, setDemoPrice] = useState(50000);
  const [history, setHistory] = useState<{ time: string, price: number }[]>([]);
  const [position, setPosition] = useState<{ entry: number, size: number, type: 'BUY' | 'SELL' } | null>(null);
  const [pnl, setPnl] = useState(0);
  const [totalDemoProfit, setTotalDemoProfit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate initial history
    const initial = Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      price: 50000 + (Math.random() - 0.5) * 200
    }));
    setHistory(initial);
  }, []);

  useEffect(() => {
    if (isSimulating) {
      timerRef.current = window.setInterval(() => {
        setDemoPrice(prev => {
          const change = (Math.random() - 0.48) * 50; // Slight upward bias for more interesting sell training
          const newPrice = prev + change;
          
          setHistory(h => {
            const newHistory = [...h, { time: Date.now().toString(), price: newPrice }].slice(-30);
            return newHistory;
          });

          if (position) {
            const currentPnl = position.type === 'BUY' 
              ? (newPrice - position.entry) * position.size
              : (position.entry - newPrice) * position.size;
            setPnl(currentPnl);
          }

          return newPrice;
        });
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSimulating, position]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (position) {
      // Close position
      setTotalDemoProfit(prev => prev + pnl);
      setPosition(null);
      setPnl(0);
    } else {
      // Open position
      setPosition({ entry: demoPrice, size: 1, type });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center shadow-xl shadow-amber-500/5">
        <div>
          <h1 className="text-3xl font-black text-amber-400">Trader Sell Academy</h1>
          <p className="text-slate-400 mt-1">Master the art of high-frequency execution in a zero-risk environment.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-6">
           <div className="text-right">
             <div className="text-[10px] text-amber-500/50 font-black uppercase tracking-widest">Training Capital</div>
             <div className="text-2xl font-mono font-bold text-white">${(user.demoBalance || 50000).toLocaleString()}.00</div>
           </div>
           <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isSimulating ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500 text-slate-950'}`}
           >
             {isSimulating ? 'Stop Simulator' : 'Start Simulator'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 animate-pulse"></span>
              Live Price Feed (Simulated)
            </h3>
            <div className="text-4xl font-mono font-black text-white tracking-tighter">
              ${demoPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={3} fill="url(#demoColor)" animationDuration={300} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Execution Panel</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Session Performance</div>
                <div className={`text-2xl font-mono font-bold ${totalDemoProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalDemoProfit >= 0 ? '+' : ''}${totalDemoProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {position && (
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${position.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      ACTIVE {position.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Entry: ${position.entry.toFixed(2)}</span>
                  </div>
                  <div className={`text-3xl font-mono font-black ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
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
                className={`py-4 rounded-xl font-black text-xs transition-all ${position?.type === 'BUY' ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'} disabled:opacity-20`}
              >
                {position?.type === 'BUY' ? 'CLOSE BUY' : 'DEMO BUY'}
              </button>
              <button 
                onClick={() => handleTrade('SELL')}
                disabled={!isSimulating || (position && position.type !== 'SELL')}
                className={`py-4 rounded-xl font-black text-xs transition-all ${position?.type === 'SELL' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white'} disabled:opacity-20`}
              >
                {position?.type === 'SELL' ? 'CLOSE SELL' : 'DEMO SELL'}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-widest">Training Mode: Virtual Execution Only</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
           <h4 className="font-bold mb-2">Sell Strategy: "The Retracement Catch"</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             The simulator is tuned for volatility. To maximize demo profits, look for sharp spikes above $50,100 and practice hitting <strong>DEMO SELL</strong> at the peak of the momentum candle.
           </p>
        </div>
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center space-x-4">
           <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
           </div>
           <div>
              <div className="font-bold text-amber-400">Educational Notice</div>
              <div className="text-xs text-slate-500 uppercase font-black">Admin oversight disabled for training sessions.</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTrading;
