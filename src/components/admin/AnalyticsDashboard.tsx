import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Percent, DollarSign, UserPlus, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { getRevenueStats, getTeacherPerformance, getAttendanceHeatmap, getMemberStats } from '../../lib/analytics';
import { RevenueStat, TeacherPerformance, HeatmapData, MemberStat } from '../../types';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueStat[]>([]);
  const [teacherData, setTeacherData] = useState<TeacherPerformance[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [memberData, setMemberData] = useState<MemberStat[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rev, teachers, heatmap, members] = await Promise.all([
          getRevenueStats(),
          getTeacherPerformance(),
          getAttendanceHeatmap(),
          getMemberStats()
        ]);
        setRevenueData(rev);
        setTeacherData(teachers);
        setHeatmapData(heatmap);
        setMemberData(members);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Summary calculations based on fetched data
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total_revenue, 0);
  const avgFillRate = teacherData.length > 0 
    ? (teacherData.reduce((sum, item) => sum + item.avg_fill_rate, 0) / teacherData.length).toFixed(1) 
    : '0';
  const newMembers = memberData.reduce((sum, item) => sum + item.new_signups, 0);

  const stats = [
    {
      label: '总营收 Total Revenue',
      value: `¥${totalRevenue.toLocaleString()}`,
      change: '+12.5%', // Mocked trend
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: '本月营收 Current Month'
    },
    {
      label: '平均上课率 Avg. Fill Rate',
      value: `${avgFillRate}%`,
      change: '+5.2%',
      icon: Percent,
      color: 'bg-blue-500',
      description: '基于总预约位 Based on capacity'
    },
    {
      label: '新成员 New Members',
      value: newMembers.toString(),
      change: '+18.3%',
      icon: UserPlus,
      color: 'bg-rose-500',
      description: '过去30天 Last 30 days'
    },
    {
      label: '缺勤率 No-Show Rate',
      value: '4.2%',
      change: '-1.5%',
      icon: XCircle,
      color: 'bg-amber-500',
      description: '预约未到场 Unattended bookings'
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
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-blue-500/10`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </h3>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-2">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              营收趋势图 Revenue Trends
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
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
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              用户增长图 User Growth
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700 }} />
                <Bar dataKey="new_signups" name="新注册 New" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active_users" name="活跃 Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Teacher Leaderboard */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          教师表现排行 Teacher Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherData.map((teacher, index) => (
            <div key={teacher.teacher_id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank #{index + 1}</span>
                  <h4 className="text-sm font-black text-slate-800">{teacher.teacher_name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-600">{teacher.avg_fill_rate.toFixed(1)}%</div>
                  <span className="text-[8px] font-black text-slate-400 uppercase">Avg Fill</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                  <span>上课人数 Bookings: {teacher.total_bookings}</span>
                  <span>候补 Waitlist: {teacher.total_waitlist}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${teacher.avg_fill_rate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
