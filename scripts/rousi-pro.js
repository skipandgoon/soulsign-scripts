// ==UserScript==
// @name Rousi（肉丝）
// @namespace https://soulsign.inu1255.cn?account=baiwei666
// @version 1.0.1
// @author baiwei666
// @loginURL https://rousi.pro/
// @updateURL https://soulsign.inu1255.cn/script/baiwei666/rousi
// @expire 14400000
// @domain rousi.pro
// ==/UserScript==

exports.run = async function (param) {
 const url = "https://rousi.pro/points";

 async function waitUntil(fb, predicate, timeout = 20000, interval = 150) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
   try {
    if (await fb.eval(predicate)) return true;
   } catch (e) {}
   await fb.sleep(interval);
  }
  throw new Error("等待条件超时");
 }

 async function hasText(fb, text) {
  return await fb.eval((t) => document.body && document.body.innerText.includes(t), text);
 }

 async function clickButtonByText(fb, text) {
  return await fb.eval((t) => {
   const btns = Array.from(document.querySelectorAll("button"));
   const target = btns.find(b => ((b.innerText || "").trim()).includes(t) && !b.disabled);
   if (!target) return false;
   target.scrollIntoView({ block: "center", inline: "center" });
   target.click();
   return true;
  }, text);
 }

 // ★ 唯一改动: false → true, 前台打开, 页面必加载(SPA 后台节能不渲染)
 return await open(url, true, async (fb) => {
  await waitUntil(
   fb,
   () => {
    const text = document.body?.innerText || "";
    return text.includes("试试手气") || text.includes("已签到");
   },
   30000
  );

  if (await hasText(fb, "已签到")) {
   return "今日已签到";
  }

  const clicked = await clickButtonByText(fb, "试试手气");
  if (!clicked) throw "未找到可点击的试试手气按钮";

  await waitUntil(
   fb,
   () => (document.body?.innerText || "").includes("已签到"),
   20000
  );

  return "签到成功（试试手气）";
 });
};

exports.check = async function (param) {
 return true;
};