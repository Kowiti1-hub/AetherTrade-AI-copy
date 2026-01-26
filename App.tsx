
import React, { useState, useEffect } from 'react';
import { AppView, AuthView, User, UserRole, Theme } from './types';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import MarketInsights from './components/MarketInsights';
import StrategyBuilder from './components/StrategyBuilder';
import LiveAssistant from './components/LiveAssistant';
import SecurityHub from './components/SecurityHub';
import AdminUserManagement from './components/AdminUserManagement';
import AdminWithdrawals from './components/AdminWithdrawals';
import TraderWallet from './components/TraderWallet';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DemoTrading from './components/DemoTrading';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>(AuthView.LANDING);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user && authView === AuthView.LANDING) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    }
  }, [user, authView]);

  if (!user) {
    if (authView === AuthView.LANDING) {
      return <div className="w-full h-full overflow-auto"><LandingPage onNavigate={setAuthView} /></div>;
    }
    return (
      <div className="w-full h-full overflow-hidden">
        <AuthPage 
          initialView={authView} 
          onSuccess={(u) => setUser(u)} 
          onCancel={() => setAuthView(AuthView.LANDING)}
        />
      </div>
    );
  }

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const NavItem = ({ view, icon: Icon, label, color = 'sky' }: { view: AppView, icon: React.FC, label: string, color?: string }) => {
    const isActive = activeView === view;
    const activeClasses = color === 'amber' 
      ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
      : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]';
    
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? activeClasses 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <Icon />
        <span className={`font-medium transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col p-4 z-50`}>
        <div className="flex items-center px-2 mb-8 mt-2 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <span className={`ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            AetherTrade AI
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view={AppView.DASHBOARD} icon={ICONS.Dashboard} label="Dashboard" />
          
          {user.role === UserRole.TRADER && (
            <>
              <NavItem view={AppView.MARKET_INSIGHTS} icon={ICONS.Insights} label="Market Insights" />
              <NavItem view={AppView.STRATEGY_BUILDER} icon={ICONS.Strategy} label="Strategy Builder" />
              <NavItem view={AppView.LIVE_ASSISTANT} icon={ICONS.Live} label="Live Assistant" />
              <div className="pt-2"></div>
              <NavItem 
                view={AppView.DEMO_TRADING} 
                icon={() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>} 
                label="Demo Training" 
                color="amber"
              />
              <NavItem 
                view={AppView.TRADER_WALLET} 
                icon={() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>} 
                label="My Wallet" 
              />
            </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
              <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Administration</div>
              <NavItem view={AppView.USER_MANAGEMENT} icon={() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="User Manager" />
              <NavItem view={AppView.WITHDRAWAL_REQUESTS} icon={() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/></svg>} label="Withdrawals" />
              <NavItem view={AppView.SECURITY_HUB} icon={ICONS.Security} label="MTD Security" />
            </>
          )}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className={`p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>
             <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-tighter">Authenticated as</div>
             <div className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{user.username}</div>
             <div className="text-[9px] px-2 py-0.5 mt-1 inline-block bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full border border-sky-500/20">{user.role}</div>
          </div>
          <button onClick={() => setUser(null)} className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-rose-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className={`ml-2 text-xs font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm flex items-center justify-between px-8 z-10 transition-colors">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className={`font-semibold uppercase tracking-wider text-sm ${activeView === AppView.DEMO_TRADING ? 'text-amber-500 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'}`}>
              {activeView.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all border border-slate-200 dark:border-slate-700"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              )}
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all border border-slate-200 dark:border-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === AppView.DASHBOARD && <Dashboard />}
          {activeView === AppView.MARKET_INSIGHTS && <MarketInsights />}
          {activeView === AppView.STRATEGY_BUILDER && <StrategyBuilder />}
          {activeView === AppView.LIVE_ASSISTANT && <LiveAssistant />}
          {activeView === AppView.SECURITY_HUB && <SecurityHub />}
          {activeView === AppView.USER_MANAGEMENT && <AdminUserManagement />}
          {activeView === AppView.WITHDRAWAL_REQUESTS && <AdminWithdrawals />}
          {activeView === AppView.TRADER_WALLET && <TraderWallet user={user} />}
          {activeView === AppView.DEMO_TRADING && <DemoTrading user={user} />}
        </div>
      </main>
    </div>
  );
};

export default App;
