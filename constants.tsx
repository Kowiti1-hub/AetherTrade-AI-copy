
import React from 'react';

export const COLORS = {
  light: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#10b981',
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b'
  },
  dark: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#10b981',
    background: '#020617',
    surface: '#0f172a',
    border: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
  }
};

export const MOCK_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 68432.12, change: 2.4, marketCap: '1.34T', volume24h: '35.2B' },
  { symbol: 'ETH', name: 'Ethereum', price: 3452.88, change: -1.2, marketCap: '412.5B', volume24h: '18.1B' },
  { symbol: 'SOL', name: 'Solana', price: 142.45, change: 5.8, marketCap: '63.2B', volume24h: '4.5B' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.32, change: 0.45, marketCap: '3.42T', volume24h: '12.4B' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 124.12, change: 4.12, marketCap: '3.05T', volume24h: '42.1B' },
];

export const ICONS = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Insights: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8a3 3 0 0 0-3 3"/></svg>
  ),
  Strategy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M6 5h2"/><path d="M16 19h2"/></svg>
  ),
  Live: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
  ),
  Security: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  TrendUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="m22 7-8.5 8.5-5-5L2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  ),
  TrendDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m22 17-8.5-8.5-5 5L2 7"/><polyline points="16 17 22 17 22 11"/></svg>
  )
};
