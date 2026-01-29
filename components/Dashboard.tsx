
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MOCK_ASSETS, ICONS } from '../constants';
import { marketData } from '../services/marketDataService';
import { MarketAsset, PriceAlert, AlertNotification } from '../types';

const newsData = [
  { id: 1, title: 'US Core CPI Data: Inflation holds steady at 3.4% YoY.', time: 'High Impact', sentiment: 'Neutral', category: 'Calendar' },
  { id: 2, title: 'FOMC Meeting Minutes: Fed signals cautious approach to rate cuts.', time: 'Critical', sentiment: 'Bearish', category: 'Macro' },
  { id: 3, title: 'UK Employment Change exceeds expectations by 42k.', time: 'Med Impact', sentiment: 'Bullish', category: 'Calendar' },
  { id: 4, title: 'ECB President Lagarde speaking on Eurozone growth outlook.', time: '14:30 GMT', sentiment: 'Neutral', category: 'Events' },
];

const intelligenceFeed = [
  { id: 1, source: 'Reuters', title: 'NVIDIA hits record high as Blackwell chip demand exceeds supply forecasts.', time: '2m ago', sentiment: 'Bullish', urgency: 'High' },
  { id: 2, source: 'Bloomberg', title: 'China central bank keeps policy rates steady, eyes yuan stability.', time: '14m ago', sentiment: 'Neutral', urgency: 'Low' },
  { id: 3, source: 'FT', title: 'S&P 500 futures dip as 10-year Treasury yields climb back above 4.3%.', time: '25m ago', sentiment: 'Bearish', urgency: 'Medium' },
  { id: 4, source: 'CoinDesk', title: 'Institutional BTC outflows slow down; Analysts eye $72k resistance flip.', time: '42m ago', sentiment: 'Bullish', urgency: 'Medium' },
  { id: 5, source: 'Wall Street Journal', title: 'Global shipping rates spike as regional tensions impact trade routes.', time: '1h ago', sentiment: 'Bearish', urgency: 'High' },
];

const Dashboard: React.FC = () => {
  const [assets, setAssets] = useState<MarketAsset[]>(MOCK_ASSETS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);
  const [volumeSortOrder, setVolumeSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      setUpdating(true);
      const latest = await marketData.getLatestPrices();
      setAssets(latest);
      setLastUpdate(new Date());
      setTimeout(() => setUpdating(false), 800);
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const parseVolume = (volStr: string): number => {
    const clean = volStr.replace(/[$,]/g, '').toUpperCase();
    const num = parseFloat(clean);
    if (clean.includes('T')) return num * 1e12;
    if (clean.includes('B')) return num * 1e9;
    if (clean.includes('M')) return num * 1e6;
    if (clean.includes('K')) return num * 1e3;
    return num;
  };

  const sortedAssets = useMemo(() => {
    if (volumeSortOrder === 'none') return assets;
    return [...assets].sort((a, b) => {
      const volA = parseVolume(a.volume24h);
      const volB = parseVolume(b.volume24h);
      return volumeSortOrder === 'asc' ? volA - volB : volB - volA;
    });
  }, [assets, volumeSortOrder]);

  const toggleSort = () => {
    setVolumeSortOrder(prev => {
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 transition-colors">
      
      {/* Portfolio Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Equity Balance', value: `$142,520`, change: '+12.4%', up: true },
          { label: 'Used Margin', value: '$4,322.12', change: '1.2%', up: true },
          { label: 'Free Margin', value: '$138,198', change: '96%', up: true },
          { label: 'Margin Level', value: '3,297%', change: 'Safe', up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-sky-500/50 transition-all duration-300 group shadow-sm">
            <div className="text-slate-500 text-sm mb-2 font-medium">{stat.label}</div>
            <div className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{stat.value}</div>
            <div className={`text-xs font-semibold flex items-center ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stat.change}
              <span className="text-slate-400 dark:text-slate-600 ml-2 font-normal italic">Institutional status</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Watchlist with Forex Spreads */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Market Watchlist</h3>
              <button 
                onClick={toggleSort}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  volumeSortOrder !== 'none' 
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-500' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <span>Vol 24h</span>
                {volumeSortOrder === 'desc' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>}
                {volumeSortOrder === 'asc' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>}
                {volumeSortOrder === 'none' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Feed Active</span>
            </div>
          </div>
          <div className="space-y-4">
            {sortedAssets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-xl group transition-all hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center font-black text-sky-500">{asset.symbol[0]}</div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">
                      Spread: {asset.spread?.toFixed(4)} 
                      <span className="mx-2 opacity-30">|</span> 
                      Vol: {asset.volume24h}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
                  <div className={`text-xs font-semibold ${asset.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Calendar Widget */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Economic Calendar</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="flex-1 space-y-4">
            {newsData.map(news => (
              <div key={news.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                 <div className="flex justify-between items-center mb-1">
                   <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${news.time === 'High Impact' || news.time === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                     {news.time}
                   </span>
                   <span className="text-[9px] text-slate-400 font-mono">FOREX LIVE</span>
                 </div>
                 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{news.title}</h4>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-sky-500 transition-colors">
            Full Institutional Calendar
          </button>
        </div>
      </div>

      {/* Real-time Global Intelligence Feed */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Global Intelligence Feed</h3>
              <p className="text-sm text-slate-500 mt-1">Institutional stream monitoring sentiment, volatility, and geopolitical triggers.</p>
           </div>
           <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Signals</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           {intelligenceFeed.map(news => (
             <div key={news.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl group hover:border-sky-500/30 transition-all flex items-start space-x-5">
                <div className={`w-12 h-12 rounded-xl shrink-0 flex flex-col items-center justify-center border font-mono text-[10px] font-black ${
                  news.sentiment === 'Bullish' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                  news.sentiment === 'Bearish' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' :
                  'bg-slate-500/5 border-slate-500/20 text-slate-500'
                }`}>
                   <div className="uppercase opacity-60 tracking-tighter">{news.sentiment[0]}L</div>
                   <div className="text-[8px] leading-none mt-0.5">SNT</div>
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{news.source}</span>
                      <span className="text-[10px] font-mono text-slate-400">{news.time}</span>
                   </div>
                   <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-sky-500 transition-colors">
                     {news.title}
                   </h4>
                   <div className="mt-3 flex items-center space-x-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                        news.urgency === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        news.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                      }`}>
                        {news.urgency} Urgency
                      </span>
                      <span className="text-[9px] text-slate-500 italic">Market Sensitivity: Extreme</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
           <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div> Positive Flow: 62%</span>
              <span className="flex items-center"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></div> Negative Flow: 38%</span>
           </div>
           <button className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-600 transition-colors">View Deep Analysis Pipeline</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
