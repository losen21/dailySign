//logs.js
const util = require('../../utils/util.js')
const app = getApp()
const prop = app.globalData.Proportion
Page({
  data: {
    item: {},
    style0: true,
    style1: false,
    style2: false,
  },
  onLoad: function (options) {
    let data = JSON.parse(options.obj);
    let style = parseInt(options.style);
    this.setData({
      style0: style === 0 ? true : false,
      style1: style === 1 ? true : false,
      style2: style === 2 ? true : false,
      item: data
    });
    console.log(data)
  },
  saveSign: function(){
    let canvasId = ''
    if(this.data.style0) {
      canvasId = 'style0'
      this.drawStyle0()
    }
    if (this.data.style1) {
      canvasId = 'style1'
      this.drawStyle1()
    }
    if (this.data.style2) {
      canvasId = 'style2'
      this.drawStyle2()
    }
  },
  drawStyle0:function(){
    let data = this.data.item
    const ctx = wx.createCanvasContext('style0')

    ctx.setFontSize(prop*34)
    ctx.fillText(data.year+'年'+data.month+'月', prop*100, prop*152)
    ctx.fillText('农历' + data.chiMonth + data.chiDay, prop*100, prop*210)

    ctx.draw()
  },
  drawStyle1: function () {

  },
  drawStyle2: function () {

  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '每日一签',
      desc: '最具人气的签到小程序',
      path: '/page/detail',
      imgUrl: 'https://mobile.51wnl.com/temporary/dailysign/style3-choose-icon@2x.png',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
