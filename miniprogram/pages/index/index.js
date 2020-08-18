Page({

  /**
   * 页面的初始数据
   */
  data: {
    aside: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 用户登录
   */
  login: function () {
    wx.cloud.callFunction({
      name: 'login',
      success (res) {
        console.log(res)
      }
    })
  },

  /**
   * 获取用户头像昵称
   */
  getUserInfo: function (data) {
    console.log('用户信息', data)
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userInfo: data.detail.userInfo
      },
      success (res) {
        console.log(res)
      }
    })
  },

  changeAside () {
    this.setData({
      aside: !this.data.aside
    })
  },

  doNothing () {
    return false
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})