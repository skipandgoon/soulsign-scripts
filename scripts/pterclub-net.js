// ==UserScript==
// @name              pter（猫）
// @namespace         https://soulsign.inu1255.cn?account=baiwei666
// @version           1.0.0
// @author            baiwei666
// @loginURL          https://pterclub.net/index.php
// @expire            14400000
// @domain           pterclub.net
// ==/UserScript==

exports.run = async function(param) {
var { data } = await axios.get('https://pterclub.net/attendance.php');
    if (/签到成功/.test(data)) return '签到成功';
    if (/您今天已经签到过了/.test(data)) return '今日已签';
    throw '访问失败';
};

exports.check = async function(param) {
var { data } = await axios.get('https://pterclub.net/index.php');
    return /首页/.test(data);
};