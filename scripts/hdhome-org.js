// ==UserScript==
// @name              HDHome（家园）
// @namespace         https://soulsign.inu1255.cn/scripts/366
// @version           1.0.1
// @author            yqt
// @loginURL          https://hdhome.org/
// @updateURL         https://soulsign.inu1255.cn/script/yqt/HDHome
// @expire            14400000
// @domain            hdhome.org
// ==/UserScript==

exports.run = async function(param) {
var {
    data
  } = await axios.get('https://hdhome.org/attendance.php');
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
  } = await axios.get('https://hdhome.org/');
  return /欢迎回来/.test(data);
};