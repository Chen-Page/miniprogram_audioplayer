// miniprogram/pages/player/player.js
const manager = require('../../utils/player')
const util = require('../../utils/util')
const testData = require('../../data/data')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    progress: {
      paused: true
    },
    activeIndex: '',
    showListModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let t = this
    manager.pushAudioList(testData.audioList)
    // manager.playAudio()
    // manager.pauseAudio()
    manager.getPlayerStatus((res) => {
      t.setData({
        progress: res,
        activeIndex: res.playingAudioIndex
      })
    })
    this.getAudioList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  playAudio () {
    manager.playAudio()
  },
  
  pauseAudio () {
    manager.pauseAudio()
  },

  prevAudio () {
    manager.prevAudio()
  },

  nextAudio () {
    manager.nextAudio()
  },
  dragAudioSlider (e) {
    manager.seekAudio({
      percent: e.detail.value
    })
  },
  getAudioList (e) {
    let audioList = manager.getAudioList()
    this.setData({
      audioList
    })
  },
  changePlaySequence () {
    manager.changePlaySequence()
  },

  changeAudio(e) {
    let index = e.currentTarget.dataset.index
    let { playingAudioIndex } = this.data.progress
    if (!util.isNull(playingAudioIndex)) {
      if (playingAudioIndex == index) {
        return
      }
    }
    manager.changeAudio(index)
  },

  toggleListModal () {
    this.setData({
      showListModal: !this.data.showListModal
    })
  },

  removeAudio (e) {
    let index = e.currentTarget.dataset.index
    let result = manager.removeAudio(index)
    this.setData({
      audioList: result.audioList,
      activeIndex: result.playingAudioIndex
    })
  },

  pushNextPlayAudio (e) {
    let audio = testData.audioList[0]
    let result = manager.pushNextPlayAudio(audio)
    this.setData({
      audioList: result.audioList,
      activeIndex: result.playingAudioIndex
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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