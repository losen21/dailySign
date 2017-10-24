
// import HistoryData from '../../data.js'
import util from '../../utils/util.js'
let HistoryData = 0
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    uid: '',
    signtxt: '签到',
    tiptxt: '你还没开始签到哦',
    signed: false,
    signdays: 0,
    // showDays: false,
    todayIndex: 0,   //当天的已签到天数
    history: [],
    autoplay: false,
    duration: '300',
    current: 0,
    showPop: false,
    isToday: true,
    rightContent: '明天敬请期待',
    leftContent: '已经没有了哦',
    lastX: 0,
    lastY: 0
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
    // 如果当天已签到
    if (wx.getStorageSync('signed')) {
      this.setData({
        signtxt: '已签到',
        tiptxt: '已签到' + (that.data.todayIndex + 1) + '天',
        signdays: that.data.todayIndex + 1
      })
    }
    // // 每天晚上十二点清除前一天签到数据
    // if (1) {
    //   let d = new Date();
    //   if (d.getHours() === 0 && d.getMinutes() === 0) {
    //     wx.setStorageSync('signed',false)
    //   }
    // }
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
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
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
          that.setData({
            signtxt: '已签到',
            tiptxt: '已签到' + (that.data.todayIndex + 1) + '天',
            signdays: that.data.todayIndex + 1,
            showPop: true
          })
          wx.setStorageSync('signed', true)
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
    var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
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
  getDailyInfo: function(){
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
        datekey: '2017-10-20',
        enddatekey: enddatekey
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let data = res.data.data

        // 调试
        // data[20].rIndex = 24
        // data[19].rIndex = 23
        // data[17].rIndex = 21
        // 调试
        // that.data.todayIndex = data[data.length - 1].rIndex  //保存当天已签到天数
        // data[data.length - 1].rIndex = 0  //设置当天已签到天数为0

        for (let i = 0, len = data.length; i < len; i++) {
          data[i].year = data[i].dateKey.split('-')[0]
          data[i].month = data[i].dateKey.split('-')[1]
          data[i].day = data[i].dateKey.split('-')[2]
          data[i].largeYear = parseInt(data[i].dateKey.split('-')[0]).toLocaleString('zh-Hans-CN-u-nu-hanidec').replace(',', '')
          data[i].largerIndex = that.NumberToChinese(data[i].rIndex)
        }
        that.setData({
          history: data,
          current: data.length - 1,
          // rindex: data[data.length-1].rIndex
        })
        // console.log(that.data.history)
      }
    })
  },
  // 在弹窗中保存图片
  saveSign: function(){

  },
  // 在弹窗中分享
  shareNow: function() {

  },
  closePop: function(){
    this.setData({
      showPop: false
    })
  },
  display: function(e){
    let currentIndex = e.currentTarget.dataset.index
    let obj = JSON.stringify(this.data.history[currentIndex])
    wx.navigateTo({
      url: '../detail/detail?obj=' + obj
    })
  },
  changeIndex: function(e){
    this.setData({
      isToday: (e.detail.current === this.data.history.length - 1) ? true : false
    })
    // if (e.detail.current === 0) {
    //   this.show(this.data.leftContent)
    // }
    // else if (e.detail.current === this.data.history.length - 1) {
    //   this.show(this.data.rightContent);
    // }
  },
  backToday: function(){
    this.setData({
      current: this.data.history.length - 1
    })
  },
  handletouchmove:function(e){
    console.log(e.currentTarget.dataset.index)
    let that = this
    let currentX = e.touches[0].pageX
    let currentY = e.touches[0].pageY
    let tx = currentX - this.data.lastX
    let ty = currentY - this.data.lastY
    //左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      // 向左滑动
      if (tx < 0)
        {
          if (e.currentTarget.dataset.index === that.data.history.length - 1) {
            that.show(that.data.rightContent)
          }
        }
      // 向右滑动
      else if (tx > 0)
      {
        if (e.currentTarget.dataset.index === 0) {
          that.show(that.data.leftContent)
        }
      }
        
    }
    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX
    this.data.lastY = currentY
  }
})
