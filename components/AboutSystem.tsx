
import React from 'react';

const AboutSystem: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[3rem] backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-sky-500/10 text-sky-500 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-sky-500/20">
              System Architecture v3.1
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              A distributed <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-500">Neural Matrix</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              AetherTrade AI is built on a globally distributed high-frequency infrastructure that bypasses traditional central server bottlenecks. By leveraging decentralized processing nodes, we ensure zero-latency intelligence and execution for institutional traders.
            </p>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors"></div>
             <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-sky-500/20 animate-[spin_20s_linear_infinite]"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m4.93 19.07 14.14-14.14"/></svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-sky-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-sky-500/50">
                   <span className="text-3xl font-black text-white">A</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           {
             title: 'Quantum-Safe Encryption',
             desc: 'Protecting your capital with NTRU and Dilithium-grade cryptographic protocols that stay ahead of emerging computational threats.',
             icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           },
           {
             title: 'Moving Target Defense',
             desc: 'Active system obfuscation that rotates network paths and execution environments every 1000ms to neutralize surveillance.',
             icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           },
           {
             title: 'Low-Slippage Bridge',
             desc: 'Proprietary liquidity routing that connects you directly to tier-1 banks, ensuring your orders fill at the precise millisecond of logic trigger.',
             icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           }
         ].map((item, idx) => (
           <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] hover:border-sky-500/50 transition-all shadow-sm">
             <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 mb-6">
               {item.icon}
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-white mb-6">Execution Integrity</h2>
            <div className="space-y-4">
               {[
                 { label: 'Uptime Reliability', value: '99.999%', color: 'emerald' },
                 { label: 'API Response Time', value: '14ms', color: 'sky' },
                 { label: 'Max Concurrent Nodes', value: '25,000+', color: 'violet' }
               ].map((stat, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-sm text-slate-400">{stat.label}</span>
                   <span className={`text-lg font-mono font-black text-${stat.color}-400`}>{stat.value}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-4">
            <p>
              Unlike legacy trading platforms that rely on "cloud" solutions with shared resources, AetherTrade deploys dedicated polymorphic containers for every institutional session.
            </p>
            <p>
              This architecture prevents "Cross-Tenant Information Leakage" and ensures that your trading strategies and execution patterns remain entirely private, even from our own system administrators.
            </p>
            <div className="pt-4">
              <button className="px-6 py-3 bg-white text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-sky-400 transition-colors">
                View Whitepaper
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSystem;
