// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */

let registerUser = async (wxContext) => {
  const db = cloud.database()
  // 查询用户是否已在用户表
  const user = db.collection('user')
  const isRegister = await user.where({
    wxOpenId: wxContext.OPENID
  }).count()
  if (isRegister.total == 0) {
    let newOne = await user.orderBy('registerTime', 'asc')
    .limit(1)
    .get()
    let userId = 1
    console.log('user:', newOne)
    if (newOne.data && newOne.data.length != 0) {
      userId = newOne.data[0].userId + 1
    }
    let data = {
      wxOpenId: wxContext.OPENID,
      registerTime: new Date(),
      userId: userId
    }
    // 用户表增加用户记录
    await user.add({
      data: data
    })
  }
}

exports.main = async (event, context) => {

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()

  registerUser(wxContext)

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: wxContext.ENV
  }
}

