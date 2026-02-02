
import React, { useState } from 'react';
import { User, PaymentMethodType, LinkedAccount, Transaction } from '../types';

interface TraderWalletProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onAddTransaction: (tx: Transaction) => void;
}

const TraderWallet: React.FC<TraderWalletProps> = ({ user, onUpdateUser, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('MOBILE');

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(user.linkedAccounts || [
    { id: 'm1', type: 'MOBILE', label: 'Primary Mobile Wallet', details: user.phone || '', provider: 'M-PESA' }
  ]);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      setValidationError("Please enter a valid amount.");
      return;
    }

    if (activeTab === 'WITHDRAWAL') {
      if (!selectedMethodId) {
        setValidationError("Please select a payout channel (where you want the funds to be sent).");
        return;
      }
      const selectedMethod = linkedAccounts.find(a => a.id === selectedMethodId);
      if (selectedMethod?.type === 'MOBILE' && !selectedMethod.details.match(/^\+?[0-9]{7,15}$/)) {
        setValidationError("The selected mobile channel has an invalid phone number.");
        return;
      }
      if (numAmount > (user.balance || 0)) {
        setValidationError(`Insufficient balance. Available: $${(user.balance || 0).toLocaleString()}`);
        return;
      }
    }
    
    setPending(true);
    setTimeout(() => {
      const selectedMethod = linkedAccounts.find(a => a.id === selectedMethodId);
      const newTx: Transaction = {
        id: `TX-${Math.floor(Math.random() * 100000)}`,
        userId: user.id,
        username: user.username,
        amount: numAmount,
        type: activeTab,
        status: activeTab === 'DEPOSIT' ? 'COMPLETED' : 'PENDING',
        timestamp: Date.now(),
        methodType: activeTab === 'DEPOSIT' ? 'BANK' : selectedMethod?.type,
        details: activeTab === 'DEPOSIT' 
          ? `Deposit via Paybill Account: ${user.paybillNumber || 'Aether-Direct'}` 
          : `Withdrawal via ${selectedMethod?.type} to ${selectedMethod?.type === 'MOBILE' ? 'Phone' : 'Account'}: ${selectedMethod?.details}`
      };

      if (activeTab === 'DEPOSIT') {
        onUpdateUser({ ...user, balance: (user.balance || 0) + numAmount });
      }

      onAddTransaction(newTx);
      setPending(false);
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const addMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const type = newMethodType;
    const details = formData.get('details') as string;

    if (type === 'MOBILE' && !details.match(/^\+?[0-9]{7,15}$/)) {
      alert("Please provide a valid phone number for mobile wiring.");
      return;
    }

    const newAccount: LinkedAccount = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      label: formData.get('label') as string,
      details: details,
      provider: formData.get('provider') as string || undefined
    };
    const updatedAccounts = [...linkedAccounts, newAccount];
    setLinkedAccounts(updatedAccounts);
    onUpdateUser({ ...user, linkedAccounts: updatedAccounts });
    setShowAddMethod(false);
  };

  const generatePaybill = () => {
    const pb = `PB-${Math.floor(100000 + Math.random() * 900000)}`;
    onUpdateUser({ ...user, paybillNumber: pb });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-gradient-to-br from-sky-500/20 to-violet-600/20 border border-sky-500/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <h2 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Real Balance</h2>
             <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter mb-4">
               ${user.balance?.toLocaleString()}.00
             </div>
             <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               <span className="text-[10px] uppercase font-bold">Liquid Assets</span>
             </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] backdrop-blur-md shadow-sm">
             <h3 className="text-sm font-bold mb-4">Linked Channels</h3>
             <div className="space-y-3">
               {linkedAccounts.map(acc => (
                 <div 
                  key={acc.id}
                  className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800"
                 >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[9px] font-black uppercase text-slate-400">{acc.type}</div>
                      {acc.type === 'MOBILE' && (
                        <div className="p-1 bg-emerald-500/10 rounded text-[8px] text-emerald-500 font-bold uppercase">Phone Wire</div>
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{acc.label}</div>
                    <div className="text-[10px] font-mono text-slate-500">{acc.details}</div>
                 </div>
               ))}
               <button 
                onClick={() => setShowAddMethod(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-sky-500/30 transition-colors"
               >
                 + Add New Channel
               </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-10 w-fit">
              <button 
                onClick={() => { setActiveTab('DEPOSIT'); setSuccess(false); setValidationError(null); }}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DEPOSIT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}
              >
                Deposit
              </button>
              <button 
                onClick={() => { setActiveTab('WITHDRAWAL'); setSuccess(false); setValidationError(null); }}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'WITHDRAWAL' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500'}`}
              >
                Withdraw
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center animate-in zoom-in-95">
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Transaction Initialized</h3>
                 <p className="text-slate-500 text-sm">
                   {activeTab === 'DEPOSIT' ? 'Direct capital injection confirmed.' : 'Withdrawal request sent to clearing house for payout.'}
                 </p>
                 <button onClick={() => setSuccess(false)} className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Acknowledge</button>
              </div>
            ) : (
              <form onSubmit={handleTransaction} className="space-y-8">
                {activeTab === 'DEPOSIT' ? (
                  <div className="p-6 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-sky-500 tracking-widest mb-1">Trader Paybill ID</h4>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {user.paybillNumber ? user.paybillNumber : "ID not provisioned"}
                      </p>
                    </div>
                    {!user.paybillNumber ? (
                      <button type="button" onClick={generatePaybill} className="px-4 py-2 bg-sky-500 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-sky-500/20">Provision ID</button>
                    ) : (
                       <span className="text-[9px] text-emerald-500 font-bold uppercase italic">Active Node</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Payout Destination</label>
                    {linkedAccounts.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                        <p className="text-xs text-slate-500 mb-4">You must link a payout channel before withdrawing.</p>
                        <button type="button" onClick={() => setShowAddMethod(true)} className="px-6 py-2 bg-sky-500 text-white text-[10px] font-black uppercase rounded-xl">Add Channel Now</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {linkedAccounts.map(acc => (
                          <button 
                            key={acc.id}
                            type="button"
                            onClick={() => setSelectedMethodId(acc.id)}
                            className={`p-4 rounded-2xl border text-left transition-all ${selectedMethodId === acc.id ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.15)]' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-sky-500/30'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                               <div className={`p-1.5 rounded-lg ${selectedMethodId === acc.id ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                  {acc.type === 'MOBILE' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
                                  )}
                               </div>
                               <div className="text-[8px] font-black uppercase text-slate-400">{acc.type}</div>
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{acc.label}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">{acc.details}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Transfer ($)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono font-black text-slate-900 dark:text-white focus:border-sky-500 outline-none transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                {validationError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-500 font-bold animate-in shake duration-300">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                      <span>{validationError}</span>
                    </div>
                  </div>
                )}

                <button 
                  disabled={pending}
                  className={`w-full py-5 bg-gradient-to-r ${activeTab === 'DEPOSIT' ? 'from-emerald-500 to-teal-600' : 'from-sky-500 to-violet-600'} text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50 active:scale-95`}
                >
                  {pending ? "Securing Transfer..." : activeTab === 'DEPOSIT' ? "Complete Capital Ingress" : "Initialize Capital Egress"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showAddMethod && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Channel Provisioning</h3>
            <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {(['MOBILE', 'BANK'] as PaymentMethodType[]).map(t => (
                <button key={t} onClick={() => setNewMethodType(t)} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newMethodType === t ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t === 'MOBILE' ? 'Phone Wire' : 'Bank Node'}</button>
              ))}
            </div>
            <form onSubmit={addMethod} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Channel Label</label>
                <input name="label" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none" placeholder="e.g. My Personal Wallet" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{newMethodType === 'MOBILE' ? "Phone Number (+...)" : "Account / IBAN Details"}</label>
                <input 
                  name="details" 
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none font-mono" 
                  placeholder={newMethodType === 'MOBILE' ? "+254..." : "Account Details"} 
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="flex-1 py-4 bg-sky-500 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-sky-500/20 active:scale-95 transition-all">Link Channel</button>
                <button type="button" onClick={() => setShowAddMethod(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderWallet;
