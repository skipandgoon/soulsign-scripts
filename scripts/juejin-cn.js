// ==UserScript==
// @name Juejin（稀土掘金）
// @namespace https://soulsign.inu1255.cn/scripts/623
// @version 1.1.0
// @author gogobody
// @loginURL https://juejin.cn/user/center/signin?from=main_page
// @updateURL https://soulsign.inu1255.cn/script/gogobody/juejin.cn
// @expire 300000
// @domain juejin.cn
// @param name 账号
// @param pwd 密码
// ==/UserScript==

exports.run = async function(param) {
  return await open("https://juejin.cn/user/center/signin?from=main_page", false, async (fb) => {
    // ① 等页面加载出签到元素(最多30秒): 已签到→直接返回; 出现签到按钮→继续
    var state = "";
    for (var i = 0; i < 20; i++) {
      state = await fb.eval("(function(){var els=document.querySelectorAll('button,span,div');for(var i=0;i<els.length;i++){var t=(els[i].textContent||'').trim();if(/已签到|签到成功/.test(t))return 'SIGNED';if(/^签到$|立即签到|去签到/.test(t))return 'CLICKABLE'}return 'WAIT'})()");
      state = String(state || '').replace(/^"|"$/g, '');
      if (state === "SIGNED") return "签到成功（今日已签）";
      if (state === "CLICKABLE") break;
      await fb.sleep(1500);
    }
    if (state !== "CLICKABLE") throw "签到失败：页面加载超时或找不到签到入口";

    // ② 点击签到按钮
    var ck = await fb.eval("(function(){var els=document.querySelectorAll('button');for(var i=0;i<els.length;i++){var t=(els[i].textContent||'').trim();if(/^签到$|立即签到|去签到/.test(t)){els[i].click();return 'CLICKED'}}var els2=document.querySelectorAll('div,span');for(var j=0;j<els2.length;j++){var t2=(els2[j].textContent||'').trim();if(t2==='签到'){els2[j].click();return 'CLICKED'}}return 'NOT_FOUND'})()");
    ck = String(ck || '').replace(/^"|"$/g, '');
    if (ck !== "CLICKED") throw "签到失败：找不到可点击的签到按钮";

    // ③ 等确认(最多10秒): 按钮变"已签到"或出现"签到成功"提示
    for (var k = 0; k < 7; k++) {
      await fb.sleep(1500);
      var ok = await fb.eval("(function(){var els=document.querySelectorAll('button,span,div');for(var i=0;i<els.length;i++){var t=(els[i].textContent||'').trim();if(/已签到|签到成功/.test(t))return 'DONE'}return 'WAIT'})()");
      ok = String(ok || '').replace(/^"|"$/g, '');
      if (ok === "DONE") return "签到成功";
    }
    throw "签到失败：已点击但未确认成功, 请手动检查页面";
  });
};

exports.check = async function(param) {
  return true;
};