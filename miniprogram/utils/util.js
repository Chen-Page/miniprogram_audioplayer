
let type = (o) => {
  // 判断对象类型的方法
  let s = Object.prototype.toString.call(o)
  return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}

['Null',
  'Undefined',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Function',
  'RegExp'
].forEach(function (t) {
  type['is' + t] = function (o) {
    return type(o) === t.toLowerCase()
  }
})

let isNull = (obj) => {
  // 判断是否为空对象，长度为0的数组，空字符串，是否为undefined、null，是否为NaN的数字
  if (obj === 'null' || obj === 'undefined') {
    return true
  } else if (type.isString(obj) || type.isArray(obj)) {
    return obj.length === 0
  } else if (type.isNumber(obj)) {
    return isNaN(obj)
  } else if (type.isUndefined(obj) || type.isNull(obj)) {
    return true
  } else if (type.isObject(obj)) {
    return Object.keys(obj).length === 0
  } else {
    return false
  }
}

let padStart = (string = '', length = 0, padStr = '') => {
  // es6 padStart
  try {
    string = string.toString()
    let n = length - string.length
    if (n <= 0) {
      n = 0
    }
    for (let i = 0; i < n; i++) {
      string = padStr + string
    }
    return string.toString()
  } catch (e) {
    return ''
  }
}
let padEnd = (string = '', length = 0, padStr = '') => {
  // es6 padEnd
  try {
    string = string.toString()
    let n = length - string.length
    if (n <= 0) {
      n = 0
    }
    for (let i = 0; i < n; i++) {
      string += padStr
    }
    return string.toString()
  } catch (e) {
    return ''
  }
}

let randomNewNumber = (options = {}) => {
  // 生成与oldNumber不同的范围内的随机数
  let { min, max, oldNumber } = options

  let random = ''

  if (isNull(min) || isNull(max)) {
    min = 0
    max = 1
  }

  if (isNull(oldNumber)) {
    random = Math.random() * (max - min)
  } else {
    let count = 0
    do {
      random = Math.random() * (max - min)
      if (count > 100) {
        // 防止循环过量
        break
      }
    } while (isNull(random) || random == oldNumber)
  }

  random = Math.floor(random)

  return random
}

let shuffle = (arr = []) => {
  // 随机化数组
  if (!type.isArray(arr)) {
    return arr
  }
  let len = arr.length
  for (let i = len - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = arr[j]
    arr[j] = arr[i]
    arr[i] = temp
  }
  return arr
}

let deepClone = (target) => {
  // 深拷贝
  let result
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      for (let i in target) {
        result.push(deepClone(target[i]))
      }
    } else if (target === null) {
      result = null 
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      result = {}
      for (let i in target) {
        result[i] = deepClone(target[i])
      }
    }
  } else {
    result = target
  }
  return result
}

let getExtension = (e = '') => {
  if (!type.isString(e)) {
    return ''
  }
  if (!e.includes('.')) {
    return ''
  }
  let arr = e.split('.')
  return arr[arr.length - 1]
}

let showModal = (e = {}) => {
  // 自定义modal，暂时使用小程序原生modal
  wx.showModal(e)
}

let hideModal = (e = {}) => {
  // 隐藏自定义modal
  wx.hideModal(e)
}

let showLoading = (e = {}) => {
  // 自定义loading，暂时使用小程序原生loading
  wx.showLoading(e)
}

let hideLoading = (e = {}) => {
  // 隐藏自定义loading
  wx.hideLoading(e)
}

let showToast = (e = {}) => {
  // 自定义toast，暂时使用小程序原生toast
  e.icon = 'none'
  wx.showToast(e)
}

let hideToast = (e = {}) => {
  // 隐藏自定义toast
  wx.hideToast(e)
}


module.exports = {
  type,
  isNull,
  padStart,
  padEnd,
  randomNewNumber,
  shuffle,
  deepClone,
  getExtension,
  showModal,
  hideModal,
  showLoading,
  hideLoading,
  showToast,
  hideToast
}