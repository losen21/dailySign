
// import localData from '../../data.js'
import util from '../../utils/util.js'
let localData = 0

//index.js
//获取应用实例
const app = getApp()
const prop = app.globalData.Proportion
const system = app.globalData.system
const brand = app.globalData.brand
// touch相关
let touchDot = 0,time = 0,interval = ""
// 请求次数
let reqIndex = 0
// 最终数据
let DATA = []
// 请求的日期
let reqDate = ''
// 请求天数, 实际请求天数 = dates + 1 ,因为getPointDate()方法多算了一天
let dates = 30
// 分享的天数序号
let shareIndex = 0
// 之前签到的天数
let signDays = 0
// 当前序号
let nowIndex = 0
// 点击flag 防止连续点击
let flag = 0
// 是否启用分享
let isShare = false

Page({
  data: {
    uid: '',
    signtxt: '签到',
    tiptxt: '你还没开始签到哦',
    signed: false,
    signdays: '',
    // todayIndex: 0,   //当天的已签到天数
    history: {},
    // swiper相关
    autoplay: false,
    duration: '400',
    current: dates,
    //
    showPop: false,
    isToday: true,
    // 切换样式相关
    style0: true,
    style1: false,
    style2: false,
    currentStyle: 0,
    // 
    showLoading: false,
    itemClicked: false,
    isHuawei: false,
    nowIndex: dates,
    loading: false
  },
  onLoad: function (options) {
    // 显示加载
    this.setData({
      loading: true
    })
    console.log(util.getCurrentPageUrlWithArgs())
    // 处理分享过来的日期 分享的天数超过一个月，就显示今天
    // if (options.current) {
    //   let index = parseInt(options.current)
    //   if (index < 30 && index >= 0) {
    //     shareIndex = index
    //   }
    //   else {
    //     shareIndex = 30
    //   }
    // }
    
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
      // 本地存储uid
      wx.setStorageSync('uid', this.uid)
      console.log(wx.getStorageSync('uid'))
    }
    // 初始化已选样式
    if (wx.getStorageSync('currentStyle')) {
      this.changeStyleData(wx.getStorageSync('currentStyle'))
    }
    // // 初始化签到天数
    // if (wx.getStorageSync('signDays')) {
    //   signDays = wx.getStorageSync('signDays')
    // }

    // 在第二天进行操作时
    let useDate = util.formatTime(new Date()).split(' ')[0];
    if (wx.getStorageSync('useDate')) {
      // 同一天内使用
      if (wx.getStorageSync('useDate') === useDate) {
        console.log('今天又来啦~')
      }
      else {
        wx.setStorageSync('useDate', useDate)
        wx.setStorageSync('signed', false)
      }
    }
    else {
      wx.setStorageSync('useDate', useDate)
    }
    DATA = []
    this.getDailyInfo()
  },
  onReady:function(){
    // console.log('页面渲染完成')
    this.setData({
      loading: false
    })
  },
  onShow:function(){
    reqIndex = 0
    console.log('页面显示')
    console.log('isShare=' + isShare)
    // 初始化签到天数
    if (wx.getStorageSync('signDays')) {
      signDays = wx.getStorageSync('signDays')
    }
    // 处理华为手机
    if (brand === 'HUAWEI' || brand === 'huawei' || brand === 'google') {
      this.setData({
        isHuawei: true
      })
    }
    // // 置空数据
    // DATA = []
    // this.getDailyInfo()

    // this.setData({
    //   current: nowIndex ? nowIndex : DATA.length-1
    // })
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
            let date = util.formatTime(new Date()).split(' ')[0]
            // 签到成功后重新请求当天数据，并替换之前的数据
            that.getDailyInfo(date,date,0)
            // let userData = that.data.history
            // console.log('userData:' + userData[0].year)
            // let rindex = userData[userData.length - 1].rIndex
            // userData[userData.length - 1].largerIndex = that.NumberToChinese(rindex)

            that.setData({
              signtxt: '已签到',
              tiptxt: '已签到' + signDays + '天',
              signdays: signDays,
              showPop: true,
              // history: userData
            })
            wx.setStorageSync('signed', true)
          }
        }
      })
    }
  },
  // 生成唯一用户标识uid
  uuid: function() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.replace(/-/g,'');
  },
  NumberToChinese: function(num){
    if (!/^\d*(\.\d*)?$/.test(num)) { 
      alert("Number is wrong!"); return "Number is wrong!"; 
    }
    let AA = new Array("〇", "一", "二", "三", "四", "五", "六", "七", "八", "九");
    let BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
    let a = ("" + num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
    for (let i = a[0].length - 1; i >= 0; i--) {
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
      for (let i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
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
  getDailyInfo: function(startDate,endDate,flushreq){
    // 记录总共请求次数
    reqIndex += 1
    console.log('请求次数：' + reqIndex)
    // let datekey = wx.getStorageSync('firstTime')

    let enddatekey = endDate ? endDate : util.formatTime(new Date()).split(' ')[0]
    let datekey = startDate ? startDate : this.getPointDate(enddatekey, -dates)
    // 记录每次请求的结束日期
    reqDate = enddatekey

    console.log('enddatekey:' + enddatekey + '   ' + 'datekey' + datekey)
    // 计算首次使用日期和当前日期差值，最多显示一个月的数据
    // let diff = this.getDateDiff(datekey, enddatekey)
    // console.log('使用时间相差天数' + diff)
    console.log('30天前的日期:' + this.getPointDate(enddatekey, -dates))

    // datekey = diff > 31 ? this.getDate(enddatekey) : datekey
    
    let that = this
    // 获取该用户签到情况
    wx.request({
      url: 'https://service.51wnl.com/Api/SignEvDay/GetSignInfo',
      data: {
        uid: that.uid,
        did: '',
        datekey: datekey,
        enddatekey: enddatekey
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let data = res.data.data
        let todayIndex = 0
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
          if (data[i].festival) {
            // data[i].festival = data[i].festival.substring(0,2)
            data[i].festival = data[i].festival.replace('节', '')
          }

          if(data[i].rIndex !== 0) {
            todayIndex = data[i].rIndex
          }
        }
       
        // 只请求签到当天,替换当天的数据
        if(startDate === endDate && startDate) {
          DATA = DATA.reverse()
          DATA[0] = data[0]
          signDays = todayIndex  // 设置为之前已签到的天数
          wx.setStorageSync('signDays', signDays)
        }
        else {
          DATA = DATA.reverse().concat(data.reverse())
          // 如果有分享的索引值
          if(shareIndex) {
            console.log('分享的的索引：'+ shareIndex)
            // 如果不是当天的索引
            if(shareIndex !== DATA.length - 1) {
              that.setData({
                isToday: false
              })
            }
            // 设置为当前分享的索引
            that.setData({
              current: shareIndex
            })
          }
          else {
            that.setData({
              current: flushreq ? dates + 2 : dates
            })
          }
        }
        console.log('todayIndex:' + todayIndex)

        that.setData({
          history: DATA.reverse(),
        })
        // wx.setStorageSync('historyData', DATA)
        console.log(that.data.history)
        
        // 如果当天已签到
        if (wx.getStorageSync('signed')) {
          console.log(signDays)
          that.setData({
            signtxt: '已签到',
            tiptxt: '已签到' + signDays + '天',
            signdays: signDays
          })
        }
      }
    })
  },
  // 计算日期相差天数
  getDateDiff: function (startDate, endDate){
    let startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
    let endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
    let dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
    return dates;
  },
  // 计算当前日期的前30天日期  isPre代表前一天
  getDate: function (endDate,isPre){
    let startTime
    let endTime = Date.parse(new Date(endDate))/1000;   //传入值的时间戳
    if (isPre === 0) {     //30天前的时间戳
      startTime = endTime - (dates - 1) * (60 * 60 * 24)
    }
    if(isPre === 1) {
      startTime = endTime - dates * (60 * 60 * 24)
    }
    let date = new Date(startTime * 1000).toLocaleDateString().replace(/\//g,'-')
    console.log('getDate获取到的值:' + date)
    return date
  },
  // 计算当前日期endDate 的前后AddDayCount天 的日期
  getPointDate: function (endDate, AddDayCount) { 
    let num = Math.floor(AddDayCount);
    let symbol = '/';
    if (endDate.indexOf('-') > -1) {
      symbol = '-';
    } else if (endDate.indexOf('.') > -1) {
      symbol = '.';
    }
    let myDate = new Date(endDate);
    let lw = new Date(Number(myDate) + 1000 * 60 * 60 * 24 * num); //num天数
    let lastY = lw.getFullYear();
    let lastM = lw.getMonth() + 1;
    let lastD = lw.getDate();
    let startdate = lastY + symbol + (lastM < 10 ? "0" + lastM : lastM) + symbol + (lastD < 10 ? "0" + lastD : lastD);
    return startdate; 
  },
  
  // 保存图片
  saveSign:function(){
    let canvasId = ''
    let that = this
    this.setData({
      showLoading: true
    })
    if (this.data.style0) {
      canvasId = 'style0'
      this.drawStyle0()
      setTimeout(function(){
        that.saveImage('style0')
      }, 2500)
    }
    if (this.data.style1) {
      canvasId = 'style1'
      this.drawStyle1()
      // 防止图片还未绘制完成就保存 ps 官方drawImage方法还未加入绘制完成回调，用延时处理
      setTimeout(function(){
        that.saveImage('style1')
      }, 2500)
    }
    if (this.data.style2) {
      canvasId = 'style2'
      this.drawStyle2()
    }
    // this.drawStyle0()
    // this.drawStyle1()
  },
  drawStyle0:function(){
    let that = this
    // 只需要当天的数据
    let data = this.data.history[this.data.history.length-1]
    const ctx = wx.createCanvasContext('style0')
    // 将canvas生成白色背景，避免生成的png图片背景是透明的
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, prop * 690, prop * 920)
    // 二维码
    let qrcode = '../images/qrcode.jpg'
    ctx.drawImage(qrcode, prop * 180, prop * 556, prop * 100, prop * 100);
    // 有节日时日期板块上移 50rpx
    if (data.festival) {
      ctx.setFillStyle('#333333')
      ctx.setFontSize(prop * 34)
      ctx.fillText(data.year + '年' + data.month + '月', prop * 140, prop * 102)
      ctx.fillText('农历' + data.chiMonth + data.chiDay, prop * 130, prop * 160)
      ctx.setFontSize(prop * 200)
      ctx.fillText(data.day, prop * 115, prop * 370)
    }
    else {
      // 无节日时日期板块
      ctx.setFillStyle('#333333')
      ctx.setFontSize(prop * 34)
      ctx.fillText(data.year + '年' + data.month + '月', prop * 140, prop * 152)
      ctx.fillText('农历' + data.chiMonth + data.chiDay, prop * 130, prop * 210)
      ctx.setFontSize(prop * 200)
      ctx.fillText(data.day, prop * 115, prop * 420)
    }
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
      ctx.fillText(data.festival, data.festival.length === 3 ? prop * 178 : prop * 194, prop * 475)
      // 节日右边线条
      ctx.lineWidth = prop * 2;
      ctx.moveTo(prop * 292, prop * 516)
      ctx.lineTo(prop * 342, prop * 516)
      ctx.setStrokeStyle('#333333')
      ctx.stroke()
      
    }
    // 中间线条
    ctx.beginPath()
    ctx.lineWidth = prop * 2;
    ctx.moveTo(prop * 450, prop * 40)
    ctx.lineTo(prop * 450, prop * 650)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.stroke()
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
    this.drawDailyTxt(ctx,data)

    ctx.draw()

    
  },
  drawStyle1:function(){
    // 只需要当天的数据
    let data = this.data.history[this.data.history.length - 1]
    const ctx = wx.createCanvasContext('style1')
    // 将canvas生成白色背景，避免生成的png图片背景是透明的
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, prop * 690, prop * 920)
    // 日期板块
    ctx.setStrokeStyle('#e0e0e0')
    ctx.strokeRect(prop*76, prop*40, prop*164, prop*222)
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
    if(data.festival) {
      // 矩形框
      ctx.setStrokeStyle('#e0e0e0')
      ctx.strokeRect(prop * 76, prop * 260, prop * 164, prop * 54)
      ctx.setFillStyle('#ffffff')
      // 清除上边框
      ctx.setStrokeStyle('#e0e0e0')
      ctx.clearRect(prop * 77, prop * 261, prop * 162, prop*2)
      // 节日名
      ctx.setFontSize(prop * 24)
      ctx.setFillStyle('#333333')
      ctx.fillText(data.festival, prop * 135, prop * 300)
    }
    // icon
    let icon = '../images/logo-icon@3x.png'
    ctx.drawImage(icon, prop * 132, prop * 436, prop * 50, prop * 79);
    // 二维码
    let qrcode = '../images/qrcode.jpg'
    ctx.drawImage(qrcode, prop * 106, prop * 546, prop * 100, prop * 100);
    // 每日图片,先下载到本地，再绘图
    let image,that = this
    wx.downloadFile({
      url: data.largeImage,
      success:function(res){
        console.log(res.tempFilePath)
        ctx.drawImage(res.tempFilePath, prop * 310, prop * 40, prop * 340, prop * 606);
        // 绘制每日一言区域
        that.drawDailyTxt(ctx, data)
        ctx.draw()
      }
    })
    
  },
  drawDailyTxt:function(ctx,data){
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
            // 阻止安卓弹出自定义toast
            // if (system === 'Android') {
            //   return
            // }
            that.show('日签已保存到本地')
          },
          complete:function(){
            that.setData({
              showLoading: false
            })
          }
        })
      }
    })
  },
  // 文字竖排显示
  verticalTxt: function (ctx,str,x,y,fontsize){
    let arr = str.split('')
    for(let i = 0,len = str.length; i < len; i ++) {
      // 将中间圆点位置右移12rpx
      if (arr[i] === '·') {
        ctx.fillText(arr[i], x + prop*12, y + prop * 34 * i)
      }
      // 小号字体 缩小间距
      else if(fontsize) {
        ctx.fillText(arr[i], x, y + prop * 28 * i)
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
    this.itemClicked(this)
    let currentIndex = e.currentTarget.dataset.index
    console.log(currentIndex)
    let obj = JSON.stringify(this.data.history[currentIndex])
    let styleType = wx.getStorageSync('currentStyle') ? wx.getStorageSync('currentStyle') : this.data.currentStyle
    wx.navigateTo({
      url: '../detail/detail?obj=' + obj + '&style=' + styleType + '&current=' + currentIndex
    })
  },
  // 阻止多次点击
  itemClicked: function(self) {
    self.setData({
      itemClicked: true
    })
    setTimeout(function () {
      self.setData({
        itemClicked: false
      })
    }, 500)
  },
  // 滑动监听
  changeIndex: function(e){
    let that = this
    console.log(e.detail.current)
    let enddatekey = this.getPointDate(reqDate, -dates - 1)
    let datekey = this.getPointDate(enddatekey, -dates)

    console.log('当前swiper索引值：'+e.detail.current)
    this.setData({
      nowIndex: e.detail.current
    })
    // 当滑动到倒数第二个，再次请求
    if (e.detail.current === 1) {
      // this.getDailyInfo(datekey, enddatekey, 1)
    }
    this.setData({
      isToday: (e.detail.current === this.data.history.length - 1) ? true : false,      
    })
  },
  // 回到今天
  backToday: function(){
    this.setData({
      current: this.data.history.length - 1
    })
  },
  // 跳转至切换样式
  switchStyle:function(){
    // 传入当天的数据给切换样式页面
    let obj = JSON.stringify(this.data.history[this.data.history.length - 1])
    wx.navigateTo({
      url: '../changestyle/changestyle?obj=' + obj + '&index='+ this.data.currentStyle
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
  touchStart:function(e){
    
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 处理临界点的滑动
  touchMove:function(e){
    let that = this
    //只处理第一张和最后一张
    if (e.currentTarget.dataset.index === that.data.history.length - 1 || e.currentTarget.dataset.index === 0){
      let moveX = e.touches[0].pageX;
      // 左滑
      if (moveX - touchDot <= -40 && time < 10) {
        // 第一张
        if (e.currentTarget.dataset.index === that.data.history.length - 1) {
          that.show('明天，敬请期待~')
        }
      }
      // 右滑
      if (moveX - touchDot >= 40 && time < 10) {
        // 最后一张
        if (e.currentTarget.dataset.index === 0) {
          that.show('只能到这里咯！')
        }
      }
    }
  },
  touchEnd:function(e){
    clearInterval(interval); // 清除setInterval
    time = 0;
  },
  onShareAppMessage: function (res) {
    let that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    // 保存当前序号
    isShare = true
    nowIndex = that.data.current
    return {
      title: '每日一签',
      desc: '最具人气的签到小程序',
      path: 'pages/index/index?current='+ that.data.current,
      // imageUrl: 'https://qiniu.image.cq-wnl.com/sentenceimg/2017103024b9b0572e2d47139d0d5798fc1208d3.jpg',
      success: function (res) {
        // 转发成功
        that.setData({
          showPop: false
        })
        if (system === 'Android') {
          return
        }
        that.show('分享成功')
      },
      fail: function (res) {
        // 转发失败
        // that.show('分享失败')
      }
    }
  }
})
