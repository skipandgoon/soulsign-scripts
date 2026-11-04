// ==UserScript==
// @name              TTG（听听歌）
// @namespace         https://soulsign.inu1255.cn?account=chitanda
// @version           1.0.0
// @author            chitanda
// @loginURL          https://totheglory.im
// @updateURL         https://soulsign.inu1255.cn/script/chitanda/TTG
// @expire            14400000
// @domain            totheglory.im
// @grant            notify
// ==/UserScript==

exports.run = async function(param) {
var  {data} = await axios.get('https://totheglory.im/index.php');
    var signToken=data.match(/signed_token.*."/)[0].split('"')[1];
    var timestamp=data.match(/signed_timestamp.*."/)[0].split('"')[1];
    const params = new URLSearchParams();
    params.append('signed_timestamp', timestamp);
    params.append('signed_token', signToken);
    var url='https://totheglory.im/signed.php';
    var {data}=await axios.post(url,params);
    if (/签到/.test(data))return '今日已签';
    else throw"签到失败"
};

exports.check = async function(param) {
var { data } = await axios.get('https://totheglory.im/index.php');
    return /退出/.test(data);
};