// ==UserScript==
// @name              hxpt（好学）
// @namespace         https://soulsign.inu1255.cn?account=baiwei666
// @version           2.0.0
// @author            baiwei666
// @loginURL          https://www.hxpt.org/login
// @expire            14400000
// @domain            www.hxpt.org
// @grant             cookie
// ==/UserScript==

// 好学改版后是 Next.js 前端 + /api/v1 接口，签到判据只认接口字段，不看页面文本：
//   GET  /api/v1/home                -> data.attendance.{checked_today, calendar[], streak, total_days, off}
//   POST /api/v1/attendance/checkin  -> data.{reward, streak}
//   GET  /api/v1/me/csrf             -> 下发 flux_csrf cookie；写操作必须带 x-csrf-token
const BASE = 'https://www.hxpt.org';
const HOME_API = BASE + '/api/v1/home';
const CHECKIN_API = BASE + '/api/v1/attendance/checkin';
const CSRF_API = BASE + '/api/v1/me/csrf';

// 站点按 UTC+8 切日（前端也是 Date.now()+288e5 取日期）
function today() {
  return new Date(Date.now() + 288e5).toISOString().slice(0, 10);
}

function unwrap(res) {
  let body = res && res.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      throw '接口返回非 JSON（可能被风控或改版）';
    }
  }
  if (!body || typeof body.code !== 'number') throw '接口返回异常';
  if (body.code === 2001) throw '登录已失效，请重新登录';
  if (body.code !== 0) throw body.message || '接口错误 code=' + body.code;
  return body.data || {};
}

async function getJson(path) {
  return unwrap(await axios.get(path));
}

function attendanceOf(home) {
  const attendance = home && home.attendance;
  return attendance && !attendance.off ? attendance : null;
}

function dayRecord(attendance) {
  const list = Array.isArray(attendance && attendance.calendar) ? attendance.calendar : [];
  const day = today();
  return list.find((item) => item && String(item.date).slice(0, 10) === day) || null;
}

function checkedToday(attendance) {
  if (!attendance) return false;
  if (attendance.checked_today === true) return true;
  const record = dayRecord(attendance);
  return !!(record && record.done);
}

async function getCsrfToken() {
  let token = '';
  try {
    token = await getCookie(BASE, 'flux_csrf');
  } catch (error) {
    token = '';
  }
  if (!token) {
    try {
      await axios.get(CSRF_API);
    } catch (error) {
      // 拿不到就按下面的缺失处理
    }
    try {
      token = await getCookie(BASE, 'flux_csrf');
    } catch (error) {
      token = '';
    }
  }
  if (!token) throw '缺少 CSRF 令牌';
  try {
    return decodeURIComponent(token);
  } catch (error) {
    return token;
  }
}

exports.run = async function (param) {
  const before = await getJson(HOME_API);
  const attendance = attendanceOf(before);
  if (!attendance) throw '签到模块未开启';

  const record = dayRecord(attendance);
  if (checkedToday(attendance)) {
    const reward = record && record.done && record.reward != null ? ' · +' + record.reward : '';
    return '今日已签 | 连续 ' + (attendance.streak || 0) + ' 天' + reward;
  }

  const token = await getCsrfToken();
  const result = unwrap(
    await axios.post(CHECKIN_API, JSON.stringify({}), {
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
    })
  );

  // 服务端权威复核：POST 返回 code=0 只算提交成功，状态必须真的翻成已签
  let after = null;
  try {
    after = await getJson(HOME_API);
  } catch (error) {
    after = null;
  }
  if (after) {
    const afterAttendance = attendanceOf(after);
    if (!afterAttendance || !checkedToday(afterAttendance)) {
      throw '接口返回成功，但签到状态未更新';
    }
    const afterRecord = dayRecord(afterAttendance);
    const reward = result.reward != null ? result.reward : afterRecord && afterRecord.reward;
    const streak = result.streak != null ? result.streak : afterAttendance.streak;
    return '签到成功 | 获得 ' + (reward != null ? reward : '?') + ' 魔力 · 连续 ' + (streak || 0) + ' 天';
  }
  return '签到成功 | 获得 ' + (result.reward != null ? result.reward : '?') + ' 魔力（状态复核未完成）';
};
