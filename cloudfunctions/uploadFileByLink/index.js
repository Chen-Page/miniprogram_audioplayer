const cloud = require('wx-server-sdk')
const request = require('request')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  var url = event.url; //下载地址,应该由前端进行传递,而后云函数进行下载
  var type = event.type; //type:'dump'(转储) 'trans'(传递)
  var filename = event.filename;
  //文件名称需要自己进行上传,或者substring 截取url
  var options = {
    url: url,
    encoding: null,
    headers: {
      "content-type": "application/octet-stream",
    },
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if(type=='trans'){
          //中继
        resolve(body)
      }else{
          //转储
        resolve(
          cloud.uploadFile({
            cloudPath: 'tmp/'+filename,
            fileContent: body,
          })
        )
      }
    })
  })
}