import React, { useState, useEffect } from 'react';
import { DanceClass, PurchaseRecord, AppTheme } from './types';
import { generateClasses } from './data';
import HomeView from './components/HomeView';
import ScheduleView from './components/ScheduleView';
import StoreView from './components/StoreView';
import ProfileView from './components/ProfileView';
import { Home, CalendarDays, ShoppingBag, User, Wifi, Battery, Signal, Bell, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastMsg {
  id: string;
  msg: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Authorization status mock to match WeChat Authorization View shown in Screenshot 1
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    const saved = localStorage.getItem('plana_authorized');
    return saved === 'true';
  });

  // Tab control states: 'home' | 'schedule' | 'store' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'store' | 'profile'>('home');

  // WeChat login interactive sub-states
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
  const [showProtocolModal, setShowProtocolModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

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
        date: '2026-05-23'
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

  // Action feedback feedback alerts state
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

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
            setClasses={setClasses}
            userPasses={userPasses}
            setUserPasses={setUserPasses}
            bookedClassIds={bookedClassIds}
            setBookedClassIds={setBookedClassIds}
            waitlistClassIds={waitlistClassIds}
            setWaitlistClassIds={setWaitlistClassIds}
            addToast={addToast}
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
            onLogout={() => {
              setIsAuthorized(false);
              localStorage.removeItem('plana_authorized');
              addToast('已安全退出微信授权登录！', 'info');
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderWeChatLoginScreen = () => {
    return (
      <div className="flex-1 bg-white flex flex-col justify-between p-6 font-sans select-none text-slate-800" id="wechat-login-viewport">
        {/* Mock WeChat mini program top header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 -mx-6 px-6 bg-slate-50/50" id="wechat-mini-header">
          <button 
            onClick={() => addToast('微信环境内置浏览器，点击左上角即可退出。', 'info')}
            className="text-slate-500 hover:text-slate-900 font-extrabold text-sm focus:outline-none cursor-pointer"
            id="wechat-close-btn"
          >
            ✕
          </button>
          
          <div className="text-center" id="wechat-title-container">
            <div className="text-[12px] font-black text-slate-900 tracking-wide text-ellipsis overflow-hidden max-w-[180px]">
              PLAN A 舞蹈工作室
            </div>
            <div className="text-[7.5px] font-bold text-slate-400 -mt-0.5 tracking-tight font-mono">
              weiguan.fityun.cn
            </div>
          </div>

          {/* WeChat Standard action buttons capsule */}
          <div className="flex items-center space-x-2.5 bg-black/5 border border-black/5 px-3 py-1.5 rounded-full text-slate-800 text-[10px]" id="wechat-options-capsule">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></span>
            <span className="text-[8px] font-black">●●●</span>
          </div>
        </div>

        {/* Central Logo & Title Area */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-12" id="wechat-brand-central">
          {/* PA Stylized Vector Emblem */}
          <div className="w-20 h-20 rounded-full bg-black flex flex-col items-center justify-center p-3.5 shadow-xl relative group" id="brand-logo-emblem">
            {/* Inner Ring */}
            <div className="absolute inset-1.5 border-2 border-white/10 rounded-full"></div>
            
            {/* Stylized P A Vector path drawing inside SVGs */}
            <svg viewBox="0 0 100 100" className="w-11 h-11 text-white fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round" id="pa-logo-svg">
              <path d="M 32 75 L 32 25 L 58 25 C 70 25, 70 47, 58 47 L 32 47" />
              <path d="M 52 47 L 72 75" />
              <path d="M 45 61 L 63 61" />
            </svg>
            
            {/* Glowing active center indicator */}
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <h3 className="text-[16px] font-black tracking-widest text-[#2c3e50] uppercase mt-5" id="brand-main-title">
            PLAN A 舞蹈工作室
          </h3>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider mt-1.5 uppercase font-mono" id="brand-subtitle">
            Professional Dance Union
          </p>
        </div>

        {/* Buttons Controls */}
        <div className="space-y-4" id="wechat-action-buttons">
          <button
            onClick={() => {
              if (!agreementChecked) {
                addToast('请先阅读并勾选同意《会员服务协议》！', 'error');
                return;
              }
              // Set authorized process
              addToast('微信授权成功！欢迎光临 PLAN A 舞蹈教室！', 'success');
              setIsAuthorized(true);
              localStorage.setItem('plana_authorized', 'true');
            }}
            className="w-full bg-[#1abc9c] hover:bg-[#16a085] active:scale-[0.98] text-white flex items-center justify-center font-black text-[13px] tracking-wider py-3.5 rounded-full shadow-lg transition-all duration-250 cursor-pointer"
            id="wechat-submit-btn"
          >
            <span>微信授权登录</span>
          </button>

          <button
            onClick={() => {
              addToast('您已拒绝授权登录，可在勾选协议后，重新进行微信授权登录进入。', 'info');
            }}
            className="w-full bg-[#f1f3f5] hover:bg-[#e9ecef] active:scale-[0.98] text-slate-705 text-slate-700 flex items-center justify-center font-bold text-[13px] tracking-wider py-3.5 rounded-full transition-all duration-250 cursor-pointer"
            id="wechat-cancel-btn"
          >
            取消
          </button>
        </div>

        {/* Terms agreement checkbox & register linkage */}
        <div className="mt-12 flex items-center justify-between text-slate-500 pb-2" id="wechat-legal-row">
          {/* Leftside Agreement */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAgreementChecked(!agreementChecked)}
              className={`w-4.5 h-4.5 rounded-full border transition-all flex items-center justify-center focus:outline-none cursor-pointer ${
                agreementChecked
                  ? 'bg-[#1abc9c] border-[#1abc9c] text-white'
                  : 'bg-white border-slate-300'
              }`}
              id="agreement-checkbox"
            >
              {agreementChecked && (
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[3]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span className="text-[11px] font-semibold text-slate-500">
              我已阅读并同意
              <button 
                onClick={() => setShowProtocolModal(true)}
                className="text-[#1abc9c] font-black hover:underline ml-0.5 focus:outline-none cursor-pointer inline"
                id="view-protocol-link"
              >
                《会员服务协议》
              </button>
            </span>
          </div>

          {/* Rightside Register Link */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="text-slate-800 hover:text-slate-950 font-black text-[11px] hover:underline cursor-pointer focus:outline-none"
            id="view-register-link"
          >
            注册
          </button>
        </div>

        {/* Technical branding footer */}
        <div className="text-center text-[9px] font-bold text-slate-300 tracking-widest mt-6" id="wechat-technical-footer">
          由 <span className="text-slate-400 font-extrabold">菲特云</span> 提供技术支持
        </div>
      </div>
    );
  };

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
        {isAuthorized && (
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
        )}

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
                  !isAuthorized
                    ? 'bg-white/95 border-slate-200 text-slate-850 shadow-emerald-500/5'
                    : currentTheme === 'midnight-cyber'
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
          !isAuthorized 
            ? 'bg-white' 
            : currentTheme === 'midnight-cyber' 
            ? 'bg-[#0c0d14]' 
            : currentTheme === 'cool-mint' 
            ? 'bg-[#F0F2FA]' 
            : 'bg-[#FAF8F5]'
        }`} id="main-viewport-body">
          {isAuthorized ? renderViewContent() : renderWeChatLoginScreen()}
        </div>

        {/* Bottom micro-interactive navigation bar */}
        {isAuthorized && (
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
        )}

      </div>

      {/* ==================== LEGAL & REGISTER WECHAT DIALOGS ==================== */}
      <AnimatePresence>
        {showProtocolModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-slate-800 p-6 border shadow-2xl relative"
            >
              <button
                onClick={() => setShowProtocolModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-sm font-black focus:outline-none cursor-pointer"
              >
                ✕
              </button>
              <h4 className="text-xs font-black text-slate-900 border-b pb-2 tracking-wide">PLANA 会员服务协议</h4>
              <div className="text-[10px] leading-relaxed max-h-60 overflow-y-auto mt-3 pr-1 space-y-2 text-slate-650 font-semibold font-sans">
                <p>欢迎签署 PLAN A 门下会员服务协议。当您选用微信号授权登录系统，即表明您完全确认并遵守以下消课、冻卡与退课款规则：</p>
                <p><strong>1. 消课课分额度：</strong>各次卡拥有固定有效期，支持课表自由自主预约及取消，任意时间不追加额外阻滞（通常课程在开始2小时前均支持零责任回退课点）。</p>
                <p><strong>2. 店内退卡条款：</strong>自购卡起7个自然日内，在未曾发生大课预约与核销扣次操作时，支持全额原路径轻松在线秒级退理。</p>
                <p><strong>3. 休卡冻结方案：</strong>学业繁重或临时异地出差者可点击冻结延长14日，冻结锁死期间不计耗有效期天数，方便老客户长线备练。</p>
              </div>
              <button
                onClick={() => {
                  setAgreementChecked(true);
                  setShowProtocolModal(false);
                  addToast('您已确认并同意 PLAN A 守则！已自动为您勾选服务同意项。', 'success');
                }}
                className="mt-5 w-full bg-[#1abc9c] hover:bg-[#16a085] text-white py-2.5 text-xs font-black rounded-full cursor-pointer focus:outline-none shadow-md"
              >
                确认并同意会员守则
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-slate-800 p-6 border shadow-2xl relative"
            >
              <button
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-sm font-black focus:outline-none cursor-pointer"
              >
                ✕
              </button>
              <h4 className="text-xs font-black text-slate-900 border-b pb-2 tracking-wide">PLANA 新会员绑定注册</h4>
              
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[9px] font-black tracking-wider text-slate-400 block mb-1">手机号码 (+86)</label>
                  <input 
                    type="text" 
                    placeholder="请输入手机号" 
                    defaultValue="13800005142"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1abc9c] text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black tracking-wider text-slate-400 block mb-1">注册代号（首推昵称）</label>
                  <input 
                    type="text" 
                    placeholder="请输入昵称" 
                    defaultValue="PLANA_51421"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1abc9c] text-slate-800 font-bold"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-normal mt-2">
                  * 默认创建将直接赠予新人在手 12 点大课体验卡（对应我的中心 12次 额度展示）。
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setAgreementChecked(true);
                  setIsAuthorized(true);
                  localStorage.setItem('plana_authorized', 'true');
                  addToast('新会员注册成功！赠送的基础12点体验课卡发放到手，已为您登入！', 'success');
                }}
                className="mt-5 w-full bg-[#1abc9c] hover:bg-[#16a085] text-white py-2.5 text-xs font-black rounded-full cursor-pointer focus:outline-none shadow-md"
              >
                申领首课卡并快捷注册
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
