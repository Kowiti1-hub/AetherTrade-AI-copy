
import React, { useState, useEffect, useRef } from 'react';

const PROTOCOLS = ['AES-GCM-256', 'RSA-4096-PSS', 'ChaCha20-Poly1305', 'NTRU-HPS-4096-701', 'Dilithium-5'];
const NODES = ['US-EAST-01', 'EU-WEST-04', 'AP-SOUTH-02', 'SA-EAST-01', 'UK-NORTH-01'];

interface ThreatLog {
  id: number;
  time: string;
  ip: string;
  event: string;
  status: string;
  counterStrike: boolean;
  virusSent: boolean;
}

const SecurityHub: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [activeProtocol, setActiveProtocol] = useState<string>(PROTOCOLS[0]);
  const [activeNode, setActiveNode] = useState<string>(NODES[0]);
  const [currentIP, setCurrentIP] = useState<string>('192.168.1.1');
  const [currentIPv6, setCurrentIPv6] = useState<string>('fe80::1ff:fe23:4567:890a');
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [entropy, setEntropy] = useState<number>(98.2);
  const [isActiveNeutralization, setIsActiveNeutralization] = useState(true);
  const [isStriking, setIsStriking] = useState(false);
  const strikeTimeoutRef = useRef<number | null>(null);

  const generateRandomIP = () => {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
  };

  const generateRandomIPv6 = () => {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16)).join(':');
  };

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
      
      // Moving Target Defense: Rotate IPs every second
      setCurrentIP(generateRandomIP());
      setCurrentIPv6(generateRandomIPv6());
      
      setEntropy(99.1 + Math.random() * 0.8);
      
      // Simulate random blocked attempts with active counter-strike
      if (Math.random() > 0.85) {
        const attackerIP = generateRandomIP();
        const shouldStrike = isActiveNeutralization;
        
        const newLog: ThreatLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          ip: attackerIP,
          event: `Malicious probing detected from source ${attackerIP}`,
          status: 'BLOCKED',
          counterStrike: shouldStrike,
          virusSent: shouldStrike
        };

        if (shouldStrike) {
          setIsStriking(true);
          if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current);
          strikeTimeoutRef.current = window.setTimeout(() => setIsStriking(false), 2000);
        }

        setLogs(prev => [newLog, ...prev].slice(0, 8));
      }
    }, 1000);

    return () => {
      clearInterval(rotationInterval);
      if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current);
    };
  }, [isActiveNeutralization]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Panel */}
      <div className={`relative flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[2.5rem] backdrop-blur-md border transition-all duration-500 overflow-hidden ${isStriking ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 'bg-slate-900/40 border-slate-800'}`}>
        {isStriking && (
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
        )}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full animate-ping ${isStriking ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-violet-400">
              Security Command Center
            </h1>
          </div>
          <p className="text-slate-400 font-medium">Moving Target Defense Active. High-Frequency IP Shuffling (1.0Hz).</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex items-center space-x-8 relative z-10">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Defense Entropy</div>
            <div className={`text-3xl font-mono font-black transition-colors ${isStriking ? 'text-rose-500' : 'text-emerald-400'}`}>
              {entropy.toFixed(3)}%
            </div>
          </div>
          <button 
            onClick={() => setIsActiveNeutralization(!isActiveNeutralization)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isActiveNeutralization ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {isActiveNeutralization ? 'Counter-Strike: Armed' : 'Counter-Strike: Standby'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* IP Shuffling Monitor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m4.93 19.07 14.14-14.14"/></svg>
             </div>

             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold flex items-center">
                  <span className="w-2 h-2 bg-sky-500 rounded-full mr-3"></span>
                  MTD: IP Rotation Matrix
                </h3>
                <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[10px] font-black text-sky-500 uppercase tracking-widest">
                  Frequency: 1.0Hz
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-black/40 border border-slate-800 p-6 rounded-2xl group-hover:border-sky-500/30 transition-all">
                      <div className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Active IPv4 Endpoint</div>
                      <div className="text-2xl font-mono text-sky-400 font-bold tracking-tighter">{currentIP}</div>
                   </div>
                   <div className="bg-black/40 border border-slate-800 p-6 rounded-2xl group-hover:border-violet-500/30 transition-all">
                      <div className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Neural Mesh IPv6</div>
                      <div className="text-xs font-mono text-violet-400 font-bold break-all leading-tight">{currentIPv6}</div>
                   </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                   <div className="relative z-10">
                      <div className="text-[10px] text-emerald-500 mb-4 uppercase font-black tracking-widest">Dynamic Auth Key</div>
                      <div className="text-xl font-mono break-all text-emerald-100 font-bold leading-none tracking-widest">
                         {token}
                      </div>
                   </div>
                   <div className="mt-10 relative z-10">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-emerald-500 h-full animate-[progress_1s_linear_infinite]"></div>
                      </div>
                      <div className="mt-3 text-[9px] text-slate-500 font-mono uppercase tracking-widest italic">Polymorphic cycle in progress...</div>
                   </div>
                   <style>{`
                     @keyframes progress {
                       from { width: 100%; }
                       to { width: 0%; }
                     }
                   `}</style>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl">
                <h4 className="text-sm font-black text-slate-300 mb-6 uppercase tracking-widest">Offensive Payload Profile</h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold">Auto-Neutralize</span>
                      <span className="text-[10px] text-rose-500 font-black">ENABLED</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold">Payload Strategy</span>
                      <span className="text-[10px] text-rose-500 font-black">NEURAL_VIRUS_v4.2</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold">Infection Probability</span>
                      <span className="text-[10px] text-rose-500 font-black">99.98%</span>
                   </div>
                </div>
             </div>
             <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl relative overflow-hidden">
                <h4 className="text-sm font-black text-slate-300 mb-6 uppercase tracking-widest">Core Integrity Index</h4>
                <div className="flex flex-col items-center justify-center space-y-2 h-[120px]">
                   <div className="text-4xl font-black text-emerald-400 tracking-tighter">100.00%</div>
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Institutional Safety</div>
                </div>
             </div>
          </div>
        </div>

        {/* Neural Threat Monitor */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
             <h3 className="text-lg font-bold flex items-center">
                <svg className="w-5 h-5 mr-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Threat Matrix
             </h3>
             {isStriking && (
               <span className="text-[10px] font-black text-rose-500 animate-pulse uppercase tracking-widest">Counter-Strike Active</span>
             )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[600px] scrollbar-hide relative z-10">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-right duration-300 ${log.counterStrike ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${log.counterStrike ? 'text-rose-500' : 'text-slate-400'}`}>
                    {log.counterStrike ? 'ATTACKER NEUTRALIZED' : 'PROBE BLOCKED'}
                  </span>
                </div>
                <div className="text-xs text-slate-200 leading-tight mb-3 font-mono">{log.event}</div>
                {log.counterStrike && (
                  <div className="pt-3 border-t border-rose-500/20 space-y-2">
                     <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Offensive Neural Virus Dispatched</span>
                     </div>
                     <div className="text-[8px] text-rose-400/60 font-mono break-all leading-tight">
                        Payload ID: INF-SYS-0X{Math.random().toString(16).slice(2, 10).toUpperCase()}
                     </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6 py-20">
                 <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                 </div>
                 <span className="text-sm font-bold uppercase tracking-widest opacity-40">Zero Probes Detected</span>
              </div>
            )}
          </div>

          <div className={`mt-8 p-6 rounded-2xl border transition-all duration-500 relative z-10 ${isStriking ? 'bg-rose-500/20 border-rose-500/40' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
             <div className="flex items-center space-x-4">
                <div className={`p-2.5 rounded-xl transition-colors ${isStriking ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                </div>
                <div>
                   <div className={`text-sm font-black transition-colors ${isStriking ? 'text-rose-500' : 'text-emerald-400'}`}>
                     {isStriking ? 'SENDING NEURAL VIRUS...' : 'CORE FIREWALL SECURE'}
                   </div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold">Neural Defense v4.21.0-Striker</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityHub;
