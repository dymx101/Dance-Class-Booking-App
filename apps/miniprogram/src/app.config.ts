export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/schedule/index',
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'PLAN A Dance',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#f43f5e',
    backgroundColor: '#fff',
    borderStyle: 'black',
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
      }
    ]
  }
})
