// ==UserScript==
// @name              M-team（馒头）
// @namespace         https://gist.github.com/janlay/d2e136be5940348bb7aee4d9c6b87b5a
// @version           2.0
// @author            janlay
// @loginURL          https://kp.m-team.cc/index.php
// @updateURL         https://gist.github.com/janlay/d2e136be5940348bb7aee4d9c6b87b5a/raw/m-team.js
// @expire            14400000
// @domain            kp.m-team.cc
// ==/UserScript==

const endpoint = 'https://kp.m-team.cc/';

exports.run = exports.check = async function(param) {
    const { status } = await axios.get(`${endpoint}index.php`);
    return status == 200 ? 'OK' : 'FAILED'
};