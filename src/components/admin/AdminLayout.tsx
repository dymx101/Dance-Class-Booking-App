import React from 'react';
import { Calendar, Users, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'schedule' | 'teachers';
  setActiveTab: (tab: 'schedule' | 'teachers') => void;
  onExit: () => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab, onExit }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black tracking-tighter text-lg leading-tight">PLAN A</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Management</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</div>
          
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${
              activeTab === 'schedule' 
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'schedule' ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-black text-sm tracking-tight">排课管理 Schedule</span>
          </button>

          <button 
            onClick={() => setActiveTab('teachers')} 
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${
              activeTab === 'teachers' 
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'teachers' ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-black text-sm tracking-tight">教师库 Teachers</span>
          </button>

          <button 
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] text-slate-600 cursor-not-allowed opacity-50 group"
          >
            <Settings className="w-5 h-5" />
            <span className="font-black text-sm tracking-tight">系统设置 Settings</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <button 
            onClick={onExit} 
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-sm tracking-tight">退出后台 Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeTab === 'schedule' ? '排课管理' : '教师库管理'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {activeTab === 'schedule' ? 'Manage your studio class schedule' : 'Maintain the list of professional instructors'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right mr-4 hidden md:block">
              <div className="text-xs font-black text-slate-900">Administrator</div>
              <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Online & Active</div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mb-32"></div>
      </div>
    </div>
  );
}
