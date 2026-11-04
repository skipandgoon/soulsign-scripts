// ==UserScript==
// @name              ld246.com
// @version           1.0.0
// @author            魂签录制
// @loginURL          https://ld246.com/activity/checkin
// @expire            300e3
// @domain            ld246.com
// @param             name 账号
// @param             pwd 密码
// ==/UserScript==

exports.run = async function(param) {
 // 使用浏览器打开登录界面，并获取窗口句柄
 return await open("https://ld246.com/activity/checkin", /** 调试时设置成true */ false, async (fb) => {
  var rate = 1.5; // 间隔时间倍率,值越小脚本执行越快
  await fb.sleep(613 * rate)

  // 1. 已签到判断: 页面出现"今日签到获得X积分/已签到"字样 → 直接返回, 不误报失败
  var t0 = await fb.eval("document.body ? document.body.innerText : ''");
  if (/今日签到获得|今日已签到|您已签到|已经签到/.test(t0)) {
   return "今日已签到";
  }

  // 2. 未签到 → 点击签到按钮
  await fb.click(".btn");
  await fb.waitLoaded();

  // 3. 等待签到反馈出现(最多 10s, 轮询页面文本)
  for (var i = 0; i < 20; i++) {
   await fb.sleep(500);
   var t = await fb.eval("document.body ? document.body.innerText : ''");
   if (/今日签到获得/.test(t)) {
    return "签到成功";
   }
   if (/签到成功|已签到/.test(t)) {
    return "签到成功";
   }
  }

  // 4. 兜底: 原 URL 跳转判定
  if (!(await fb.eval("location.href")).startsWith("https://ld246.com/activity/checkin")) throw '签到失败'
  throw '签到失败';
 });
};

exports.check = async function(param) {
 // 保持 true: 由 run 内做已签到判断(返回"今日已签到"), 避免 check 误判导致跳过或误报
 return true;
};