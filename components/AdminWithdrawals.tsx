
import React from 'react';
import { Transaction, User } from '../types';

interface AdminWithdrawalsProps {
  transactions: Transaction[];
  onUpdateTransactions: (txs: Transaction[]) => void;
  onUpdateUser: (user: User) => void;
}

const AdminWithdrawals: React.FC<AdminWithdrawalsProps> = ({ transactions, onUpdateTransactions, onUpdateUser }) => {
  const pendingRequests = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const targetTx = transactions.find(t => t.id === id);
    if (status === 'APPROVED' && targetTx) {
      // In a real app we'd fetch the user's current data first
      // Here we simulate the balance deduction upon approval
      // This part is tricky in a stateless frontend mock, but we'll reflect the intent
      // We assume the user prop in App.tsx is the current one, but Admin might be different
      // For this mock, we just update the transaction status
    }
    
    onUpdateTransactions(transactions.map(t => t.id === id ? { ...t, status: status === 'APPROVED' ? 'COMPLETED' : 'REJECTED' } : t));
  };

  const getMethodColor = (type?: string) => {
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
        <p className="text-slate-400 text-sm">Review and authorize outgoing capital transfers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingRequests.length === 0 ? (
          <div className="p-20 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-20"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <p className="font-bold">Queue Empty</p>
            <p className="text-xs">No pending transfers found.</p>
          </div>
        ) : (
          pendingRequests.map(req => (
            <div key={req.id} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between backdrop-blur-md gap-6">
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${getMethodColor(req.methodType)}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-500 uppercase tracking-widest">{req.id}</div>
                  <div className="text-lg font-bold">{req.username}</div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">{req.details}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Amount</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">${req.amount.toLocaleString()}</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleAction(req.id, 'APPROVED')} className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg">Authorize</button>
                  <button onClick={() => handleAction(req.id, 'REJECTED')} className="px-6 py-2.5 bg-slate-800 text-rose-400 font-bold rounded-xl">Reject</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
