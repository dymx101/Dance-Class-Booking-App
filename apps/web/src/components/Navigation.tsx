import React from 'react';
import { Home, CalendarDays, ShoppingBag, User, Bell, Sparkles } from 'lucide-react';
import { AppTheme } from '@dance-app/shared';

interface NavigationProps {
  activeTab: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile';
  setActiveTab: (tab: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  theme: AppTheme;
}

interface SidebarProps {
  activeTab: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile';
  setActiveTab: (tab: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  theme: AppTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  theme
}) => {
  const getSidebarStyles = () => {
    switch (theme) {
      case 'midnight-cyber':
        return 'bg-[#0f111a] border-white/5 text-slate-400';
      case 'cool-mint':
        return 'bg-white border-slate-200/60 text-slate-500';
      default:
        return 'bg-white border-[#EBE6DD] text-slate-500';
    }
  };

  const getLogoColor = () => {
    switch (theme) {
      case 'midnight-cyber':
        return 'text-white';
      default:
        return 'text-slate-900';
    }
  };

  const getButtonStyles = (isActive: boolean) => {
    if (isActive) {
      return theme === 'cool-mint' 
        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
        : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20';
    }
    return theme === 'midnight-cyber'
      ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      : 'text-slate-500 hover:text-slate-900 hover:bg-black/5';
  };

  return (
    <aside className={`hidden md:flex w-64 h-screen flex-col border-r shrink-0 sticky top-0 left-0 z-40 transition-colors duration-500 ${getSidebarStyles()}`}>
      <div className="p-8">
        <h1 className={`text-2xl font-black tracking-tighter italic ${getLogoColor()}`}>PLAN A</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Dance Studio</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { id: 'home', label: '首页 / Home', icon: Home },
          { id: 'schedule', label: '课表 / Schedule', icon: CalendarDays },
          { id: 'private-coaching', label: '私教 / Private', icon: Sparkles },
          { id: 'store', label: '商城 / Store', icon: ShoppingBag },
          { id: 'profile', label: '我的 / Profile', icon: User },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${getButtonStyles(activeTab === item.id)}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${theme === 'midnight-cyber' ? 'border-white/5' : 'border-slate-100'}`}>
        <button
          onClick={onOpenNotifications}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative cursor-pointer ${
            theme === 'midnight-cyber'
              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-transparent shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-bold">通知 / Alerts</span>
        </button>
      </div>
    </aside>
  );
};

export const TabBar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  theme
}) => (
  <div className={`md:hidden px-3 py-2 flex items-center justify-around select-none z-30 shrink-0 shadow-2xl backdrop-blur-md border-t transition-colors duration-500 ${
    theme === 'midnight-cyber' 
      ? 'bg-[#0f111a]/95 border-white/5' 
      : theme === 'cool-mint'
      ? 'bg-white/95 border-slate-200/60'
      : 'bg-white/95 border-[#EBE6DD]'
  }`} id="footer-navigation">
    {[
      { id: 'home', label: '首页', icon: Home },
      { id: 'schedule', label: '课表', icon: CalendarDays },
      { id: 'private-coaching', label: '私教', icon: Sparkles },
      { id: 'store', label: '商城', icon: ShoppingBag },
      { id: 'profile', label: '我的', icon: User },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id as any)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
          activeTab === item.id 
            ? (theme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
            : 'text-slate-400 hover:text-slate-650'
        }`}
      >
        <item.icon className={`w-4.5 h-4.5 transition-transform ${
          activeTab === item.id 
            ? `scale-110 ${theme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
            : 'text-slate-400'
        }`} />
        <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">{item.label}</span>
      </button>
    ))}
  </div>
);

export const Navigation: React.FC<NavigationProps> = (props) => {
  return (
    <>
      <Sidebar {...props} />
      <TabBar {...props} />
    </>
  );
};
