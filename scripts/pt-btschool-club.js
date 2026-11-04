// ==UserScript==
// @name              Btschool（学校）
// @namespace         https://soulsign.inu1255.cn?account=justdo888
// @version           1.0.1
// @author            justdo888
// @loginURL          https://pt.btschool.club/index.php
// @updateURL         https://soulsign.inu1255.cn/script/justdo888/btschool.club
// @expire            900000
// @domain            pt.btschool.club
// ==/UserScript==

exports.run = async function(param) {
var { data } = await axios.get('https://pt.btschool.club/index.php?action=addbonus');
    return '签到成功';
};

exports.check = async function(param) {
var { data } = await axios.get('https://pt.btschool.club/index.php');
    return /欢迎回来/.test(data);
};