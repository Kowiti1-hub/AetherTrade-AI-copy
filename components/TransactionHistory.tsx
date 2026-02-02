
import React from 'react';
import { User, Transaction, UserRole } from '../types';

interface TransactionHistoryProps {
  user: User;
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user, transactions }) => {
  const filteredTxs = user.role === UserRole.ADMIN 
    ? transactions 
    : transactions.filter(t => t.userId === user.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{user.role === UserRole.ADMIN ? 'Global Transaction Logs' : 'My Financial History'}</h2>
          <p className="text-slate-400 text-sm">A full audit trail of deposits, withdrawals, and trading activity.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ref / User</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type / Details</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">No transactions recorded.</td>
              </tr>
            ) : (
              filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">{tx.id}</div>
                    <div className="text-[10px] text-slate-500">{tx.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                         tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                         tx.type === 'WITHDRAWAL' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                         'bg-slate-100 text-slate-500 border-slate-200'
                       }`}>
                         {tx.type}
                       </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">{tx.details}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-mono font-bold ${tx.type === 'DEPOSIT' || tx.type === 'TRADE_CLOSE' ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'TRADE_CLOSE' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                      tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
