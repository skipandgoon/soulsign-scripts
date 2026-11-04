// ==UserScript==
// @name              Crabpt（蟹黄堡）
// @namespace         https://soulsign.inu1255.cn?account=baiwei666
// @version           1.0.0
// @author            baiwei666
// @loginURL          https://crabpt.vip/index.php
// @expire            14400000
// @domain           crabpt.vip
// ==/UserScript==

exports.run = async function(param) {
var { data } = await axios.get('https://crabpt.vip/attendance.php');
    if (/签到成功/.test(data)) return '签到成功';
    if (/您今天已经签到过了/.test(data)) return '今日已签';
    throw '访问失败';
};

exports.check = async function(param) {
var { data } = await axios.get('https://crabpt.vip/index.php');
    return /欢迎回来/.test(data);
};