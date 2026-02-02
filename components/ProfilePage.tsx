
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    country: user.country || '',
    accountDetails: user.accountDetails || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState<string | undefined>(user.profilePicture);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMsg('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setSuccessMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New password confirmation does not match.");
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        accountDetails: formData.accountDetails,
        profilePicture
      };
      if (formData.newPassword) {
        updatedUser.password = formData.newPassword;
      }
      onUpdate(updatedUser);
      setIsSaving(false);
      setSuccessMsg('Profile and security details synchronized.');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Personal & Security Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Refine your institutional identity and access credentials.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in-95">
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center text-center backdrop-blur-md">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-sky-500/50">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{formData.username}</h2>
              <div className="inline-flex items-center px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black rounded-full mt-2 uppercase tracking-widest border border-violet-500/20">
                {user.role} Verified
              </div>
            </div>

            <div className="w-full mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</div>
                <div className="text-xs font-black text-emerald-500 uppercase">{user.status}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Account ID</div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-400">#{user.id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
             <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Policy Restriction</span>
             </div>
             <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
               Usernames are unique immutable identifiers and cannot be modified after initial provisioning.
             </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-md shadow-sm space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Personal Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username (Locked)</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Verified Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                      placeholder="+X XXX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Access Security</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Current Token (Password)</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                    placeholder="Confirm existing credential"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Token</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm New Token</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full px-10 py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Synchronizing Credentials..." : "Commit Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
