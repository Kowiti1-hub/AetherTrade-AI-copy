
import React, { useState, useEffect } from 'react';
import { AuthView, UserRole, User } from '../types';

interface AuthPageProps {
  initialView: AuthView;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

const COUNTRY_PREFIXES: Record<string, string> = {
  '+1': 'USA / Canada',
  '+44': 'United Kingdom',
  '+254': 'Kenya',
  '+234': 'Nigeria',
  '+233': 'Ghana',
  '+27': 'South Africa',
  '+63': 'Philippines',
  '+91': 'India',
  '+61': 'Australia',
  '+81': 'Japan',
  '+49': 'Germany',
  '+33': 'France',
  '+7': 'Russia',
  '+86': 'China',
  '+55': 'Brazil'
};

const AuthPage: React.FC<AuthPageProps> = ({ initialView, onSuccess, onCancel }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [role, setRole] = useState<UserRole>(UserRole.TRADER);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
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
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Smart Country Suggestion based on phone prefix
      if (name === 'phone') {
        const prefix = Object.keys(COUNTRY_PREFIXES).find(p => value.startsWith(p));
        if (prefix) {
          newData.country = COUNTRY_PREFIXES[prefix];
        }
      }
      
      return newData;
    });
    // Clear verification if email changes
    if (name === 'email') setEmailVerified(false);
  };

  const verifyGoogleEmail = () => {
    if (!formData.email.endsWith('@gmail.com') && !formData.email.endsWith('@googlemail.com')) {
      setErrors(["Please use a registered Google email account (@gmail.com)."]);
      return;
    }
    setIsVerifyingEmail(true);
    setErrors([]);
    // Simulate Google OAuth handshake
    setTimeout(() => {
      setIsVerifyingEmail(false);
      setEmailVerified(true);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (view === AuthView.REGISTER) {
      // 1. Compulsory Fields
      if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        newErrors.push("Compulsory fields (First Name, Last Name, Username, Email, Password) are required.");
      }

      // 2. Google Verification
      if (!emailVerified) {
        newErrors.push("Please verify your Google email account before proceeding.");
      }

      // 3. Username uniqueness/logic
      const emailLocalPart = formData.email.split('@')[0].toLowerCase();
      const lowerUsername = formData.username.toLowerCase();
      const lowerFirstName = formData.firstName.toLowerCase();
      const lowerMiddleName = formData.middleName.toLowerCase();
      const lowerLastName = formData.lastName.toLowerCase();

      if (lowerUsername === emailLocalPart) {
        newErrors.push("Username cannot be the same as your email identifier.");
      }
      if (lowerUsername === lowerFirstName || lowerUsername === lowerMiddleName || lowerUsername === lowerLastName) {
        newErrors.push("Username cannot be the same as any of your legal names.");
      }

      if (role === UserRole.TRADER) {
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
      
      if (formData.password.length < 6) {
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
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      role: role,
      status: 'ACTIVE',
      phone: formData.phone,
      country: formData.country,
      accountDetails: formData.accountDetails,
      balance: role === UserRole.TRADER ? 10000 : undefined,
      demoBalance: role === UserRole.TRADER ? 50000 : undefined,
      emailVerified: true
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-2xl bg-slate-900/40 backdrop-blur-3xl md:border md:border-slate-800 shadow-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-500">
        
        <div className="shrink-0 p-6 flex items-center justify-between border-b border-slate-800/50">
          <button onClick={onCancel} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg"><span className="text-sm font-bold text-white">A</span></div>
            <span className="font-bold text-slate-200 tracking-tight">AetherTrade AI</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 scrollbar-hide">
          <div className="max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                {view === AuthView.LOGIN ? 'Welcome Back' : `New ${role === UserRole.ADMIN ? 'Administrator' : 'Institutional Trader'}`}
              </h2>
              <p className="text-slate-400 text-sm">
                {view === AuthView.LOGIN ? 'Authenticate your credentials to access the floor.' : 'Complete the kyc-ready provisioning process.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {view === AuthView.REGISTER && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/50 rounded-2xl border border-slate-800/50 mb-4">
                  <button type="button" onClick={() => setRole(UserRole.TRADER)} className={`py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${role === UserRole.TRADER ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Trader</button>
                  <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Admin</button>
                </div>
              )}

              {errors.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 animate-in fade-in slide-in-from-top-1">
                  {errors.map((e, i) => <div key={i} className="flex items-start mb-1"><span className="mr-2">•</span>{e}</div>)}
                </div>
              )}

              <div className="space-y-5">
                {view === AuthView.REGISTER && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name <span className="text-rose-500">*</span></label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="John" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                        <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="Quincy" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name <span className="text-rose-500">*</span></label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Desired Username <span className="text-rose-500">*</span></label>
                      <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="AlphaTraderX" />
                      <p className="text-[9px] text-slate-600 ml-1 italic">Must be distinct from your legal names and email.</p>
                    </div>
                  </>
                )}

                {view === AuthView.LOGIN && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="Enter username" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Google Email <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full bg-slate-950 border ${emailVerified ? 'border-emerald-500/50' : 'border-slate-800'} rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none pr-12`} placeholder="example@gmail.com" />
                    {emailVerified && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" title="Verified Google Account">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      </div>
                    )}
                  </div>
                  {view === AuthView.REGISTER && !emailVerified && (
                    <button 
                      type="button" 
                      onClick={verifyGoogleEmail}
                      disabled={isVerifyingEmail || !formData.email}
                      className="flex items-center space-x-2 text-[10px] font-black uppercase text-sky-400 hover:text-sky-300 transition-colors bg-sky-400/5 border border-sky-400/20 px-3 py-2 rounded-lg"
                    >
                      {isVerifyingEmail ? (
                        <>
                          <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2"/><path d="M22 7H2"/><path d="M5 2V22"/><path d="M19 2V22"/></svg>
                          <span>Verify with Google</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {view === AuthView.REGISTER && role === UserRole.TRADER && (
                  <div className="space-y-1 animate-in slide-in-from-bottom-1 duration-300">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Email</label>
                    <input type="email" name="emailConfirm" required value={formData.emailConfirm} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Token (Password)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      required 
                      value={formData.password}
                      onChange={handleChange} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none pr-12" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {view === AuthView.REGISTER && role === UserRole.TRADER && (
                  <>
                    <div className="space-y-1 animate-in slide-in-from-bottom-1 duration-300">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Token</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          name="passwordConfirm" 
                          required 
                          value={formData.passwordConfirm}
                          onChange={handleChange} 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none pr-12" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone (with prefix)</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none font-mono" placeholder="+44..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
                        <input type="text" name="country" required value={formData.country} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 transition-all outline-none" placeholder="Suggested by prefix" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KYC Manifest Notes</label>
                      <textarea name="accountDetails" value={formData.accountDetails} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-500 transition-all outline-none resize-none" rows={2} placeholder="Optional identity references..." />
                    </div>
                  </>
                )}
              </div>

              <button 
                type="submit" 
                className={`w-full py-5 mt-4 bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 group relative overflow-hidden ${view === AuthView.REGISTER && !emailVerified ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              >
                <span className="relative z-10">{view === AuthView.LOGIN ? 'Synchronize & Connect' : 'Initialize Trader Profile'}</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {view === AuthView.LOGIN ? "Don't have access to the floor?" : "Already provisioned?"}
                <button onClick={() => setView(view === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN)} className="ml-2 text-sky-400 font-bold hover:underline decoration-sky-400/30 underline-offset-4">
                  {view === AuthView.LOGIN ? 'Create Provision' : 'Enter Portal'}
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
