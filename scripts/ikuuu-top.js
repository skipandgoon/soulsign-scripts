// ==UserScript==
// @name         ikuuu（iKuuu VPN）
// @namespace    https://soulsign.inu1255.cn?account=checkin
// @version      1.0.2
// @author       墨墨
// @loginURL     https://ikuuu.top/
// @expire       900000
// @domain       ikuuu.top
// @domain       ikuuu.pw
// ==/UserScript==
//
// iKuuu 每日签到（跑在魂签里，直接用浏览器登录态，不用再往青龙贴 COOKIE）
//
// 判定顺序（1.0.2 改）：
//   1) 先直接调站内接口 POST /user/checkin（同步 XHR，页面里带 cookie），拿 JSON 的 ret/msg
//      —— 这样「签到成功 / 今日已签到 / 未登录」三种结果是确定的，不靠页面文案猜
//   2) 接口不可用（404/非 JSON）才退回「找按钮点一下，再等页面文字」
//   3) 页面文案判定放宽：已签到 / 今日已签 / 签到过 / 连续签到 / 明天再来 都算已签
//
// 登录要「账号密码 + 点选验证」，脚本不自动登录；登录态没了直接报错让你手点一次。

const DOMAINS = ['https://ikuuu.top', 'https://ikuuu.pw'];
const DONE_RE = /已签到|今日已签|签到过|已经签到|连续签到|明天再来|签到成功/;

function txtOf(t) {
  return String(t || '').replace(/\s+/g, ' ');
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

async function hasPasswordField(fb) {
  try {
    return await fb.eval(() =>
      !!document.querySelector('input[type=password], input[name=password], input[name=passwd]')
    );
  } catch (e) {
    return false;
  }
}

// 直接打签到接口：返回 { kind, msg }
async function apiCheckin(fb) {
  let raw = '';
  try {
    raw = await fb.eval(() => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/user/checkin', false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send('{}');
        return String(xhr.status) + '|' + String(xhr.responseText || '').slice(0, 400);
      } catch (e) {
        return 'ERR|' + String(e);
      }
    });
  } catch (e) {
    return null;
  }
  if (!raw || raw.indexOf('|') < 0) return null;
  const idx = raw.indexOf('|');
  const status = Number(raw.slice(0, idx));
  const body = raw.slice(idx + 1);
  if (!status || status === 404 || /ERR/.test(raw.slice(0, idx))) return null;

  let json = null;
  try {
    json = JSON.parse(body);
  } catch (e) {}

  if (json && typeof json === 'object') {
    const msg = String(json.msg || json.message || '');
    const ret = json.ret;
    if (ret === 1 || ret === '1' || json.success === true) return { kind: 'ok', msg: msg || '签到成功' };
    if (/已签到|已经签到|签到过|重复/.test(msg)) return { kind: 'ok', msg: msg || '今日已签到' };
    if (/未登录|请登录|登录后|token|授权/.test(msg) || status === 401 || status === 403) {
      return { kind: 'login', msg: msg || 'HTTP ' + status };
    }
    if (ret === 0 || ret === '0') return { kind: 'fail', msg: msg || '接口返回 ret=0' };
    return { kind: 'unknown', msg: msg || body.slice(0, 120) };
  }

  if (/login|登录/.test(body)) return { kind: 'login', msg: '接口返回登录页' };
  return { kind: 'unknown', msg: body.slice(0, 120) };
}

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

exports.run = async function () {
  let lastErr = '';
  for (const base of DOMAINS) {
    try {
      const out = await open(base + '/', false, async (fb) => {
        await fb.sleep(5000); // 等 SPA 起来

        if (await hasPasswordField(fb)) {
          throw '未登录：iKuuu 需要「账号密码 + 点选验证」，请在浏览器里手动登录一次（登完保持登录即可，不用复制 cookie）';
        }

        let pageText = txtOf(await bodyOf(fb));
        if (DONE_RE.test(pageText) && !/未签到/.test(pageText)) return '今日已签到';

        // 1) 直接打接口，结果确定性最高
        const api = await apiCheckin(fb);
        if (api) {
          if (api.kind === 'ok') return /签到成功/.test(api.msg) ? '签到成功 | ' + api.msg : '今日已签到';
          if (api.kind === 'login') throw '未登录：' + api.msg + '（浏览器里手动登录一次即可）';
          if (api.kind === 'fail') lastErr = '接口失败：' + api.msg;
        }

        // 2) 退回点按钮
        let clicked = false;
        for (let i = 0; i < 30; i++) {
          pageText = txtOf(await bodyOf(fb));
          if (DONE_RE.test(pageText)) return clicked ? '签到成功' : '今日已签到';
          if (await hasPasswordField(fb)) {
            throw '未登录：会话中途失效，请在浏览器里手动登录一次';
          }
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
        throw lastErr || '签到失败：30 秒内没等到结果（页面可能改版，或签到按钮文案变了）';
      });
      if (out) return out;
    } catch (e) {
      lastErr = String((e && e.message) || e);
      if (/未登录/.test(lastErr)) throw lastErr;
    }
  }
  throw lastErr || '签到失败：两个域名都没成功';
};
