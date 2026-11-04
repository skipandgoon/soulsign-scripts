// ==UserScript==
// @name 吾爱破解
// @namespace https://soulsign.inu1255.cn?account=jingyan96
// @version 1.0.6
// @author jingyan96
// @loginURL https://www.52pojie.cn/
// @updateURL https://soulsign.inu1255.cn/script/jingyan96/吾爱签到(修改可用)
// @expire 600000
// @domain www.52pojie.cn
// ==/UserScript==

exports.run = async function(param) {
 var { data } = await axios.get('https://www.52pojie.cn');
 if (/wbs.png/.test(data))
  return '任务已完成';
 else {
  return await open("https://www.52pojie.cn/", false, async (fb) => {
   var rate = 0.7;

   // ★ 修复1: 不固定 sleep, 等签到按钮真正出现(后台标签加载慢也能等到)
   await fb.waitUntil("[src='https://static.52pojie.cn/static/image/common/qds.png']", 30000);
   await fb.click("[src='https://static.52pojie.cn/static/image/common/qds.png']");

   // ★ 修复2: 点击后等页面完成(签到后 wbs.png 会消失)
   await fb.waitLoaded();
   await fb.sleep(3000 * rate);

   var { data } = await axios.get('https://www.52pojie.cn');
   if (/wbs.png/.test(data))
    return "签到成功";
   else
    throw "需重试";
  });
 }
};

exports.check = async function(param) {
 return true;
};