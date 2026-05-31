import React, { useState, useEffect } from 'react';
import { DanceClass, PurchaseRecord, AppTheme, generateClasses } from '@dance-app/shared';
import HomeView from './components/HomeView';
import ScheduleView from './components/ScheduleView';
import PrivateCoachingView from './components/PrivateCoachingView';
import StoreView from './components/StoreView';
import ProfileView from './components/ProfileView';
import AdminLayout from './components/admin/AdminLayout';
import TeacherManager from './components/admin/TeacherManager';
import ScheduleManager from './components/admin/ScheduleManager';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import LiveToast from './components/notifications/LiveToast';
import NotificationCenter from './components/notifications/NotificationCenter';
import { Home, CalendarDays, ShoppingBag, User, Wifi, Battery, Signal, Bell, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navigation, Sidebar, TabBar } from './components/Navigation';
import { supabase } from './lib/supabase';

interface ToastMsg {
  id: string;
  msg: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();

  // Tab control states: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'private-coaching' | 'store' | 'profile'>('home');

  // Admin panel states
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'schedule' | 'teachers' | 'analytics'>('analytics');

  // Notification center state
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Active custom visual theme choice: default to high-contrast warm white vibrant mode
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('dance_app_theme');
    return (saved as AppTheme) || 'vibrant-light';
  });

  useEffect(() => {
    localStorage.setItem('dance_app_theme', currentTheme);
  }, [currentTheme]);

  // Persistence core states with localStorage synchronization fallback
  const [userPasses, setUserPasses] = useState<number>(() => {
    const saved = localStorage.getItem('dance_app_userPasses');
    return saved ? parseInt(saved, 10) : 12; // Start student with 12 free trial passes
  });

  const [bookedClassIds, setBookedClassIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dance_app_bookedClassIds');
    // Pre-book one class to give immediate visual feedback on Profile/My page on load
    return saved ? JSON.parse(saved) : ['template_02_jazz_g1_2026-05-25'];
  });

  const [waitlistClassIds, setWaitlistClassIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dance_app_waitlistClassIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('dance_app_purchaseHistory');
    return saved ? JSON.parse(saved) : [
      {
        id: 'rec_pre',
        cardId: 'c2',
        cardName: '10次团课周卡 (10 Classes Pack)',
        price: 399,
        passesAdded: 10,
        date: '2026-05-23',
        stripePaymentId: 'pi_mock_123456789'
      }
    ];
  });

  const [classes, setClasses] = useState<DanceClass[]>(() => {
    const saved = localStorage.getItem('dance_app_classes_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return generateClasses();
      }
    }
    return generateClasses();
  });

  const [bookedSpots, setBookedSpots] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('dance_app_bookedSpots');
    return saved ? JSON.parse(saved) : { 'template_02_jazz_g1_2026-05-25': 'A3' };
  });

  // Action feedback feedback alerts state
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Fetch classes, user bookings, and user passes from Supabase
  const fetchClassesAndBookings = React.useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch class instances
      const { data: classesData, error: classesError } = await supabase
        .from('class_instances')
        .select('*, teacher:teachers(*)')
        .order('date', { ascending: true })
        .order('timestart', { ascending: true });

      if (classesError) throw classesError;

      // 2. Fetch user's active bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('userid', user.id)
        .in('status', ['booked', 'waiting']);

      if (bookingsError) throw bookingsError;

      // 3. Fetch user's remaining passes
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('remainingpasses')
        .eq('id', user.id)
        .single();

      if (!userError && userData) {
        setUserPasses(userData.remainingpasses);
      }

      // 4. Fetch user's purchase records
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchase_records')
        .select('*')
        .eq('userid', user.id)
        .order('date', { ascending: false });

      if (!purchaseError && purchaseData) {
        setPurchaseHistory(purchaseData.map(rec => ({
          id: rec.id,
          cardid: rec.cardid,
          cardname: rec.cardname,
          price: rec.price,
          passesadded: rec.passesadded,
          date: rec.date ? rec.date.split('T')[0] : new Date().toISOString().split('T')[0],
          stripepaymentid: rec.stripepaymentid
        })));
      }

      // 5. Fetch bookings count for each class instance to calculate bookedcount and reservedspots
      const { data: allBookingsData, error: allBookingsError } = await supabase
        .from('bookings')
        .select('classid, status, spotnumber');

      const bookedCounts: Record<string, number> = {};
      const reservedSpots: Record<string, string[]> = {};
      if (!allBookingsError && allBookingsData) {
        allBookingsData.forEach((b) => {
          if (b.status === 'booked') {
            bookedCounts[b.classid] = (bookedCounts[b.classid] || 0) + 1;
            if (b.spotnumber) {
              if (!reservedSpots[b.classid]) reservedSpots[b.classid] = [];
              reservedSpots[b.classid].push(b.spotnumber);
            }
          }
        });
      }

      // Format timestart and timeend from 'HH:MM:SS' to 'HH:MM'
      const formattedClasses = (classesData || []).map((cls) => {
        const countFromDB = bookedCounts[cls.id] || 0;
        return {
          ...cls,
          timestart: cls.timestart ? cls.timestart.substring(0, 5) : '',
          timeend: cls.timeend ? cls.timeend.substring(0, 5) : '',
          bookedcount: countFromDB,
          reservedspots: reservedSpots[cls.id] || []
        };
      });

      // Extract booked and waiting classids and spots
      const bookedIds = (bookingsData || [])
        .filter((b) => b.status === 'booked')
        .map((b) => b.classid);

      const waitlistIds = (bookingsData || [])
        .filter((b) => b.status === 'waiting')
        .map((b) => b.classid);

      const spots: Record<string, string> = {};
      (bookingsData || []).forEach(b => {
        if (b.status === 'booked' && b.spotnumber) {
          spots[b.classid] = b.spotnumber;
        }
      });

      setBookedClassIds(bookedIds);
      setWaitlistClassIds(waitlistIds);
      setBookedSpots(spots);
      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error fetching Supabase classes and bookings:', err);
    }
  }, [user]);

  // Sync state with profile
  useEffect(() => {
    if (profile) {
      setUserPasses(profile.remainingpasses);
    }
  }, [profile]);

  // Trigger fetchClassesAndBookings on user login
  useEffect(() => {
    if (user) {
      fetchClassesAndBookings();
    } else {
      setBookedClassIds([]);
      setWaitlistClassIds([]);
    }
  }, [user, fetchClassesAndBookings]);

  // Listen for real-time booking changes from NotificationContext
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const handleBookingsChanged = () => {
      // Clear existing timer if any
      clearTimeout(debounceTimer);
      
      // Debounce the refresh by 500ms to handle rapid changes
      debounceTimer = setTimeout(() => {
        fetchClassesAndBookings();
      }, 500);
    };

    window.addEventListener('supabase:bookings_changed', handleBookingsChanged);
    
    return () => {
      window.removeEventListener('supabase:bookings_changed', handleBookingsChanged);
      clearTimeout(debounceTimer);
    };
  }, [fetchClassesAndBookings]);

  // Handle Stripe success redirect
  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Switch to profile tab
      setActiveTab('profile');

      // Show success toast
      addToast('支付成功！您的课点已更新。(Payment successful! Passes updated.)', 'success');

      // Refresh user data (passes)
      fetchClassesAndBookings();

      // Clean up URL
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [user, fetchClassesAndBookings]);

  // Local storage synchronization triggered upon core state alterations
  useEffect(() => {
    localStorage.setItem('dance_app_userPasses', String(userPasses));
  }, [userPasses]);

  useEffect(() => {
    localStorage.setItem('dance_app_bookedClassIds', JSON.stringify(bookedClassIds));
  }, [bookedClassIds]);

  useEffect(() => {
    localStorage.setItem('dance_app_waitlistClassIds', JSON.stringify(waitlistClassIds));
  }, [waitlistClassIds]);

  useEffect(() => {
    localStorage.setItem('dance_app_purchaseHistory', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  useEffect(() => {
    localStorage.setItem('dance_app_classes_db', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('dance_app_bookedSpots', JSON.stringify(bookedSpots));
  }, [bookedSpots]);

  // Dispatch Toast notice
  const addToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const newToast: ToastMsg = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      msg,
      type
    };
    setToasts((prev) => [...prev, newToast]);

    // Self destroy after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  // Switch to another tab on request
  const handleTabSuggestion = (tab: 'home' | 'schedule' | 'private-coaching' | 'store' | 'profile') => {
    setActiveTab(tab);
    // Smooth scrolling to top of page container inside components
    const el = document.getElementById('main-viewport-body');
    if (el) el.scrollTop = 0;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Render chosen view
  const renderViewContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            theme={currentTheme}
            onSuggestTab={handleTabSuggestion}
            addToast={addToast}
          />
        );
      case 'schedule':
        return (
          <ScheduleView
            theme={currentTheme}
            classes={classes}
            userPasses={userPasses}
            bookedClassIds={bookedClassIds}
            waitlistClassIds={waitlistClassIds}
            addToast={addToast}
            onRefresh={fetchClassesAndBookings}
            bookedSpots={bookedSpots}
          />
        );
      case 'private-coaching':
        return (
          <PrivateCoachingView
            theme={currentTheme}
            addToast={addToast}
            userPasses={userPasses}
          />
        );
      case 'store':
        return (
          <StoreView
            theme={currentTheme}
            userPasses={userPasses}
            setUserPasses={setUserPasses}
            purchaseHistory={purchaseHistory}
            setPurchaseHistory={setPurchaseHistory}
            addToast={addToast}
          />
        );
      case 'profile':
        return (
          <ProfileView
            theme={currentTheme}
            setTheme={setCurrentTheme}
            userPasses={userPasses}
            setUserPasses={setUserPasses}
            bookedClassIds={bookedClassIds}
            setBookedClassIds={setBookedClassIds}
            waitlistClassIds={waitlistClassIds}
            setWaitlistClassIds={setWaitlistClassIds}
            classes={classes}
            setClasses={setClasses}
            purchaseHistory={purchaseHistory}
            addToast={addToast}
            bookedSpots={bookedSpots}
            setBookedSpots={setBookedSpots}
            onLogout={async () => {
              await signOut();
              addToast('Logged out successfully', 'info');
            }}
            onToggleAdmin={() => {
              if (profile?.name === 'Admin' || user?.email?.includes('admin')) {
                setIsAdminMode(true);
              } else {
                addToast('无管理员权限 (Unauthorized: Admin access required)', 'error');
              }
            }}
            onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  if (isAdminMode) {
    // Protected admin route check
    const isAuthorized = profile?.name === 'Admin' || user?.email?.includes('admin');
    
    if (!isAuthorized) {
      setIsAdminMode(false);
      return null;
    }

    return (
      <AdminLayout 
        activeTab={adminTab} 
        setActiveTab={setAdminTab} 
        onExit={() => setIsAdminMode(false)}
      >
        {adminTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : adminTab === 'teachers' ? (
          <TeacherManager />
        ) : (
          <ScheduleManager />
        )}
      </AdminLayout>
    );
  }

  const getAppBg = () => {
    if (currentTheme === 'midnight-cyber') return 'bg-[#0c0d14]';
    if (currentTheme === 'cool-mint') return 'bg-[#F0F2FA]';
    return 'bg-[#FAF8F5]';
  };

  return (
    <div className={`w-full h-screen relative overflow-hidden ${getAppBg()} flex flex-col md:flex-row transition-all duration-500 font-sans antialiased`}>
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={handleTabSuggestion}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        theme={currentTheme}
      />

      <div className={`flex-1 flex flex-col min-w-0 relative h-full`}>
        {/* Live Interactive Theme / Style Switcher */}
      <div className={`px-4 md:px-8 lg:px-12 py-2 flex items-center justify-between border-b shrink-0 ${
          currentTheme === 'midnight-cyber' 
            ? 'bg-[#13141f]/95 border-white/5 text-zinc-300' 
            : currentTheme === 'cool-mint'
            ? 'bg-white/95 border-slate-200/50 text-slate-800'
            : 'bg-white/95 border-orange-100/30 text-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-1.5 hover:bg-black/5 rounded-xl transition-colors cursor-pointer md:hidden"
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <span className="text-[10px] font-black tracking-wide flex items-center">
              <span className="mr-1">🎨</span> 视觉风格:
            </span>
          </div>
          <div className="flex space-x-1 p-0.5 bg-black/5 rounded-full">
            <button
              onClick={() => setCurrentTheme('vibrant-light')}
              className={`text-[9px] px-2.5 py-0.5 rounded-full font-black cursor-pointer transition ${
                currentTheme === 'vibrant-light' 
                  ? 'bg-rose-500 text-white shadow' 
                  : 'text-zinc-500 hover:text-slate-800'
              }`}
            >
              元气暖白
            </button>
            <button
              onClick={() => setCurrentTheme('cool-mint')}
              className={`text-[9px] px-2.5 py-0.5 rounded-full font-black cursor-pointer transition ${
                currentTheme === 'cool-mint' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-zinc-500 hover:text-slate-800'
              }`}
            >
              夏日薄荷
            </button>
            <button
              onClick={() => setCurrentTheme('midnight-cyber')}
              className={`text-[9px] px-2.5 py-0.5 rounded-full font-black cursor-pointer transition ${
                currentTheme === 'midnight-cyber' 
                  ? 'bg-[#ef4444] text-white shadow' 
                  : 'text-zinc-500 hover:text-slate-800'
              }`}
            >
              深夜黑金
            </button>
          </div>
        </div>

        {/* Notification Components */}
        <LiveToast />
        <NotificationCenter 
          isOpen={isNotificationCenterOpen} 
          onClose={() => setIsNotificationCenterOpen(false)} 
          theme={currentTheme}
        />

        {/* Dynamic sliding alert banner overlays */}
        <div className="absolute top-22 left-4 right-4 z-[999] pointer-events-none space-y-2">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`pointer-events-auto rounded-2xl py-3 px-4 shadow-xl flex items-start space-x-3 text-xs w-full backdrop-blur-md border ${
                  currentTheme === 'midnight-cyber'
                  ? 'bg-[#161722]/95 border-white/10 text-white'
                  : 'bg-white/95 border-slate-200 text-slate-800'
                }`}
              >
                {t.type === 'success' ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : t.type === 'error' ? (
                  <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4.5 h-4.5 text-sky-500 shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 pr-1 font-bold font-sans">
                  {t.msg}
                </div>

                <button
                  onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                  className="opacity-60 hover:opacity-100 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View rendering zone */}
        <div className={`flex-1 overflow-hidden flex flex-col relative transition-colors duration-500 ${
          currentTheme === 'midnight-cyber' 
            ? 'bg-[#0c0d14]' 
            : currentTheme === 'cool-mint' 
            ? 'bg-[#F0F2FA]' 
            : 'bg-[#FAF8F5]'
        }`} id="main-viewport-body">
          {renderViewContent()}
        </div>

        <TabBar 
          activeTab={activeTab}
          setActiveTab={handleTabSuggestion}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          theme={currentTheme}
        />
      </div>
    </div>
  );
}