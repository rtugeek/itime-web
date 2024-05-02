import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: '修改成你的信息',
  description: {
    'zh-CN': '修改成你的组件描述',
  },
  entry: '',
  hash: true,
  remote: {
    base: '/itime',
    hostname: 'widgetjs.cn',
  },
  homepage: '',
  name: 'com.wisdom.itime',
  title: {
    'zh-CN': '修改成你的组件标题',
  },
  version: '1.0.0',
  devOptions: {
    folder: './src/widgets/',
    devUrl: 'http://localhost:5173/itime',
    remoteEntry: 'http://localhost:5173/itime',
  },
})
