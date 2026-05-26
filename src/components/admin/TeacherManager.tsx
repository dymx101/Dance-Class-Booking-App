import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Teacher } from '../../types';
import { User, Plus, Pencil, Trash2, X, Star, Tag, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + crypto.randomUUID(),
    tags: [],
    rating: 5.0,
    description: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        avatar: teacher.avatar,
        tags: teacher.tags,
        rating: teacher.rating,
        description: teacher.description
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + crypto.randomUUID(),
        tags: [],
        rating: 5.0,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingTeacher) {
        const { error } = await supabase
          .from('teachers')
          .update(formData)
          .eq('id', editingTeacher.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这位教师吗？')) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchTeachers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  if (loading && teachers.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Teachers...</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">教师库 <span className="text-rose-500">{teachers.length}</span></h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">Teacher Management System</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>添加教师</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center space-x-3">
          <X className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">Error: {error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-black hover:text-rose-800">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <motion.div 
            layout
            key={teacher.id} 
            className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-rose-100 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background Decorative element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="w-20 h-20 rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner border-2 border-white">
                  <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenModal(teacher)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">{teacher.name}</h3>
                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-700">{teacher.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                {teacher.tags && teacher.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {teacher.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-slate-400 font-bold leading-relaxed line-clamp-3 uppercase tracking-tight">
                  {teacher.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {teachers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">暂无教师数据</p>
            <button 
              onClick={() => handleOpenModal()}
              className="mt-4 text-rose-500 font-black text-xs hover:underline uppercase"
            >
              立即添加第一位教师
            </button>
          </div>
        )}
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
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingTeacher ? '编辑教师信息' : '添加新教师'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Teacher Profile Configuration
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
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-slate-50 group-hover:border-rose-100 transition-colors">
                      <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + crypto.randomUUID() })}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-rose-500 transition-all"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">教师姓名 Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如: 艾比老师"
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">评分 Rating (1-5)</label>
                    <div className="relative">
                      <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        required
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">头像地址 Avatar URL</label>
                    <input 
                      required
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-[10px] font-mono font-bold text-slate-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">擅长风格 Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="flex items-center space-x-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-800">✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="输入风格并回车 (如: Jazz)"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={addTag}
                      className="px-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">个人简介 Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="介绍一下这位教师..."
                    className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"
                  ></textarea>
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
                    {loading ? '正在保存...' : '保存教师信息'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
