// ==UserScript==
// @name nodeseek
// @version 1.2.0
// @author 魂签录制
// @loginURL https://www.nodeseek.com/board
// @expire 300e3
// @domain www.nodeseek.com
// ==/UserScript==

exports.run = async function (param) {
 const url = "https://www.nodeseek.com/board";

 // 等待工具：存在即可（后台标签也能过，不纠结可见性）
 async function waitForSelector(fb, selector, timeout = 20000, interval = 300) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
   const ok = await fb.eval((sel) => !!document.querySelector(sel), selector);
   if (ok) return true;
   await fb.sleep(interval);
  }
  throw new Error(`等待元素超时: ${selector}`);
 }

 // 读 .head-info 状态文本
 async function readStatus(fb) {
  return await fb.eval(() => {
   const hi = document.querySelector('.head-info');
   return hi ? hi.innerText.trim() : '';
  });
 }

 return await open(url, false, async (fb) => {
  // 0) ★ 先检测是否已在别处签到（今天已签过）
  await fb.sleep(1000);
  const before = await readStatus(fb);
  if (/今日签到|已签到|签到成功/.test(before)) {
   return "✅ 今日已签到: " + before.slice(0, 40);
  }

  // 1) 等签到入口出现并点击
  const entrySel = ".head-info>div>:nth-child(2)";
  await waitForSelector(fb, entrySel, 20000);
  await fb.click(entrySel, 20000);

  // 2) 等确认按钮并点击
  const okSel = ".msc-ok";
  await waitForSelector(fb, okSel, 20000);
  const ok = await fb.click(okSel, 20000);
  if (!ok) throw "签到失败";

  // 3) 点击后再确认结果（防"点了但没签上"）
  await fb.sleep(2000);
  const after = await readStatus(fb);
  if (/今日签到|已签到|签到成功/.test(after)) {
   return "✅ 签到成功: " + after.slice(0, 40);
  }
  return "✅ 签到成功";
 });
};

exports.check = async function (param) {
 return true;
};