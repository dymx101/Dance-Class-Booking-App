import React from 'react';
import { BarChart3, TrendingUp, Users, Percent, DollarSign, UserPlus, Calendar, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AnalyticsDashboard() {
  // Dummy data for MVP
  const stats = [
    {
      label: '总营收 Total Revenue',
      value: '¥42,850',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: '本月营收 Current Month'
    },
    {
      label: '平均上课率 Avg. Fill Rate',
      value: '78.4%',
      change: '+5.2%',
      icon: Percent,
      color: 'bg-blue-500',
      description: '基于总预约位 Based on capacity'
    },
    {
      label: '新成员 New Members',
      value: '124',
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

  return (
    <div className="space-y-8">
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
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
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

      {/* Placeholder for Charts (Task 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-80 flex flex-col items-center justify-center text-slate-400 border-dashed border-2">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-black text-xs uppercase tracking-[0.2em]">营收趋势图 (Revenue Chart Placeholder)</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-80 flex flex-col items-center justify-center text-slate-400 border-dashed border-2">
          <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-black text-xs uppercase tracking-[0.2em]">用户增长图 (Growth Chart Placeholder)</p>
        </div>
      </div>
    </div>
  );
}
