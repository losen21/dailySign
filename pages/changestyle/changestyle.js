// pages/changestyle/changestyle.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    current: 0,
    autoplay: false,
    duration: '300',
    active0: true,
    active1: false,
    active2: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = JSON.parse(options.obj);
    let index = options.index
    this.setData({
      item: data,
      current: index
    });
    console.log(this.data.item)
  },
  // 手动选择
  selectStyle: function (e) {
    let currentStyleIndex = parseInt(e.currentTarget.dataset.index);
    this.setData({
      active0: currentStyleIndex === 0 ? true : false,
      active1: currentStyleIndex === 1 ? true : false,
      active2: currentStyleIndex === 2 ? true : false,
      current: currentStyleIndex
    });
    let pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //使用上一个页面的方法设置数据
      prePage.changeStyleData(currentStyleIndex)
    }
    wx.setStorageSync('currentStyle', currentIndex)
  },
  // 滑动选择
  changeIndex:function(e){
    let currentIndex = e.detail.current
    this.setData({
      active0: currentIndex === 0 ? true : false,
      active1: currentIndex === 1 ? true : false,
      active2: currentIndex === 2 ? true : false,
    });
    let pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //关键在这里
      prePage.changeStyleData(currentIndex)
    }
    wx.setStorageSync('currentStyle', currentIndex)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '每日一签',
      desc: '最具人气的签到小程序',
      path: 'pages/index/index',
      imageUrl: 'https://qiniu.image.cq-wnl.com/sentenceimg/2017103024b9b0572e2d47139d0d5798fc1208d3.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})