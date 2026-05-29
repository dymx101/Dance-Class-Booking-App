import React, { useState, useEffect } from 'react';
import { MOCK_BANNERS, TEACHERS, MOCK_NOTICES, MOCK_VIDEOS, Teacher } from '@dance-app/shared';
import { Volume2, Award, Play, Flame, Star, Heart, Film, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeViewProps {
  theme?: string;
  onSuggestTab: (tabName: 'schedule' | 'store' | 'profile') => void;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function HomeView({ theme = 'vibrant-light', onSuggestTab, addToast }: HomeViewProps) {
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  // Computed layout variables
  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const headerBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/65' : 'border-orange-100/30';
  const textTitleClass = isDark ? 'text-[#f8fafc]' : 'text-slate-900';
  const textDescClass = isDark ? 'text-zinc-500' : 'text-slate-500';
  const textWhite = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-600';
  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5 text-white' : isMint ? 'bg-white border-slate-200/50 text-slate-800 shadow-sm' : 'bg-white border-orange-100/30 text-slate-800 shadow-sm';
  const cardBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/50' : 'border-[#f2ede4]';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const iconColor = isMint ? 'text-teal-500' : 'text-rose-500';

  const badgeClass = isMint 
    ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' 
    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20';

  // Notice styles
  const noticeBg = isDark 
    ? 'bg-[#13141f] border-white/5 text-zinc-200' 
    : isMint 
    ? 'bg-teal-50/60 border border-teal-100/40 text-[#0f533a]' 
    : 'bg-orange-50/50 border border-orange-100/20 text-[#8a3300]';

  const noticeTextClass = isDark ? 'text-zinc-200' : isMint ? 'text-teal-900' : 'text-orange-950';

  // Featured billboard styling
  const billboardBg = isDark 
    ? 'from-[#1b192e] to-[#12111d] border-white/5 text-white shadow-lg' 
    : isMint 
    ? 'from-emerald-50/90 to-teal-50/40 border border-teal-100 text-slate-800 shadow-sm' 
    : 'from-orange-50/60 to-rose-50/40 border border-orange-105 border-orange-100/30 text-slate-800 shadow-sm';

  const billboardBtn = isMint
    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white'
    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white';

  const ctaBtnColor = isMint ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-500 hover:bg-rose-600';

  // Banner slide track
  const [bannerIndex, setBannerIndex] = useState(0);

  // Active Notice loop state
  const [noticeIndex, setNoticeIndex] = useState(0);

  // Video playback simulation modal state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Selected teacher for Bio modal drawer popup
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Cycle banner loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % MOCK_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Notice ticker loop
  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % MOCK_NOTICES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex-1 overflow-y-auto px-4 pb-20 pt-4 transition-colors duration-500 ${bgClass}`} id="home-view-container">
      {/* Studio Header Brand */}
      <div className={`flex items-center justify-between pb-3 mb-3 border-b ${headerBorder}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${isMint ? 'from-teal-400 to-emerald-500' : 'from-pink-500 to-violet-600'} flex items-center justify-center shadow-lg shadow-pink-500/10`}>
            <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45"></div>
          </div>
          <div>
            <h1 className={`text-sm font-black tracking-widest leading-none uppercase ${textTitleClass}`}>
              PLANA <span className={`${highlightText} font-mono font-black`}>DANCE</span>
            </h1>
            <p className={`text-[8px] font-bold tracking-widest leading-none mt-1 ${textDescClass}`}>
              CRAFT YOUR RHYTHM • SUMMER CAMP
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-[10px] ${badgeClass} font-black px-2.5 py-0.5 rounded-full`}>
            热度 9.8k ★
          </span>
        </div>
      </div>


      {/* 1. Animated Promotional Banners Hero */}
      <div className="mt-3 relative h-40 rounded-[28px] overflow-hidden shadow-2xl bg-[#141521] border border-white/5" id="banner-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={bannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={MOCK_BANNERS[bannerIndex].image}
              alt={MOCK_BANNERS[bannerIndex].title}
              className="w-full h-full object-cover brightness-[0.55]"
              referrerPolicy="no-referrer"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-transparent to-transparent"></div>
            {/* Banner Meta Specs */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-pink-500/20 border border-pink-500/30 text-pink-400 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase mb-1.5 inline-block">
                STUDIO CAMPUS
              </span>
              <h2 className="font-extrabold text-sm tracking-tight text-white drop-shadow-md truncate">
                {MOCK_BANNERS[bannerIndex].title}
              </h2>
              <p className="text-[10px] text-zinc-400 truncate mt-1 opacity-90 font-medium">
                {MOCK_BANNERS[bannerIndex].subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Banner Indicator dots */}
        <div className="absolute bottom-4 right-4 flex space-x-1.5 z-10">
          {MOCK_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setBannerIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === bannerIndex ? 'bg-rose-500 w-3' : 'bg-white/30'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* 2. Notice Board rolling marquee */}
      <div className={`mt-3 ${noticeBg} rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-colors`} id="notice-board">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <Volume2 className={`w-4 h-4 ${iconColor} shrink-0`} />
          <div className="overflow-hidden h-4.5 relative flex-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={noticeIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                className={`text-xs font-bold block truncate leading-relaxed font-sans pr-4 ${noticeTextClass}`}
              >
                {MOCK_NOTICES[noticeIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Class Quick Action Navigator Grid */}
      <div className="grid grid-cols-3 gap-3 mt-4" id="home-shortcuts">
        <button
          onClick={() => onSuggestTab('schedule')}
          className={`${cardBgClass} hover:-translate-y-0.5 active:translate-y-0 p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center cursor-pointer group`}
        >
          <div className={`w-10 h-10 rounded-xl ${isMint ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-500'} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
            <Award className="w-5 h-5" />
          </div>
          <span className={`text-xs font-black ${textWhite}`}>预约排课</span>
          <span className={`text-[8px] font-extrabold mt-1 ${textSecondary}`}>每日精品大课</span>
        </button>

        <button
          onClick={() => onSuggestTab('store')}
          className={`${cardBgClass} hover:-translate-y-0.5 active:translate-y-0 p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center cursor-pointer group`}
        >
          <div className={`w-10 h-10 rounded-xl ${isMint ? 'bg-emerald-500/10 text-emerald-600' : 'bg-violet-500/10 text-violet-500'} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
            <Flame className="w-5 h-5" />
          </div>
          <span className={`text-xs font-black ${textWhite}`}>特惠商城</span>
          <span className={`text-[8px] font-extrabold mt-1 ${textSecondary}`}>超值次卡通卡</span>
        </button>

        <button
          onClick={() => onSuggestTab('profile')}
          className={`${cardBgClass} hover:-translate-y-0.5 active:translate-y-0 p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center cursor-pointer group`}
        >
          <div className={`w-10 h-10 rounded-xl ${isMint ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-500'} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
            <Play className="w-5 h-5" />
          </div>
          <span className={`text-xs font-black ${textWhite}`}>我的课表</span>
          <span className={`text-[8px] font-extrabold mt-1 ${textSecondary}`}>剩余课点进度</span>
        </button>
      </div>

      {/* 4. Popular Instructors Section */}
      <div className="mt-5" id="home-teachers-list">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center ${isDark ? 'text-zinc-400' : 'text-slate-700'}`}>
            <Star className={`w-3.5 h-3.5 mr-1.5 fill-current ${iconColor}`} />
            明星舞者导师 / TEAM
          </h3>
          <span className={`text-[9px] font-black ${textSecondary}`}>头像查看简介</span>
        </div>

        {/* Horizontal rolling instructors avatars */}
        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {TEACHERS.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => setSelectedTeacher(teacher)}
              className="flex flex-col items-center shrink-0 w-16 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className={`w-12 h-12 rounded-full object-cover border-2 ${isDark ? 'border-[#13141f]' : 'border-white'} ring-2 ring-black/5 group-hover:ring-rose-500 transition-all duration-200`}
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute bottom-0 right-0 ${isMint ? 'bg-teal-600' : 'bg-rose-500'} text-white rounded-full p-0.5 text-[7px] leading-none text-center font-black`}>
                  ✓
                </span>
              </div>
              <span className={`text-[11px] font-black mt-1.5 pb-0.5 truncate max-w-full ${textWhite}`}>
                {teacher.name}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold leading-none truncate max-w-full">
                {teacher.tags[0].split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* About PLANA branding message block with Sleek Street aesthetic */}
      <div className={`mt-5 p-5 rounded-[24px] bg-gradient-to-br ${billboardBg} border relative overflow-hidden`}>
        {/* Dynamic ambient orb overlay inside */}
        <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-36 h-36 bg-pink-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase mb-2 inline-block ${
            isDark ? 'bg-rose-550/10 bg-rose-500/10 border border-rose-500/20 text-rose-455' : isMint ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
          }`}>
            FEATURED ACADEMY
          </span>
          <h4 className={`font-extrabold text-sm tracking-tight mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>为什么选择 PLANA 街舞学院？</h4>
          <p className={`text-[10px] leading-relaxed font-sans max-w-[92%] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            作为高端连锁街舞排课排头潮牌，PLANA 汇聚全国顶尖战队核心舞者。覆盖 JAZZ (爵士)、HIPHOP (街舞)、URBAN (都市编舞)等热门门类。这里不仅是汗水挥洒地，更是时尚街舞文化社区。
          </p>
          <button
            onClick={() => {
              onSuggestTab('schedule');
              addToast('现在预订第一堂免费体验课吧！', 'success');
            }}
            className={`mt-3.5 px-4_5 py-2 ${billboardBtn} rounded-full text-[10px] font-black tracking-wide transition shadow-md cursor-pointer`}
          >
            开启体验课 &rarr;
          </button>
        </div>
      </div>

      {/* 5. Featured wraps feedback videos */}
      <div className="mt-5 pb-4" id="home-featured-videos">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center ${isDark ? 'text-zinc-400' : 'text-slate-700'}`}>
            <Film className={`w-3.5 h-3.5 mr-1.5 ${iconColor}`} />
            前沿课堂結課反馈 / Video Showcase
          </h3>
          <span className={`text-[9px] font-bold ${textSecondary}`}>视频教学</span>
        </div>

        {/* Video grids cards */}
        <div className="grid grid-cols-2 gap-3">
          {MOCK_VIDEOS.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setActiveVideoId(video.id);
                addToast(`正在拉取课堂反馈短片: ${video.title}`, 'info');
              }}
              className={`border rounded-2xl overflow-hidden cursor-pointer group hover:border-[#ed4d8c]/30 transition duration-300 ${cardBgClass}`}
            >
              {/* Cover cover ratio */}
              <div className="relative h-24 bg-slate-900 overflow-hidden">
                <img
                  src={video.cover}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`w-8 h-8 rounded-full ${isMint ? 'bg-teal-600' : 'bg-rose-500'} flex items-center justify-center text-white scale-95 group-hover:scale-105 transition shadow-lg`}>
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </span>
                </div>
                <span className="absolute bottom-1 right-1.5 bg-[#0c0d14]/90 text-white text-[8px] px-1.5 py-0.5 rounded-md font-mono font-black">
                  {video.duration}
                </span>
              </div>

              {/* Title description bar */}
              <div className="p-2 leading-tight">
                <p className={`text-[11px] font-black line-clamp-2 h-8 leading-snug ${textWhite}`}>
                  {video.title}
                </p>
                <div className="flex items-center justify-between text-[8px] font-black mt-2">
                  <span className={textSecondary}>{video.plays} 播放</span>
                  <span className={`flex items-center ${highlightText}`}>
                    <Heart className="w-2.5 h-2.5 fill-current mr-0.5" />
                    {video.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Studio Contact & Location Footer */}
      <div className={`mt-6 pt-5 border-t ${cardBorder} pb-2`} id="home-view-footer">
        <div className={`p-5 rounded-[24px] ${cardBgClass} border relative overflow-hidden`} id="footer-contact-card">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-teal-500"></div>
          
          <h4 className={`text-xs font-black tracking-widest uppercase mb-4 flex items-center ${highlightText}`}>
            <span className="mr-2">📍</span> 门店资讯 / CONTACT US
          </h4>
          
          <div className="space-y-4 font-sans text-xs">
            {/* Address Row */}
            <div className="flex items-start gap-3" id="footer-address-row">
              <div className={`w-7 h-7 rounded-lg ${isMint ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-500'} flex items-center justify-center shrink-0 mt-0.5`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-0.5">舞蹈房地址 / ADDRESS</span>
                <p className={`font-semibold leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-705 text-slate-700'}`}>
                  北京市朝阳区三里屯世茂工三 A座3层302室 (PLAN A 舞蹈旗舰店)
                </p>
                <span className="text-[9px] text-zinc-500 font-medium block mt-1 tracking-tight">三里屯核心商圈 • 导航定位PLAN A 舞蹈工作室直达</span>
              </div>
            </div>

            {/* Phone Row */}
            <div className="flex items-start gap-3" id="footer-phone-row">
              <div className={`w-7 h-7 rounded-lg ${isMint ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-500'} flex items-center justify-center shrink-0 mt-0.5`}>
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-0.5">联系电话 / PHONE</span>
                <a 
                  href="tel:13800005142" 
                  className={`font-black tracking-wider text-sm hover:underline flex items-center gap-1.5 ${highlightText}`}
                  onClick={(e) => {
                    addToast('正在拨打 PLAN A 舞蹈工作室客服电话...', 'info');
                  }}
                >
                  138-0000-5142
                </a>
                <span className="text-[9px] text-zinc-500 font-medium block mt-1 tracking-tight">每日接听：10:00 - 22:30 • 欢迎提前电话预约试课</span>
              </div>
            </div>

            {/* WeChat Contact QR Row */}
            <div className="pt-3.5 border-t border-slate-100/10 flex flex-col items-center md:flex-row md:items-start gap-4" id="footer-wechat-row">
              {/* QR Scan card frame */}
              <div className="relative p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-md shrink-0 flex flex-col items-center group overflow-hidden" id="qr-code-frame">
                {/* Simulated scan beam animation */}
                <span className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 animate-[bounce_2.5s_infinite] opacity-60 pointer-events-none"></span>
                
                {/* Stylized QR Code SVG */}
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-slate-900 fill-current" id="vector-qr-svg">
                  {/* Top-Left Finder */}
                  <path d="M 5 5 L 25 5 L 25 25 L 5 25 Z" className="text-slate-900" />
                  <path d="M 9 9 L 21 9 L 21 21 L 9 21 Z" className="text-white fill-white" />
                  <path d="M 12 12 L 18 12 L 18 18 L 12 18 Z" className="text-emerald-500 fill-emerald-500" />

                  {/* Top-Right Finder */}
                  <path d="M 75 5 L 95 5 L 95 25 L 75 25 Z" className="text-slate-900" />
                  <path d="M 79 9 L 91 9 L 91 21 L 79 21 Z" className="text-white fill-white" />
                  <path d="M 82 12 L 88 12 L 88 18 L 82 18 Z" className="text-emerald-500 fill-emerald-500" />

                  {/* Bottom-Left Finder */}
                  <path d="M 5 75 L 25 75 L 25 95 L 5 95 Z" className="text-slate-900" />
                  <path d="M 9 79 L 21 79 L 21 91 L 9 91 Z" className="text-white fill-white" />
                  <path d="M 12 82 L 18 82 L 18 88 L 12 88 Z" className="text-emerald-500 fill-emerald-500" />

                  {/* High Density QR Matrix Dots Mock */}
                  {/* Row 1 */}
                  <rect x="35" y="5" width="4" height="4" />
                  <rect x="45" y="5" width="4" height="4" />
                  <rect x="55" y="5" width="4" height="4" className="text-emerald-400 fill-emerald-400" />
                  <rect x="65" y="5" width="4" height="4" />
                  {/* Row 2 */}
                  <rect x="30" y="15" width="4" height="4" />
                  <rect x="40" y="15" width="4" height="4" />
                  <rect x="50" y="15" width="4" height="4" />
                  <rect x="60" y="15" width="4" height="4" />
                  {/* Row 3 */}
                  <rect x="35" y="25" width="4" height="4" />
                  <rect x="45" y="25" width="4" height="4" />
                  <rect x="55" y="25" width="4" height="4" />
                  <rect x="65" y="25" width="4" height="4" />
                  {/* Row 4 */}
                  <rect x="5" y="35" width="4" height="4" />
                  <rect x="15" y="35" width="4" height="4" />
                  <rect x="25" y="35" width="4" height="4" />
                  <rect x="35" y="35" width="4" height="4" className="text-emerald-400 fill-emerald-400" />
                  <rect x="45" y="35" width="4" height="4" />
                  <rect x="55" y="35" width="4" height="4" />
                  <rect x="65" y="35" width="4" height="4" />
                  <rect x="75" y="35" width="4" height="4" />
                  <rect x="85" y="35" width="4" height="4" />
                  {/* Row 5 */}
                  <rect x="10" y="45" width="4" height="4" />
                  <rect x="20" y="45" width="4" height="4" />
                  <rect x="30" y="45" width="4" height="4" />
                  <rect x="70" y="45" width="4" height="4" />
                  <rect x="80" y="45" width="4" height="4" />
                  <rect x="90" y="45" width="4" height="4" />
                  {/* Row 6 */}
                  <rect x="5" y="55" width="4" height="4" />
                  <rect x="15" y="55" width="4" height="4" />
                  <rect x="25" y="55" width="4" height="4" />
                  <rect x="35" y="55" width="4" height="4" />
                  <rect x="45" y="55" width="4" height="4" />
                  <rect x="55" y="55" width="4" height="4" />
                  <rect x="65" y="55" width="4" height="4" />
                  <rect x="75" y="55" width="4" height="4" />
                  <rect x="85" y="55" width="4" height="4" className="text-emerald-400 fill-emerald-400" />
                  {/* Row 7 */}
                  <rect x="30" y="65" width="4" height="4" />
                  <rect x="40" y="65" width="4" height="4" />
                  <rect x="50" y="65" width="4" height="4" />
                  <rect x="60" y="65" width="4" height="4" />
                  <rect x="70" y="65" width="4" height="4" />
                  <rect x="80" y="65" width="4" height="4" />
                  {/* Row 8 */}
                  <rect x="35" y="75" width="4" height="4" />
                  <rect x="45" y="75" width="4" height="4" />
                  <rect x="55" y="75" width="4" height="4" />
                  <rect x="65" y="75" width="4" height="4" />
                  {/* Row 9 */}
                  <rect x="30" y="85" width="4" height="4" />
                  <rect x="40" y="85" width="4" height="4" />
                  <rect x="50" y="85" width="4" height="4" />
                  <rect x="60" y="85" width="4" height="4" className="text-emerald-400 fill-emerald-400" />
                  <rect x="70" y="85" width="4" height="4" />

                  {/* Standard small alignment pattern */}
                  <path d="M 70 70 L 80 70 L 80 80 L 70 80 Z" />
                  <path d="M 73 73 L 77 73 L 77 77 L 73 77 Z" className="text-white fill-white" />
                  <rect x="74" y="74" width="2" height="2" />

                  {/* Center Brand Logo Indicator inside QR Code */}
                  <circle cx="50" cy="50" r="13" className="text-white fill-white" />
                  <circle cx="50" cy="50" r="10" className="text-emerald-600 fill-emerald-600" />
                  {/* Inner text PA */}
                  <text x="50" y="53.5" fontSize="10" fontWeight="bold" textAnchor="middle" fill="white" className="font-sans font-black">PA</text>
                </svg>

                <div className="text-[7.5px] font-black text-rose-500 mt-1 uppercase tracking-tighter">微信扫一扫</div>
              </div>

              <div className="flex-1 text-left min-w-0">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-0.5">微信专属客服 / WECHAT CONTACT</span>
                <p className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                  专属客服客服：<button onClick={() => {
                    navigator.clipboard.writeText('PLAN_A_STUDIO_514');
                    addToast('微信号已拷贝到剪贴板，快去添加吧！', 'success');
                  }} className={`${highlightText} font-mono font-black border-b border-dashed border-rose-500/40 hover:opacity-85 text-xs focus:outline-none cursor-pointer`}>PLAN_A_STUDIO_514</button>
                </p>
                <div className={`text-[10px] leading-relaxed mt-1.5 font-medium space-y-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <p>• 长按、扫描或点击微信号复制，在微信内搜索添加极速答疑</p>
                  <p>• 享受考级考证咨询、最新团建课程价表、卡券退改补卡等特权</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Humble copyright footnote */}
        <div className="text-center mt-4 pb-2">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
            © 2026 PLAN A DANCE STUDIO. ALL RIGHTS RESERVED.
          </p>
          <span className="text-[7.5px] font-bold text-zinc-300 mt-1 block">由 菲特云 提供排课和系统技术支持</span>
        </div>
      </div>

      {/* ==================== DIALOG POPUP 1: VIDEO SIMULATION MODAL ==================== */}
      <AnimatePresence>
        {activeVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div className={`rounded-3xl w-full max-w-sm overflow-hidden text-center relative p-6 border shadow-2xl text-white ${isDark ? 'bg-[#13141f] border-white/10' : 'bg-white border-black/10'}`}>
              <button
                onClick={() => setActiveVideoId(null)}
                className={`absolute top-4_5 right-4_5 font-black cursor-pointer text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                ✕
              </button>

              <p className={`text-[9px] font-extrabold uppercase tracking-widest font-sans ${highlightText}`}>
                PLANA CLASS VIDEO PLAYER
              </p>
              <h4 className={`text-xs font-black mt-1.5 mb-4 leading-snug px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {MOCK_VIDEOS.find((v) => v.id === activeVideoId)?.title}
              </h4>

              {/* Dynamic video simulated display with progress bar */}
              <div className="relative h-44 bg-black rounded-2xl overflow-hidden flex items-center justify-center mb-4 border border-white/5">
                <img
                  src={MOCK_VIDEOS.find((v) => v.id === activeVideoId)?.cover}
                  alt="feedback"
                  className="w-full h-full object-cover opacity-60 animate-pulse"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <Play className={`w-12 h-12 fill-current animate-ping opacity-75 ${highlightText}`} />
                  <span className={`text-white text-[9px] mt-3 px-3 py-1 rounded-full font-black uppercase tracking-widest ${ctaBtnColor}`}>
                    [ 正在播放 4K 结课舞演短片 ]
                  </span>
                </div>
              </div>

              <div className={`text-[11px] text-left p-3.5 rounded-2xl border space-y-1.5 font-sans ${
                isDark ? 'bg-white/5 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div>• 日期: 2026-05-25 教学沉淀秀</div>
                <div>• 配乐: High tempo bass music remix</div>
                <div>• 编排: 导师现场根据零基础学员进度精简重构</div>
              </div>

              <button
                onClick={() => {
                  setActiveVideoId(null);
                  onSuggestTab('schedule');
                  addToast('已引导进入选课表！', 'success');
                }}
                className={`mt-4 w-full py-2.5 text-white text-xs font-black rounded-full shadow-lg hover:scale-102 transition duration-200 cursor-pointer ${ctaBtnColor}`}
              >
                立即预定本色导师大课
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== DIALOG POPUP 2: TEACHER BIO MODAL ==================== */}
      <AnimatePresence>
        {selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop slide click shut */}
            <div
              onClick={() => setSelectedTeacher(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            ></div>

            {/* Slider bottom bio info */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={`relative rounded-t-[36px] w-[375px] max-h-[85vh] overflow-y-auto p-6 border-t z-10 shadow-2xl ${
                isDark ? 'bg-[#13141f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className={`w-12 h-1 rounded-full mx-auto mb-4 ${isDark ? 'bg-white/15' : 'bg-slate-350'}`}></div>

              {/* Top main profile specs */}
              <div className="flex items-start space-x-4">
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 ${isMint ? 'border-teal-500' : 'border-rose-500'}`}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTeacher.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs mt-1 font-bold">
                    <span className={`flex items-center font-black ${highlightText}`}>
                      ★ {selectedTeacher.rating.toFixed(1)}
                    </span>
                    <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>•</span>
                    <span className={`font-extrabold text-[9px] px-2 py-0.5 rounded-md ${badgeClass}`}>首推名师导师</span>
                  </div>

                  {/* Badges tags row */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTeacher.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                          isDark ? 'bg-white/5 text-zinc-300 border-white/5' : 'bg-slate-150 bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio summary description paragraphs */}
              <div className="mt-5 space-y-3">
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest leading-none text-zinc-400">个人简介 / Biography</h4>
                  <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${isDark ? 'text-zinc-305' : 'text-slate-700'}`}>
                    {selectedTeacher.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest leading-none mt-3 text-zinc-400">主攻风格 / Core Genres</h4>
                  <p className={`text-xs mt-1.5 font-semibold leading-relaxed ${isDark ? 'text-zinc-305' : 'text-slate-700'}`}>
                    Hiphop (街舞律动), Jazz Funk, Commercial Choreo (高燃商业爵士), Lyrical isolations.
                  </p>
                </div>

                <div className={`rounded-2xl p-4 border mt-3 space-y-2 font-semibold text-xs ${
                  isDark ? 'bg-white/5 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex justify-between">
                    <span>课堂氛围评分:</span>
                    <span className={`font-black ${highlightText}`}>9.9/10 SUPER FUN</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>最受喜爱风格:</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>基础爆发隔离/Groove</span>
                  </div>
                </div>
              </div>

              {/* CTA call action booking */}
              <div className="mt-5 space-y-2.5">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    onSuggestTab('schedule');
                    addToast(`已为您筛选导师 ${selectedTeacher.name} 的课程`, 'info');
                  }}
                  className={`w-full py-3 text-white text-xs font-black rounded-full transition shadow-md flex items-center justify-center space-x-1 cursor-pointer ${billboardBtn}`}
                >
                  <span>一键查询该导师排课表</span>
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className={`w-full py-2.5 text-xs font-black rounded-full transition cursor-pointer border ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
