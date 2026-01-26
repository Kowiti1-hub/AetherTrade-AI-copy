
import React, { useState } from 'react';
import { AuthView, UserRole, User } from '../types';

interface AuthPageProps {
  initialView: AuthView;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView, onSuccess, onCancel }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [role, setRole] = useState<UserRole>(UserRole.TRADER);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    country: '',
    accountDetails: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pw: string) => {
    return pw.length >= 6; // Simple validation for demo
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (view === AuthView.REGISTER) {
      if (!formData.username || !formData.email || !formData.password) {
        newErrors.push("Core credentials are required.");
      }

      if (role === UserRole.TRADER) {
        // Traders need numerous fields
        if (!formData.phone || !formData.country || !formData.emailConfirm) {
          newErrors.push("Full KYC details are required for Traders.");
        }
        if (formData.email !== formData.emailConfirm) {
          newErrors.push("Email confirmation does not match.");
        }
        if (formData.password !== formData.passwordConfirm) {
          newErrors.push("Passwords do not match.");
        }
      }
      
      if (!validatePassword(formData.password)) {
        newErrors.push("Password must be at least 6 characters.");
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSuccess({
      id: Math.random().toString(36).substr(2, 9),
      username: formData.username || 'System_User',
      email: formData.email,
      role: role,
      status: 'ACTIVE',
      phone: formData.phone,
      country: formData.country,
      accountDetails: formData.accountDetails,
      balance: role === UserRole.TRADER ? 10000 : undefined,
      demoBalance: role === UserRole.TRADER ? 50000 : undefined
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl bg-slate-900/40 backdrop-blur-3xl md:border md:border-slate-800 shadow-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden">
        
        <div className="shrink-0 p-6 flex items-center justify-between border-b border-slate-800/50">
          <button onClick={onCancel} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg flex items-center justify-center"><span className="text-sm font-bold text-white">A</span></div>
            <span className="font-bold text-slate-200">AetherTrade</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 scrollbar-hide">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                {view === AuthView.LOGIN ? 'Welcome Back' : `New ${role === UserRole.ADMIN ? 'Admin' : 'Trader'}`}
              </h2>
              <p className="text-slate-400 text-sm">
                {role === UserRole.ADMIN ? 'Administrator provisioning portal.' : 'Institutional-grade retail trading.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/50 rounded-2xl border border-slate-800/50 mb-4">
                <button type="button" onClick={() => setRole(UserRole.TRADER)} className={`py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${role === UserRole.TRADER ? 'bg-sky-500 text-slate-950' : 'text-slate-500'}`}>Trader</button>
                <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>Admin</button>
              </div>

              {errors.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                  {errors.map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Username</label>
                  <input type="text" name="username" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="Alpha_One" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Email</label>
                  <input type="email" name="email" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="admin@aethertrade.ai" />
                </div>

                {view === AuthView.REGISTER && role === UserRole.TRADER && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Confirm Email</label>
                    <input type="email" name="emailConfirm" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Password</label>
                  <input type="password" name="password" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="••••••••" />
                </div>

                {view === AuthView.REGISTER && role === UserRole.TRADER && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Confirm Password</label>
                      <input type="password" name="passwordConfirm" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                        <input type="tel" name="phone" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="+1..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Country</label>
                        <input type="text" name="country" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="UK" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Account Notes</label>
                      <textarea name="accountDetails" onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-500 transition-all outline-none resize-none" rows={2} />
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">
                {view === AuthView.LOGIN ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {view === AuthView.LOGIN ? "Don't have access?" : "Existing user?"}
                <button onClick={() => setView(view === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN)} className="ml-2 text-sky-400 font-bold hover:underline">
                  {view === AuthView.LOGIN ? 'Register' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
