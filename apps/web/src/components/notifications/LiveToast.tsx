import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../types';

export default function LiveToast() {
  const { notifications } = useNotifications();
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isread);
    if (unread.length > 0) {
      const latest = unread[0];
      setActiveToast(latest);
      const timer = setTimeout(() => setActiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-start space-x-3 max-w-md w-full pointer-events-auto border border-rose-400">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-wider">{activeToast.title}</h4>
              <p className="text-sm font-bold leading-tight mt-0.5">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
