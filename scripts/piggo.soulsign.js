// ==UserScript==
// @name         猪猪 piggo.me
// @namespace    https://soulsign.inu1255.cn?account=checkin
// @version      1.0.5
// @author       墨墨
// @loginURL     https://piggo.me/
// @expire       900000
// @domain       piggo.me
// ==/UserScript==
//
// 猪猪 2026-11 改版后签到要点：
//   · 前端是 SPA，签到按钮在 /calendar 页面里（不是 attendance.php，那个已经废了）
//   · 点签到会要求 Cloudflare Turnstile 人机验证 —— 无头浏览器过不了，
//     但魂签跑在你的真实浏览器里，验证会静默通过，所以这个脚本能正常签
//   · 脚本只做两件事：进日历页 → 点「签到 · +N」→ 等页面出现「已签到」
//   · 故意不写 exports.check：站点有 CF，沙箱里探测会误判「离线」；
//     魂签源码规定「没有 check 函数 = 默认在线」，交给 run 自己报错更可靠

const PAGE = 'https://piggo.me/calendar';

function parseSigned(text) {
  const flat = String(text).replace(/\s+/g, ' ');
  const m = flat.match(/已签到(?:\s*·\s*(\d+)\s*天)?(?:\s*·\s*\+?\s*(\d+))?/);
  if (!m) return null;
  return { streak: m[1] || '', points: m[2] || '' };
}

function fmt(prefix, info) {
  const bits = [];
  if (info && info.streak) bits.push('连续 ' + info.streak + ' 天');
  if (info && info.points) bits.push('+' + info.points);
  return bits.length ? (prefix + ' | ' + bits.join(' · ')) : prefix;
}

async function body(fb) {
  try {
    return await fb.eval(() => (document.body ? document.body.innerText : ''));
  } catch (e) {
    return '';
  }
}

// 在页面里找「签到 · +N」按钮并点击（class 会变，所以按文字找）
async function clickSign(fb) {
  try {
    return await fb.eval(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const txt = (e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
      let el = document.querySelector('[class*=att-pill]');
      if (!el || !/^(签到|补签)/.test(txt(el))) {
        const all = [...document.querySelectorAll('body *')].filter(vis);
        let c = all.filter((e) => /^(签到|补签)(\s*·\s*\+\s*\d+)?$/.test(txt(e)));
        if (!c.length) c = all.filter((e) => /签到\s*·/.test(txt(e)) && e.children.length <= 2);
        el = c.length ? c.sort((a, b) => txt(a).length - txt(b).length)[0] : null;
      }
      if (!el) return '';
      try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
      el.click();
      return txt(el);
    });
  } catch (e) {
    return '';
  }
}

exports.run = async function (param) {
  return await open(PAGE, false, async (fb) => {
    await fb.sleep(6000); // 等 SPA 启动
    let clicked = false;
    for (let i = 0; i < 75; i++) {
      const url = await fb.eval(() => location.href).catch(() => '');
      if (/\/login/.test(url)) throw '未登录：请先在浏览器里打开 piggo.me 登录一次';

      const t = await body(fb);
      const info = parseSigned(t);
      if (info) {
        return clicked ? fmt('签到成功', info) : fmt('今日已签到', info);
      }

      if (!clicked) {
        const label = await clickSign(fb);
        if (label) {
          clicked = true;
          await fb.sleep(3000);
          continue;
        }
      } else if (i % 8 === 0) {
        // 万一 Turnstile 弹了复选框，试着点一下（正常浏览器里一般会静默通过）
        try {
          const f = await fb.getFrame('challenges.cloudflare.com', 3, 3000);
          if (f) await f.click('input[type=checkbox], .ctp-checkbox-label, body').catch(() => {});
        } catch (e) {}
      }
      await fb.sleep(1500);
    }
    throw '签到失败：等不到「已签到」（页面可能又改版，或人机验证没过）';
  });
};
