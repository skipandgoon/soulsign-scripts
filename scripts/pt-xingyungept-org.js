// ==UserScript==
// @name              xingyunge（星陨阁）
// @namespace         https://soulsign.inu1255.cn/scripts/366
// @version           1.0.1
// @author            yqt
// @loginURL          https://pt.xingyungept.org/
// @expire            14400000
// @domain            pt.xingyungept.org
// ==/UserScript==

exports.run = async function(param) {
var {
    data
  } = await axios.get('https://pt.xingyungept.org/attendance.php');
  if (/签到成功/.test(data)) {
    return '签到成功';
  } else if (/已经签到过了/.test(data)) {
    return '已经签到过了';
  }
  throw '签到失败';
};

exports.check = async function(param) {
var {
    data
  } = await axios.get('https://pt.xingyungept.org/');
  return /欢迎回来/.test(data);
};