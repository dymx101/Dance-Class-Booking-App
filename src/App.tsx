import React, { useState, useEffect } from 'react';
import { DanceClass, PurchaseRecord, AppTheme } from './types';
import { generateClasses } from './data';
import HomeView from './components/HomeView';
import ScheduleView from './components/ScheduleView';
import StoreView from './components/StoreView';
import ProfileView from './components/ProfileView';
import AdminLayout from './components/admin/AdminLayout';
import TeacherManager from './components/admin/TeacherManager';
import ScheduleManager from './components/admin/ScheduleManager';
import { Home, CalendarDays, ShoppingBag, User, Wifi, Battery, Signal, Bell, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { supabase } from './lib/supabase';

interface ToastMsg {
  id: string;
  msg: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const { user, profile, signOut, loading: authLoading } = useAuth();

  // Tab control states: 'home' | 'schedule' | 'store' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'store' | 'profile'>('home');

  // Admin panel states
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'schedule' | 'teachers'>('schedule');

  // Active custom visual theme choice: default to high-contrast warm white vibrant mode
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('plana_theme');
    return (saved as AppTheme) || 'vibrant-light';
  });

  useEffect(() => {
    localStorage.setItem('plana_theme', currentTheme);
  }, [currentTheme]);

  // Persistence core states with localStorage synchronization fallback
  const [userPasses, setUserPasses] = useState<number>(() => {
    const saved = localStorage.getItem('plana_userPasses');
    return saved ? parseInt(saved, 10) : 12; // Start student with 12 free trial passes
  });

  const [bookedClassIds, setBookedClassIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('plana_bookedClassIds');
    // Pre-book one class to give immediate visual feedback on Profile/My page on load
    return saved ? JSON.parse(saved) : ['template_02_jazz_g1_2026-05-25'];
  });

  const [waitlistClassIds, setWaitlistClassIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('plana_waitlistClassIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('plana_purchaseHistory');
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
    const saved = localStorage.getItem('plana_classes_db');
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
    const saved = localStorage.getItem('plana_bookedSpots');
    return saved ? JSON.parse(saved) : { 'template_02_jazz_g1_2026-05-25': 'A3' };
  });

  // Action feedback feedback alerts state
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Fetch classes, user bookings, and user passes from Supabase
  const fetchClassesAndBookings = async () => {
    if (!user) return;
    try {
      // 1. Fetch class instances
      const { data: classesData, error: classesError } = await supabase
        .from('class_instances')
        .select('*, teacher:teachers(*)')
        .order('date', { ascending: true })
        .order('timeStart', { ascending: true });

      if (classesError) throw classesError;

      // 2. Fetch user's active bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('userId', user.id)
        .in('status', ['booked', 'waiting']);

      if (bookingsError) throw bookingsError;

      // 3. Fetch user's remaining passes
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('remainingPasses')
        .eq('id', user.id)
        .single();

      if (!userError && userData) {
        setUserPasses(userData.remainingPasses);
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
          cardId: rec.cardid,
          cardName: rec.cardname,
          price: rec.price,
          passesAdded: rec.passesadded,
          date: rec.date ? rec.date.split('T')[0] : new Date().toISOString().split('T')[0],
          stripePaymentId: rec.stripepaymentid
        })));
      }

      // 5. Fetch bookings count for each class instance to calculate bookedCount and reservedSpots
      const { data: allBookingsData, error: allBookingsError } = await supabase
        .from('bookings')
        .select('classId, status, spotNumber');

      const bookedCounts: Record<string, number> = {};
      const reservedSpots: Record<string, string[]> = {};
      if (!allBookingsError && allBookingsData) {
        allBookingsData.forEach((b) => {
          if (b.status === 'booked') {
            bookedCounts[b.classId] = (bookedCounts[b.classId] || 0) + 1;
            if (b.spotNumber) {
              if (!reservedSpots[b.classId]) reservedSpots[b.classId] = [];
              reservedSpots[b.classId].push(b.spotNumber);
            }
          }
        });
      }

      // Format timeStart and timeEnd from 'HH:MM:SS' to 'HH:MM'
      const formattedClasses = (classesData || []).map((cls) => {
        const countFromDB = bookedCounts[cls.id] || 0;
        return {
          ...cls,
          timeStart: cls.timeStart ? cls.timeStart.substring(0, 5) : '',
          timeEnd: cls.timeEnd ? cls.timeEnd.substring(0, 5) : '',
          bookedCount: countFromDB,
          reservedSpots: reservedSpots[cls.id] || []
        };
      });

      // Extract booked and waiting classIds and spots
      const bookedIds = (bookingsData || [])
        .filter((b) => b.status === 'booked')
        .map((b) => b.classId);

      const waitlistIds = (bookingsData || [])
        .filter((b) => b.status === 'waiting')
        .map((b) => b.classId);

      const spots: Record<string, string> = {};
      (bookingsData || []).forEach(b => {
        if (b.status === 'booked' && b.spotNumber) {
          spots[b.classId] = b.spotNumber;
        }
      });

      setBookedClassIds(bookedIds);
      setWaitlistClassIds(waitlistIds);
      setBookedSpots(spots);
      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error fetching Supabase classes and bookings:', err);
    }
  };

  // Sync state with profile
  useEffect(() => {
    if (profile) {
      setUserPasses(profile.remainingPasses);
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
  }, [user]);

  // Listen for real-time booking changes from NotificationContext
  useEffect(() => {
    const handleBookingsChanged = () => {
      fetchClassesAndBookings();
    };
    window.addEventListener('supabase:bookings_changed', handleBookingsChanged);
    return () => window.removeEventListener('supabase:bookings_changed', handleBookingsChanged);
  }, []);

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
  }, [user]);

  // Local storage synchronization triggered upon core state alterations
  useEffect(() => {
    localStorage.setItem('plana_userPasses', String(userPasses));
  }, [userPasses]);

  useEffect(() => {
    localStorage.setItem('plana_bookedClassIds', JSON.stringify(bookedClassIds));
  }, [bookedClassIds]);

  useEffect(() => {
    localStorage.setItem('plana_waitlistClassIds', JSON.stringify(waitlistClassIds));
  }, [waitlistClassIds]);

  useEffect(() => {
    localStorage.setItem('plana_purchaseHistory', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  useEffect(() => {
    localStorage.setItem('plana_classes_db', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('plana_bookedSpots', JSON.stringify(bookedSpots));
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
  const handleTabSuggestion = (tab: 'home' | 'schedule' | 'store' | 'profile') => {
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
        {adminTab === 'teachers' ? (
          <TeacherManager />
        ) : (
          <ScheduleManager />
        )}
      </AdminLayout>
    );
  }

  // Dynamic style calculations based on selected theme
  const getOuterBg = () => {
    if (currentTheme === 'midnight-cyber') return 'bg-[#06070a]';
    if (currentTheme === 'cool-mint') return 'bg-[#e2e4ef]';
    return 'bg-[#eeded5]'; // warm sand
  };

  const getBezelBg = () => {
    if (currentTheme === 'midnight-cyber') return 'border-[#181a24] bg-[#0c0d14]';
    if (currentTheme === 'cool-mint') return 'border-[#cbd2e6] bg-[#F0F2FA]';
    return 'border-[#e0d6cb] bg-[#FAF8F5]';
  };

  const getNotchColor = () => {
    if (currentTheme === 'midnight-cyber') return 'bg-[#0c0d14] text-[#94a3b8] border-b border-white/5';
    if (currentTheme === 'cool-mint') return 'bg-[#F0F2FA] text-slate-600 border-b border-slate-200/50';
    return 'bg-[#FAF8F5] text-slate-600 border-b border-orange-100/30';
  };

  return (
    <div className={`min-h-screen ${getOuterBg()} relative flex items-center justify-center p-0 md:p-6 font-sans antialiased overflow-hidden transition-colors duration-500`}>
      {/* Glow Backlights */}
      {currentTheme === 'midnight-cyber' ? (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </>
      ) : currentTheme === 'cool-mint' ? (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-pink-550/10 bg-pink-550/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        </>
      )}

      {/* Mobile emulator framing overlay */}
      <div className={`w-full max-w-[412px] h-screen md:h-[860px] md:rounded-[48px] md:shadow-[0_24px_70px_rgba(0,0,0,0.15)] relative overflow-hidden border-0 md:border-[12px] ${getBezelBg()} flex flex-col transition-all duration-500`}>
        
        {/* Mock Simulated Smartphone Notch bar */}
        <div className={`text-xs px-6 py-2 flex items-center justify-between font-mono font-bold leading-none select-none shrink-0 ${getNotchColor()}`} id="emulator-notching-bar">
          <span>11:40</span>
          {/* Circular speaker camera notch */}
          <div className={`hidden md:block w-24 h-4 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-b-2xl z-40 ${
            currentTheme === 'midnight-cyber' ? 'bg-[#181a24]' : currentTheme === 'cool-mint' ? 'bg-[#cbd2e6]' : 'bg-[#e0d6cb]'
          }`}></div>
          <div className="flex items-center space-x-1.5 z-10 opacity-70">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 ml-0.5" />
          </div>
        </div>

        {/* Live Interactive Theme / Style Switcher under the notch */}
        <div className={`px-4 py-2 flex items-center justify-between border-b shrink-0 ${
          currentTheme === 'midnight-cyber' 
            ? 'bg-[#13141f]/95 border-white/5 text-zinc-300' 
            : currentTheme === 'cool-mint'
            ? 'bg-white/95 border-slate-200/50 text-slate-800'
            : 'bg-white/95 border-orange-100/30 text-slate-800'
        }`}>
          <span className="text-[10px] font-black tracking-wide flex items-center">
            <span className="mr-1">🎨</span> 视觉风格:
          </span>
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

        {/* Bottom micro-interactive navigation bar */}
        <div className={`px-3 py-2 flex items-center justify-around select-none z-30 shrink-0 shadow-2xl backdrop-blur-md border-t transition-colors duration-500 ${
          currentTheme === 'midnight-cyber' 
            ? 'bg-[#0f111a]/95 border-white/5' 
            : currentTheme === 'cool-mint'
            ? 'bg-white/95 border-slate-200/60'
            : 'bg-white/95 border-[#EBE6DD]'
        }`} id="footer-navigation">
          <button
            onClick={() => handleTabSuggestion('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'home' 
                ? (currentTheme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Home className={`w-4.5 h-4.5 transition-transform ${
              activeTab === 'home' 
                ? `scale-110 ${currentTheme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
                : 'text-slate-400'
            }`} />
            <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">首页</span>
          </button>

          <button
            onClick={() => handleTabSuggestion('schedule')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'schedule' 
                ? (currentTheme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            id="tab-schedule"
          >
            <CalendarDays className={`w-4.5 h-4.5 transition-transform ${
              activeTab === 'schedule' 
                ? `scale-110 ${currentTheme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
                : 'text-slate-400'
            }`} />
            <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">课表</span>
          </button>

          <button
            onClick={() => handleTabSuggestion('store')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'store' 
                ? (currentTheme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            id="tab-store"
          >
            <ShoppingBag className={`w-4.5 h-4.5 transition-transform ${
              activeTab === 'store' 
                ? `scale-110 ${currentTheme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
                : 'text-slate-400'
            }`} />
            <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">商城</span>
          </button>

          <button
            onClick={() => handleTabSuggestion('profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? (currentTheme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            id="tab-profile"
          >
            <User className={`w-4.5 h-4.5 transition-transform ${
              activeTab === 'profile' 
                ? `scale-110 ${currentTheme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
                : 'text-slate-400'
            }`} />
            <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">我的</span>
          </button>
        </div>

      </div>

    </div>
  );
}