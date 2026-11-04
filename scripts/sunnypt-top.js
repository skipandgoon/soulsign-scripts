// ==UserScript==
// @name Sunny（晴天）
// @namespace https://soulsign.inu1255.cn?account=baiwei666
// @version 1.1.0
// @author baiwei666
// @loginURL https://sunnypt.top/user/attendance
// @expire 14400000
// @domain sunnypt.top
// ==/UserScript==

exports.run = async function(param) {
 // ★ 前台打开, 页面必加载(避免后台标签节能点不到按钮)
 return await open("https://sunnypt.top/user/attendance", true, async (fb) => {
  var rate = 0.5;
  await fb.sleep(2000 * rate);

  // 1) 读页面文本
  var text = await fb.eval(() => document.body ? document.body.innerText : '');

  // 2) 已签到直接结束
  if (/今日签到已完成|已经签到过|已签到/.test(text)) {
   return "今日已签到";
  }

  // 3) 点"开始签到"按钮
  var clicked = await fb.eval(() => {
   var btns = Array.from(document.querySelectorAll('button, a, input[type=button], input[type=submit]'));
   var target = btns.find(b => {
    var t = (b.innerText || b.value || '').trim();
    return t.includes('开始签到') && !b.disabled;
   });
   if (!target) return false;
   target.click();
   return true;
  });
  if (!clicked) throw "未找到开始签到按钮";

  // 4) 轮询等待签到结果(最多 20 秒)
  var start = Date.now();
  while (Date.now() - start < 20000) {
   await fb.sleep(1000);
   var t = await fb.eval(() => document.body ? document.body.innerText : '');
   if (/签到成功/.test(t)) return "签到成功";
   if (/今日签到已完成|已经签到过|已签到/.test(t)) return "签到成功(今日签到已完成)";
  }
  throw "签到结果未知, 请手动检查";
 });
};

exports.check = async function(param) {
 var { data } = await axios.get('https://sunnypt.top/user/attendance');
 return /欢迎回来/.test(data);
};