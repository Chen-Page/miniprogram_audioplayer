// subPackages/file/pages/cloudDownloadFile/cloudDownloadFile.js
const util = require('../../../../utils/util')
const fileformats = require('../../data/fileformats')

const testSrc = 'http://music.163.com/song/media/outer/url?id=22814470.mp3'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '', // 链接
    title: '', // 名称
    singer: '', // 歌手
    coverImgUrl: '', // 封面
    epname: '', // 专辑名
    duration: '', // 时长
    selectedAudioIndex: -1,
    audioType: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      audioType: fileformats.audio
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

  cloudDownLoadFile() {
    let t = this
    wx.cloud.callFunction({
      name: 'uploadFileByLink',
      data: {
        url: t.data.src,
        type: 'upload',
        filename: t.data.title
      },
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  input(e) {
    let name = e.currentTarget.dataset.name
    let value = e.detail.value
    this.setData({
      [name]: value
    })
    if (name === 'src') {
      this.getExtension()
    }
  },

  picker(e) {
    let name = e.currentTarget.dataset.name
    let value = e.detail.value
    this.setData({
      [name]: value
    })
  },

  getExtension() {
    let src = this.data.src
    let extension = util.getExtension(src)
    let audioType = this.data.audioType
    if (audioType.includes(extension)) {
      this.setData({
        selectedAudioIndex: audioType.indexOf(extension)
      })
    }
  },

  choosePoster() {
    let t = this
    wx.chooseImage({
      count: 1,
      success(res) {
        t.setData({
          coverImgUrl: res.tempFilePaths[0]
        })
      }
    })
  },

  checkData() {
    let t = this
    let reg = /(http|https|ftp):\/\/([\w.]+\/?)\S*/
    let {
      src,
      title,
      singer,
      coverImgUrl,
      epname,
      duration,
      selectedAudioIndex,
      audioType
    } = t.data
    if (util.isNull(src)) {
      util.showToast({
        title: '没有输入链接'
      })
      return
    }
    if (!reg.test(src)) {
      util.showToast({
        title: '链接格式错误'
      })
      return
    }
    if (util.isNull(title)) {
      util.showToast({
        title: '没有输入歌曲名'
      })
      return
    }
    if (selectedAudioIndex === -1) {
      util.showToast({
        title: '未获取到歌曲后缀名，请手动选择'
      })
      return
    }
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