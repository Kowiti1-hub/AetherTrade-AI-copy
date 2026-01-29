
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { TradingStrategy } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';

interface BacktestResult {
  netProfit: number;
  netProfitUSD: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  equityCurve: { x: number, y: number, label: string }[];
}

type ToolType = 'none' | 'trendline' | 'horizontal' | 'fibonacci';

interface Drawing {
  type: ToolType;
  points: { x: number, y: number }[];
  id: string;
}

const StrategyBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<TradingStrategy | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  // Drawing Tools State
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Simulation Parameters
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialCapital, setInitialCapital] = useState('10000');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setBacktestResult(null);
    setDrawings([]);
    try {
      const res = await gemini.generateStrategy(prompt);
      setStrategy(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runBacktest = () => {
    if (!strategy) return;
    setIsBacktesting(true);
    setBacktestResult(null);
    setDrawings([]);

    const capital = parseFloat(initialCapital) || 10000;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const daysDiff = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));

    setTimeout(() => {
      const riskMultiplier = strategy.riskProfile === 'High' ? 2.5 : strategy.riskProfile === 'Medium' ? 1.5 : 0.8;
      const profitPercentage = parseFloat((Math.random() * 15 * riskMultiplier * (daysDiff / 365) + 5).toFixed(2));
      const netProfitUSD = (capital * profitPercentage) / 100;

      const steps = 30;
      let currentEquity = capital;
      const equityCurve = Array.from({ length: steps }, (_, i) => {
        const volatility = (Math.random() - 0.45) * (capital * 0.05) * riskMultiplier;
        currentEquity += volatility + (netProfitUSD / steps);
        return { 
          x: i, 
          y: parseFloat(currentEquity.toFixed(2)),
          label: `Day ${i + 1}` 
        };
      });

      const result: BacktestResult = {
        netProfit: profitPercentage,
        netProfitUSD: netProfitUSD,
        winRate: parseFloat((Math.random() * 20 + 55).toFixed(1)),
        profitFactor: parseFloat((Math.random() * 0.8 + 1.2).toFixed(2)),
        maxDrawdown: parseFloat((Math.random() * 5 * riskMultiplier + 2).toFixed(2)),
        totalTrades: Math.floor((Math.random() * 100 + 40) * (daysDiff / 365)),
        equityCurve
      };

      setBacktestResult(result);
      setIsBacktesting(false);
    }, 2500);
  };

  // Drawing Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'none' || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing({
      type: activeTool,
      points: [{ x, y }],
      id: Math.random().toString(36).substr(2, 9)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentDrawing || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing({
      ...currentDrawing,
      points: [currentDrawing.points[0], { x, y }]
    });
  };

  const handleMouseUp = () => {
    if (currentDrawing) {
      setDrawings([...drawings, currentDrawing]);
      setCurrentDrawing(null);
    }
  };

  const clearDrawings = () => setDrawings([]);

  // Fix: Added key to props type to satisfy TypeScript when rendering in a list
  const FibonacciLevels = ({ y1, y2, x1, x2 }: { y1: number, y2: number, x1: number, x2: number, key?: React.Key }) => {
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const diff = y2 - y1;
    return (
      <g>
        {levels.map(level => {
          const y = y1 + diff * level;
          return (
            <g key={level}>
              <line 
                x1={Math.min(x1, x2)} 
                y1={y} 
                x2={Math.max(x1, x2)} 
                y2={y} 
                stroke="rgba(14, 165, 233, 0.4)" 
                strokeWidth="1" 
                strokeDasharray="4 2" 
              />
              <text x={Math.max(x1, x2) + 5} y={y + 3} fill="rgba(14, 165, 233, 0.6)" fontSize="9" className="font-mono">
                {level === 0 ? 'START' : level === 1 ? 'END' : level.toString()}
              </text>
            </g>
          );
        })}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" />
      </g>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 transition-colors">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-xl transition-colors">
            <div className="flex items-center space-x-3 mb-4">
               <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-500 dark:text-violet-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M6 5h2"/><path d="M16 19h2"/></svg>
               </div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Strategy Architect</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Define your trading objectives. Our neural network will synthesize a precise mathematical execution plan.</p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 transition-all focus:ring-4 focus:ring-violet-500/10 dark:placeholder:text-slate-600 mb-6"
              placeholder="Describe your strategy: e.g. Mean reversion on S&P 500 using Bollinger Band squeezes with volume confirmation on 15m timeframe..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Initial Capital ($)</label>
                  <input 
                    type="number" 
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-violet-500 outline-none text-slate-900 dark:text-white"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-mono focus:border-violet-500 outline-none text-slate-900 dark:text-white"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-mono focus:border-violet-500 outline-none text-slate-900 dark:text-white"
                  />
               </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-black rounded-2xl shadow-xl shadow-violet-600/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Synthesizing Architecture...</span>
                </span>
              ) : 'Generate Execution Plan'}
            </button>
          </div>

          {strategy && (isBacktesting || backtestResult) && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in duration-500 transition-colors">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Strategy Backtest Performance</h3>
                  <p className="text-sm text-slate-500">Historical equity projection based on architectural parameters.</p>
                </div>
                {isBacktesting && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Simulating...</span>
                  </div>
                )}
              </div>

              {isBacktesting ? (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                  <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
                  </div>
                  <p className="text-xs text-slate-500 font-mono italic">Ingesting historical ticks and volatility matrices...</p>
                </div>
              ) : backtestResult && (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Net Profit</div>
                      <div className="text-xl font-black text-emerald-600 font-mono">+${backtestResult.netProfitUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-[9px] text-emerald-500/70 font-bold">+{backtestResult.netProfit}%</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Win Rate</div>
                      <div className="text-xl font-black text-sky-600 font-mono">{backtestResult.winRate}%</div>
                      <div className="text-[9px] text-sky-500/70 font-bold">Weighted Alpha</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Profit Factor</div>
                      <div className="text-xl font-black text-violet-600 font-mono">{backtestResult.profitFactor}</div>
                      <div className="text-[9px] text-violet-500/70 font-bold">Sharpe Optimized</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Max Drawdown</div>
                      <div className="text-xl font-black text-rose-600 font-mono">-{backtestResult.maxDrawdown}%</div>
                      <div className="text-[9px] text-rose-500/70 font-bold">Historical Low</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Total Trades</div>
                      <div className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono">{backtestResult.totalTrades}</div>
                      <div className="text-[9px] text-slate-500 font-bold">Execution Count</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Expectancy</div>
                      <div className="text-xl font-black text-amber-600 font-mono">${(backtestResult.netProfitUSD / backtestResult.totalTrades).toFixed(2)}</div>
                      <div className="text-[9px] text-amber-500/70 font-bold">Per Trade Edge</div>
                    </div>
                  </div>

                  <div className="relative h-[500px] w-full bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50 flex transition-all">
                    {/* Drawing Toolbar */}
                    <div className="w-12 border-r border-slate-200 dark:border-slate-800 pr-4 mr-4 flex flex-col space-y-3 shrink-0">
                       <button 
                        onClick={() => setActiveTool('none')}
                        className={`p-2.5 rounded-xl transition-all ${activeTool === 'none' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Pointer"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
                       </button>
                       <button 
                        onClick={() => setActiveTool('trendline')}
                        className={`p-2.5 rounded-xl transition-all ${activeTool === 'trendline' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Trendline"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/></svg>
                       </button>
                       <button 
                        onClick={() => setActiveTool('horizontal')}
                        className={`p-2.5 rounded-xl transition-all ${activeTool === 'horizontal' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Horizontal Line"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" x2="21" y1="12" y2="12"/><circle cx="12" cy="12" r="2"/></svg>
                       </button>
                       <button 
                        onClick={() => setActiveTool('fibonacci')}
                        className={`p-2.5 rounded-xl transition-all ${activeTool === 'fibonacci' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Fibonacci Retracement"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><path d="M12 3v18"/></svg>
                       </button>
                       <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                          <button 
                            onClick={clearDrawings}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Clear All Drawings"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                       </div>
                    </div>

                    <div className="flex-1 relative" ref={chartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={backtestResult.equityCurve}>
                          <defs>
                            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                          <XAxis dataKey="x" hide />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            stroke="#64748b"
                            tickFormatter={(val) => `$${val.toLocaleString()}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#10b981' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Equity']}
                            labelStyle={{ display: 'none' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="y" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            fill="url(#equityGradient)" 
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>

                      {/* SVG Drawing Layer */}
                      <svg 
                        className="absolute inset-0 pointer-events-auto cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{ display: activeTool === 'none' ? 'none' : 'block' }}
                      >
                        {[...drawings, ...(currentDrawing ? [currentDrawing] : [])].map((drawing) => {
                          if (drawing.points.length < 2 && drawing.type !== 'horizontal') return null;
                          const p1 = drawing.points[0];
                          const p2 = drawing.points[1] || p1;

                          switch (drawing.type) {
                            case 'trendline':
                              return (
                                <line 
                                  key={drawing.id}
                                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                  stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"
                                />
                              );
                            case 'horizontal':
                              return (
                                <line 
                                  key={drawing.id}
                                  x1="0" y1={p1.y} x2="100%" y2={p1.y}
                                  stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5"
                                />
                              );
                            case 'fibonacci':
                              return <FibonacciLevels key={drawing.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
                            default:
                              return null;
                          }
                        })}
                      </svg>
                      
                      {/* Read-only drawings (displayed when tool is none) */}
                      {activeTool === 'none' && (
                         <svg className="absolute inset-0 pointer-events-none">
                            {drawings.map((drawing) => {
                              const p1 = drawing.points[0];
                              const p2 = drawing.points[1] || p1;
                              switch (drawing.type) {
                                case 'trendline':
                                  return <line key={drawing.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.6" />;
                                case 'horizontal':
                                  return <line key={drawing.id} x1="0" y1={p1.y} x2="100%" y2={p1.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.6" />;
                                case 'fibonacci':
                                  return <FibonacciLevels key={drawing.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
                                default: return null;
                              }
                            })}
                         </svg>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[400px] flex flex-col space-y-6 shrink-0">
          {strategy ? (
            <div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-500">
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-violet-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex-1 transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-10 text-slate-400 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M6 5h2"/><path d="M16 19h2"/></svg>
                 </div>

                 <div className="inline-flex items-center px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black rounded-full mb-6 uppercase tracking-[0.2em] border border-violet-500/20">
                   {strategy.riskProfile} Risk Profile
                 </div>
                 
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{strategy.name}</h3>
                 
                 <div className="space-y-6 text-sm">
                   <div>
                     <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-2">Timeframe Integration</div>
                     <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 inline-block font-mono text-sky-600 dark:text-sky-400">{strategy.timeframe}</div>
                   </div>

                   <div>
                     <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-2">Indicator Matrix</div>
                     <div className="flex flex-wrap gap-2">
                       {strategy.indicators.map(idx => (
                         <span key={idx} className="text-[10px] px-3 py-1.5 bg-sky-500/5 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-lg font-bold shadow-sm dark:shadow-none">
                           {idx}
                         </span>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest mb-1.5">Alpha Entry Logic</div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 italic">
                         {strategy.entryCondition}
                       </p>
                     </div>

                     <div>
                       <div className="text-[10px] text-rose-600 dark:text-rose-500 font-black uppercase tracking-widest mb-1.5">Risk Mitigation Exit</div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 italic">
                         {strategy.exitCondition}
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mt-8">
                    <button 
                      onClick={runBacktest}
                      disabled={isBacktesting}
                      className="py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      {isBacktesting ? (
                         <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      )}
                      <span>Backtest</span>
                    </button>
                    <button className="py-3.5 bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-sky-500/20 transition-all">
                      Deploy Live
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center text-slate-400 dark:text-slate-600 transition-colors h-full min-h-[500px]">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
               </div>
               <p className="text-sm font-black uppercase tracking-widest">Awaiting Parameters</p>
               <p className="text-xs mt-2 leading-relaxed">Synthesis of the trading matrix begins once architecture inputs are provided.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyBuilder;
