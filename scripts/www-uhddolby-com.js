// ==UserScript==
// @name              UHddolby（杜比）
// @namespace         https://soulsign.inu1255.cn?account=justdo888
// @version           1.0.0
// @author            justdo888
// @loginURL          https://www.uhddolby.com/index.php
// @updateURL         https://soulsign.inu1255.cn/script/justdo888/hddolby.com
// @expire            14400000
// @domain            www.uhddolby.com
// ==/UserScript==

exports.run = async function(param) {
var { data } = await axios.get('https://www.uhddolby.com/attendance.php');
    if (/签到成功/.test(data)) return '签到成功';
    if (/签到已得/.test(data)) return '今日已签';
    throw '签到成功';
};

exports.check = async function(param) {
var { data } = await axios.get('https://www.uhddolby.com/index.php');
    return /欢迎回来/.test(data);
};