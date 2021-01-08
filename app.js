function compileUrl (code) {
  return `https://fundgz.1234567.com.cn/js/${code}.js`
}

const myJiJinList = [
  // '001410', '005176', '110022', '161725', '003634', '004477', '110011', '163402'
  { code: '001410', hold: 18306.33 }, // 信达澳
  { code: '005176', hold: 23288.05 }, // 富国医疗
  { code: '110022', hold: 17240.99 }, // 易方达消费
  { code: '161725', hold: 14094.55 }, // 白酒
  { code: '003634', hold: 10712.29 },  // 嘉实农业
  { code: '004477', hold: 0 },
  { code: '110011', hold: 0 },
  { code: '004642', hold: 0 },
  { code: '320007', hold: 0 },
  { code: '002190', hold: 0 },
  { code: '167301', hold: 0 }
]
$('body').append(`<li style="color: red; font-weight: bold">现在时间: ${new Date().toLocaleString()}</li>`)
$('body').append('waiting......')

function getData () {
  let arr = []
  const reqList = []
  myJiJinList.forEach(item => {
    myReq(item.code)
  })
}

let resArr = []

function jsonpgz (item2) {
  resArr.push(item2)
  if (resArr.length === myJiJinList.length) {
    test(resArr)
  }
}

function test (res) {
  arr = res.sort((a, b) => {
    return b.gszzl - a.gszzl
  })
  let total = []
  arr.forEach(item2 => {
    myJiJinList.forEach(item => {
      if (item2.fundcode === item.code) {
        total.push(item.hold * item2.gszzl / 100).toFixed(2)
        if (item2.gszzl > 0) {
          $('body').append(`<li style="color: red">${item2.name},code: ${item2.fundcode}, 今日涨幅: +${item2.gszzl}, 持仓: ${item.hold}, 收益: ${(item.hold * item2.gszzl / 100).toFixed(2)}, 最后更新时间: ${item2.gztime}<li>`)
        } else {
          $('body').append(`<li style="color: green">${item2.name},code: ${item2.fundcode}, 今日涨幅: ${item2.gszzl}, 持仓: ${item.hold}, 收益: ${(item.hold * item2.gszzl / 100).toFixed(2)}, 最后更新时间: ${item2.gztime}<li>`)
        }
      }
    })
  })
  const totalCount = total.reduce((a, b) => { return a + b })
  const totalPrice = myJiJinList.reduce((a, b) => { return a + b.hold }, 0)
  if (totalCount > 0) {
    $('body').append(`<li style="font-size: 30px; color: red; margin-top: 20px">当前持仓: ${totalPrice.toFixed(2)}, 今日收益预估: ${totalCount.toFixed(2)}<li>`)
  } else {
    $('body').append(`<li style="font-size: 30px; color: green; margin-top: 20px">当前持仓: ${totalPrice.toFixed(2)}, 今日收益预估: ${totalCount.toFixed(2)}<li>`)
  }
}

function myReq (item) {
  return new Promise(resolve => {
    $.ajax({
      type: "get",//请求方式 post或者get
      url: compileUrl(item), //接口路径
      async: true,//true 异步 false 同步  可以不写 默认异步
      dataType: "jsonp", //json 或者 jsonp 出现跨域写jsonp  可以不写这个
      jsonp: 'jsonpgz'
    });
  })
}

getData()