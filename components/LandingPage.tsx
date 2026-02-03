
import React, { useState } from 'react';
import { AuthView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AuthView) => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-900 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-sky-400 transition-colors group"
      >
        <span className="text-lg font-bold tracking-tight">{question}</span>
        <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
          {answer}
        </p>
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'intelligence' | 'system'>('market');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400 hidden sm:block">
            AetherTrade AI
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-8 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#feature-matrix" className="hover:text-sky-400 transition-colors">Core Intelligence</a>
          <a href="#faqs" className="hover:text-sky-400 transition-colors">FAQs</a>
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
        <div className="inline-block px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-sky-400 mb-8 uppercase tracking-widest">
          The Alpha In Non-Biological Logic
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          Math > Emotion. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400">
            Human Bias Solved.
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The human brain is an evolution of survival, not high-frequency data arbitrage. AetherTrade AI replaces fear and greed with pure, cold, predictive matrices.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button 
            onClick={() => onNavigate(AuthView.REGISTER)}
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Deploy My Capital
          </button>
          <a href="#feature-matrix" className="w-full md:w-auto px-10 py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl text-lg transition-all text-center">
            Compare AI vs Human
          </a>
        </div>
      </section>

      {/* Interactive Feature Matrix Section */}
      <section id="feature-matrix" className="px-8 py-24 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">The Competitive Matrix</h2>
          <p className="text-slate-400">Select a domain to see how AetherTrade AI dominates traditional human decision-making.</p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-12 max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'market' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Market Edge
          </button>
          <button 
            onClick={() => setActiveTab('intelligence')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'intelligence' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'system' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            About System
          </button>
        </div>

        <div className="min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
          {activeTab === 'market' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-slate-900/40 border border-slate-800 rounded-[2.5rem]">
                <h3 className="text-xl font-bold mb-6 text-rose-500 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Human Limitation
                </h3>
                <ul className="space-y-6 text-slate-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-rose-500 mr-3 font-bold">✕</span>
                    <span><b>Fear of Loss:</b> Humans tend to exit winning trades too early and hold losers too long due to loss aversion.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-500 mr-3 font-bold">✕</span>
                    <span><b>Recency Bias:</b> Being emotionally affected by the last trade causes erratic and non-systematic execution.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-500 mr-3 font-bold">✕</span>
                    <span><b>Physical Latency:</b> Reaction to market news is limited by biological nerve signals (250ms delay).</span>
                  </li>
                </ul>
              </div>
              <div className="p-10 bg-sky-500/5 border border-sky-500/20 rounded-[2.5rem] shadow-[0_0_40px_rgba(14,165,233,0.1)]">
                <h3 className="text-xl font-bold mb-6 text-emerald-400 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                  AetherTrade Dominance
                </h3>
                <ul className="space-y-6 text-slate-300 text-sm">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 font-bold">✓</span>
                    <span><b>Probabilistic Purity:</b> Decisions are calculated strictly on expected value (EV+) with zero attachment to results.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 font-bold">✓</span>
                    <span><b>Systematic Objectivity:</b> The AI executes 10,000 simulations per second to find the objective optimal path.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 font-bold">✓</span>
                    <span><b>Zero-Lag execution:</b> Trades are sent to the liquidity hub directly from our neural core in &lt;5ms.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-12 flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <h3 className="text-3xl font-black text-violet-400">Total Intelligence Synthesis</h3>
                <p className="text-slate-400 leading-relaxed">
                  While a human analyst can read one news article at a time, AetherTrade AI ingests 100,000+ global news sources, social media pulses, and macroeconomic releases simultaneously.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center text-violet-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold">NLP Sentiment Matrix</div>
                      <div className="text-xs text-slate-500">Scanning global sentiment for manipulation patterns.</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center text-sky-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Inter-Asset Correlation</div>
                      <div className="text-xs text-slate-500">Analyzing synchrony between Gold, Forex, and Crypto in real-time.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-[400px] aspect-square bg-gradient-to-br from-violet-600/20 to-sky-600/20 rounded-[3rem] border border-white/5 flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                 <div className="w-32 h-32 bg-violet-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(139,92,246,0.4)]">
                   <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path></svg>
                  </div>
                  <h4 className="text-xl font-bold">Neural Mesh</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Intelligence distributed across 48 global availability zones to ensure 100% execution reliability and bypass local market downtime.</p>
               </div>
               <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
                  <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </div>
                  <h4 className="text-xl font-bold">Polymorphic Engine</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Our execution architecture changes its own IP and signature every second, neutralizing front-running bots and predatory high-frequency players.</p>
               </div>
               <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h4 className="text-xl font-bold">Zero-Lag Bridge</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Direct institutional connections that place your capital at the front of the queue, ensuring slippage is a thing of the past.</p>
               </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="px-8 py-24 max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Aether System Intelligence FAQs</h2>
          <p className="text-slate-500">Technical insights into our core architecture and decision matrices.</p>
        </div>
        <div className="space-y-2 bg-slate-900/20 p-8 rounded-[3rem] border border-slate-900">
          <FAQItem 
            question="Why is AI superior to human institutional traders?"
            answer="Institutional traders are still human; they suffer from ego, fatigue, and the 'Gambler's Fallacy'. Our AI evaluates every trade as an independent probabilistic event, devoid of memory-based bias. It doesn't 'try to get even' after a loss—it simply recalculates the next best move."
          />
          <FAQItem 
            question="How does the Moving Target Defense protect my capital?"
            answer="By rotating IP addresses and network signatures every 1000ms, our firewall prevents malicious entities from establishing a persistent reconnaissance point. This effectively makes our execution hub 'invisible' to external automated attacks."
          />
          <FAQItem 
            question="What happens if a malicious actor attempts a breach?"
            answer="Our 'Neural Counter-Strike' protocol is triggered for every blocked attack. The system doesn't just block; it identifies the source and automatically dispatches an offensive infection payload (virus) to the attacker's origin, neutralizing the threat at its source."
          />
          <FAQItem 
            question="Is the Gemini-powered reasoning real-time?"
            answer="Yes. We utilize a high-bandwidth integration with Gemini's low-latency reasoning engines, allowing our 'Live Assistant' to provide technical analysis based on chart data that is less than 100ms old."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-slate-900 bg-slate-950 text-center text-slate-500 text-xs mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>&copy; 2025 AetherTrade AI Global. Decision Dominance Platform.</p>
          <div className="flex space-x-6 font-bold uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Risk</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
