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
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserPasses = async () => {
    try {
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
      console.error('Error fetching user passes:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch Cards
        const { data: cards, error: cardsError } = await supabase
          .from('payment_cards')
          .select('*')
          .order('price', { ascending: true })
        
        if (cardsError) {
          console.error('Error fetching cards:', cardsError)
          setDbCards(PAYMENT_CARDS)
        } else if (cards && cards.length > 0) {
          setDbCards(cards as PaymentCard[])
        } else {
          setDbCards(PAYMENT_CARDS)
        }

        // Fetch User Passes
        await fetchUserPasses()
      } catch (err) {
        console.error('Fetch data exception:', err)
        setDbCards(PAYMENT_CARDS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleBuy = (card: PaymentCard) => {
    setSelectedCard(card)
  }

  const handleConfirmPayment = async () => {
    if (!selectedCard) return
    setIsProcessing(true)
    
    try {
      // 1. Create order and get signed parameters from Edge Function
      const { data, error } = await supabase.functions.invoke('create-wechat-order', {
        body: { card_id: selectedCard.id }
      })

      if (error) throw error
      if (!data || !data.timeStamp) {
        throw new Error('支付参数获取失败')
      }

      // 2. Invoke native WeChat Pay
      const paymentParams = {
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
      }
      await Taro.requestPayment(paymentParams)

      // 3. Handle Success
      Taro.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      })
      
      setSelectedCard(null)
      // Sync balance after successful payment
      await fetchUserPasses()

    } catch (err: any) {
      console.error('Payment error:', err)
      
      // Handle User Cancel or specific error
      const errorMsg = err.errMsg && err.errMsg.includes('cancel') 
        ? '支付取消' 
        : (err.message || '支付失败')

      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <View className='store-container loading-state'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载商城中...</Text>
      </View>
    )
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
          {dbCards.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-icon'>📦</Text>
              <Text className='empty-text'>暂无可选卡项</Text>
            </View>
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
                    有效期: {card.validdays} 天 • {card.passes === -1 ? '无限次通卡' : `共 ${card.passes} 课时`}
                  </Text>
                  <Text className='card-desc'>{card.description}</Text>
                </View>

                <View className='card-footer'>
                  <View className='price-box'>
                    <Text className='price-currency'>¥</Text>
                    <Text className='price-amount'>{card.price}</Text>
                    {card.originalprice && (
                      <Text className='price-original'>¥{card.originalprice}</Text>
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
                    {selectedCard.passes === -1 ? '无限次' : `${selectedCard.passes} 次`} • 效期 {selectedCard.validdays} 天
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
