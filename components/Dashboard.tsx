
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MOCK_ASSETS } from '../constants';
import { marketData } from '../services/marketDataService';
import { MarketAsset, PriceAlert, AlertNotification } from '../types';

const newsData = [
  { id: 1, title: 'US Core CPI Data: Inflation holds steady at 3.4% YoY.', time: 'High Impact', sentiment: 'Neutral', category: 'Calendar' },
  { id: 2, title: 'FOMC Meeting Minutes: Fed signals cautious approach to rate cuts.', time: 'Critical', sentiment: 'Bearish', category: 'Macro' },
  { id: 3, title: 'UK Employment Change exceeds expectations by 42k.', time: 'Med Impact', sentiment: 'Bullish', category: 'Calendar' },
  { id: 4, title: 'ECB President Lagarde speaking on Eurozone growth outlook.', time: '14:30 GMT', sentiment: 'Neutral', category: 'Events' },
];

const Dashboard: React.FC = () => {
  const [assets, setAssets] = useState<MarketAsset[]>(MOCK_ASSETS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Market Watchlist</h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-mono">FEED ACTIVE</span>
            </div>
          </div>
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-xl group transition-all hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center font-black text-sky-500">{asset.symbol[0]}</div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">Spread: {asset.spread?.toFixed(4)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 4 })}</div>
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
    </div>
  );
};

export default Dashboard;
