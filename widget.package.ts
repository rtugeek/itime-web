import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: 'Wisdom LTD',
  description: {
    'zh-CN': '倒计时、纪念日、生日、日程管理，您的时间助理',
    'en-US': 'Countdowns, anniversaries, birthdays, and schedule management—your personal time assistant.',
  },
  remoteEntry: 'https://itime.fun/web',
  remotePackage: 'https://itime.fun/web/widget.json',
  hash: true,
  icon: '/favicon-96x96.png',
  remote: {
    entry: 'https://itime.fun/web',
    base: '/web',
    hostname: 'itime.fun',
  },
  homepage: '',
  name: 'itime.fun',
  title: {
    'zh-CN': 'iTime',
    'en-US': 'iTime',
  },
  devOptions: {
    folder: './src/widgets/',
    devUrl: 'http://localhost:5173/web',
    remoteEntry: 'http://localhost:5173/web',
  },
})
