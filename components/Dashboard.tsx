import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MOCK_ASSETS } from '../constants';
import { marketData } from '../services/marketDataService';
import { MarketAsset, PriceAlert, AlertNotification } from '../types';

type SortKey = 'price' | 'change' | 'marketCap';
type SortOrder = 'asc' | 'desc';

const TOTAL_PORTFOLIO_VALUE = 142520.45;

const chartData = [
  { name: '00:00', value: 65000 },
  { name: '04:00', value: 67000 },
  { name: '08:00', value: 66200 },
  { name: '12:00', value: 69000 },
  { name: '16:00', value: 68400 },
  { name: '20:00', value: 71000 },
  { name: '23:59', value: 70200 },
];

const allocationData = [
  { name: 'Crypto', value: 45, color: '#0ea5e9' },
  { name: 'Stocks', value: 35, color: '#8b5cf6' },
  { name: 'Bonds', value: 15, color: '#10b981' },
  { name: 'Cash', value: 5, color: '#64748b' },
];

const newsData = [
  { id: 1, title: 'Fed Chair signals potential rate hold in upcoming Q3 session.', time: '5m ago', sentiment: 'Neutral', category: 'Macro' },
  { id: 2, title: 'Bitcoin dominance reaches 3-year high amidst institutional spot ETF inflow.', time: '12m ago', sentiment: 'Bullish', category: 'Crypto' },
  { id: 3, title: 'Global chip shortage eases as production capacity expands in SE Asia.', time: '24m ago', sentiment: 'Bullish', category: 'Tech' },
  { id: 4, title: 'Regulatory scrutiny increases for cross-chain decentralized protocols.', time: '1h ago', sentiment: 'Bearish', category: 'Regulation' },
  { id: 5, title: 'NVIDIA quarterly earnings exceed analyst expectations by 15.4%.', time: '2h ago', sentiment: 'Bullish', category: 'Equities' },
  { id: 6, title: 'Crude oil prices stabilize following OPEC+ production consensus.', time: '3h ago', sentiment: 'Neutral', category: 'Commodities' },
];

const Dashboard: React.FC = () => {
  const [assets, setAssets] = useState<MarketAsset[]>(MOCK_ASSETS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAssetForAlert, setSelectedAssetForAlert] = useState<MarketAsset | null>(null);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  
  // Sorting State
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      setUpdating(true);
      const latest = await marketData.getLatestPrices();
      
      const currentPrices: Record<string, number> = {};
      latest.forEach(a => currentPrices[a.symbol] = a.price);
      
      // Check alerts
      const triggered: AlertNotification[] = [];
      const updatedAlerts = alerts.map(alert => {
        if (!alert.active) return alert;
        const currentPrice = currentPrices[alert.symbol];
        if (!currentPrice) return alert;

        let isTriggered = false;
        if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) isTriggered = true;
        if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) isTriggered = true;

        if (isTriggered) {
          triggered.push({
            id: Math.random().toString(36).substr(2, 9),
            symbol: alert.symbol,
            price: currentPrice,
            message: `${alert.symbol} reached target of $${alert.targetPrice.toLocaleString()} (${alert.condition === 'ABOVE' ? 'Exceeded' : 'Dropped below'})`,
            timestamp: Date.now()
          });
          return { ...alert, active: false }; // Deactivate after trigger
        }
        return alert;
      });

      if (triggered.length > 0) {
        setNotifications(prev => [...triggered, ...prev].slice(0, 5));
        setAlerts(updatedAlerts);
      }

      setAssets(latest);
      setLastUpdate(new Date());
      
      setTimeout(() => {
        prevPrices.current = currentPrices;
        setUpdating(false);
      }, 1000);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [alerts]);

  const parseMarketCap = (capStr: string): number => {
    const num = parseFloat(capStr);
    if (capStr.includes('T')) return num * 1e12;
    if (capStr.includes('B')) return num * 1e9;
    if (capStr.includes('M')) return num * 1e6;
    return num;
  };

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      let valA: number;
      let valB: number;

      switch (sortKey) {
        case 'price':
          valA = a.price;
          valB = b.price;
          break;
        case 'change':
          valA = a.change;
          valB = b.change;
          break;
        case 'marketCap':
          valA = parseMarketCap(a.marketCap);
          valB = parseMarketCap(b.marketCap);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') return valA - valB;
      return valB - valA;
    });
  }, [assets, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getPriceColor = (symbol: string, currentPrice: number) => {
    const prev = prevPrices.current[symbol];
    if (!prev || Math.abs(prev - currentPrice) < 0.001) return 'text-slate-800 dark:text-slate-100';
    return currentPrice > prev ? 'text-emerald-500 animate-pulse' : 'text-rose-500 animate-pulse';
  };

  const openAlertModal = (asset: MarketAsset) => {
    setSelectedAssetForAlert(asset);
    setNewAlertPrice(asset.price.toFixed(2));
    setIsAlertModalOpen(true);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForAlert || !newAlertPrice) return;

    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedAssetForAlert.symbol,
      targetPrice: parseFloat(newAlertPrice),
      condition: newAlertCondition,
      active: true,
    };

    setAlerts(prev => [...prev, newAlert]);
    setIsAlertModalOpen(false);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const SortButton = ({ label, k }: { label: string, k: SortKey }) => {
    const isActive = sortKey === k;
    return (
      <button 
        onClick={() => toggleSort(k)}
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center space-x-1 ${
          isActive 
            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent'
        }`}
      >
        <span>{label}</span>
        {isActive && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="10" 
            height="10" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            className={`transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-12 transition-colors">
      {/* Alert Trigger Notifications Area */}
      <div className="fixed top-20 right-8 z-[100] space-y-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto bg-white dark:bg-slate-900/90 border border-sky-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl w-80 animate-in slide-in-from-right-8 duration-300">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">Price Alert</span>
              </div>
              <button onClick={() => removeNotification(n.id)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{n.message}</p>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-mono">Current: ${n.price.toLocaleString()}</span>
              <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Portfolio', value: `$${TOTAL_PORTFOLIO_VALUE.toLocaleString()}`, change: '+12.4%', up: true },
          { label: '24h Volume', value: '$8,432.12', change: '+2.1%', up: true },
          { label: 'Active Positions', value: '12', change: '-1', up: false },
          { label: 'Risk Score', value: 'Low/Med', change: 'Stable', up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-sky-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
            <div className="text-slate-500 text-sm mb-2 font-medium">{stat.label}</div>
            <div className="text-2xl font-bold mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-slate-900 dark:text-white">{stat.value}</div>
            <div className={`text-xs font-semibold flex items-center ${stat.up ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
              {stat.up ? '▲' : '▼'} {stat.change}
              <span className="text-slate-400 dark:text-slate-600 ml-2 font-normal italic">from yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Performance</h3>
            <div className="flex space-x-2">
              {['1H', '4H', '1D', '1W', '1M'].map(t => (
                <button key={t} className={`px-3 py-1 text-xs rounded-md border transition-colors ${t === '1D' ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400' : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-slate-400 dark:text-slate-600"
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-slate-400 dark:text-slate-600"
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tw-bg-opacity, #fff)', border: '1px solid currentColor', borderRadius: '12px' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Watchlist</h3>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${updating ? 'bg-sky-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${updating ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono uppercase tracking-tighter">
                Live: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
          
          {/* Sorting Controls */}
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-hide">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sort By:</span>
            <SortButton label="Cap" k="marketCap" />
            <SortButton label="Price" k="price" />
            <SortButton label="24h" k="change" />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {sortedAssets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-all group-hover:scale-105">
                      {asset.symbol[0]}
                    </div>
                    {alerts.some(a => a.symbol === asset.symbol && a.active) && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center text-slate-900 dark:text-white">
                      {asset.symbol}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openAlertModal(asset); }}
                        className="ml-2 p-1 text-slate-400 dark:text-slate-600 hover:text-sky-600 dark:hover:text-sky-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Set Price Alert"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm font-bold transition-colors duration-500 ${getPriceColor(asset.symbol, asset.price)}`}>
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-semibold ${asset.change > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 text-slate-700 dark:text-slate-300">
            <span>Explore All Assets</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* Portfolio Allocation and Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500">Asset distribution by category</p>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
          
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tw-bg-opacity, #0f172a)', 
                      border: '1px solid currentColor', 
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => {
                      const dollarValue = (TOTAL_PORTFOLIO_VALUE * value / 100).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      });
                      return [`${dollarValue} (${value}%)`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    iconType="circle"
                    formatter={(value: string) => <span className="text-slate-600 dark:text-slate-300 text-sm font-medium ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-4 mt-4 md:mt-0">
               {allocationData.map((item, i) => (
                 <div key={i} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">{item.name}</div>
                    <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Real-time Market Intelligence Feed */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intelligence Feed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500">Real-time global market signals</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 uppercase font-bold">Live Stream</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[300px]">
            {newsData.map((news) => (
              <div key={news.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all cursor-default group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                    news.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                    news.sentiment === 'Bearish' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                    'bg-slate-200 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400'
                  }`}>
                    {news.sentiment}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{news.time}</span>
                </div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-white transition-colors leading-snug">
                  {news.title}
                </h4>
                <div className="mt-2 text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter">
                  Source: {news.category} Analysis Hub
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors uppercase tracking-widest">
            View All Intelligence
          </button>
        </div>
      </div>

      {/* Alerts Management Section */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Price Alerts</h3>
          <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-500/20">
            {alerts.filter(a => a.active).length} Pending
          </span>
        </div>
        
        {alerts.filter(a => a.active).length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-4 opacity-20"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
             <p className="text-sm">No active alerts. Use the bell icon in your watchlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.filter(a => a.active).map(alert => (
              <div key={alert.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-sky-600 dark:text-sky-400 shadow-sm dark:shadow-none">
                    {alert.symbol[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{alert.symbol}</div>
                    <div className="text-[10px] text-slate-500 font-mono italic">
                      {alert.condition === 'ABOVE' ? 'Hits Above' : 'Drops Below'} ${alert.targetPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Creation Modal */}
      {isAlertModalOpen && selectedAssetForAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-violet-600"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600 dark:text-sky-400 mr-2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                Set Price Alert
              </h3>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-bold text-slate-900 dark:text-white text-xl shadow-sm">
                  {selectedAssetForAlert.symbol[0]}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedAssetForAlert.symbol}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">Market: ${selectedAssetForAlert.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setNewAlertCondition('ABOVE')}
                    className={`py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${newAlertCondition === 'ABOVE' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-500'}`}
                  >
                    Goes Above
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewAlertCondition('BELOW')}
                    className={`py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${newAlertCondition === 'BELOW' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                  >
                    Drops Below
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Target Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-mono focus:border-sky-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-950 font-black rounded-2xl shadow-xl shadow-sky-500/20 transition-all active:scale-95"
              >
                Create Alert Matrix
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;