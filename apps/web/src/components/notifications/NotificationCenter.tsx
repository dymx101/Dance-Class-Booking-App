import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCheck, Inbox, Calendar, CreditCard, UserPlus, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
}

export default function NotificationCenter({ isOpen, onClose, theme = 'vibrant-light' }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5' : isMint ? 'bg-white border-slate-200/50' : 'bg-white border-[#f2ede4]';
  const textWhite = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-500';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const headerBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/65' : 'border-orange-100/30';

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'waitlist_promoted': return <UserPlus className="w-4 h-4" />;
      case 'booking_confirmed': return <Calendar className="w-4 h-4" />;
      case 'purchase_successful': return <CreditCard className="w-4 h-4" />;
      case 'class_cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: Notification['type'], isread: boolean) => {
    if (isread) return 'bg-slate-100 text-slate-400';
    switch (type) {
      case 'waitlist_promoted': return 'bg-purple-100 text-purple-600';
      case 'booking_confirmed': return 'bg-emerald-100 text-emerald-600';
      case 'purchase_successful': return 'bg-amber-100 text-amber-600';
      case 'class_cancelled': return 'bg-rose-100 text-rose-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] cursor-pointer"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-[320px] z-[1001] shadow-2xl flex flex-col ${bgClass}`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${headerBorder}`}>
              <div>
                <h2 className={`text-lg font-black tracking-tight ${textWhite}`}>通知中心</h2>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">Notification Center</p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer ${textSecondary}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-6 py-3 flex justify-end">
                <button 
                  onClick={() => markAllAsRead()}
                  className={`text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-80 transition-opacity cursor-pointer ${highlightText}`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>全部已读 (Mark all read)</span>
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <Inbox className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold">暂无任何通知</p>
                  <p className="text-[10px] mt-1">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {notifications.map((n) => (
                    <motion.div
                      layout
                      key={n.id}
                      onClick={() => !n.isread && markAsRead(n.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${cardBgClass} ${
                        !n.isread ? 'ring-1 ring-rose-500/20 shadow-md' : 'opacity-70 shadow-sm'
                      }`}
                    >
                      {!n.isread && (
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <div className={`p-2 rounded-xl shrink-0 ${getIconBg(n.type, n.isread)}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-black truncate ${textWhite}`}>{n.title}</h4>
                          <p className={`text-[11px] font-medium leading-relaxed mt-1 ${textSecondary}`}>{n.message}</p>
                          <p className="text-[9px] font-bold text-zinc-400 mt-2 font-mono">
                            {new Date(n.createdat).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
