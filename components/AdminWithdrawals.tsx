
import React, { useState } from 'react';
import { WithdrawalRequest } from '../types';

const INITIAL_REQUESTS: WithdrawalRequest[] = [
  { id: 'W-001', userId: '1', username: 'Trader_Alpha', amount: 2500, status: 'PENDING', timestamp: Date.now() - 3600000, methodType: 'BANK', destinationDetails: 'HSBC - **** 9912' },
  { id: 'W-002', userId: '2', username: 'Whale_Watcher', amount: 15400, status: 'PENDING', timestamp: Date.now() - 7200000, methodType: 'PAYPAL', destinationDetails: 'whale.fin@gmail.com' },
];

const AdminWithdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>(INITIAL_REQUESTS);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getMethodColor = (type: string) => {
    switch(type) {
      case 'PAYPAL': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'MOBILE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">Withdrawal Clearing House</h2>
        <p className="text-slate-400 text-sm">Review and authorize outgoing capital transfers across multiple channels.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.filter(r => r.status === 'PENDING').length === 0 ? (
          <div className="p-20 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-20"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <p className="font-bold">Queue Empty</p>
            <p className="text-xs">All capital transfers have been processed.</p>
          </div>
        ) : (
          requests.filter(r => r.status === 'PENDING').map(req => (
            <div key={req.id} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between backdrop-blur-md gap-6">
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${getMethodColor(req.methodType)}`}>
                  {req.methodType === 'PAYPAL' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 2h6l2 9.5a4.5 4.5 0 1 0 9 0l2-9.5h2"/></svg>
                  ) : req.methodType === 'MOBILE' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">
                    {req.id} 
                    <span className="mx-2 opacity-30">|</span> 
                    <span className="text-[10px] text-sky-400">{req.methodType}</span>
                  </div>
                  <div className="text-lg font-bold">{req.username}</div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">{req.destinationDetails}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Requested Amount</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">${req.amount.toLocaleString()}</div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAction(req.id, 'APPROVED')}
                    className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  >
                    Authorize
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'REJECTED')}
                    className="px-6 py-2.5 bg-slate-800 text-rose-400 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {requests.filter(r => r.status !== 'PENDING').length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Historical Clearing Log</h3>
            <span className="text-[10px] text-slate-600 font-mono">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="space-y-2">
            {requests.filter(r => r.status !== 'PENDING').map(req => (
              <div key={req.id} className="p-4 bg-slate-950/50 border border-slate-800/30 rounded-xl flex items-center justify-between text-xs group hover:border-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="text-slate-500 font-mono">{req.id}</span>
                  <span className="font-bold text-slate-200">{req.username}</span>
                  <span className="text-slate-600 px-2 py-0.5 bg-slate-900 rounded-md text-[9px] uppercase font-black">{req.methodType}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-slate-500 italic hidden md:inline">{req.destinationDetails}</span>
                  <span className="font-mono text-slate-300 font-bold">${req.amount.toLocaleString()}</span>
                  <span className={`font-black uppercase tracking-tighter text-[10px] ${req.status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}`}>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
