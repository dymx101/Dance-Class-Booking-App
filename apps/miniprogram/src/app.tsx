import { PropsWithChildren, useEffect } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { wechatLogin, getSupabase } from '@dance-app/shared'
import './app.css'

// Initialize Supabase in Mini Program
// Note: These would normally come from a config file or process.env
getSupabase({
  url: 'https://your-supabase-url.supabase.co',
  anonKey: 'your-anon-key'
});

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
    handleSilentLogin()
  })

  const handleSilentLogin = async () => {
    try {
      const { code } = await Taro.login()
      console.log('WeChat Login Code:', code)
      
      const { data, error } = await wechatLogin(code)
      if (error) {
        console.error('Silent login failed:', error)
      } else {
        console.log('Silent login successful:', data)
      }
    } catch (err) {
      console.error('WeChat login error:', err)
    }
  }

  return children
}

export default App
