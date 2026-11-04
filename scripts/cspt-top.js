// ==UserScript==
// @name cspt（财神）
// @namespace https://soulsign.inu1255.cn?account=baiwei666
// @version 1.1.1
// @author baiwei666
// @loginURL https://cspt.top/index.php
// @expire 14400000
// @domain cspt.top
// ==/UserScript==

exports.run = async function(param) {
 return await open("https://cspt.top/attendance.php", true, async (fb) => {
  // 轮询等 CF 验证通过 + 签到结果出现（最多 30 秒）
  let text = '';
  for (let i = 0; i < 30; i++) {
   await fb.sleep(1000);
   text = await fb.eval(function() {
    return document && document.body ? document.body.innerText : '';
   });
   if (/签到成功|您今天已经签到过了|今日已签到|今日排名/.test(text)) break;
  }

  if (/签到成功/.test(text)) return '签到成功';
  if (/您今天已经签到过了|今日已签到|今日排名/.test(text)) return '今日已签';
  throw 'CF验证超时或签到失败';
 });
};

exports.check = async function(param) {
 return await open("https://cspt.top/index.php", false, async (fb) => {
  await fb.waitLoaded();
  await fb.sleep(3000);
  const text = await fb.eval(function() {
   return document && document.body ? document.body.innerText : '';
  });
  return /首页|退出|欢迎/.test(text);
 });
};