import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  bio: string | null;
  created_at: string;
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="flex items-center justify-center h-64 font-bold text-slate-400">Loading teachers...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">教师库 ({teachers.length})</h2>
        <button 
          onClick={() => fetchTeachers()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
        >
          刷新列表
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-lg">{teacher.name}</h3>
                <div className="mt-2 space-y-1">
                  {teacher.email && (
                    <div className="flex items-center text-xs text-slate-500 font-bold">
                      <Mail className="w-3 h-3 mr-2" />
                      {teacher.email}
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center text-xs text-slate-500 font-bold">
                      <Phone className="w-3 h-3 mr-2" />
                      {teacher.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {teacher.specialties && teacher.specialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.specialties.map((spec, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {teacher.bio && (
              <p className="mt-4 text-xs text-slate-500 font-medium line-clamp-2">
                {teacher.bio}
              </p>
            )}
          </div>
        ))}
        
        {teachers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">暂无教师数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
