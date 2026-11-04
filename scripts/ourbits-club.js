// ==UserScript==
// @name Ourbits（我堡）
// @namespace https://soulsign.inu1255.cn?account=baiwei666
// @version 1.2.1
// @author baiwei666
// @loginURL https://ourbits.club/
// @expire 14400000
// @domain ourbits.club
// ==/UserScript==
//
// 我堡（NexusPHP）签到要点：
//   · 已签到标志（签到页）：抱歉 您今天已经签到过了，请勿重复刷新。
//   · 签到页有嵌入式 Turnstile：过盾后表单会自动提交 = 执行签到
//   · ⚠️ 用户栏的「（签到已得N）」是上次签到的残留，今天没签也照样显示 —— 不能拿它判今日已签
//   · ⚠️ 过盾期间绝不判结果（残留标记 + 还没转完的 Turnstile 会同时出现在页面上，会假报成功）
//   · 故意不写 exports.check：魂签沙箱里 fetch 探测不可靠（会被 CSP/跨域拦成「不在线」）

const ATT = 'https://ourbits.club/attendance.php';

// 一次读全：正文 / Turnstile 令牌长度 / 盾 iframe / 签到入口是否还在
async function probe(fb) {
  return fb.eval(() => {
    const txt = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ');
    const tok = document.querySelector('input[name=cf-turnstile-response], textarea[name=cf-turnstile-response]');
    const cfIframe = [...document.querySelectorAll('iframe')].some((f) => /challenges\.cloudflare\.com/.test(f.src || ''));
    const form = document.querySelector('input[name=formhash]');
    const signBtn = [...document.querySelectorAll('button, input[type=submit], a')]
      .some((e) => /^(签到|点我签到|立即签到|打卡)$/.test((e.innerText || e.value || '').trim()));
    return {
      txt,
      tokenLen: tok ? String(tok.value || '').length : -1,
      cfIframe,
      hasForm: !!(form || signBtn),
      url: location.href,
    };
  }).catch(() => null);
}

function fmt(txt) {
  const flat = String(txt).replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const bits = [];
  const got = flat.match(/签到已得\s*([\d,.]+)/);
  const magic = flat.match(/魔力值\s*\[?\s*使用\s*\]?\s*[:：]\s*([\d,.]+)/);
  if (got) bits.push('签到已得 ' + got[1]);
  if (magic) bits.push('魔力值 ' + magic[1]);
  return bits.length ? ' | ' + bits.join(' · ') : '';
}

exports.run = async function (param) {
  // 不再用首页 fetch 预判：用户栏那个标记不可靠，宁可多开这一个页面
  return await open(ATT, false, async (fb) => {
    let cfSeen = false;
    for (let i = 0; i < 90; i++) {
      await fb.sleep(1000);
      const s = await probe(fb);
      if (!s) continue;
      if (/login\.php|takelogin/i.test(s.url)) throw '未登录：请先在浏览器里打开 ourbits.club 登录一次';

      // 过盾判定：整页挑战 / 盾 iframe 在 / 令牌控件存在但为空 → 继续等，绝不判结果
      const cfText = /Just a moment|cf-challenge|请稍候|Checking your browser|Performing security|人机验证/.test(s.txt);
      const pending = cfText || s.cfIframe || s.tokenLen === 0;
      if (pending) { cfSeen = true; continue; }
      if (s.tokenLen > 0) { cfSeen = true; continue; }   // 令牌刚到手，等表单自动提交完

      // 盾已过 → 判结果（严格：已签看明确文案；成功要求「签到入口消失」）
      if (/您今天已经签到过了|今天已经签到|请勿重复刷新/.test(s.txt)) return '今日已签到' + fmt(s.txt);

      const succ = /签到成功|签到完成|获得\s*[\d.,]+\s*(?:魔力|克|点)/.test(s.txt);
      const reward = /签到已得\s*[\d,.]+/.test(s.txt);
      if (!s.hasForm && (succ || reward)) return '签到成功' + fmt(s.txt);

      if (!s.hasForm && !succ && !reward && i > 30) throw '签到失败：页面既无签到入口也无已签提示（可能改版）';
    }
    throw '签到失败：等不到签到结果' + (cfSeen ? '（人机验证未通过）' : '（页面改版？）');
  });
};