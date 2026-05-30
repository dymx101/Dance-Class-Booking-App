import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Image, ScrollView, Switch } from '@tarojs/components'
import { useLoad, showToast } from '@tarojs/taro'
import { DanceClass, getSupabase } from '@dance-app/shared'
import './index.css'

export default function Schedule() {
  const [classes, setClasses] = useState<DanceClass[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('2026-05-25')
  const [onlyBookable, setOnlyBookable] = useState(false)

  const supabase = getSupabase()

  useLoad(() => {
    fetchClasses()
  })

  async function fetchClasses() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('class_instances')
        .select('*, teacher:teachers(*)')
        .order('timestart', { ascending: true })

      if (error) throw error
      setClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
      showToast({ title: '加载失败', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (cls.date !== selectedDate) return false
      if (onlyBookable && cls.bookedcount >= cls.maxcount) return false
      return true
    })
  }, [classes, selectedDate, onlyBookable])

  const dates = useMemo(() => {
    return [
      { name: '周日', date: '2026-05-25', day: '25' },
      { name: '周一', date: '2026-05-26', day: '26' },
      { name: '周二', date: '2026-05-27', day: '27' },
      { name: '周三', date: '2026-05-28', day: '28' },
      { name: '周四', date: '2026-05-29', day: '29' },
      { name: '周五', date: '2026-05-30', day: '30' },
    ]
  }, [])

  return (
    <View className='schedule-container'>
      {/* Date Selector */}
      <ScrollView scrollX className='date-scroll'>
        <View className='date-list'>
          {dates.map((item) => (
            <View
              key={item.date}
              className={`date-item ${selectedDate === item.date ? 'active' : ''}`}
              onClick={() => setSelectedDate(item.date)}
            >
              <Text className='date-name'>{item.name}</Text>
              <Text className='date-day'>{item.day}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Filter */}
      <View className='filter-bar'>
        <Text className='filter-label'>只看可约</Text>
        <Switch
          color='#f43f5e'
          checked={onlyBookable}
          onChange={(e) => setOnlyBookable(e.detail.value)}
        />
      </View>

      {/* Class List */}
      <ScrollView scrollY className='class-scroll'>
        {loading ? (
          <View className='loading-box'><Text>加载中...</Text></View>
        ) : filteredClasses.length === 0 ? (
          <View className='empty-box'><Text>暂无课程</Text></View>
        ) : (
          filteredClasses.map((cls) => (
            <View key={cls.id} className='class-card'>
              <View className='class-time'>
                <Text className='time-text'>{cls.timestart} - {cls.timeend}</Text>
                <Text className='genre-text'>{cls.genre}</Text>
              </View>
              <View className='class-body'>
                <Image src={cls.teacher?.avatar} className='teacher-avatar' mode='aspectFill' />
                <View className='class-info'>
                  <Text className='class-title'>{cls.title}</Text>
                  <Text className='teacher-name'>{cls.teacher?.name}</Text>
                  <Text className='class-meta'>{cls.classroom} • {cls.bookedcount}/{cls.maxcount}人</Text>
                </View>
                <View className='class-action'>
                  <View className='book-btn'>
                    <Text>预约</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
