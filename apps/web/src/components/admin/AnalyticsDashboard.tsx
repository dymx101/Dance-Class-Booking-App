import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, Percent, DollarSign, UserPlus, XCircle, 
  Loader2, Calendar, ChevronDown, Filter, Info, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { getRevenueStats, getTeacherPerformance, getAttendanceHeatmap, getMemberStats } from '../../lib/analytics';
import { RevenueStat, TeacherPerformance, HeatmapData, MemberStat } from '../../types';
import { supabase } from '../../lib/supabase';

type Period = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const [sending, setSending] = useState(false);
  
  // Master data
  const [rawRevenueData, setRawRevenueData] = useState<RevenueStat[]>([]);
  const [rawTeacherData, setRawTeacherData] = useState<TeacherPerformance[]>([]);
  const [rawHeatmapData, setRawHeatmapData] = useState<HeatmapData[]>([]);
  const [rawMemberData, setRawMemberData] = useState<MemberStat[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [rev, teachers, heatmap, members] = await Promise.all([
          getRevenueStats(),
          getTeacherPerformance(),
          getAttendanceHeatmap(),
          getMemberStats()
        ]);
        setRawRevenueData(rev);
        setRawTeacherData(teachers);
        setRawHeatmapData(heatmap);
        setRawMemberData(members);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSendTestReport = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('generate-report', {
        body: { type: 'weekly' }
      });
      if (error) throw error;
      alert('Report sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send report.');
    } finally {
      setSending(false);
    }
  };

  // Filtered data based on period
  const filteredRevenue = useMemo(() => {
    if (period === 'all') return rawRevenueData;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return rawRevenueData.filter(item => new Date(item.week) >= cutoff).reverse();
  }, [rawRevenueData, period]);

  const filteredMembers = useMemo(() => {
    if (period === 'all') return rawMemberData;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return rawMemberData.filter(item => new Date(item.week) >= cutoff).reverse();
  }, [rawMemberData, period]);

  // Summary calculations
  const summary = useMemo(() => {
    const revenue = filteredRevenue.reduce((sum, item) => sum + item.total_revenue, 0);
    const signups = filteredMembers.reduce((sum, item) => sum + item.new_signups, 0);
    const fillRate = rawTeacherData.length > 0 
      ? (rawTeacherData.reduce((sum, item) => sum + item.avg_fill_rate, 0) / rawTeacherData.length).toFixed(1) 
      : '0';

    return { revenue, signups, fillRate };
  }, [filteredRevenue, filteredMembers, rawTeacherData]);

  const stats = [
    {
      label: '总营收 Total Revenue',
      value: `¥${summary.revenue.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: `基于所选周期 Based on ${period}`
    },
    {
      label: '平均上课率 Avg. Fill Rate',
      value: `${summary.fillRate}%`,
      change: '+5.2%',
      icon: Percent,
      color: 'bg-blue-500',
      description: '全时段平均 Overall average'
    },
    {
      label: '新成员 New Members',
      value: summary.signups.toString(),
      change: '+18.3%',
      icon: UserPlus,
      color: 'bg-rose-500',
      description: `周期内新增 ${period} signups`
    },
    {
      label: '缺勤率 No-Show Rate',
      value: '4.2%',
      change: '-1.5%',
      icon: XCircle,
      color: 'bg-amber-500',
      description: '周期内统计 Period stats'
    }
  ];

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
        <p className="font-black text-xs uppercase tracking-widest">数据分析加载中... (Analyzing Data...)</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">管理中心数据看板 (Analytics)</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">实时监控工作室营收与运营情况 Real-time Studio Pulse</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendTestReport}
            disabled={sending}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all border border-rose-100"
          >
            {sending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Mail className="w-3 h-3" />
            )}
            <span>发送测试报表 (Send Test Report)</span>
          </button>

          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  period === p 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p === 'all' ? '全部' : p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.change}
                </span>
                <TrendingUp className={`w-3 h-3 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </h3>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {stat.description}
              </p>
            </div>
            {/* Decorative background element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              营收趋势图 Revenue Trends
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">单位: CNY (¥)</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                  labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '营收 Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke="#10b981" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Member Growth Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              用户增长图 User Growth
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">单位: 人 (Members)</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMembers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="circle" 
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', tracking: '0.1em' }} 
                />
                <Bar dataKey="new_signups" name="新注册 New" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} animationDuration={1500} />
                <Bar dataKey="active_users" name="活跃 Active" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Teacher Leaderboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              教师表现排行 Teacher Performance
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1">基于平均上课率与候补人数 Rankings by Avg. Fill Rate</p>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all border border-slate-100">
            <Filter className="w-3 h-3" />
            <span>更多筛选 Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rawTeacherData.map((teacher, index) => (
            <div 
              key={teacher.teacher_id} 
              className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${
                    index === 0 ? 'bg-amber-100 text-amber-600' : 
                    index === 1 ? 'bg-slate-200 text-slate-600' : 
                    index === 2 ? 'bg-orange-100 text-orange-600' : 
                    'bg-white text-slate-400'
                  } border border-black/5 flex items-center justify-center text-lg font-black shadow-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{teacher.teacher_name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">INSTRUCTOR</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{teacher.avg_fill_rate.toFixed(1)}%</div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg Fill</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/60 rounded-2xl border border-black/5">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Bookings</span>
                    <span className="text-xs font-black text-slate-800">{teacher.total_bookings}</span>
                  </div>
                  <div className="p-3 bg-white/60 rounded-2xl border border-black/5">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Waitlist</span>
                    <span className="text-xs font-black text-slate-800">{teacher.total_waitlist}</span>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${teacher.avg_fill_rate}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
