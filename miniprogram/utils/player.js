const manager = wx.getBackgroundAudioManager()
const util = require('./util')
const { isNull } = require('./util')

class BackgroundAudio { // 背景音频
  constructor (options = {}) {
    let {src, startTime, title, epname, singer, coverImgUrl, webUrl, protocol, playbackRate, id} = options
    this.id = id || '' // 音频id required
    this.src = src || '' // 播放地址 required
    this.startTime = startTime || '0' // 初始播放位置，单位：s
    this.title = title || '未知音乐' // 音频标题 required
    this.epname = epname || '未知专辑' // 专辑名
    this.singer = singer || '未知歌手' // 歌手
    this.coverImgUrl = coverImgUrl || '' // 封面
    this.webUrl = webUrl || '' // 分享页面链接
    this.protocol = protocol || 'http' // 音频协议
    this.playbackRate = playbackRate || '1' // 播放速度 
    this.currentDuration = 0 // 时长
  }
}

class Progress { // 播放进度
  constructor (options = {}) {
    let {duration, currentTime} = options
    if (duration === 0) {
      this.duration = 0
      this.currentTime = 0
      this.percent = 0
    } else {
      this.duration = duration
      this.currentTime = currentTime
      this.percent = Number(((currentTime / duration) * 100).toFixed(2))
      this.transformData('durationContent', duration)
      this.transformData('currentTimeContent', currentTime)  
    }
  }
  transformData (name, data) {
    this[name] = {
      hour: util.padStart(parseInt(data / 3600), 2, '0'),
      min: util.padStart(parseInt(data % 3600 / 60), 2, '0'),
      sec: util.padStart(parseInt(data % 3600 % 60), 2, '0')
    }
  }
}

manager._audioList_ = [] // 播放列表
manager._playingAudioIndex_ = 0 // 当前播放内容
manager._playSequence_ = 'loop' // 播放顺序
manager._historyList_ = [] // 历史记录(时间从近到远，最新的在最前面)
manager._intervalListener_ = {} // 存储循环获取播放状态的方法

manager.pushAudio = (options) => {
  // 添加音频至播放列表
  let audio = new BackgroundAudio(options)
  manager._audioList_.push(audio)
}

manager.pushNextPlayAudio = (options) => {
  // 添加至下一首播放
  let audio = new BackgroundAudio(options)
  manager._audioList_.splice(manager._playingAudioIndex_ + 1, 0, audio)
  let res = {
    audioList: manager._audioList_,
    playingAudioIndex: manager._playingAudioIndex_
  }
  return res
}

manager.removeAudio = (e) => {
  // 移除出播放列表
  if (util.isNull(e)) {
    return
  }
  let index = -1
  let playingAudioIndex = manager._playingAudioIndex_
  let audioList = manager._audioList_
  if (util.type.isString(e) || util.type.isNumber(e)) {
    index = Number(e)
  } else if (util.isObject(e)) {
    index = (Number(e.index))
  }
  if (index == playingAudioIndex) {
    manager.stopAudio()
    audioList.splice(index, 1)
    manager._audioList_ = audioList
    manager.changeAudio(index)
  }  else if (index < playingAudioIndex) {
    audioList.splice(index, 1)
    manager._audioList_ = audioList
    manager._playingAudioIndex_ -= 1
  } else if (index > playingAudioIndex) {
    audioList.splice(index, 1)
    manager._audioList_ = audioList
  }
  let res = {
    audioList: audioList,
    playingAudioIndex: manager._playingAudioIndex_
  }
  return res
}

manager.pushAudioList = (list) => {
  // 添加播放列表数组
  for (let i = 0; i < list.length; i++) {
    manager.pushAudio(list[i])
  }
}

manager.clearAudioList = () => {
  // 清空播放列表
  manager.stopAudio()
  manager._playingAudioIndex_ = 0
  manager._audioList_ = []
}

manager.changePlaySequence = (e) => {
  // 更改播放顺序
  // 可选值： single(单曲循环) loop(列表循环)  random(随机播放) 
  // 默认值： loop
  const playSequenceList = ['loop', 'single', 'random']
  if (util.isNull(e)) {
    let index = playSequenceList.indexOf(manager._playSequence_)
    index += 1
    if (index > 2) {
      index = 0
    }
    manager._playSequence_ = playSequenceList[index]
  } else {
    if (playSequenceList.includes(e)) {
      manager._playSequence_ = e
    }
   }
}

manager.playAudio = () => {
  let audio = {}
  if (util.isNull(manager.src)) {
    // 如果没有可播放内容，则取当前播放内容或者播放列表第一个
    if (!util.isNull(manager._audioList_)) {
      let index = manager._playingAudioIndex_
      if (index >= manager._audioList_.length) {
        index = 0
      }
      audio = manager._audioList_[index]
      manager._playingAudioIndex_ = index
    }
    if (!isNull(audio.src)) {
      let keys = Object.keys(audio)
      for (let i in keys) {
        const name = keys[i]
        manager[name] = audio[name]
      }
      pushHistoryList(audio)
      manager.play()
    }
  } else {
    audio = manager._audioList_[manager._playingAudioIndex_]
    pushHistoryList(audio)
    manager.play()
  }
}

manager.pauseAudio = () => {
  manager.pause()
}

manager.stopAudio = () => {
  manager.stop()
}

manager.seekAudio = (e) => {
  console.log(e)
  if (util.isNull(e)) {
    return
  }
  if (util.type.isString(e) || util.type.isNumber(e)) {
    manager.seek(e)
  }
  if (util.type.isObject) {
    let {percent, sec} = e
    if (!isNull(sec)) {
      manager.seek(sec)
    } else if (!isNull(percent)) {
      const {duration} = manager
      sec = duration * percent / 100
      manager.seek(sec)
    }
  }
  if (manager.paused) {
    manager.playAudio()
  }
}

manager.changeAudio = (e) => {
  // 通过index值或者id值切换音频，默认index
  if (util.isNull(e)) {
    return
  }
  let audioList = manager._audioList_
  if (audioList.length == 0) {
    return
  }
  let index = -1
  if (util.type.isString(e) || util.type.isNumber(e)) {
    index = Number(e)
  } else if (util.isObject(e)) {
    if (!util.isNull(e.index)) {
      index = (Number(e.index))
    } else if (!util.isNull(e.id)) {
      index = getIndexById(e.id)
    }
  }
  if (util.type.isNumber(index) && !isNaN(index) && index != -1) {
    manager.stopAudio()
    manager._playingAudioIndex_ = index
    let audio = audioList[manager._playingAudioIndex_]
    let keys = Object.keys(audio)
    for (let i in keys) {
      const name = keys[i]
      manager[name] = audio[name]
    }
    manager.playAudio()
  }
}

manager.prevAudio = () => {
  // 上一曲
  manager.stopAudio()
  let historyList = manager._historyList_
  let audio = {}
  if (historyList.length > 1) {
    manager._historyList_.shift()
    audio = manager._historyList_[0]
    let index = getIndexById(audio.id)
    let keys = Object.keys(audio)
    for (let i in keys) {
      const name = keys[i]
      manager[name] = audio[name]
    }
    manager._playingAudioIndex_ = index
    manager.playAudio()
  } else {
    if (historyList.length == 1) {
      manager._historyList_ = []
    }
    let index = manager._playingAudioIndex_
    if (index === 0) {
      index = manager._audioList_.length - 1
    } else {
      index--
    }
    manager._playingAudioIndex_ = index
    let audio = manager._audioList_[manager._playingAudioIndex_]
    let keys = Object.keys(audio)
    for (let i in keys) {
      const name = keys[i]
      manager[name] = audio[name]
    }
    manager.playAudio()
  }
}

manager.nextAudio = () => {
  // 下一曲
  manager.stopAudio()
  let index = getNextAudio({
    active: true
  })
  manager._playingAudioIndex_ = index
  let audio = manager._audioList_[manager._playingAudioIndex_]
  let keys = Object.keys(audio)
  for (let i in keys) {
    const name = keys[i]
    manager[name] = audio[name]
  }
  manager.playAudio()
}

manager.onPrev = () => {
  // ios端点击上一曲触发
  manager.prevAudio()
}

manager.onNext = () => {
  // ios端点击下一曲触发
  manager.nextAudio()
}

manager.resetAudio = () => {
  // 重置当前播放内容
  manager.stopAudio()
  let audio = new BackgroundAudio()
  let keys = Object.keys(audio)
  for (let i in keys) {
    const name = keys[i]
    manager[name] = audio[name]
  }
}

manager.getAudioList = () => {
  // 获取当前播放列表
  return manager._audioList_
}

manager.getDuration= () => {
  // 获取播放时长
  return new Promise((resolve, reject) => {
    const TIMEOUT = 5000
    const STEP = 100
    let time = 0
    let interval = setInterval(() => {
      time += STEP
      if(time > TIMEOUT) {
        clearInterval(interval)
        resolve(0)
      }
      if (manager.duration) {
        clearInterval(interval)
        resolve(manager.duration)
      }
    }, STEP)
  })
}

manager.getPlayerStatus = (callback) => {
  // 获取当前歌曲进度信息
  const STEP = 1000
  manager._intervalListener_ = setInterval(() => {
    // 监听播放进度变化
    manager.getDuration().then((duration) => {
      const { currentTime } = manager
      const audio = manager._audioList_[manager._playingAudioIndex_]
      if (!util.isNull(audio)) {
        if (audio.currentDuration) {
          duration = audio.currentDuration
        } else {
          manager._audioList_[manager._playingAudioIndex_].currentDuration = duration
        }
      }
      const progress = new Progress({
        duration,
        currentTime
      })
      let paused = manager.paused
      if (util.isNull(paused) && paused === undefined) {
        // 未给播放器设置内容时，为暂停状态
        paused = true
      }
      const status = {
        paused: paused,
        ...progress,
        ...audio,
        playingAudioIndex: manager._playingAudioIndex_,
        playSequence: manager._playSequence_
      }
      callback(status)
    }).catch((err) => {
      console.log(err)
    })
  }, STEP)
}

manager.onEnded(() => {
  // 当前播放内容完成后，播放下一曲
  let index = getNextAudio({
    auto: true
  })
  manager._playingAudioIndex_ = index
  let audio = manager._audioList_[manager._playingAudioIndex_]
  let keys = Object.keys(audio)
  for (let i in keys) {
    const name = keys[i]
    manager[name] = audio[name]
  }
  manager.playAudio()
})

manager.uninstallIntervalListener = () => {
  // 清除计时器
  clearInterval(manager._intervalListener_)
}

let getNextAudio = (options = {}) => {
  // 获取下一个音频的index
  const playSequence = manager._playSequence_
  const audioList = manager._audioList_
  const len = audioList.length
  let playingAudioIndex = manager._playingAudioIndex_

  if (len == 0) {
    return -1
  }
  if (playSequence == 'single' && options.type == 'active') {
    // 用户主动触发 并且 处于单曲循环状态 则 切换至列表的下一项内容
    playSequence = 'loop'
  }
  if (playSequence == 'single') {
    return playingAudioIndex
  }else if (playSequence == 'loop') {
    playingAudioIndex += 1
    if (playingAudioIndex >= len) {
      playingAudioIndex = 0
    }
    return playingAudioIndex
  } else if (playSequence == 'random') {
    if (len == 1) {
      playingAudioIndex = 0
    } else {
      playingAudioIndex = util.randomNewNumber({
        min: 0,
        max: len,
        oldNumber: playingAudioIndex
      })
    }
    return playingAudioIndex
  }
}

let pushHistoryList = (audio) => {
  // 增加至历史记录列表
  let { id } = audio
  let historyList = manager._historyList_
  let index = -1
  for (let i in historyList) {
    if (historyList[i].id == id) {
      index = i
      break
    }
  }
  if (index != -1) {
    manager._historyList_.splice(index, 1)
  }
  manager._historyList_.unshift(audio)
}

let removeHistoryList = (id) => {
  // 从历史记录列表中移除
  let historyList = manager._historyList_
  let index = -1
  for (let i in historyList) {
    if (historyList[i].id == id) {
      index = i
      break
    }
  }
  if (index != -1) {
    manager._historyList_.splice(index, 1)
  }
}

let getIndexById = (id) => {
  if (util.isNull(id)) {
    return
  }
  let audioList = manager._audioList_
  let index = -1
  if (audioList.length == 0) {
    return
  }
  for (let i = 0; i < audioList.length; i++) {
    if (audioList[i].id == id) {
      index = i
      break
    }
  }
  return index
}

module.exports = manager