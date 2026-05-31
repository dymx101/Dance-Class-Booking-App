import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Percent, DollarSign, UserPlus, XCircle, 
  Loader2, Calendar, ChevronDown, Filter, Info, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { getRevenueStats, getTeacherPerformance, getAttendanceHeatmap, getMemberStats, getStudioHealth, getAtRiskMembers } from '../../lib/analytics';
import { RevenueStat, TeacherPerformance, HeatmapData, MemberStat, StudioHealth, AtRiskMember } from '@dance-app/shared';
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
  const [health, setHealth] = useState<StudioHealth | null>(null);
  const [atRiskMembers, setAtRiskMembers] = useState<AtRiskMember[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [rev, teachers, heatmap, members, healthData, atRisk] = await Promise.all([
          getRevenueStats(),
          getTeacherPerformance(),
          getAttendanceHeatmap(),
          getMemberStats(),
          getStudioHealth(),
          getAtRiskMembers()
        ]);
        setRawRevenueData(rev);
        setRawTeacherData(teachers);
        setRawHeatmapData(heatmap);
        setRawMemberData(members);
        setHealth(healthData);
        setAtRiskMembers(atRisk);
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

  const stats = [
    {
      label: '总营收 Total Revenue',
      value: health ? `¥${health.revenue.current.toLocaleString()}` : '¥0',
      change: health ? `${health.revenue.growth >= 0 ? '+' : ''}${health.revenue.growth.toFixed(1)}%` : '0%',
      growth: health ? health.revenue.growth : 0,
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: `过去30天对比 Based on 30d comparison`
    },
    {
      label: '平均上课率 Avg. Fill Rate',
      value: health ? `${health.fillrate.toFixed(1)}%` : '0%',
      change: '+2.1%', // Mocked for fill rate for now
      growth: 2.1,
      icon: Percent,
      color: 'bg-blue-500',
      description: '全时段平均 Overall average'
    },
    {
      label: '新成员 New Members',
      value: health ? health.signups.current.toString() : '0',
      change: health ? `${health.signups.growth >= 0 ? '+' : ''}${health.signups.growth.toFixed(1)}%` : '0%',
      growth: health ? health.signups.growth : 0,
      icon: UserPlus,
      color: 'bg-rose-500',
      description: `增长趋势 User growth trend`
    },
    {
      label: '缺勤率 No-Show Rate',
      value: health ? `${health.noshowrate.toFixed(1)}%` : '0%',
      change: '-1.5%',
      growth: -1.5,
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
                <span className={`text-[10px] font-black ${stat.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.change}
                </span>
                {stat.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                )}
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
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
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

        {/* Retention CRM List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              流失预警 Retention List
            </h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            {atRiskMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase italic">No at-risk members found.</div>
            ) : (
              atRiskMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs font-black">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-slate-800 block">{member.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Inactive: {member.days_inactive} days</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-rose-600 block">{member.remainingpasses} 次</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Left</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-slate-900/10">
            全部导出 Export CRM List
          </button>
        </motion.div>
      </div>

      {/* Member Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              用户增长图 User Growth
            </h3>
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

        {/* Teacher Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
        >
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            教师表现排行 Teacher Performance
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            {rawTeacherData.map((teacher, index) => (
              <div key={teacher.teacher_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col group hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-black text-slate-800">{teacher.teacher_name}</span>
                  <span className="text-xs font-black text-blue-600">{teacher.avg_fill_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${teacher.avg_fill_rate}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
