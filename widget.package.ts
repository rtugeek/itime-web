import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: 'Wisdom LTD',
  description: {
    'zh-CN': '修改成你的组件描述',
  },
  remoteEntry: 'https://itime.fun/web',
  remotePackage: 'https://itime.fun/web/widget.json',
  hash: true,
  remote: {
    entry: 'https://itime.fun/web',
    base: '/web',
    hostname: 'itime.fun',
  },
  homepage: '',
  name: 'itime.fun',
  title: {
    'zh-CN': 'iTime',
  },
  devOptions: {
    folder: './src/widgets/',
    devUrl: 'http://localhost:5173/web',
    remoteEntry: 'http://localhost:5173/web',
  },
})
