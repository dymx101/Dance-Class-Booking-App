import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userid', user.id)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.isread).length);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to user's notifications
      const notificationSubscription = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `userid=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification;
              setNotifications((prev) => [newNotification, ...prev]);
              if (!newNotification.isread) {
                setUnreadCount((prev) => prev + 1);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotification = payload.new as Notification;
              setNotifications((prev) => {
                const oldNotification = prev.find(n => n.id === updatedNotification.id);
                if (oldNotification) {
                  if (!oldNotification.isread && updatedNotification.isread) {
                    setUnreadCount(c => c - 1);
                  } else if (oldNotification.isread && !updatedNotification.isread) {
                    setUnreadCount(c => c + 1);
                  }
                }
                return prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n));
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as any).id;
              setNotifications((prev) => {
                const oldNotification = prev.find(n => n.id === deletedId);
                if (oldNotification && !oldNotification.isread) {
                  setUnreadCount(c => c - 1);
                }
                return prev.filter((n) => n.id !== deletedId);
              });
            }
          }
        )
        .subscribe();

      return () => {
        notificationSubscription.unsubscribe();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Subscribe to global bookings for spot sync
  useEffect(() => {
    const bookingSubscription = supabase
      .channel('global-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const classId = (payload.new as any)?.classId || (payload.old as any)?.classId;
          // Dispatch custom event to notify components that spots might have changed
          window.dispatchEvent(new CustomEvent('supabase:bookings_changed', { 
            detail: { classId, payload } 
          }));
        }
      )
      .subscribe();

    return () => {
      bookingSubscription.unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isread: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      // Revert if error? For now just log. Realtime will eventually sync it back.
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isread: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('userid', user.id)
      .eq('isread', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
