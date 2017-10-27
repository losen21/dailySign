
// import HistoryData from '../../data.js'
import util from '../../utils/util.js'
let HistoryData = 0
//index.js
//获取应用实例
const app = getApp()
const prop = app.globalData.Proportion
const system = app.globalData.system

Page({
  data: {
    uid: '',
    signtxt: '签到',
    tiptxt: '你还没开始签到哦',
    signed: false,
    signdays: '',
    todayIndex: 0,   //当天的已签到天数
    history: [],
    autoplay: false,
    duration: '300',
    current: 0,
    showPop: false,
    isToday: true,
    rightContent: '明天，敬请期待~',
    leftContent: '只能到这里咯！',
    lastX: 0,
    lastY: 0,
    lastSlide: true,
    firstSlide: false,
    style0: true,
    style1: false,
    style2: false
  },
  onLoad: function (e) {
    let app = getApp()
    // toast组件实例
    new app.ToastPannel();

    let that = this
    // 获取uid
    if (wx.getStorageSync('uid')) {
      this.uid = wx.getStorageSync('uid')
      console.log('have uid: ' + this.uid)
    }
    else {
      this.uid = this.uuid()
      let firstTime = util.formatTime(new Date()).split(' ')[0];
      // 本地存储uid 和 第一次使用的日期
      wx.setStorageSync('uid', this.uid)
      wx.setStorageSync('firstTime', firstTime)
      console.log(wx.getStorageSync('uid'))
    }
    // 如果有本地数据
    if (HistoryData) {
      let data = HistoryData.HistoryData;
      data[22].rIndex = 24
      for (let i = 0, len = data.length; i < len; i++ ) {
        data[i].year = data[i].dateKey.split('-')[0]
        data[i].month = data[i].dateKey.split('-')[1]
        data[i].day = data[i].dateKey.split('-')[2]
        data[i].largeYear = parseInt(data[i].dateKey.split('-')[0]).toLocaleString('zh-Hans-CN-u-nu-hanidec').replace(',', '')
        data[i].largerIndex = this.NumberToChinese(data[i].rIndex)
      }
      console.log(data);
      this.setData({
        history: data,
        current: HistoryData.HistoryData.length - 1
      })
    }
    else {
      this.getDailyInfo()
    }
    
  },
  // 改变样式
  changeStyleData:function(index){
    this.setData({
      style0: index === 0 ? true : false,
      style1: index === 1 ? true : false,
      style2: index === 2 ? true : false,
      currentStyle: index
    })
  },
  // 用户签到
  signOn: function (e) {
    let that = this
    if (wx.getStorageSync('signed')) {
      return
    }
    else {
      wx.request({
        url: 'https://service.51wnl.com/Api/SignEvDay/SignToday',
        data: {
          uid: this.uid,
          did: ''
        },
        dataType: 'json',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.status === 200) {
            // 签到成功后重新请求列表
            that.getDailyInfo()
            let userData = that.data.history
            let rindex = userData[userData.length - 1].rIndex
            userData[userData.length - 1].largerIndex = that.NumberToChinese(rindex)

            that.setData({
              signtxt: '已签到',
              tiptxt: '已签到' + rindex + '天',
              signdays: rindex,
              showPop: true,
              history: userData
            })
            wx.setStorageSync('signed', true)
          }
        }
      })
    }
  },
  // 生成唯一用户标识uid
  uuid: function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.replace(/-/g,'');
  },
  NumberToChinese: function(num){
    if (!/^\d*(\.\d*)?$/.test(num)) { 
      alert("Number is wrong!"); return "Number is wrong!"; 
    }
    var AA = new Array("〇", "一", "二", "三", "四", "五", "六", "七", "八", "九");
    var BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
    for (var i = a[0].length - 1; i >= 0; i--) {
      switch (k) {
        case 0: re = BB[7] + re; break;
        case 4: if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
          re = BB[4] + re; break;
        case 8: re = BB[5] + re; BB[7] = BB[5]; k = 0; break;
      }
      if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
      if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re; k++;
    }

    if (a.length > 1) //加上小数部分(如果有小数部分) 
    {
      re += BB[6];
      for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
    }
    return re;
  },
  yearToChinese:function(num){
    let chi = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
    let int = ['0','1','2','3','4','5','6','7','8','9']
    let str = num.toString().split('')
    let result = []
    for(let i = 0; i < str.length; i++) {
      result.push(chi[parseInt(str[i])])
    }
    result = result.toString().replace(/,/g, '')
    return result
  },
  // 获取签到信息
  getDailyInfo: function(date){
    let datekey = wx.getStorageSync('firstTime')
    let enddatekey = util.formatTime(new Date()).split(' ')[0]

    // 在第二天进行操作时
    if (wx.getStorageSync('useDate')) {
      // 同一天内使用
      if (wx.getStorageSync('useDate') === enddatekey) {
        console.log('今天又来啦~')
      }
      else {
        wx.setStorageSync('useDate', enddatekey)
        wx.setStorageSync('signed', false)
      }
    }
    else {
      wx.setStorageSync('useDate', enddatekey)
    }
    let that = this
    // 获取该用户签到情况
    wx.request({
      url: 'https://service.51wnl.com/Api/SignEvDay/GetSignInfo',
      data: {
        uid: that.uid,
        did: '',
        datekey: '2017-10-24',
        enddatekey: enddatekey
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let data = res.data.data
        let todayIndex = 0
        // 调试
        // data[20].rIndex = 24
        // data[19].rIndex = 23
        // data[3].rIndex = 1
        data[3].festival = '端午节'
        // 调试
        // that.data.todayIndex = data[data.length - 1].rIndex  //保存当天已签到天数
        // data[data.length - 1].rIndex = 0  //设置当天已签到天数为0

        for (let i = 0, len = data.length; i < len; i++) {
          data[i].year = data[i].dateKey.split('-')[0]
          data[i].month = data[i].dateKey.split('-')[1]
          data[i].day = data[i].dateKey.split('-')[2]
          // data[i].largeYear = parseInt(data[i].dateKey.split('-')[0]).toLocaleString('zh-Hans-CN-u-nu-hanidec').replace(',', '')
          data[i].largeYear = that.yearToChinese(parseInt(data[i].dateKey.split('-')[0]))
          data[i].largerIndex = that.NumberToChinese(data[i].rIndex)
          data[i].largeMonth = that.NumberToChinese(data[i].dateKey.split('-')[1])
          data[i].largeDay = that.NumberToChinese(data[i].dateKey.split('-')[2])
          if (data[i].largeMonth === '一十') {
            data[i].largeMonth = '十'
          }
          if (data[i].largeDay === '一十') {
            data[i].largeDay = '十'
          }
          // data[i].weekText = data[i].weekText.replace('周','星期')
          if (data[i].festival) {
            data[i].festival = data[i].festival.substring(0,2)
          }

          if(data[i].rIndex !== 0) {
            todayIndex = data[i].rIndex
          }
        }
        // console.log(todayIndex)
        that.setData({
          history: data,
          current: data.length - 1,
          todayIndex: todayIndex  // 设置为之前已签到的天数
        })
        console.log(that.data.history)
        // 如果当天已签到
        if (wx.getStorageSync('signed')) {
          console.log(that.data.todayIndex)
          that.setData({
            signtxt: '已签到',
            tiptxt: '已签到' + todayIndex + '天',
            signdays: todayIndex
          })
        }
      }
    })
  },
  
  // 在弹窗中分享
  shareNow: function() {
    
  },
  // 在弹窗中保存图片
  saveSign:function(e){
    let canvasId = ''
    if (this.data.style0) {
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
    // 只需要当天的数据
    let data = this.data.history[this.data.history.length-1]
    const ctx = wx.createCanvasContext('style0')
    // 日期板块
    ctx.setFontSize(prop * 34)
    ctx.fillText(data.year + '年' + data.month + '月', prop * 140, prop * 152)
    ctx.fillText('农历' + data.chiMonth + data.chiDay, prop * 130, prop * 210)
    ctx.setFontSize(prop*200)
    ctx.fillText(data.day, prop * 115, prop * 420)
    // 节日左边线条
    ctx.beginPath()
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 118, prop * 516)
    ctx.lineTo(prop * 168, prop * 516)
    ctx.setStrokeStyle('#333333')
    ctx.stroke()
    if (data.festival) {
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
    let that = this
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

    // 分隔线条
    ctx.beginPath()
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 40, prop * 666)
    ctx.lineTo(prop * 650, prop * 666)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.stroke()
    // 第几天
    ctx.setFontSize(prop * 30)
    ctx.setFillStyle('#c30d23')
    if (data.largerIndex){
      ctx.fillText('【第' + data.largerIndex + '天】', prop * 25, prop * 715)
    }
    // 每日描述
    ctx.beginPath()
    ctx.setFillStyle('#333333')
    ctx.setFontSize(prop * 30)    
    this.drawText(ctx, data.dayText, prop * 40, prop * 755)
    // ctx.fillText(data.dayText, prop * 40, prop * 770)

    ctx.draw()

    wx.canvasToTempFilePath({
      canvasId: 'style0',
      success: function(res){
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success:function(response){
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
  verticalTxt: function (ctx,str,x,y){
    let arr = str.split('')
    for(let i = 0,len = str.length; i < len; i ++) {
      // 将中间圆点位置右移12rpx
      if (arr[i] === '·') {
        ctx.fillText(arr[i], x + prop*12, y + prop * 34 * i)
      }
      else {
        ctx.fillText(arr[i], x, y + prop * 34 * i)
      } 
    }
  },
  // 文字换行显示
  drawText: function (ctx, str, x, y){
    // str = '知识能使人的眼睛更加明亮，理想能使人的心灵更加美好。'
    let rowTxt = []  //每行文字集合
    let rowCount = str.length / 20  //一共几行 （每行20字）
    let currentRowIndex = ''  //第一行字符结束的位置

    if (rowCount > 0 && rowCount < 1) {
      y = y + prop * 60
    }
    else if( rowCount >= 1 && rowCount < 2) {
      y = y + prop * 40
    }
    else if (rowCount >= 2 && rowCount < 3) {
      y = y + prop * 20
    }
    else{
      ;
    }
    console.log(y)

    for (let i = 0; i < rowCount; i++) {
      if(i === 0) {
        ctx.fillText(str.substring(0, 20), x, y + (prop * 34 * 1.19 * i));  //prop * 34 * 1.19 表示文字的行高
        currentRowIndex = 20;
      }
      else if( i > 3) {
        return 
      }
      else {
        ctx.fillText(str.substring(20 * i, 20 * (i + 1)), x, y + (prop * 34 * 1.19 * i));        
      }
    }
    
  },
  // 关闭弹窗
  closePop: function(){
    this.setData({
      showPop: false
    })
  },
  // 显示详情
  display: function(e){
    let currentIndex = e.currentTarget.dataset.index
    let obj = JSON.stringify(this.data.history[currentIndex])
    wx.navigateTo({
      url: '../detail/detail?obj=' + obj + '&style=' + app.globalData.currentStyle
    })
  },
  // 滑动监听
  changeIndex: function(e){
    this.setData({
      isToday: (e.detail.current === this.data.history.length - 1) ? true : false,      
      firstSlide: e.detail.current === 0 ? true : false
    })
    this.setData({
      lastSlide: this.data.isToday ? true : false
    })
  },
  // 回到今天
  backToday: function(){
    this.setData({
      current: this.data.history.length - 1
    })
  },
  // 切换样式
  switchStyle:function(){
    // 传入当天的数据给切换样式页面
    let obj = JSON.stringify(this.data.history[this.data.history.length - 1])
    wx.navigateTo({
      url: '../changestyle/changestyle?obj=' + obj + '&index='+this.data.currentStyle
    })
  },
  // 点击前进
  prev:function(e){
    let currentIndex = e.currentTarget.dataset.current
    this.setData({
      current: currentIndex - 1
    })
  },
  // 点击后退
  next: function(e){
    let currentIndex = e.currentTarget.dataset.current
    this.setData({
      current: currentIndex + 1
    })
  },
  // 处理临界点的滑动
  handletouchmove:function(e){
    // console.log(e.currentTarget.dataset.index)
    let that = this
    // 第一张和最后一张
    if (e.currentTarget.dataset.index === that.data.history.length - 1 || e.currentTarget.dataset.index === 0){
      let currentX = e.touches[0].pageX
      let currentY = e.touches[0].pageY
      let tx = currentX - that.data.lastX
      let ty = currentY - that.data.lastY
      //左右方向滑动
      if (Math.abs(tx) > Math.abs(ty)) {
        // 向左滑动
        if (tx < 0) {
          if (e.currentTarget.dataset.index === that.data.history.length - 1) {
            that.show('明天，敬请期待~')
          }
        }
        // 向右滑动
        else if (tx > 0) {
          if (e.currentTarget.dataset.index === 0) {
            that.show('只能到这里咯！')
          }
        }

      }
      //将当前坐标进行保存以进行下一次计算
      that.data.lastX = currentX
      that.data.lastY = currentY
    }
  },
  onShareAppMessage: function (res) {
    let that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '每日一签',
      desc: '最具人气的签到小程序',
      path: '/page/index',
      imgUrl: 'https://mobile.51wnl.com/temporary/dailysign/style3-choose-icon@2x.png',
      success: function (res) {
        // 转发成功
        that.setData({
          showPop: false
        })
        that.show('分享成功')
      },
      fail: function (res) {
        // 转发失败
        that.show('分享失败')
      }
    }
  }
})
