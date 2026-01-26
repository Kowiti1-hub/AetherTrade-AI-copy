
import React, { useState, useMemo } from 'react';
import { User, PaymentMethodType, LinkedAccount, WithdrawalRequest } from '../types';

interface TraderWalletProps {
  user: User;
}

const TraderWallet: React.FC<TraderWalletProps> = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State for linking new methods
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('BANK');

  // Mock withdrawal history for the user
  const [pastWithdrawals] = useState<WithdrawalRequest[]>([
    { 
      id: 'W-992', 
      userId: user.id, 
      username: user.username, 
      amount: 1200, 
      status: 'APPROVED', 
      timestamp: Date.now() - 86400000 * 3, // 3 days ago
      methodType: 'BANK', 
      destinationDetails: 'Chase Bank - **** 4421' 
    },
    { 
      id: 'W-841', 
      userId: user.id, 
      username: user.username, 
      amount: 500, 
      status: 'REJECTED', 
      timestamp: Date.now() - 86400000 * 7, // 7 days ago
      methodType: 'PAYPAL', 
      destinationDetails: 'user@example.com' 
    },
    { 
      id: 'W-720', 
      userId: user.id, 
      username: user.username, 
      amount: 2500, 
      status: 'APPROVED', 
      timestamp: Date.now() - 86400000 * 12, // 12 days ago
      methodType: 'BANK', 
      destinationDetails: 'Chase Bank - **** 4421' 
    }
  ]);

  // Initial Mock Accounts if none exist
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(user.linkedAccounts || [
    { id: 'm1', type: 'BANK', label: 'Primary Checking', details: '**** 4421', provider: 'Chase Bank' }
  ]);

  // Logic to determine mobile provider based on user country
  const mobileProviderLabel = useMemo(() => {
    const country = (user.country || 'Global').toLowerCase();
    if (country.includes('kenya')) return 'M-Pesa';
    if (country.includes('phil') || country.includes('manila')) return 'GCash / Maya';
    if (country.includes('nigeria') || country.includes('ghana')) return 'MTN / Airtel Mobile Money';
    if (country.includes('usa')) return 'Venmo / CashApp';
    if (country.includes('uk')) return 'Revolut Mobile';
    return 'Local Mobile Wallet';
  }, [user.country]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !selectedMethodId) return;
    
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 5000);
    }, 2000);
  };

  const addMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newAccount: LinkedAccount = {
      id: Math.random().toString(36).substr(2, 9),
      type: newMethodType,
      label: formData.get('label') as string,
      details: formData.get('details') as string,
      provider: formData.get('provider') as string || undefined
    };

    setLinkedAccounts([...linkedAccounts, newAccount]);
    setShowAddMethod(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Balances */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-gradient-to-br from-sky-500/20 to-violet-600/20 border border-sky-500/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <h2 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Live Liquid Assets</h2>
             <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter mb-4">
               ${user.balance?.toLocaleString()}.00
             </div>
             <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               <span className="text-[10px] uppercase font-bold">Verified Equity</span>
             </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] backdrop-blur-md shadow-sm">
             <h3 className="text-sm font-bold mb-4">Linked Withdrawal Channels</h3>
             <div className="space-y-3">
               {linkedAccounts.map(acc => (
                 <button 
                  key={acc.id}
                  onClick={() => setSelectedMethodId(acc.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${selectedMethodId === acc.id ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-sky-500/30 dark:hover:border-slate-700'}`}
                 >
                   <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 mb-1">{acc.type} • {acc.provider || 'Personal'}</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{acc.label}</div>
                        <div className="text-xs font-mono text-slate-500">{acc.details}</div>
                      </div>
                      {selectedMethodId === acc.id && (
                        <div className="bg-sky-500 p-1 rounded-full">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                   </div>
                 </button>
               ))}
               <button 
                onClick={() => setShowAddMethod(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-bold hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all"
               >
                 + Link New Account
               </button>
             </div>
          </div>
        </div>

        {/* Right: Withdrawal Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
            <h2 className="text-2xl font-black mb-2">Initiate Capital Transfer</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Funds will be dispatched to your selected channel upon administrator clearance.</p>

            {success ? (
              <div className="p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center animate-in zoom-in-95">
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Request Dispatched</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Your transaction hash is being generated. Expected processing window: 12-24 hours.</p>
                 <button onClick={() => setSuccess(false)} className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Return to Wallet</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Transfer Amount (USD)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono focus:border-sky-500 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white"
                        placeholder="0.00"
                        required
                        max={user.balance}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-xs">USD</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Selected Destination</label>
                    <div className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex items-center h-[62px]">
                       {selectedMethodId ? (
                         <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/></svg>
                           </div>
                           <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{linkedAccounts.find(a => a.id === selectedMethodId)?.label}</span>
                         </div>
                       ) : (
                         <span className="text-slate-400 dark:text-slate-600 italic text-sm">Please select a channel</span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/50 flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                    By submitting, you authorize AetherTrade to deduct ${amount || '0.00'} from your live balance. Transfers to {selectedMethodId ? linkedAccounts.find(a => a.id === selectedMethodId)?.provider : 'selected providers'} are final once authorized by an Admin.
                  </div>
                </div>

                <button 
                  disabled={pending || !selectedMethodId || !amount}
                  className="w-full py-5 bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-20"
                >
                  {pending ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying Liquidity...</span>
                    </span>
                  ) : 'Confirm Withdrawal Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Transaction History */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transaction History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Completed capital transfers and cleared disbursements.</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span>Clearing Complete</span>
          </div>
        </div>

        <div className="space-y-4">
          {pastWithdrawals.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              <p className="font-bold">No historical data found</p>
              <p className="text-xs">Cleared transactions will appear in this ledger.</p>
            </div>
          ) : (
            pastWithdrawals.map(tx => (
              <div key={tx.id} className="p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between group hover:border-sky-500/30 transition-all gap-6">
                <div className="flex items-center space-x-5 w-full md:w-auto">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                     tx.status === 'APPROVED' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                   }`}>
                      {tx.status === 'APPROVED' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                   </div>
                   <div>
                     <div className="flex items-center space-x-2 mb-0.5">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.id}</span>
                       <span className="text-slate-300 dark:text-slate-800 text-xs">|</span>
                       <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                         tx.status === 'APPROVED' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'
                       }`}>
                         {tx.status}
                       </span>
                     </div>
                     <div className="font-bold text-slate-800 dark:text-slate-200">{tx.methodType} Disbursement</div>
                     <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.destinationDetails}</div>
                   </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto md:space-x-12">
                   <div className="text-left md:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Transfer Date</div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Cleared Amount</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        ${tx.amount.toLocaleString()}
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative text-slate-100">
            <h3 className="text-xl font-bold mb-6">Link New Financial Channel</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              {(['BANK', 'PAYPAL', 'MOBILE'] as PaymentMethodType[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setNewMethodType(t)}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newMethodType === t ? 'bg-sky-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={addMethod} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Label</label>
                <input name="label" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white" placeholder="e.g. My Savings" />
              </div>

              {newMethodType === 'BANK' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                    <input name="provider" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white" placeholder="e.g. HSBC / Chase" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IBAN / Account Number</label>
                    <input name="details" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white" placeholder="XXXX XXXX XXXX 1234" />
                  </div>
                </>
              )}

              {newMethodType === 'PAYPAL' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PayPal Email</label>
                  <input name="details" type="email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white" placeholder="user@example.com" />
                  <input type="hidden" name="provider" value="PayPal" />
                </div>
              )}

              {newMethodType === 'MOBILE' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Network Provider</label>
                    <select name="provider" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white">
                       <option value={mobileProviderLabel}>{mobileProviderLabel}</option>
                       <option value="Other / Global">Other / Global</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input name="details" type="tel" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none text-white" placeholder="+1..." defaultValue={user.phone} />
                  </div>
                </>
              )}

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="flex-1 py-4 bg-sky-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest">Link Channel</button>
                <button type="button" onClick={() => setShowAddMethod(false)} className="px-6 py-4 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderWallet;
