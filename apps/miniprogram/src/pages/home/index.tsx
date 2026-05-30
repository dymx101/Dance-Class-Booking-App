import React, { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { useLoad, navigateTo, switchTab } from '@tarojs/taro'
import { MOCK_BANNERS, TEACHERS, MOCK_NOTICES, MOCK_VIDEOS, Teacher } from '@dance-app/shared'
import './index.css'

export default function Home() {
  const [bannerIndex, setBannerIndex] = useState(0)
  const [noticeIndex, setNoticeIndex] = useState(0)

  // Use simple theme for now
  const theme = 'vibrant-light'
  const isDark = theme === 'midnight-cyber'
  
  const bgClass = isDark ? 'bg-dark' : 'bg-light'
  const textTitleClass = isDark ? 'text-white' : 'text-slate-900'

  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % MOCK_NOTICES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSuggestTab = (tabName: string) => {
    if (tabName === 'schedule') {
      switchTab({ url: '/pages/schedule/index' })
    }
  }

  return (
    <ScrollView scrollY className={`home-container ${bgClass}`}>
      {/* Header */}
      <View className='header'>
        <View className='header-left'>
          <View className='logo-box'>
            <View className='logo-inner'></View>
          </View>
          <View>
            <Text className={`studio-name ${textTitleClass}`}>PLANA DANCE</Text>
            <Text className='studio-slogan'>CRAFT YOUR RHYTHM • SUMMER CAMP</Text>
          </View>
        </View>
        <View className='header-right'>
          <Text className='badge'>热度 9.8k ★</Text>
        </View>
      </View>

      {/* Banner */}
      <View className='banner-container'>
        <Swiper
          className='banner-swiper'
          circular
          autoplay
          interval={4500}
          onChange={(e) => setBannerIndex(e.detail.current)}
        >
          {MOCK_BANNERS.map((banner, index) => (
            <SwiperItem key={index}>
              <Image src={banner.image} className='banner-image' mode='aspectFill' />
              <View className='banner-content'>
                <Text className='banner-tag'>STUDIO CAMPUS</Text>
                <Text className='banner-title'>{banner.title}</Text>
                <Text className='banner-subtitle'>{banner.subtitle}</Text>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* Notice */}
      <View className='notice-board'>
        <Text className='notice-icon'>📢</Text>
        <Text className='notice-text'>{MOCK_NOTICES[noticeIndex]}</Text>
      </View>

      {/* Shortcuts */}
      <View className='shortcuts-grid'>
        <View className='shortcut-card' onClick={() => handleSuggestTab('schedule')}>
          <View className='shortcut-icon-box pink'>
            <Text>🏆</Text>
          </View>
          <Text className='shortcut-title'>预约排课</Text>
          <Text className='shortcut-desc'>每日精品大课</Text>
        </View>
        <View className='shortcut-card'>
          <View className='shortcut-icon-box purple'>
            <Text>🔥</Text>
          </View>
          <Text className='shortcut-title'>特惠商城</Text>
          <Text className='shortcut-desc'>超值次卡通卡</Text>
        </View>
        <View className='shortcut-card'>
          <View className='shortcut-icon-box amber'>
            <Text>▶️</Text>
          </View>
          <Text className='shortcut-title'>我的课表</Text>
          <Text className='shortcut-desc'>剩余课点进度</Text>
        </View>
      </View>

      {/* Teachers */}
      <View className='section-header'>
        <Text className='section-title'>明星舞者导师 / TEAM</Text>
      </View>
      <ScrollView scrollX className='teachers-scroll'>
        <View className='teachers-list'>
          {TEACHERS.map((teacher) => (
            <View key={teacher.id} className='teacher-card'>
              <Image src={teacher.avatar} className='teacher-avatar' mode='aspectFill' />
              <Text className='teacher-name'>{teacher.name}</Text>
              <Text className='teacher-tag'>{teacher.tags[0].split(' ')[0]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className='footer'>
        <View className='contact-card'>
          <Text className='contact-title'>📍 门店资讯 / CONTACT US</Text>
          <View className='contact-row'>
            <Text className='contact-label'>地址 / ADDRESS</Text>
            <Text className='contact-value'>北京市朝阳区三里屯世茂工三 A座3层302室</Text>
          </View>
          <View className='contact-row'>
            <Text className='contact-label'>电话 / PHONE</Text>
            <Text className='contact-value'>138-0000-5142</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
