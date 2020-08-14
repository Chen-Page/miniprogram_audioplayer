// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let updateUserInfo = async (wxContext, event) => {
  const db = cloud.database()
  // 查询用户是否已在用户表
  const user = db.collection('user')
  user.where({
    wxOpenId: wxContext.OPENID
  }).update({
    data: event.userInfo
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log('updateUserInfo')
  updateUserInfo(wxContext, event)

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    context
  }
}