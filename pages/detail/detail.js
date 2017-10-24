//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    item: {}
  },
  onLoad: function (options) {
    let data = JSON.parse(options.obj);
    this.setData({ 
      item: data
    });
  }
})
