// ==UserScript==
// @name 网易云音乐
// @namespace https://soulsign.inu1255.cn?account=keeper-lf
// @version 1.0.7
// @author keeper-lf
// @loginURL https://music.163.com/#/login
// @expire 900000
// @domain music.163.com
// ==/UserScript==
//
// 本版两处改动（病根同一个）：
//   ① 魂签沙箱里 axios 返回的 data 是「原始字符串」（源码 js/offscreen.js: data: await response.text()），
//      原脚本直接当对象用 → data.code 永远 undefined → throw data.msg → 抛出的也是 undefined
//      → 执行结果就显示 "undefined"。修法：先 JSON.parse。
//   ② 删掉 exports.check —— 它同样在读 data.code（永远 undefined）→ 永远返回 false
//      → 被判「不在线」→ 任务根本不执行。魂签源码规定「没有 check 函数 = 默认在线」。
//   run 的流程与返回文案保持原样（'今日已签' / '签到成功'）。

function parseJson(d) {
  if (d && typeof d === 'object') return d;
  try {
    return JSON.parse(String(d || '{}'));
  } catch (e) {
    return {};
  }
}

exports.run = async function (param) {
  // 1. 手机签到
  let res = await axios.get('http://music.163.com/api/point/dailyTask?type=0', { withCredentials: true });
  let data = parseJson(res && res.data);
  if (data.code !== 200 && data.code !== -2) throw (data.msg || ('code=' + data.code));

  // 2. 电脑签到
  res = await axios.get('http://music.163.com/api/point/dailyTask?type=1', { withCredentials: true });
  data = parseJson(res && res.data);
  if (data.code === -2) return '今日已签';
  if (data.code !== 200) throw (data.msg || ('code=' + data.code));
  return '签到成功';
};