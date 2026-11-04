// ==UserScript==
// @name HiFiNi（音乐磁场）
// @namespace https://soulsign.inu1255.cn?account=zszczh
// @version 1.0.1
// @author zszczh
// @loginURL https://www.hifini.net/
// @updateURL https://soulsign.inu1255.cn/script/zszczh/HiFiNi_-_音乐磁场
// @expire 300000
// @domain www.hifini.net
// @param name 账号
// @param pwd 密码
// ==/UserScript==

exports.run = async function(param) {
 return await open("https://www.hifini.net/", false, async (fb) => {
  var rate = 0.5;
  // ★ 改: 不再固定 sleep, 等 #sign 签到按钮出现再点(后台标签慢也能等到)
  await fb.waitUntil("#sign", 30000);
  await fb.click("#sign");
  await fb.waitLoaded();
  if(!(await fb.eval("location.href")).startsWith("https://www.hifini.net/sg_sign.htm")) throw '签到失败'
  return "签到成功";
 });
};

exports.check = async function(param) {
 return true;
};