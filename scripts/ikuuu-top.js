// ==UserScript==
// @name         ikuuu（iKuuu VPN）
// @namespace    https://soulsign.inu1255.cn?account=checkin
// @version      1.1.0
// @author       墨墨
// @loginURL     https://ikuuu.top/
// @expire       900000
// @domain       ikuuu.top
// @domain       ikuuu.pw
// @param            name 账号
// @param            pwd 密码
// ==/UserScript==
//
// iKuuu 每日签到（魂签，浏览器登录态；不需要往青龙贴 COOKIE）
//
// 1.1.0：
//   · 支持参数「账号 / 密码」：登录页会自动填写并提交（填值用原生 setter + input/change 事件，
//     Vue/React 的受控输入也能吃到）
//   · 如果登录页还有「点选验证」，脚本无法代过 → 会明确报错让你手点一次，登完再跑
//   · 签到判定仍优先调 POST /user/checkin，拿 ret/msg 判定成功 / 已签到 / 未登录
//   · 域名在 ikuuu.top / ikuuu.pw 之间自动切换

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

// 用参数里的账号密码填登录表单（原生 setter + 事件，兼容受控组件）
async function fillLogin(fb, name, pwd) {
  const expr =
    "(function(){" +
    "var NAME=" + JSON.stringify(String(name || "")) + ";" +
    "var PWD=" + JSON.stringify(String(pwd || "")) + ";" +
    "function set(el,v){if(!el)return false;" +
    "var d=Object.getOwnPropertyDescriptor(el.constructor.prototype,'value');" +
    "if(d&&d.set){d.set.call(el,v)}else{el.value=v}" +
    "el.dispatchEvent(new Event('input',{bubbles:true}));" +
    "el.dispatchEvent(new Event('change',{bubbles:true}));return true}" +
    "var p=document.querySelector('input[type=password],input[name=password],input[name=passwd]');" +
    "var u=document.querySelector('input[type=email],input[name=email],input[name=username],input[name=account],input[type=text]');" +
    "var okU=set(u,NAME), okP=set(p,PWD);" +
    "return JSON.stringify({u:!!u,p:!!p,okU:okU,okP:okP})" +
    "})()";
  try {
    return JSON.parse((await fb.eval(expr)) || "{}");
  } catch (e) {
    return {};
  }
}

async function clickLogin(fb) {
  try {
    return await fb.eval(() => {
      const t = (e) => (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim();
      const btns = [...document.querySelectorAll('button, input[type=submit], a')];
      const b = btns.find((e) => /^(登\s*录|登录|立即登录|sign in|login)$/i.test(t(e) || e.value || ""));
      if (!b) return "";
      b.click();
      return t(b) || "login";
    });
  } catch (e) {
    return "";
  }
}

async function apiCheckin(fb) {
  let raw = "";
  try {
    raw = await fb.eval(() => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/user/checkin", false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send("{}");
        return String(xhr.status) + "|" + String(xhr.responseText || "").slice(0, 400);
      } catch (e) {
        return "ERR|" + String(e);
      }
    });
  } catch (e) {
    return null;
  }
  if (!raw || raw.indexOf("|") < 0) return null;
  const idx = raw.indexOf("|");
  const status = Number(raw.slice(0, idx));
  const body = raw.slice(idx + 1);
  if (!status || status === 404 || /^ERR/.test(raw)) return null;

  let json = null;
  try {
    json = JSON.parse(body);
  } catch (e) {}

  if (json && typeof json === "object") {
    const msg = String(json.msg || json.message || "");
    const ret = json.ret;
    if (ret === 1 || ret === "1" || json.success === true) return { kind: "ok", msg: msg || "签到成功" };
    if (/已签到|已经签到|签到过|重复/.test(msg)) return { kind: "ok", msg: msg || "今日已签到" };
    if (/未登录|请登录|登录后|token|授权/.test(msg) || status === 401 || status === 403) {
      return { kind: "login", msg: msg || "HTTP " + status };
    }
    if (ret === 0 || ret === "0") return { kind: "fail", msg: msg || "接口返回 ret=0" };
    return { kind: "unknown", msg: msg || body.slice(0, 120) };
  }
  if (/login|登录/.test(body)) return { kind: "login", msg: "接口返回登录页" };
  return { kind: "unknown", msg: body.slice(0, 120) };
}

async function clickSign(fb) {
  try {
    return await fb.eval(() => {
      const vis = (e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const t = (e) => (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim();
      const all = [...document.querySelectorAll("button, a, div, span")].filter(vis);
      let c = all.filter((e) => /^(签到|每日签到|立即签到|签到领流量)$/.test(t(e)));
      if (!c.length) c = all.filter((e) => /签到/.test(t(e)) && t(e).length <= 8 && e.children.length <= 2);
      if (!c.length) return "";
      const el = c.sort((a, b) => t(a).length - t(b).length)[0];
      try {
        el.scrollIntoView({ block: "center" });
      } catch (e) {}
      el.click();
      return t(el);
    });
  } catch (e) {
    return "";
  }
}

async function tryLogin(fb, param) {
  const name = (param && (param.name || param.username)) || "";
  const pwd = (param && (param.pwd || param.password)) || "";
  if (!name || !pwd) return false;
  const filled = await fillLogin(fb, name, pwd);
  if (!filled.okP) return false;
  await fb.sleep(600);
  await clickLogin(fb);
  for (let i = 0; i < 20; i++) {
    await fb.sleep(1000);
    if (!(await hasPasswordField(fb))) return true;
  }
  return false;
}

exports.run = async function (param) {
  let lastErr = "";
  for (const base of DOMAINS) {
    try {
      const out = await open(base + "/", false, async (fb) => {
        await fb.sleep(5000); // 等 SPA 起来

        if (await hasPasswordField(fb)) {
          const ok = await tryLogin(fb, param);
          if (!ok) {
            throw "未登录：自动填写/提交后仍停在登录页（多半是「点选验证」没过）。请在浏览器里手动登录一次，或确认参数里账号密码正确";
          }
          await fb.sleep(3000);
        }

        let pageText = txtOf(await bodyOf(fb));
        if (DONE_RE.test(pageText) && !/未签到/.test(pageText)) return "今日已签到";

        const api = await apiCheckin(fb);
        if (api) {
          if (api.kind === "ok") return /签到成功/.test(api.msg) ? "签到成功 | " + api.msg : "今日已签到";
          if (api.kind === "login") {
            const ok = await tryLogin(fb, param);
            if (!ok) throw "未登录：" + api.msg + "（请手动登录一次，或检查参数里的账号密码）";
          } else if (api.kind === "fail") {
            lastErr = "接口失败：" + api.msg;
          }
        }

        let clicked = false;
        for (let i = 0; i < 30; i++) {
          pageText = txtOf(await bodyOf(fb));
          if (DONE_RE.test(pageText)) return clicked ? "签到成功" : "今日已签到";
          if (await hasPasswordField(fb)) {
            const ok = await tryLogin(fb, param);
            if (!ok) throw "未登录：会话中途失效，请在浏览器里手动登录一次";
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
        throw lastErr || "签到失败：30 秒内没等到结果（页面可能改版，或签到按钮文案变了）";
      });
      if (out) return out;
    } catch (e) {
      lastErr = String((e && e.message) || e);
      if (/未登录/.test(lastErr)) throw lastErr;
    }
  }
  throw lastErr || "签到失败：两个域名都没成功";
};
