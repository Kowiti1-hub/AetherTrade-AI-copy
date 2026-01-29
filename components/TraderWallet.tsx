
import React, { useState, useMemo } from 'react';
import { User, PaymentMethodType, LinkedAccount, WithdrawalRequest } from '../types';

interface TraderWalletProps {
  user: User;
}

type TransactionType = 'WITHDRAWAL' | 'DEPOSIT';

interface TransactionRecord extends Omit<WithdrawalRequest, 'status'> {
  type: TransactionType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  currency?: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

// Institutional Withdrawal Policy Limits
const WITHDRAWAL_LIMITS = {
  SINGLE_TX: 10000,
  DAILY_TOTAL: 25000,
};

const TraderWallet: React.FC<TraderWalletProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [depositCountry, setDepositCountry] = useState(user.country || '');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('BANK');

  // Unified Transaction History
  const [history, setHistory] = useState<TransactionRecord[]>([
    { 
      id: 'TX-992', 
      userId: user.id, 
      username: user.username, 
      amount: 1200, 
      type: 'WITHDRAWAL',
      status: 'APPROVED', 
      timestamp: Date.now() - 86400000 * 3,
      methodType: 'BANK', 
      destinationDetails: 'Chase Bank - **** 4421' 
    },
    { 
      id: 'TX-105', 
      userId: user.id, 
      username: user.username, 
      amount: 5000, 
      type: 'DEPOSIT',
      status: 'COMPLETED', 
      timestamp: Date.now() - 86400000 * 5,
      methodType: 'BANK', 
      destinationDetails: 'Wire Transfer - USD',
      currency: 'USD'
    },
    { 
      id: 'TX-841', 
      userId: user.id, 
      username: user.username, 
      amount: 500, 
      type: 'WITHDRAWAL',
      status: 'REJECTED', 
      timestamp: Date.now() - 86400000 * 7,
      methodType: 'PAYPAL', 
      destinationDetails: 'user@example.com' 
    },
    { 
      id: 'TX-202', 
      userId: user.id, 
      username: user.username, 
      amount: 2500, 
      type: 'DEPOSIT',
      status: 'COMPLETED', 
      timestamp: Date.now() - 86400000 * 1,
      methodType: 'BANK', 
      destinationDetails: 'Global Inbound - EUR',
      currency: 'EUR'
    }
  ]);

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(user.linkedAccounts || [
    { id: 'm1', type: 'BANK', label: 'Primary Checking', details: '**** 4421', provider: 'Chase Bank' }
  ]);

  const mobileProviderLabel = useMemo(() => {
    const country = (user.country || 'Global').toLowerCase();
    if (country.includes('kenya')) return 'M-Pesa';
    if (country.includes('phil')) return 'GCash / Maya';
    if (country.includes('nigeria') || country.includes('ghana')) return 'MTN / Airtel Mobile Money';
    return 'Local Mobile Wallet';
  }, [user.country]);

  // Calculate today's withdrawal volume to enforce daily limits
  const dailyWithdrawalUsage = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return history
      .filter(tx => tx.type === 'WITHDRAWAL' && tx.timestamp >= startOfToday && tx.status !== 'REJECTED')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [history]);

  const dailyUsagePercentage = Math.min(100, (dailyWithdrawalUsage / WITHDRAWAL_LIMITS.DAILY_TOTAL) * 100);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) return;

    if (activeTab === 'WITHDRAWAL') {
      if (!selectedMethodId) {
        setValidationError("Please select a linked payout destination.");
        return;
      }

      // Check against User Balance
      if (numAmount > (user.balance || 0)) {
        setValidationError(`Insufficient balance. Maximum available: $${(user.balance || 0).toLocaleString()}.`);
        return;
      }

      // Check single transaction limit
      if (numAmount > WITHDRAWAL_LIMITS.SINGLE_TX) {
        setValidationError(`Transaction limit exceeded. Maximum per withdrawal is $${WITHDRAWAL_LIMITS.SINGLE_TX.toLocaleString()}.`);
        return;
      }

      // Check daily total limit
      if (dailyWithdrawalUsage + numAmount > WITHDRAWAL_LIMITS.DAILY_TOTAL) {
        const remaining = Math.max(0, WITHDRAWAL_LIMITS.DAILY_TOTAL - dailyWithdrawalUsage);
        setValidationError(`Daily withdrawal limit of $${WITHDRAWAL_LIMITS.DAILY_TOTAL.toLocaleString()} reached. Remaining allowance today: $${remaining.toLocaleString()}.`);
        return;
      }
    }
    
    setPending(true);
    setTimeout(() => {
      const newTx: TransactionRecord = {
        id: `TX-${Math.floor(Math.random() * 900) + 100}`,
        userId: user.id,
        username: user.username,
        amount: numAmount,
        type: activeTab,
        status: activeTab === 'DEPOSIT' ? 'COMPLETED' : 'PENDING',
        timestamp: Date.now(),
        methodType: activeTab === 'DEPOSIT' ? 'BANK' : (linkedAccounts.find(a => a.id === selectedMethodId)?.type || 'BANK'),
        destinationDetails: activeTab === 'DEPOSIT' ? `Global Inbound - ${currency}` : (linkedAccounts.find(a => a.id === selectedMethodId)?.label || 'Linked Account'),
        currency: activeTab === 'DEPOSIT' ? currency : 'USD'
      };

      setHistory([newTx, ...history]);
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

  // Fix: Added key to props type to satisfy TypeScript when rendering in a list
  const TransactionItem = ({ tx }: { tx: TransactionRecord, key?: React.Key }) => (
    <div key={tx.id} className="p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between group hover:border-slate-400 dark:hover:border-slate-700 transition-all gap-6">
      <div className="flex items-center space-x-5 w-full md:w-auto">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
           tx.type === 'DEPOSIT' 
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
            : tx.status === 'REJECTED' 
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
         }`}>
            {tx.type === 'DEPOSIT' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
            )}
         </div>
         <div>
           <div className="flex items-center space-x-2 mb-0.5">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.id}</span>
             <span className="text-slate-300 dark:text-slate-800 text-xs">|</span>
             <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
               tx.status === 'APPROVED' || tx.status === 'COMPLETED' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : tx.status === 'REJECTED' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-amber-500/5 text-amber-500 border-amber-500/10'
             }`}>
               {tx.status}
             </span>
           </div>
           <div className="font-bold text-slate-800 dark:text-slate-200">{tx.type}</div>
           <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.destinationDetails}</div>
         </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto md:space-x-12">
         <div className="text-left md:text-right">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Trace Date</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
              {new Date(tx.timestamp).toLocaleDateString()}
            </div>
         </div>
         <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Net Amount</div>
            <div className={`text-xl font-black font-mono tracking-tight ${tx.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
              {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString()}
              {tx.currency && tx.currency !== 'USD' && <span className="text-[10px] ml-1 opacity-50">{tx.currency}</span>}
            </div>
         </div>
      </div>
    </div>
  );

  const depositHistory = history.filter(tx => tx.type === 'DEPOSIT');
  const activeWithdrawals = history.filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'PENDING');
  const pastWithdrawals = history.filter(tx => tx.type === 'WITHDRAWAL' && (tx.status === 'APPROVED' || tx.status === 'REJECTED'));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Balances & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-gradient-to-br from-sky-500/20 to-violet-600/20 border border-sky-500/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <h2 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Portfolio Equity</h2>
             <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter mb-4">
               ${user.balance?.toLocaleString()}.00
             </div>
             <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               <span className="text-[10px] uppercase font-bold">Audited Balance</span>
             </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] backdrop-blur-md shadow-sm">
             <h3 className="text-sm font-bold mb-4">Payout Destinations</h3>
             <div className="space-y-3">
               {linkedAccounts.map(acc => (
                 <button 
                  key={acc.id}
                  onClick={() => { setSelectedMethodId(acc.id); setActiveTab('WITHDRAWAL'); setValidationError(null); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${selectedMethodId === acc.id && activeTab === 'WITHDRAWAL' ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-sky-500/30 dark:hover:border-slate-700'}`}
                 >
                   <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 mb-1">{acc.type} • {acc.provider || 'Personal'}</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{acc.label}</div>
                        <div className="text-[10px] font-mono text-slate-500">{acc.details}</div>
                      </div>
                      {selectedMethodId === acc.id && activeTab === 'WITHDRAWAL' && (
                        <div className="bg-sky-500 p-1 rounded-full">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                   </div>
                 </button>
               ))}
               <button 
                onClick={() => setShowAddMethod(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all"
               >
                 + Link New Channel
               </button>
             </div>
          </div>
        </div>

        {/* Right: Deposit/Withdraw Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm relative overflow-hidden">
            
            {/* Limit Gauge Banner (Visible only for Withdrawals) */}
            {activeTab === 'WITHDRAWAL' && !success && (
              <div className="absolute top-0 right-0 p-10 hidden xl:block animate-in slide-in-from-right duration-500">
                <div className="w-48 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Limit</span>
                    <span className={`text-[10px] font-mono font-bold ${dailyUsagePercentage > 80 ? 'text-rose-500' : 'text-sky-500'}`}>
                      {dailyUsagePercentage.toFixed(0)}% Consumed
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${dailyUsagePercentage > 80 ? 'bg-rose-500' : 'bg-sky-500'}`}
                      style={{ width: `${dailyUsagePercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-slate-500 italic text-right">
                    Remaining: ${(WITHDRAWAL_LIMITS.DAILY_TOTAL - dailyWithdrawalUsage).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-10 w-full sm:w-fit">
              <button 
                onClick={() => { setActiveTab('DEPOSIT'); setSuccess(false); setValidationError(null); }}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DEPOSIT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Deposit
              </button>
              <button 
                onClick={() => { setActiveTab('WITHDRAWAL'); setSuccess(false); setValidationError(null); }}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'WITHDRAWAL' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Withdraw
              </button>
            </div>

            <h2 className="text-2xl font-black mb-2">
              {activeTab === 'DEPOSIT' ? 'Inject Capital' : 'Initiate Transfer'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              {activeTab === 'DEPOSIT' 
                ? 'Securely fund your trading account in your preferred local currency.' 
                : 'Request disbursement of liquid assets to your linked accounts.'}
            </p>

            {success ? (
              <div className="p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center animate-in zoom-in-95">
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                   {activeTab === 'DEPOSIT' ? 'Deposit Successful' : 'Request Dispatched'}
                 </h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">
                   {activeTab === 'DEPOSIT' 
                     ? 'Your funds have been credited. Check your balance for the update.' 
                     : 'Your transaction is being cleared. Expected window: 12-24 hours.'}
                 </p>
                 <button onClick={() => setSuccess(false)} className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Return to Form</button>
              </div>
            ) : (
              <form onSubmit={handleTransaction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Amount & Currency */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Transfer Amount</label>
                    <div className="flex space-x-2">
                      {activeTab === 'DEPOSIT' && (
                        <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:border-emerald-500"
                        >
                          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                      )}
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={amount}
                          onChange={e => { setAmount(e.target.value); setValidationError(null); }}
                          className={`w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono focus:border-${activeTab === 'DEPOSIT' ? 'emerald' : 'sky'}-500 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white ${validationError ? 'border-rose-500/50 ring-4 ring-rose-500/10' : ''}`}
                          placeholder="0.00"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-xs">
                          {activeTab === 'DEPOSIT' ? currency : 'USD'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Context Sensitive Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {activeTab === 'DEPOSIT' ? 'Origin Country' : 'Destination'}
                    </label>
                    {activeTab === 'DEPOSIT' ? (
                      <input 
                        type="text"
                        value={depositCountry}
                        onChange={e => setDepositCountry(e.target.value)}
                        placeholder="e.g. United Kingdom"
                        className="w-full h-[62px] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex items-center h-[62px]">
                        {selectedMethodId ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/></svg>
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{linkedAccounts.find(a => a.id === selectedMethodId)?.label}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 italic text-sm">Select a linked channel</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Error Feedback */}
                {validationError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-rose-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">{validationError}</div>
                  </div>
                )}

                {/* Real-time Policy Insights (Only for Withdrawals) */}
                {activeTab === 'WITHDRAWAL' && !validationError && amount && (
                   <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center space-x-3 animate-in fade-in duration-300">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-widest">
                        Transaction Parameters Verified • Safe to Authorize
                      </span>
                   </div>
                )}

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/50 flex items-center space-x-4">
                  <div className={`p-3 bg-${activeTab === 'DEPOSIT' ? 'emerald' : 'amber'}-500/10 text-${activeTab === 'DEPOSIT' ? 'emerald' : 'amber'}-600 dark:text-${activeTab === 'DEPOSIT' ? 'emerald' : 'amber'}-500 rounded-xl`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                    {activeTab === 'DEPOSIT' 
                      ? `Global deposits in ${currency} are processed via secure institutional gateways. Funds from ${depositCountry || 'any country'} are typically cleared instantly.`
                      : `Policy: Max $${WITHDRAWAL_LIMITS.SINGLE_TX.toLocaleString()} per TX, $${WITHDRAWAL_LIMITS.DAILY_TOTAL.toLocaleString()} per day. Current usage: $${dailyWithdrawalUsage.toLocaleString()}.`}
                  </div>
                </div>

                <button 
                  disabled={pending || (activeTab === 'WITHDRAWAL' && !selectedMethodId) || !amount || (activeTab === 'WITHDRAWAL' && !!validationError)}
                  className={`w-full py-5 bg-gradient-to-r ${activeTab === 'DEPOSIT' ? 'from-emerald-500 to-teal-600' : 'from-sky-500 to-violet-600'} text-white font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-20`}
                >
                  {pending ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying Gateway...</span>
                    </span>
                  ) : activeTab === 'DEPOSIT' ? `Deposit ${CURRENCIES.find(c => c.code === currency)?.symbol || ''}${amount}` : 'Authorize Transfer'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Deposit History Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Deposit History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Recent capital injections and gateway clearances.</p>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span>Settled</span>
          </div>
        </div>

        <div className="space-y-4">
          {depositHistory.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              <p className="font-bold italic">No deposit records found</p>
            </div>
          ) : (
            depositHistory.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {/* Active Withdrawal Requests Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Active Withdrawals</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Pending disbursement requests currently under review.</p>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span>Pending</span>
          </div>
        </div>

        <div className="space-y-4">
          {activeWithdrawals.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              <p className="font-bold italic">No active requests</p>
            </div>
          ) : (
            activeWithdrawals.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {/* Historical Disbursement Log Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Past Withdrawals</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Historical record of all approved and rejected disbursement requests.</p>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-sky-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span>Audit Complete</span>
          </div>
        </div>

        <div className="space-y-4">
          {pastWithdrawals.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              <p className="font-bold italic">No finalized records found</p>
            </div>
          ) : (
            pastWithdrawals.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {/* Linked Account Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative text-slate-900 dark:text-slate-100 transition-colors">
            <h3 className="text-xl font-black mb-6">Link New Financial Channel</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {(['BANK', 'PAYPAL', 'MOBILE'] as PaymentMethodType[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setNewMethodType(t)}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newMethodType === t ? 'bg-sky-500 text-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={addMethod} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Label</label>
                <input name="label" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" placeholder="e.g. My Savings" />
              </div>

              {newMethodType === 'BANK' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                    <input name="provider" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" placeholder="e.g. HSBC / Chase" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IBAN / Account Number</label>
                    <input name="details" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none font-mono" placeholder="XXXX XXXX XXXX 1234" />
                  </div>
                </>
              )}

              {newMethodType === 'PAYPAL' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PayPal Email</label>
                  <input name="details" type="email" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" placeholder="user@example.com" />
                  <input type="hidden" name="provider" value="PayPal" />
                </div>
              )}

              {newMethodType === 'MOBILE' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Network Provider</label>
                    <select name="provider" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none">
                       <option value={mobileProviderLabel}>{mobileProviderLabel}</option>
                       <option value="Global Wallet">Global Wallet</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input name="details" type="tel" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" placeholder="+..." defaultValue={user.phone} />
                  </div>
                </>
              )}

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="flex-1 py-4 bg-sky-500 text-white dark:text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20">Link Channel</button>
                <button type="button" onClick={() => setShowAddMethod(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderWallet;
