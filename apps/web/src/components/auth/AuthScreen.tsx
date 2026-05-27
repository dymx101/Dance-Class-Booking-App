import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { OTPInput } from './OTPInput';
import { Phone, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

const AUTH_ERRORS: Record<string, { en: string; zh: string }> = {
  'invalid_credentials': {
    en: 'Invalid or expired code. Please try again.',
    zh: '验证码无效或已过期，请重试。'
  },
  'too_many_requests': {
    en: 'Too many requests. Please wait before trying again.',
    zh: '请求过多，请稍后再试。'
  },
  'otp_expired': {
    en: 'OTP has expired. Please request a new one.',
    zh: '验证码已过期，请重新获取。'
  },
  'user_not_found': {
    en: 'User not found.',
    zh: '未找到用户。'
  },
  'default': {
    en: 'An error occurred. Please try again.',
    zh: '发生错误，请重试。'
  }
};

export const AuthScreen: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-submit OTP verification once all 6 digits are fully entered
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleVerifyCode(fakeEvent);
    }
  }, [otp, loading]);

  const getErrorMessage = (err: any) => {
    const code = err.code || err.message?.toLowerCase().replace(/ /g, '_');
    const mapping = AUTH_ERRORS[code] || AUTH_ERRORS['default'];
    return `${mapping.en} / ${mapping.zh}`;
  };

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a phone number');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+86${phone}`,
      });
      if (error) throw error;
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+86${phone}`,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      // App.tsx will handle the session change automatically via AuthContext
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative min-h-screen">
      {/* Background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-2">STUDIO</h1>
          <p className="text-zinc-400">Sign in to book your next class</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Welcome Back</h2>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
                    <div className="flex relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 font-medium border-r border-zinc-800 pr-3 h-full">
                        +86
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="138 0000 0000"
                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-20 pr-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || phone.length < 11}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Send SMS Code <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">Verify Code</h2>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-zinc-400">Sent to +86 {phone}</p>
                      {countdown > 0 ? (
                        <p className="text-xs text-zinc-500 font-medium">Resend in {countdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="text-xs text-white font-bold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="pt-2">
                    <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                  </div>

                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                        setError(null);
                      }}
                      disabled={loading}
                      className="w-full bg-transparent text-zinc-400 font-medium py-2 hover:text-white transition-colors cursor-pointer"
                    >
                      Back to phone entry
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
