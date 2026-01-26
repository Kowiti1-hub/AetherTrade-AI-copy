
import React, { useState, useEffect } from 'react';

const PROTOCOLS = ['AES-GCM-256', 'RSA-4096-PSS', 'ChaCha20-Poly1305', 'NTRU-HPS-4096-701', 'Dilithium-5'];
const NODES = ['US-EAST-01', 'EU-WEST-04', 'AP-SOUTH-02', 'SA-EAST-01', 'UK-NORTH-01'];

const SecurityHub: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [activeProtocol, setActiveProtocol] = useState<string>(PROTOCOLS[0]);
  const [activeNode, setActiveNode] = useState<string>(NODES[0]);
  const [logs, setLogs] = useState<{ id: number, time: string, event: string, status: string }[]>([]);
  const [entropy, setEntropy] = useState<number>(98.2);

  useEffect(() => {
    const generateToken = () => {
      const chars = 'ABCDEF0123456789!@#$%^&*';
      let result = '';
      for (let i = 0; i < 24; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      setToken(result);
    };

    const rotationInterval = setInterval(() => {
      generateToken();
      setActiveProtocol(PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)]);
      setActiveNode(NODES[Math.floor(Math.random() * NODES.length)]);
      setEntropy(98 + Math.random());
      
      // Simulate random blocked attempts
      if (Math.random() > 0.85) {
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          event: `Suspicious handshake from ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.X.X`,
          status: 'BLOCKED & ISOLATED'
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
      }
    }, 1000);

    return () => clearInterval(rotationInterval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
            AetherMoving Target Defense
          </h1>
          <p className="text-slate-400 mt-2">Active polymorphic protection rotating system parameters every 1000ms.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">System Entropy</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{entropy.toFixed(2)}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Rotation Monitor */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4">
             <div className="text-[10px] font-mono text-emerald-500/50 uppercase">Live Trace Active</div>
          </div>
          
          <h3 className="text-lg font-bold mb-8 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
            Polymorphic Layer Rotation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="bg-black/40 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-tighter font-bold">Active Encryption</div>
                  <div className="text-xl font-mono text-sky-400">{activeProtocol}</div>
               </div>
               <div className="bg-black/40 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-tighter font-bold">Network Node Path</div>
                  <div className="text-xl font-mono text-violet-400">{activeNode}</div>
               </div>
            </div>
            <div className="bg-black/60 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
               <div className="text-xs text-emerald-500 mb-4 uppercase font-bold tracking-widest">Dynamic Access Token</div>
               <div className="text-lg font-mono break-all text-emerald-200 leading-tight">
                  {token}
               </div>
               <div className="mt-6 flex justify-between items-end">
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full animate-[progress_1s_linear_infinite]"></div>
                  </div>
               </div>
               <style>{`
                 @keyframes progress {
                   from { width: 100%; }
                   to { width: 0%; }
                 }
               `}</style>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-slate-700">
            <h4 className="text-sm font-bold text-slate-300 mb-4">Moving Target Defense Logic</h4>
            <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 uppercase font-mono">
               <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>IP Shuffling</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Stack Randomization</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>App Obfuscation</span>
               </div>
            </div>
          </div>
        </div>

        {/* Threat Monitor */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Threat Intelligence</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[400px]">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                  <span className="text-[10px] font-bold text-rose-500">{log.status}</span>
                </div>
                <div className="text-xs text-slate-300 leading-tight">{log.event}</div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="m12 14 4-4"/><path d="m3.34 19 8.66-15 8.66 15z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                 <span className="text-sm">No active threats detected.</span>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                </div>
                <div>
                   <div className="text-sm font-bold text-emerald-400">Security Integrity: High</div>
                   <div className="text-[10px] text-slate-400 uppercase">System obfuscated for 24h+</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="bg-sky-500/5 border border-sky-500/20 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-4 flex items-center text-sky-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Defensive Resilience Strategy
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Traditional security relies on "walls" (firewalls) that remain static, giving attackers time to study and find cracks. 
          AetherTrade's **Moving Target Defense (MTD)** shifts the paradigm: we constantly change the "ground" underneath the attacker. 
          By rotating encryption, shifting network paths, and generating single-use tokens, we ensure that any information an attacker steals is useless by the time they try to use it.
        </p>
      </div>
    </div>
  );
};

export default SecurityHub;
