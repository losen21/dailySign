//app.js

import { ToastPannel } from './pages/toast/toast.js'

App({
  onLaunch: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        console.log(res.system.split(' ')[0] + '系统' )
        console.log('设备像素比：' + res.pixelRatio)
        that.globalData.Proportion = res.windowWidth / 750
        that.globalData.system = res.system.split(' ')[0]
        that.globalData.brand = res.brand
      }
    })
    // console.log(this.data.Proportion)
  },
  globalData: {
    currentStyle: 0,
    Proportion: 0,
    system: '',
    brand: ''
  },
  ToastPannel
})