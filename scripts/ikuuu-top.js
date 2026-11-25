// ==UserScript==
// @name         ikuuu（iKuuu VPN）
// @namespace    https://soulsign.inu1255.cn?account=checkin
// @version      1.0.1
// @author       墨墨
// @loginURL     https://ikuuu.top/
// @expire       900000
// @domain       ikuuu.top
// @domain       ikuuu.pw
// ==/UserScript==
//
// iKuuu 每日签到（跑在魂签里，直接用浏览器登录态，不用再往青龙贴 COOKIE）
//
// 要点：
//   · 站点登录要「账号密码 + 点选验证」，脚本不尝试自动登录；
//     登录态失效时明确报「需要手动登录」，你手点一次即可，不需要复制 cookie
//   · 只做一件事：进站 → 找「签到」按钮 → 点 → 等「签到成功 / 已签到」
//   · 域名会换（ikuuu.top / ikuuu.pw），脚本会在这两个之间自动切
//   · 故意不写 exports.check：站点前端是 SPA，沙箱探测容易误判离线

const DOMAINS = ['https://ikuuu.top', 'https://ikuuu.pw'];

function txtOf(t) {
  return String(t || '').replace(/\s+/g, ' ');
}

// 只认「登录页」的两个硬信号：URL 带 login，或页面上真有密码输入框。
// 不能用文字判断——登录后的页面也会有「退出登录」字样，会误判。
async function hasPasswordField(fb) {
  try {
    return await fb.eval(() =>
      !!document.querySelector('input[type=password], input[name=password], input[name=passwd]')
    );
  } catch (e) {
    return false;
  }
}

async function bodyOf(fb) {
  try {
    return await fb.eval(() => (document.body ? document.body.innerText : ''));
  } catch (e) {
    return '';
  }
}

async function urlOf(fb) {
  try {
    return await fb.eval(() => location.href);
  } catch (e) {
    return '';
  }
}

// 按文字找「签到 / 每日签到 / 立即签到」按钮
async function clickSign(fb) {
  try {
    return await fb.eval(() => {
      const vis = (e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const t = (e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
      const all = [...document.querySelectorAll('button, a, div, span')].filter(vis);
      let c = all.filter((e) => /^(签到|每日签到|立即签到|签到领流量)$/.test(t(e)));
      if (!c.length) c = all.filter((e) => /签到/.test(t(e)) && t(e).length <= 8 && e.children.length <= 2);
      if (!c.length) return '';
      const el = c.sort((a, b) => t(a).length - t(b).length)[0];
      try {
        el.scrollIntoView({ block: 'center' });
      } catch (e) {}
      el.click();
      return t(el);
    });
  } catch (e) {
    return '';
  }
}

async function readResult(fb) {
  const t = txtOf(await bodyOf(fb));
  if (/签到成功/.test(t)) return '签到成功';
  if (/已签到|已经签到|签到过/.test(t)) return '今日已签到';
  const m = t.match(/签到\s*成功|获得\s*([\d.]+\s*[MGK]?B?)/);
  if (m) return '签到成功' + (m[1] ? ' | 获得 ' + m[1] : '');
  return '';
}

exports.run = async function () {
  let lastErr = '';
  for (const base of DOMAINS) {
    try {
      const out = await open(base + '/', false, async (fb) => {
        await fb.sleep(5000); // 等 SPA 起来

        let clicked = false;
        for (let i = 0; i < 60; i++) {
          const url = await urlOf(fb);
          const t = txtOf(await bodyOf(fb));

          if (/\/auth\/login|\/login/.test(url) || (await hasPasswordField(fb))) {
            throw '未登录：iKuuu 需要「账号密码 + 点选验证」，请在浏览器里手动登录一次（登完保持登录即可，不用复制 cookie）';
          }

          const res = await readResult(fb);
          if (res) return clicked ? res : '今日已签到';

          if (!clicked) {
            const label = await clickSign(fb);
            if (label) {
              clicked = true;
              await fb.sleep(3500);
              continue;
            }
          }
          await fb.sleep(1200);
        }
        throw '签到失败：等不到结果（页面可能改版，或签到按钮文案变了）';
      });
      if (out) return out;
    } catch (e) {
      lastErr = String((e && e.message) || e);
      if (/未登录/.test(lastErr)) throw lastErr; // 登录问题换域名也没用
    }
  }
  throw lastErr || '签到失败：两个域名都没成功';
};
