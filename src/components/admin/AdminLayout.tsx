import React from 'react';
import { Calendar, Users, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'schedule' | 'teachers';
  setActiveTab: (tab: 'schedule' | 'teachers') => void;
  onExit: () => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab, onExit }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 font-black tracking-wider uppercase text-sm">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
            activeTab === 'schedule' ? 'bg-rose-500' : 'text-slate-400 hover:bg-white/5'
          }`}>
            <Calendar className="w-5 h-5" />
            <span className="font-bold text-sm">排课管理</span>
          </button>
          <button onClick={() => setActiveTab('teachers')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
            activeTab === 'teachers' ? 'bg-rose-500' : 'text-slate-400 hover:bg-white/5'
          }`}>
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">教师库</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onExit} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">退出后台</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 font-black uppercase text-slate-800">
          {activeTab === 'schedule' ? 'Schedule' : 'Teachers'}
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
