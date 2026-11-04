// ==UserScript==
// @name              HDArea（好大）
// @namespace         https://soulsign.inu1255.cn?account=lvdream
// @version           0.0.1
// @author            lvdream
// @loginURL          https://hdarea.club/sign_in.php?action=sign_in
// @expire            900000
// @domain            hdarea.club
// ==/UserScript==

exports.run = async function(param) {
var { data } = await axios.get('https://hdarea.club/sign_in.php?action=sign_in');
     if (/签到成功/.test(data)) return '签到成功';
     if (/请不要重复签到哦！/.test(data)) return '今日已签';
    throw '签到成功';
};

exports.check = async function(param) {
var { data } = await axios.get('https://hdarea.club/index.php');
     return /欢迎回来/.test(data);
};