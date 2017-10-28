//logs.js
const util = require('../../utils/util.js')
const app = getApp()
const prop = app.globalData.Proportion
const system = app.globalData.system
Page({
  data: {
    item: [],
    style0: true,
    style1: false,
    style2: false,
  },
  onLoad: function (options) {
    // 初始化toast
    new app.ToastPannel();

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
  // 保存图片
  saveSign: function () {
    let canvasId = ''
    let that = this
    if (this.data.style0) {
      canvasId = 'style0'
      this.drawStyle0()
      setTimeout(function () {
        that.saveImage('style0')
      }, 1500)
    }
    if (this.data.style1) {
      canvasId = 'style1'
      this.drawStyle1()
      // 防止图片还未绘制完成就保存 ps 官方drawImage方法还未加入绘制完成回调，用延时处理
      setTimeout(function () {
        that.saveImage('style1')
      }, 1500)
    }
    if (this.data.style2) {
      canvasId = 'style2'
      this.drawStyle2()
    }
    // this.drawStyle0()
    // this.drawStyle1()
  },
  drawStyle0: function () {
    let that = this
    // 只需要当天的数据
    let data = this.data.item
    const ctx = wx.createCanvasContext('style0')
    // 将canvas生成白色背景，避免生成的png图片背景是透明的
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, prop * 690, prop * 920)
    // 二维码
    let qrcode = '../images/qrcode.jpg'
    ctx.drawImage(qrcode, prop * 160, prop * 576, prop * 100, prop * 100);
    // 日期板块
    ctx.setFillStyle('#333333')
    ctx.setFontSize(prop * 34)
    ctx.fillText(data.year + '年' + data.month + '月', prop * 140, prop * 152)
    ctx.fillText('农历' + data.chiMonth + data.chiDay, prop * 130, prop * 210)
    ctx.setFontSize(prop * 200)
    ctx.fillText(data.day, prop * 115, prop * 420)
    if (data.festival) {
      // 节日左边线条
      ctx.beginPath()
      ctx.lineWidth = prop * 2;
      ctx.moveTo(prop * 118, prop * 516)
      ctx.lineTo(prop * 168, prop * 516)
      ctx.setStrokeStyle('#333333')
      ctx.stroke()
      // 节日
      ctx.setFontSize(prop * 34)
      ctx.setFillStyle('#333333')
      ctx.fillText(data.festival, prop * 196, prop * 525)
      // 节日右边线条
      ctx.lineWidth = prop * 2;
      ctx.moveTo(prop * 292, prop * 516)
      ctx.lineTo(prop * 342, prop * 516)
      ctx.setStrokeStyle('#333333')
      ctx.stroke()
      // 中间线条
      ctx.beginPath()
      ctx.lineWidth = prop * 2;
      ctx.moveTo(prop * 450, prop * 40)
      ctx.lineTo(prop * 450, prop * 650)
      ctx.setStrokeStyle('#e0e0e0')
      ctx.stroke()
    }
    // icon
    let icon = '../images/logo-icon@3x.png'
    ctx.drawImage(icon, prop * 500, prop * 70, prop * 50, prop * 79);

    // 天干地支板块
    ctx.beginPath()
    ctx.setFontSize(prop * 30)
    ctx.setFillStyle('#999999')
    // ctx.fillText(data.gYear + data.gMonth + data.gDay, prop * 450, prop * 152)
    let datestr = data.gYear + '·' + data.gMonth + '·' + data.gDay
    this.verticalTxt(ctx, datestr, prop * 506, prop * 240)
    // 宜忌板块
    ctx.beginPath()
    ctx.setFontSize(prop * 30)
    ctx.setFillStyle('#333333')
    ctx.fillText('宜', prop * 600, prop * 160)
    ctx.fillText('忌', prop * 600, prop * 430)
    ctx.setFillStyle('#999999')
    let yistr = data.yi
    this.verticalTxt(ctx, yistr, prop * 600, prop * 210)
    let jistr = data.ji
    this.verticalTxt(ctx, jistr, prop * 600, prop * 480)
    // 绘制每日一言区域
    this.drawDailyTxt(ctx, data)

    ctx.draw()


  },
  drawStyle1: function () {
    // 只需要当天的数据
    let data = this.data.item
    const ctx = wx.createCanvasContext('style1')
    // 将canvas生成白色背景，避免生成的png图片背景是透明的
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, prop * 690, prop * 920)
    // 日期板块
    ctx.setStrokeStyle('#e0e0e0')
    ctx.strokeRect(prop * 76, prop * 40, prop * 164, prop * 222)
    // 日期头部
    ctx.setFontSize(prop * 24)
    ctx.setFillStyle('#333333')
    ctx.fillText(data.month + '.' + data.day + '    ' + data.weekText, prop * 90, prop * 80)
    // 分割线
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 76, prop * 100)
    ctx.lineTo(prop * 240, prop * 100)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.stroke()
    // 农历
    ctx.setFontSize(prop * 30)
    ctx.setFillStyle('#333333')
    this.verticalTxt(ctx, data.chiMonth + data.chiDay, prop * 104, prop * 138)
    // 属相
    ctx.setFontSize(prop * 24)
    ctx.setFillStyle('#333333')
    this.verticalTxt(ctx, data.gYear + '属' + data.animalYear, prop * 190, prop * 138, prop * 24)
    // 中间分割
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 164, prop * 100)
    ctx.lineTo(prop * 164, prop * 260)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.stroke()
    // 节日板块
    if (data.festival) {
      // 矩形框
      ctx.setStrokeStyle('#e0e0e0')
      ctx.strokeRect(prop * 76, prop * 260, prop * 164, prop * 54)
      ctx.setFillStyle('#ffffff')
      // 清除上边框
      ctx.setStrokeStyle('#e0e0e0')
      ctx.clearRect(prop * 77, prop * 261, prop * 162, prop * 2)
      // 节日名
      ctx.setFontSize(prop * 24)
      ctx.setFillStyle('#333333')
      ctx.fillText(data.festival, prop * 135, prop * 300)
    }
    // icon
    let icon = '../images/logo-icon@3x.png'
    ctx.drawImage(icon, prop * 132, prop * 576, prop * 50, prop * 79);
    // 每日图片,先下载到本地，再绘图
    let image, that = this
    wx.downloadFile({
      url: data.largeImage,
      success: function (res) {
        console.log(res.tempFilePath)
        ctx.drawImage(res.tempFilePath, prop * 310, prop * 40, prop * 340, prop * 606);
        // 绘制每日一言区域
        that.drawDailyTxt(ctx, data)
        ctx.draw()
      }
    })

  },
  drawDailyTxt: function (ctx, data) {
    // 分隔线条
    ctx.beginPath()
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 40, prop * 686)
    ctx.lineTo(prop * 650, prop * 686)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.stroke()
    // 第几天
    ctx.setFontSize(prop * 30)
    ctx.setFillStyle('#c30d23')
    if (data.largerIndex) {
      ctx.fillText('【第' + data.largerIndex + '天】', prop * 25, prop * 728)
    }
    // 每日描述
    ctx.beginPath()
    ctx.setFillStyle('#333333')
    ctx.setFontSize(prop * 30)
    this.drawText(ctx, data.dayText, prop * 40, prop * 775)
  },
  // 生成图片并保存到本地相册
  saveImage: function (id) {
    let that = this
    wx.canvasToTempFilePath({
      canvasId: id,
      success: function (res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (response) {
            that.setData({
              showPop: false
            })
            if (system === 'Android') {
              return
            }
            that.show('日签已保存到本地')
          }
        })
      }
    })
  },
  // 文字竖排显示
  verticalTxt: function (ctx, str, x, y, fontsize) {
    let arr = str.split('')
    for (let i = 0, len = str.length; i < len; i++) {
      // 将中间圆点位置右移12rpx
      if (arr[i] === '·') {
        ctx.fillText(arr[i], x + prop * 12, y + prop * 34 * i)
      }
      // 小号字体 缩小间距
      else if (fontsize) {
        ctx.fillText(arr[i], x, y + prop * 28 * i)
      }
      else {
        ctx.fillText(arr[i], x, y + prop * 34 * i)
      }
    }
  },
  // 文字换行显示
  drawText: function (ctx, str, x, y) {
    // str = '知识能使人的眼睛更加明亮，理想能使人的心灵更加美好。'
    let rowTxt = []  //每行文字集合
    let rowCount = str.length / 20  //一共几行 （每行20字）
    let currentRowIndex = ''  //第一行字符结束的位置

    if (rowCount > 0 && rowCount < 1) {
      y = y + prop * 60
    }
    else if (rowCount >= 1 && rowCount < 2) {
      y = y + prop * 40
    }
    else if (rowCount >= 2 && rowCount < 3) {
      y = y + prop * 20
    }
    else {
      ;
    }
    for (let i = 0; i < rowCount; i++) {
      if (i === 0) {
        ctx.fillText(str.substring(0, 20), x, y + (prop * 34 * 1.19 * i));  //prop * 34 * 1.19 表示文字的行高
        currentRowIndex = 20;
      }
      else if (i > 3) {
        return
      }
      else {
        ctx.fillText(str.substring(20 * i, 20 * (i + 1)), x, y + (prop * 34 * 1.19 * i));
      }
    }

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
