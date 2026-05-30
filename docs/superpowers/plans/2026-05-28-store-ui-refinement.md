# Store UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Mini Program Store page UI to match the theme of Home/Schedule, add loading/empty states, and fetch real user pass balance.

**Architecture:** Use `getSupabase` for data fetching. Standardize background color and text styles for a light theme. Implement a `loading` state to manage asynchronous data fetching.

**Tech Stack:** React, Taro, Supabase, @dance-app/shared

---

### Task 1: Update Store Page Logic

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.tsx`

- [ ] **Step 1: Update imports and state**

Replace `import { supabase } from '../../lib/supabase'` with `import { getSupabase } from '@dance-app/shared'`.
Add `loading` state.

```tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PAYMENT_CARDS, PaymentCard, getSupabase } from '@dance-app/shared'
import './index.css'

export default function Store() {
  const [dbCards, setDbCards] = useState<PaymentCard[]>([])
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null)
  const [userPasses, setUserPasses] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabase()
  // ...
```

- [ ] **Step 2: Update `useEffect` to fetch real data**

Fetch cards and user profile.

```tsx
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('payment_cards')
          .select('*')
          .order('price', { ascending: true })
        
        if (cardsError) {
          console.error('Error fetching cards:', cardsError)
          setDbCards(PAYMENT_CARDS)
        } else if (cardsData && cardsData.length > 0) {
          setDbCards(cardsData as PaymentCard[])
        } else {
          setDbCards(PAYMENT_CARDS)
        }

        // Fetch user passes
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('remainingpasses')
            .eq('id', user.id)
            .single()
          
          if (!userError && userData) {
            setUserPasses(userData.remainingpasses || 0)
          }
        }
      } catch (err) {
        console.error('Fetch data exception:', err)
        setDbCards(PAYMENT_CARDS)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
```

- [ ] **Step 3: Update render method with loading and empty states**

```tsx
  return (
    <View className='store-container'>
      <ScrollView scrollY className='store-scroll'>
        {/* Header */}
        <View className='header'>
          <View className='header-titles'>
            <Text className='page-title'>充值购卡</Text>
            <Text className='page-subtitle'>PLANA DANCE PASSES CENTER</Text>
          </View>
          <View className='user-passes-box'>
            <Text className='passes-label'>可用课充点</Text>
            <View className='passes-value-badge'>
              <Text className='passes-value'>{userPasses} 次</Text>
            </View>
          </View>
        </View>

        {/* Promo Banner */}
        <View className='promo-banner'>
          <Text className='promo-icon'>✨</Text>
          <View className='promo-content'>
            <Text className='promo-title'>新会员特惠福利大放送</Text>
            <Text className='promo-desc'>首次注册即可在结账页享受首单 ¥15 OFF 现金立减扣减。</Text>
          </View>
        </View>

        {/* Section Title */}
        <View className='section-header'>
          <Text className='section-title'>自修团课次卡/会员通卡 / Memberships</Text>
        </View>

        {/* Cards Grid */}
        <View className='cards-grid'>
          {loading ? (
            <View className='loading-box'><Text>加载中...</Text></View>
          ) : dbCards.length === 0 ? (
            <View className='empty-box'><Text>暂无充值项</Text></View>
          ) : (
            dbCards.map((card) => (
              <View key={card.id} className='card-item' onClick={() => handleBuy(card)}>
                {card.badge && (
                  <View className='card-badge'>
                    <Text className='card-badge-text'>{card.badge}</Text>
                  </View>
                )}
                <View className='card-body'>
                  <Text className='card-title'>{card.title}</Text>
                  <Text className='card-expiry'>
                    有效期: {card.validDays} 天 • {card.passes === -1 ? '无限次通卡' : `共 ${card.passes} 课时`}
                  </Text>
                  <Text className='card-desc'>{card.description}</Text>
                </View>

                <View className='card-footer'>
                  <View className='price-box'>
                    <Text className='price-currency'>¥</Text>
                    <Text className='price-amount'>{card.price}</Text>
                    {card.originalPrice && (
                      <Text className='price-original'>¥{card.originalPrice}</Text>
                    )}
                  </View>
                  <View className='buy-action'>
                    <Text className='buy-text'>去充值</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Safety Info */}
        {/* ... (keep as is) ... */}
```

### Task 2: Update Store Page Styles

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.css`

- [ ] **Step 1: Update container and header styles**

```css
.store-container {
  height: 100vh;
  background-color: #FAF8F5;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* ... update .page-title, .page-subtitle ... */
.page-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #0f172a;
  display: block;
}

.page-subtitle {
  font-size: 18rpx;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-top: 8rpx;
  display: block;
}
```

- [ ] **Step 2: Update card and banner styles**

```css
.card-item {
  background-color: #fff;
  border: 1rpx solid #f1f5f9;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 32rpx;
  position: relative;
  overflow: hidden;
}

.card-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
  display: block;
}

.price-currency, .price-amount {
  color: #0f172a;
}

.buy-action {
  background-color: #0f172a;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
}

.buy-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 900;
}
```

- [ ] **Step 3: Add loading and empty box styles**

```css
.loading-box, .empty-box {
  padding: 100rpx 0;
  text-align: center;
  color: #94a3b8;
  font-size: 24rpx;
  font-weight: 900;
}
```

- [ ] **Step 4: Update Modal and other elements to match**

Update `.modal-content` background to `#fff`, text colors to dark.

### Task 3: Commit

- [ ] **Step 1: Add and commit changes**

Run: `git add apps/miniprogram/src/pages/store/`
Run: `git commit --amend --no-edit`
