import React, { useState, useEffect } from 'react';
import { PAYMENT_CARDS } from '../data';
import { PaymentCard, PurchaseRecord } from '../types';
import { Sparkles, ShieldCheck, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface StoreViewProps {
  theme?: string;
  userPasses: number;
  setUserPasses: React.Dispatch<React.SetStateAction<number>>;
  purchaseHistory: PurchaseRecord[];
  setPurchaseHistory: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function StoreView({
  theme = 'vibrant-light',
  userPasses,
  setUserPasses,
  purchaseHistory,
  setPurchaseHistory,
  addToast
}: StoreViewProps) {
  const { user } = useAuth();
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  // Compute theme dependent layout classes
  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const headerBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/65' : 'border-orange-100/30';
  const textTitleClass = isDark ? 'text-[#f8fafc]' : 'text-slate-900';
  const textDescClass = isDark ? 'text-zinc-500' : 'text-slate-500';
  const textWhite = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-600';

  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5 text-white' : isMint ? 'bg-white border-slate-200/50 text-slate-800 shadow-sm' : 'bg-white border-[#f2ede4] text-slate-800 shadow-sm';
  const cardBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/50' : 'border-[#f2ede4]';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const iconColor = isMint ? 'text-teal-500' : 'text-rose-500';

  const badgeClass = isDark
    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-405 text-rose-400'
    : isMint
    ? 'bg-teal-500/10 border border-teal-555 border-teal-500/20 text-teal-650 text-teal-600'
    : 'bg-rose-50 border border-rose-100 text-rose-605 text-rose-600';

  const defaultButtonClass = isMint
    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow shadow-teal-550/10'
    : 'bg-rose-500 hover:bg-rose-600 text-white shadow shadow-rose-550/10';

  const ctaBtnColor = isMint
    ? 'bg-teal-600 hover:bg-teal-700 text-white'
    : 'bg-rose-500 hover:bg-rose-600 text-white';

  // Selected Card for the checkout modal popup sheet
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);

  // Simulated Coupon Discount State
  const [selectedCouponCode, setSelectedCouponCode] = useState<'NEW' | 'FEST' | 'NONE'>('NONE');

  // Selected Pay Method: 'wechat' | 'alipay' | 'visa'
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay' | 'visa'>('wechat');

  // Loading simulation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Real cards from DB
  const [dbCards, setDbCards] = useState<PaymentCard[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('payment_cards')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        console.error('Error fetching cards:', error);
        setDbCards(PAYMENT_CARDS);
      } else if (data) {
        setDbCards(data as PaymentCard[]);
      }
    };
    fetchCards();
  }, []);

  // Return formatted price subtracting coupon discount
  const getDiscountedPriceAndLabel = (card: PaymentCard) => {
    let discountVal = 0;
    let label = '无优惠';

    if (selectedCouponCode === 'NEW' && card.price > 40) {
      discountVal = 15;
      label = '新人专属优惠 ¥15 OFF';
    } else if (selectedCouponCode === 'FEST' && card.price > 200) {
      discountVal = 50;
      label = 'PLANA店庆通卡券 ¥50 OFF';
    }

    const finalPrice = Math.max(1, card.price - discountVal);
    return { finalPrice, discountVal, label };
  };

  // Complete Simulated Purchase Flow
  const handlePaymentConfirm = async (card: PaymentCard) => {
    if (!user) {
      addToast('请先登录后再进行充值 (Please sign in to continue)', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          card_id: card.id,
          payment_method: payMethod
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('未获取到支付跳转链接 (Failed to get checkout URL)');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      addToast(`支付发起失败: ${err.message || '未知错误'}`, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto px-4 pb-20 pt-4 transition-colors duration-500 ${bgClass}`} id="store-view-container">
      {/* Studio Banner section */}
      <div className={`flex items-center justify-between pb-3 border-b ${headerBorder} mb-3`}>
        <div>
          <h2 className={`text-sm font-black uppercase tracking-wider ${textWhite}`}>充值购卡</h2>
          <p className="text-[8px] text-zinc-500 font-bold tracking-widest mt-1">PLANA DANCE PASSES CENTER</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className={`text-[9px] font-black ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>可用课充点</span>
          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg leading-none border mt-1 shadow-sm ${
            isMint 
              ? 'text-teal-600 bg-teal-500/10 border-teal-555 border-teal-500/20' 
              : 'text-rose-500 border border-rose-500/20 bg-rose-500/10'
          }`}>
            {userPasses} 次
          </span>
        </div>
      </div>

      {/* Promotional Notice box */}
      <div className={`mt-3 border p-4 rounded-2xl flex items-start space-x-2.5 shadow-md bg-gradient-to-r ${
        isMint 
          ? 'from-teal-500/5 to-emerald-500/10 border-teal-500/20' 
          : 'from-pink-500/5 to-rose-550/10 border-rose-500/20'
      }`}>
        <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${isMint ? 'text-teal-500' : 'text-rose-455 text-rose-400'}`} />
        <div className="text-[11px] leading-relaxed font-sans">
          <p className={`font-extrabold text-xs ${textWhite}`}>新会员特惠福利大放送 🎁</p>
          <p className={`mt-1 font-medium text-xs leading-relaxed ${textSecondary}`}>
            首次注册即可在结账页享受首单 <strong className={isMint ? 'text-teal-600' : 'text-rose-500 text-rose-405'}>¥15 OFF</strong> 现金立减扣减。卡券可与其他优惠累加，未用完包换包退，支持随时冻结。
          </p>
        </div>
      </div>

      {/* Main cards lists Grid */}
      <div className="mt-5 space-y-4" id="passes-catalog">
        <h3 className={`text-[10px] font-black uppercase tracking-widest pl-2 border-l-2 ${highlightText} ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          自修团课次卡/会员通卡 / Memberships Package
        </h3>

        {(dbCards.length > 0 ? dbCards : PAYMENT_CARDS).map((card) => {
          const discountLabel = card.originalPrice
            ? `省 ¥${card.originalPrice - card.price}`
            : null;

          return (
            <div
              key={card.id}
              className={`rounded-[24px] border p-4.5 relative overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-300 ${cardBgClass} ${cardBorder}`}
            >
              {/* Badge upper-right */}
              {card.badge && (
                <span className={`absolute top-0 right-0 text-white font-black text-[8px] px-3.5 py-1 rounded-bl-xl tracking-wider uppercase border-l border-b ${
                  isMint ? 'bg-teal-600 border-teal-500/10' : 'bg-rose-500 border-rose-550 border-rose-500/10'
                }`}>
                  {card.badge}
                </span>
              )}

              {/* Card specs top row */}
              <div>
                <h4 className={`font-extrabold text-sm pr-14 leading-tight ${textWhite}`}>
                  {card.title}
                </h4>
                <p className={`text-[9px] font-mono font-bold mt-1 tracking-tight ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  有效期: {card.validDays} 天 • {' '}
                  {card.passes === -1 ? '不限期/上课次数限制' : `大课共 ${card.passes} 课时`}
                </p>
                <p className={`text-[11px] mt-2 leading-relaxed font-sans font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {card.description}
                </p>
              </div>

              {/* Price elements & Purchase trigger controls */}
              <div className={`mt-4 pt-3.5 border-t border-dashed flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className={`text-[10px] font-black ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>¥</span>
                  <span className={`text-xl font-black leading-none ${textWhite}`}>
                    {card.price}
                  </span>

                  {card.originalPrice && (
                    <span className={`text-xs font-bold line-through ml-1.5 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                      ¥{card.originalPrice}
                    </span>
                  )}

                  {discountLabel && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ml-2.5 leading-none ${badgeClass}`}>
                      {discountLabel}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCard(card)}
                  className={`font-black text-xs px-5 py-2.5 rounded-full cursor-pointer hover:scale-103 active:scale-95 transition-all shadow-lg ${
                    isDark 
                      ? 'bg-white hover:bg-zinc-100 text-[#0c0d14]'
                      : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  去充值
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety notes details */}
      <div className={`mt-6 p-4 rounded-[24px] border flex items-start space-x-3.5 shadow-lg ${cardBgClass} ${cardBorder}`} id="store-faq">
        <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${highlightText}`} />
        <div className="text-[10px] leading-relaxed space-y-1">
          <p className={`font-extrabold text-xs ${textWhite}`}>PLANA 购课安全保障细则</p>
          <p className={`${textSecondary} font-medium`}>• 7天退包保障: 新卡自购包起7天内，若未进行任何大课预订消课，均可无偿向客服申请秒级退款款项。</p>
          <p className={`${textSecondary} font-medium`}>• 自动冻结延期: 用户若遇突发生病、出差，可在上课前对卡包申请为期14天的临时冻结，保证课次天数延期不被扣耗。</p>
        </div>
      </div>

      {/* ==================== SCREEN DIALOG 3: CHECKOUT MODAL ==================== */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop slide hide */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            ></motion.div>

            {/* Content Drawer Box */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={`relative rounded-t-[36px] w-[375px] mx-auto overflow-hidden p-6 border-t z-10 shadow-2xl transition-colors duration-500 ${cardBgClass} ${
                isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800 animate-fade-in'
              }`}
            >
              <div className={`w-12 h-1 rounded-full mx-auto mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-500/20'}`}></div>

              {/* Checkout header specs */}
              <div className={`text-center pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <span className={`text-[8px] font-extrabold tracking-widest font-mono uppercase ${highlightText}`}>PLANA SECURE CHECKOUT</span>
                <h4 className={`font-black text-sm mt-1 ${textWhite}`}>确认购卡项目</h4>
                <p className="text-[8px] text-zinc-500 font-mono mt-1 font-bold">订单ID: CHK_0260525_{selectedCard.id}</p>
              </div>

              {/* Card descriptions listing details */}
              <div className={`mt-4 rounded-2xl p-4.5 space-y-3.5 border ${isDark ? 'bg-[#181926] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-sans font-extrabold text-xs block ${textWhite}`}>{selectedCard.title}</span>
                    <span className={`text-[9px] mt-1.5 block font-bold font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      课点增加: {selectedCard.passes === -1 ? '无限次通卡' : `${selectedCard.passes} 次`} • 效期 {selectedCard.validDays} 天
                    </span>
                  </div>
                  <span className={`font-mono font-black text-base ${textWhite}`}>¥{selectedCard.price}</span>
                </div>

                {/* Simulated Coupon Picker list */}
                <div className={`pt-3.5 border-t border-dashed ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <label className={`text-[10px] font-black flex items-center mb-2.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <Ticket className={`w-3 h-3 mr-1.5 ${highlightText}`} />
                    在线可用卡券选择 (Coupons)
                  </label>

                  <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none grayscale">
                    <button
                      onClick={() => setSelectedCouponCode('NEW')}
                      className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedCouponCode === 'NEW'
                          ? isMint
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 scale-102 font-black shadow-xs'
                            : 'border-rose-500 bg-rose-500/10 text-rose-500 scale-102 font-black shadow-xs'
                          : isDark
                          ? 'border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10'
                          : 'border-slate-200 bg-slate-100/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>新人券 ¥15</span>
                      <span className={`text-[7px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>(首置必抢)</span>
                    </button>
                    <button
                      disabled={selectedCard.price < 200}
                      onClick={() => setSelectedCouponCode('FEST')}
                      className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                        selectedCouponCode === 'FEST'
                          ? isMint
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 scale-102 font-black shadow-xs'
                            : 'border-rose-500 bg-rose-500/10 text-rose-500 scale-102 font-black shadow-xs'
                          : isDark
                          ? 'border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10'
                          : 'border-slate-200 bg-slate-100/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>店庆券 ¥50</span>
                      <span className={`text-[7px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>(满200可用)</span>
                    </button>
                    <button
                      onClick={() => setSelectedCouponCode('NONE')}
                      className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedCouponCode === 'NONE'
                          ? isMint
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 scale-102 font-black shadow-xs'
                            : 'border-rose-500 bg-rose-500/10 text-rose-500 scale-102 font-black shadow-xs'
                          : isDark
                          ? 'border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10'
                          : 'border-slate-200 bg-slate-100/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>不用券</span>
                      <span className={`text-[7px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>(原价结算)</span>
                    </button>
                  </div>
                  
                  <div className="text-center mt-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${highlightText} animate-pulse`}>
                      卡券功能开发中 (Coming Soon)
                    </span>
                  </div>

                  {/* Pricing breakdown summary */}
                  <div className={`mt-4 pt-3.5 border-t border-dashed leading-normal font-sans text-xs space-y-1.5 ${
                    isDark ? 'border-white/5 text-zinc-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <div className="flex justify-between">
                      <span>单品价格:</span>
                      <span className={`font-mono font-medium ${textWhite}`}>¥{selectedCard.price}</span>
                    </div>

                    {getDiscountedPriceAndLabel(selectedCard).discountVal > 0 && (
                      <div className={`flex justify-between font-extrabold ${isMint ? 'text-teal-600' : 'text-rose-500 text-rose-600'}`}>
                        <span>卡券立减:</span>
                        <span className="font-mono">-¥{getDiscountedPriceAndLabel(selectedCard).discountVal}</span>
                      </div>
                    )}

                    <div className={`flex justify-between font-extrabold text-xs pt-2 mt-2 border-t border-dashed ${
                      isDark ? 'border-white/5 text-[#f1f5f9]' : 'border-slate-200 text-slate-800'
                    }`}>
                      <span>总计应付 (Final price):</span>
                      <span className={`font-mono text-sm ${isMint ? 'text-teal-600' : 'text-rose-500 text-rose-600'}`}>
                        ¥{getDiscountedPriceAndLabel(selectedCard).finalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Protocol Selection */}
              <div className="mt-4">
                <span className={`text-[9px] font-black block mb-2 uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>在线支付通道选择 (Payments)</span>
                <div className="grid grid-cols-3 gap-2 font-bold text-white">
                  <button
                    onClick={() => setPayMethod('wechat')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      payMethod === 'wechat' 
                        ? isMint 
                          ? 'border-teal-500 bg-teal-500/10 text-teal-600 font-extrabold' 
                          : 'border-rose-500 bg-rose-500/10 text-rose-505 text-rose-500 font-extrabold' 
                        : isDark
                        ? 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <span className="text-emerald-500 font-extrabold mb-0.5">微信</span>
                    <span className={`text-[7px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>WeChat Pay</span>
                  </button>
                  <button
                    onClick={() => setPayMethod('alipay')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      payMethod === 'alipay' 
                        ? isMint 
                          ? 'border-teal-500 bg-teal-500/10 text-teal-600 font-extrabold' 
                          : 'border-rose-500 bg-rose-500/10 text-rose-505 text-rose-500 font-extrabold' 
                        : isDark
                        ? 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <span className="text-blue-500 font-extrabold mb-0.5">支付宝</span>
                    <span className={`text-[7px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Alipay</span>
                  </button>
                  <button
                    onClick={() => setPayMethod('visa')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      payMethod === 'visa' 
                        ? isMint 
                          ? 'border-teal-500 bg-teal-500/10 text-teal-600 font-extrabold' 
                          : 'border-rose-500 bg-rose-500/10 text-rose-505 text-rose-500 font-extrabold' 
                        : isDark
                        ? 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <span className={`font-extrabold mb-0.5 ${isMint ? 'text-teal-600' : 'text-rose-504 text-rose-500'}`}>快捷支付</span>
                    <span className={`text-[7px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Card Pay</span>
                  </button>
                </div>
              </div>

              {/* Confirm submit buttons */}
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => handlePaymentConfirm(selectedCard)}
                  disabled={isProcessing}
                  className={`w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs rounded-full shadow-lg transition duration-200 flex items-center justify-center space-x-1 cursor-pointer ${ctaBtnColor}`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-1.5 animate-pulse"></div>
                      <span>安全网关结算中...</span>
                    </>
                  ) : (
                    <span>确认支付 ¥{getDiscountedPriceAndLabel(selectedCard).finalPrice}</span>
                  )}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setSelectedCard(null)}
                  className={`w-full py-2.5 text-xs font-bold rounded-full transition border cursor-pointer ${
                    isDark 
                      ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  返回选卡
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
