# Native Store Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-fidelity native Store page for the Mini Program with membership card purchasing.

**Architecture:** Use Taro components for cross-platform compatibility, fetch membership card data from Supabase, and implement a high-contrast design using custom CSS.

**Tech Stack:** Taro (React), TypeScript, Supabase, CSS.

---

### Task 1: Update Store Page Component

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.tsx`

- [ ] **Step 1: Overwrite `index.tsx` with refined UI and Supabase integration**

```tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PAYMENT_CARDS, PaymentCard } from '@dance-app/shared'
import { supabase } from '../../lib/supabase'
import './index.css'

export default function Store() {
  const [dbCards, setDbCards] = useState<PaymentCard[]>([])
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null)
  const [userPasses, setUserPasses] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_cards')
          .select('*')
          .order('price', { ascending: true })
        
        if (error) {
          console.error('Error fetching cards:', error)
          setDbCards(PAYMENT_CARDS)
        } else if (data && data.length > 0) {
          setDbCards(data as PaymentCard[])
        } else {
          setDbCards(PAYMENT_CARDS)
        }
      } catch (err) {
        console.error('Fetch cards exception:', err)
        setDbCards(PAYMENT_CARDS)
      }
    }
    fetchCards()

    // Mock fetching user passes
    setUserPasses(3)
  }, [])

  const handleBuy = (card: PaymentCard) => {
    setSelectedCard(card)
  }

  const handleConfirmPayment = async () => {
    if (!selectedCard) return
    setIsProcessing(true)
    
    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false)
      setSelectedCard(null)
      Taro.showToast({ title: '支付功能开发中', icon: 'none' })
    }, 1500)
  }

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
          {dbCards.map((card) => (
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
          ))}
        </View>

        {/* Safety Info */}
        <View className='safety-card'>
          <View className='safety-header'>
            <Text className='safety-header-icon'>🛡️</Text>
            <Text className='safety-header-title'>PLANA 购课安全保障细则</Text>
          </View>
          <View className='safety-body'>
            <Text className='safety-item'>• 7天退包保障: 未消课均可申请退款。</Text>
            <Text className='safety-item'>• 自动冻结延期: 支持14天临时冻结。</Text>
          </View>
        </View>
        
        <View className='footer-spacer' />
      </ScrollView>

      {/* Checkout Modal Sheet */}
      {selectedCard && (
        <View className='modal-mask' onClick={() => setSelectedCard(null)}>
          <View className='modal-content' onClick={(e) => e.stopPropagation()}>
            <View className='modal-handle' />
            <View className='modal-header'>
              <Text className='modal-header-tag'>PLANA SECURE CHECKOUT</Text>
              <Text className='modal-header-title'>确认购卡项目</Text>
            </View>

            <View className='checkout-details'>
              <View className='checkout-card'>
                <View className='checkout-card-info'>
                  <Text className='checkout-card-title'>{selectedCard.title}</Text>
                  <Text className='checkout-card-meta'>
                    {selectedCard.passes === -1 ? '无限次' : `${selectedCard.passes} 次`} • 效期 {selectedCard.validDays} 天
                  </Text>
                </View>
                <Text className='checkout-card-price'>¥{selectedCard.price}</Text>
              </View>

              <View className='summary-box'>
                <View className='summary-row'>
                  <Text className='summary-label'>单品价格:</Text>
                  <Text className='summary-value'>¥{selectedCard.price}</Text>
                </View>
                <View className='summary-row total'>
                  <Text className='summary-label-total'>总计应付:</Text>
                  <Text className='summary-value-total'>¥{selectedCard.price}</Text>
                </View>
              </View>
            </View>

            <View className='payment-section'>
              <Text className='payment-title'>支付方式</Text>
              <View className='payment-method-item'>
                <Text className='payment-method-icon'>🧧</Text>
                <Text className='payment-method-name'>微信支付</Text>
                <View className='payment-method-check'>✓</View>
              </View>
            </View>

            <View className='modal-actions'>
              <Button 
                className='confirm-btn' 
                loading={isProcessing}
                onClick={handleConfirmPayment}
              >
                {isProcessing ? '处理中...' : `确认支付 ¥${selectedCard.price}`}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
```

### Task 2: Create Store Page Styles

**Files:**
- Create: `apps/miniprogram/src/pages/store/index.css`

- [ ] **Step 1: Write high-contrast "PLAN A" CSS**

```css
.store-container {
  height: 100vh;
  background-color: #0f172a; /* slate-900 */
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.store-scroll {
  height: 100%;
}

.header {
  padding: 40rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.page-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #fff;
  display: block;
}

.page-subtitle {
  font-size: 18rpx;
  color: #64748b; /* slate-500 */
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-top: 8rpx;
  display: block;
}

.user-passes-box {
  text-align: right;
}

.passes-label {
  font-size: 18rpx;
  color: #94a3b8; /* slate-400 */
  font-weight: 900;
  display: block;
}

.passes-value-badge {
  background-color: rgba(244, 63, 94, 0.1); /* rose-500/10 */
  border: 1rpx solid rgba(244, 63, 94, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  margin-top: 8rpx;
  display: inline-block;
}

.passes-value {
  font-size: 24rpx;
  color: #f43f5e; /* rose-500 */
  font-weight: 900;
  font-family: monospace;
}

.promo-banner {
  margin: 32rpx;
  background: linear-gradient(to right, rgba(244, 63, 94, 0.05), rgba(244, 63, 94, 0.1));
  border: 1rpx solid rgba(244, 63, 94, 0.2);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: flex-start;
}

.promo-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.promo-title {
  font-size: 24rpx;
  font-weight: 800;
  color: #fff;
  display: block;
}

.promo-desc {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
  line-height: 1.4;
}

.section-header {
  padding: 20rpx 32rpx;
}

.section-title {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
}

.cards-grid {
  padding: 0 32rpx;
}

.card-item {
  background-color: #1e293b; /* slate-800 */
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 32rpx;
  position: relative;
  overflow: hidden;
}

.card-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f43f5e;
  padding: 4rpx 16rpx;
  border-bottom-left-radius: 16rpx;
}

.card-badge-text {
  font-size: 16rpx;
  color: #fff;
  font-weight: 900;
}

.card-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #fff;
  display: block;
}

.card-expiry {
  font-size: 20rpx;
  color: #f43f5e;
  font-weight: 700;
  margin-top: 8rpx;
  display: block;
}

.card-desc {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 12rpx;
  display: block;
  line-height: 1.4;
}

.card-footer {
  margin-top: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price-box {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 20rpx;
  font-weight: 800;
  color: #fff;
  margin-right: 4rpx;
}

.price-amount {
  font-size: 40rpx;
  font-weight: 900;
  color: #fff;
}

.price-original {
  font-size: 20rpx;
  color: #475569;
  text-decoration: line-through;
  margin-left: 12rpx;
  font-weight: 600;
}

.buy-action {
  background-color: #fff;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
}

.buy-text {
  font-size: 22rpx;
  color: #000;
  font-weight: 900;
}

.safety-card {
  margin: 40rpx 32rpx;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.03);
  border-radius: 24rpx;
  padding: 32rpx;
}

.safety-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.safety-header-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.safety-header-title {
  font-size: 22rpx;
  font-weight: 800;
  color: #fff;
}

.safety-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.safety-item {
  font-size: 18rpx;
  color: #64748b;
  font-weight: 500;
}

.footer-spacer {
  height: 60rpx;
}

/* Modal Styles */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.modal-content {
  background-color: #0f172a;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  padding: 40rpx;
  padding-bottom: 80rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.modal-handle {
  width: 60rpx;
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  margin: 0 auto 40rpx;
}

.modal-header-tag {
  font-size: 16rpx;
  color: #64748b;
  font-weight: 900;
  letter-spacing: 2rpx;
  display: block;
}

.modal-header-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #fff;
  margin-top: 12rpx;
  display: block;
}

.checkout-details {
  margin-top: 40rpx;
}

.checkout-card {
  background-color: #1e293b;
  padding: 32rpx;
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkout-card-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #fff;
  display: block;
}

.checkout-card-meta {
  font-size: 18rpx;
  color: #94a3b8;
  margin-top: 4rpx;
  display: block;
}

.checkout-card-price {
  font-size: 28rpx;
  font-weight: 900;
  color: #fff;
}

.summary-box {
  margin-top: 32rpx;
  padding: 0 12rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.summary-label {
  font-size: 20rpx;
  color: #64748b;
}

.summary-value {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
}

.summary-row.total {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
}

.summary-label-total {
  font-size: 24rpx;
  font-weight: 800;
  color: #fff;
}

.summary-value-total {
  font-size: 32rpx;
  font-weight: 900;
  color: #f43f5e;
}

.payment-section {
  margin-top: 48rpx;
}

.payment-title {
  font-size: 20rpx;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 24rpx;
  display: block;
}

.payment-method-item {
  background-color: #1e293b;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(244, 63, 94, 0.3);
}

.payment-method-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.payment-method-name {
  font-size: 24rpx;
  font-weight: 800;
  color: #fff;
  flex: 1;
}

.payment-method-check {
  font-size: 24rpx;
  color: #f43f5e;
  font-weight: 900;
}

.modal-actions {
  margin-top: 48rpx;
}

.confirm-btn {
  background-color: #f43f5e !important;
  color: #fff !important;
  font-weight: 900 !important;
  font-size: 28rpx !important;
  height: 90rpx !important;
  line-height: 90rpx !important;
  border-radius: 45rpx !important;
  border: none !important;
}
```

### Task 3: Update App Config

**Files:**
- Modify: `apps/miniprogram/src/app.config.ts`

- [ ] **Step 1: Register Store page and add to TabBar**

```ts
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/schedule/index',
    'pages/store/index', // Add this
    'pages/index/index'
  ],
  // ... rest of config
  tabBar: {
    // ...
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '预约',
        iconPath: 'assets/schedule.png',
        selectedIconPath: 'assets/schedule-active.png'
      },
      { // Add this
        pagePath: 'pages/store/index',
        text: '购卡',
        iconPath: 'assets/store.png',
        selectedIconPath: 'assets/store-active.png'
      }
    ]
  }
})
```

### Task 4: Commit Changes

- [ ] **Step 1: Stage and commit**

```bash
git add apps/miniprogram/src/pages/store/ apps/miniprogram/src/app.config.ts
git commit -m "feat(mp): add native store page for membership cards"
```
