import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClassTemplate, Teacher } from '../../types';
import { 
  Calendar, Plus, Pencil, Trash2, X, Clock, User, 
  ChevronRight, CalendarDays, Eye, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['周日 Sunday', '周一 Monday', '周二 Tuesday', '周三 Wednesday', '周四 Thursday', '周五 Friday', '周六 Saturday'];
const GENRES = ['hiphop', 'jazz', 'urban', 'contemporary', 'house', 'kpop', 'heels'];
const TYPES = ['group', 'private', 'series'];

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ScheduleManager() {
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ClassTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Omit<ClassTemplate, 'id'>>({
    title: '',
    genre: 'hiphop',
    dayofweek: 1,
    timestart: '19:00',
    timeend: '20:30',
    teacherid: '',
    difficulty: 3,
    classroom: 'A教室',
    minpeople: 1,
    maxcount: 20,
    type: 'group',
    isactive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [templatesRes, teachersRes] = await Promise.all([
        supabase.from('class_templates').select('*, teacher:teachers(*)').order('dayofweek').order('timestart'),
        supabase.from('teachers').select('*').order('name')
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setTemplates(templatesRes.data || []);
      setTeachers(teachersRes.data || []);
      
      if (teachersRes.data && teachersRes.data.length > 0 && !formData.teacherid) {
        setFormData(prev => ({ ...prev, teacherid: teachersRes.data[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (template?: ClassTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        genre: template.genre,
        dayofweek: template.dayofweek,
        timestart: template.timestart.substring(0, 5),
        timeend: template.timeend.substring(0, 5),
        teacherid: template.teacherid,
        difficulty: template.difficulty,
        classroom: template.classroom,
        minpeople: template.minpeople,
        maxcount: template.maxcount,
        type: template.type,
        isactive: template.isactive
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        genre: 'hiphop',
        dayofweek: 1,
        timestart: '19:00',
        timeend: '20:30',
        teacherid: teachers[0]?.id || '',
        difficulty: 3,
        classroom: 'A教室',
        minpeople: 1,
        maxcount: 20,
        type: 'group',
        isactive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.timestart >= formData.timeend) {
      setError("开始时间必须早于结束时间。 (Start time must be before end time.)");
      return;
    }

    try {
      setLoading(true);
      
      // Format times to HH:MM:SS for Postgres
      const payload = {
        ...formData,
        timestart: formData.timestart.length === 5 ? `${formData.timestart}:00` : formData.timestart,
        timeend: formData.timeend.length === 5 ? `${formData.timeend}:00` : formData.timeend
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('class_templates')
          .update(payload)
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('class_templates')
          .insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个排课模板吗？')) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('class_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (template: ClassTemplate) => {
    try {
      const { error } = await supabase
        .from('class_templates')
        .update({ isactive: !template.isactive })
        .eq('id', template.id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const syncInstances = async () => {
    try {
      setSyncLoading(true);
      setError(null);

      // 1. Calculate range: Today to +14 days
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13);
      endDate.setHours(23, 59, 59, 999);

      const startDateStr = getLocalDateString(startDate);
      const endDateStr = getLocalDateString(endDate);

      // 2. Fetch active templates
      const activeTemplates = templates.filter(t => t.isactive);
      if (activeTemplates.length === 0) {
        throw new Error("No active templates found to sync.");
      }

      // 3. Fetch existing instances in range
      const { data: existingInstances, error: fetchError } = await supabase
        .from('class_instances')
        .select('templateid, date')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (fetchError) throw fetchError;

      // 4. Generate missing instances
      const toCreate: any[] = [];
      const existingMap = new Set(existingInstances?.map(inst => `${inst.templateid}_${inst.date}`));

      for (let i = 0; i < 14; i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + i);
        const targetDateStr = getLocalDateString(targetDate);
        const dayofweek = targetDate.getDay();

        const dayTemplates = activeTemplates.filter(t => t.dayofweek === dayofweek);
        
        for (const template of dayTemplates) {
          if (!existingMap.has(`${template.id}_${targetDateStr}`)) {
            toCreate.push({
              templateid: template.id,
              date: targetDateStr,
              teacherid: template.teacherid,
              timestart: template.timestart,
              timeend: template.timeend,
              title: template.title,
              genre: template.genre,
              classroom: template.classroom,
              difficulty: template.difficulty,
              maxcount: template.maxcount,
              minpeople: template.minpeople,
              type: template.type,
              status: 'scheduled'
            });
          }
        }
      }

      if (toCreate.length === 0) {
        alert("Schedule is already up to date.");
        return;
      }

      // 5. Bulk insert
      const { error: insertError } = await supabase
        .from('class_instances')
        .insert(toCreate);

      if (insertError) throw insertError;

      alert(`Successfully synced ${toCreate.length} new sessions to the live schedule!`);
      setIsPreviewOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const groupedTemplates = Array.from({ length: 7 }, (_, i) => {
    return templates.filter(t => t.dayofweek === i);
  });

  const getPreviewData = () => {
    const today = new Date();
    const preview = [];
    
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayofweek = currentDate.getDay();
      const dateStr = getLocalDateString(currentDate);
      
      const dayTemplates = templates.filter(t => t.dayofweek === dayofweek && t.isactive);
      preview.push({
        date: dateStr,
        dayName: DAYS[dayofweek],
        classes: dayTemplates
      });
    }
    return preview;
  };

  if (loading && templates.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Schedule...</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">排课模板 <span className="text-rose-500">{templates.length}</span></h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">Weekly Recurring Schedule Management</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => syncInstances()}
            disabled={syncLoading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {syncLoading ? (
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}
            <span>{syncLoading ? 'Syncing...' : 'Sync to Live'}</span>
          </button>
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 transition-all shadow-sm active:scale-95"
          >
            <Eye className="w-5 h-5" />
            <span>发布预览</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>添加模板</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">Error: {error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-black hover:text-rose-800">✕</button>
        </div>
      )}

      {/* Week Grid */}
      <div className="space-y-6">
        {groupedTemplates.map((dayTemplates, dayIdx) => (
          <div key={dayIdx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">{DAYS[dayIdx]}</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                {dayTemplates.length} Classes
              </span>
            </div>
            
            <div className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {dayTemplates.length > 0 ? (
                  dayTemplates.map((template) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={template.id} 
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors group"
                    >
                      <div className="flex items-start space-x-6">
                        <div className="pt-1">
                          <div className="text-lg font-black text-slate-900 leading-none mb-1">
                            {template.timestart.substring(0, 5)}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            - {template.timeend.substring(0, 5)}
                          </div>
                        </div>
                        
                        <div className="w-1.5 h-12 bg-slate-100 rounded-full group-hover:bg-rose-200 transition-colors"></div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-slate-900 text-lg tracking-tight uppercase">{template.title}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              template.genre === 'hiphop' ? 'bg-indigo-50 text-indigo-600' :
                              template.genre === 'jazz' ? 'bg-rose-50 text-rose-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              {template.genre}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span>{template.teacher?.name || 'Unknown Teacher'}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <CalendarDays className="w-3.5 h-3.5" />
                              <span>{template.classroom}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end md:self-center">
                        <button 
                          onClick={() => toggleStatus(template)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            template.isactive 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {template.isactive ? 'Active' : 'Disabled'}
                        </button>
                        <button 
                          onClick={() => handleOpenModal(template)}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(template.id)}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic"
                  >
                    No templates configured for this day.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingTemplate ? '编辑排课模板' : '添加排课模板'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Template Rule Configuration
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">课程标题 Class Title</label>
                    <input 
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="例如: Jazz Funk 初级入门"
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">舞种 Genre</label>
                    <select 
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none"
                    >
                      {GENRES.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">课程类型 Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none"
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">重复日期 Day of Week</label>
                    <select 
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none"
                    >
                      {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">任课教师 Teacher</label>
                    <select 
                      required
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none"
                    >
                      <option value="" disabled>选择教师...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">开始时间 Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="time"
                        value={formData.timeStart}
                        onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">结束时间 End Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="time"
                        value={formData.timeEnd}
                        onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">授课教室 Classroom</label>
                    <input 
                      required
                      type="text"
                      value={formData.classroom}
                      onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">难度系数 Difficulty (1-5)</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      max="5"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">最少人数 Min People</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={formData.minPeople}
                      onChange={(e) => setFormData({ ...formData, minPeople: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">最大人数 Max Capacity</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={formData.maxCount}
                      onChange={(e) => setFormData({ ...formData, maxCount: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex space-x-4 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all active:scale-95"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? '正在保存...' : '保存模板信息'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#F8FAFC] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                    <Eye className="w-6 h-6 mr-3 text-rose-500" />
                    发布预览 Preview (Next 14 Days)
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Verify generated instances before synchronization
                  </p>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight">智能排课确认</h4>
                    <p className="text-xs font-bold text-amber-700/70 mt-1 leading-relaxed">
                      以下是基于当前“活跃”状态的排课模板，系统将为您自动生成的未来一周课程实例。确认无误后，点击右下角按钮即可发布。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPreviewData().map((day, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-5 bg-slate-50/50 border-b border-slate-50">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{day.date}</div>
                        <h5 className="font-black text-slate-900 uppercase tracking-tight">{day.dayName}</h5>
                      </div>
                      <div className="p-4 flex-1 space-y-3">
                        {day.classes.length > 0 ? (
                          day.classes.map(c => (
                            <div key={c.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                              <div className="text-[10px] font-black text-slate-900">{c.timeStart.substring(0, 5)}</div>
                              <div className="w-px h-4 bg-slate-200"></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-black text-slate-900 truncate uppercase">{c.title}</div>
                                <div className="text-[9px] font-bold text-slate-400 truncate">{c.teacher?.name}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                            No classes
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total generated instances: <span className="text-rose-500 font-black">{getPreviewData().reduce((acc, d) => acc + d.classes.length, 0)}</span>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95"
                  >
                    关闭预览
                  </button>
                  <button 
                    onClick={() => syncInstances()}
                    disabled={syncLoading}
                    className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {syncLoading ? '正在同步...' : '立即发布排课'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
