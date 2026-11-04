// ==UserScript==
// @name              Zhuque（朱雀）
// @namespace         https://gist.github.com/janlay/d2e136be5940348bb7aee4d9c6b87b5a
// @version           2.0
// @author            janlay
// @loginURL          https://zhuque.in/index
// @expire            14400000
// @domain            zhuque.in
// ==/UserScript==

const endpoint = 'https://zhuque.in/';

exports.run = exports.check = async function(param) {
    const { status } = await axios.get(`${endpoint}index.php`);
    return status == 200 ? 'OK' : 'FAILED'
};