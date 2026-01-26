
import React from 'react';
import { AuthView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AuthView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400">
            AetherTrade AI
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="#markets" className="hover:text-sky-400 transition-colors">Markets</a>
          <a href="#features" className="hover:text-sky-400 transition-colors">Intelligence</a>
          <a href="#security" className="hover:text-sky-400 transition-colors">Security</a>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate(AuthView.LOGIN)}
            className="px-5 py-2 text-sm font-semibold hover:text-sky-400 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate(AuthView.REGISTER)}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full transition-all shadow-lg shadow-sky-500/20"
          >
            Open Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 py-24 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="inline-block px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-sky-400 mb-8 uppercase tracking-widest animate-bounce">
          New: Gemini 3.0 Pro Intelligence Integrated
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          Precision Trading <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400">
            Driven by Pure AI.
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate institutional-grade Forex and Crypto platform. Master the markets with real-time predictive analytics, automated strategy generation, and voice-guided execution.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button 
            onClick={() => onNavigate(AuthView.REGISTER)}
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Start Trading Now
          </button>
          <button className="w-full md:w-auto px-10 py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl text-lg transition-all">
            Live Markets Demo
          </button>
        </div>
      </section>

      {/* Trust Ticker */}
      <div className="border-y border-slate-900 bg-slate-900/30 backdrop-blur-sm py-4">
        <div className="flex justify-around items-center max-w-7xl mx-auto px-8 space-x-8 animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono text-xs uppercase">EUR/USD</span>
            <span className="text-emerald-400 font-bold">1.0842</span>
            <span className="text-[10px] text-emerald-500">+0.12%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono text-xs uppercase">GBP/JPY</span>
            <span className="text-rose-400 font-bold">190.12</span>
            <span className="text-[10px] text-rose-500">-0.05%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono text-xs uppercase">XAU/USD</span>
            <span className="text-emerald-400 font-bold">2142.12</span>
            <span className="text-[10px] text-emerald-500">+1.42%</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-slate-500 font-mono text-xs uppercase">BTC/USD</span>
            <span className="text-sky-400 font-bold">68,432.12</span>
            <span className="text-[10px] text-sky-500">+2.45%</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="px-8 py-24 max-w-7xl mx-auto" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-sky-500/50 transition-all group">
            <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m4.93 19.07 14.14-14.14"/></svg>
            </div>
            <h3 className="text-xl font-bold">Predictive AI Hub</h3>
            <p className="text-slate-400 leading-relaxed">
              Leverage the most advanced Gemini 3.0 models to analyze global sentiment and predict price action before it happens.
            </p>
          </div>
          <div className="space-y-4 p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3 className="text-xl font-bold">Moving Target Defense</h3>
            <p className="text-slate-400 leading-relaxed">
              Next-gen polymorphic security that rotates encryption protocols every second, making your assets literally impossible to target.
            </p>
          </div>
          <div className="space-y-4 p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-xl font-bold">Institutional Execution</h3>
            <p className="text-slate-400 leading-relaxed">
              Ultra-low latency bridges and zero-spread environments tailored for both professional traders and administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-slate-900 bg-slate-950 text-center text-slate-500 text-sm">
        <p>&copy; 2025 AetherTrade Global Intelligence Platform. All Rights Reserved. Regulated by AI Financial Standards.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
