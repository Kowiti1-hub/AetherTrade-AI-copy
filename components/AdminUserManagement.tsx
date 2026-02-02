
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';

const INITIAL_USERS: User[] = [
  { id: '1', username: 'Trader_Alpha', firstName: 'Alpha', lastName: 'Trader', email: 'alpha@test.com', role: UserRole.TRADER, status: 'ACTIVE', phone: '+44 7700 900001', country: 'UK', balance: 14500, paybillNumber: 'PB-129402' },
  { id: '2', username: 'Whale_Watcher', firstName: 'Whale', lastName: 'Watcher', email: 'whale@test.com', role: UserRole.TRADER, status: 'ACTIVE', phone: '+1 555 1234567', country: 'USA', balance: 82000 },
  { id: '3', username: 'Market_Ghost', firstName: 'Market', lastName: 'Ghost', email: 'ghost@test.com', role: UserRole.TRADER, status: 'SUSPENDED', phone: '+81 90 1234 5678', country: 'JP', balance: 0 },
];

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', firstName: '', lastName: '', email: '', phone: '', country: '' });

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u
    ));
  };

  const deleteUser = (id: string) => {
    if (window.confirm("Permanent erasure of account metadata? This cannot be undone.")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      country: newUser.country,
      role: UserRole.TRADER,
      status: 'ACTIVE',
      balance: 0
    };
    setUsers([user, ...users]);
    setIsAdding(false);
    setNewUser({ username: '', firstName: '', lastName: '', email: '', phone: '', country: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Matrix Administration</h2>
          <p className="text-slate-400 text-sm">Oversee institutional traders and capital distribution.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-sky-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
        >
          Provision Trader
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl animate-in zoom-in-95">
          <h3 className="text-sm font-black uppercase text-slate-500 mb-4">Manual Credential Provisioning</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <input type="text" placeholder="Last Name" required value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <input type="text" placeholder="Username" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <input type="text" placeholder="Phone" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <input type="text" placeholder="Country" value={newUser.country} onChange={e => setNewUser({...newUser, country: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
            <div className="col-span-2 flex space-x-2">
              <button type="submit" className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white">Commit Profile</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 bg-slate-800 rounded-xl text-slate-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Trader Credentials</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Real Balance</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Paybill ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-200">{u.username}</div>
                  <div className="text-[10px] text-slate-500">{u.firstName} {u.lastName} • {u.country}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`font-mono font-bold ${u.balance && u.balance > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    ${u.balance?.toLocaleString()}.00
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="text-xs font-mono text-sky-400">{u.paybillNumber || "—"}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    u.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => toggleStatus(u.id)}
                      className={`p-2 rounded-lg transition-all ${u.status === 'ACTIVE' ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-emerald-500/20 text-emerald-400'}`}
                    >
                      {u.status === 'ACTIVE' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                      )}
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
