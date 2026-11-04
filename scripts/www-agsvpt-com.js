// ==UserScript==
// @name              AGSV（末日）
// @version           1.0.0
// @author            魂签录制
// @loginURL          https://www.agsvpt.com/attendance.php
// @expire            14400000
// @domain            www.agsvpt.com

// ==/UserScript==

exports.run = async function(param) {
    const runOnce = async () => {
        var { data } = await axios.get('https://www.agsvpt.com/attendance.php');
        if (/签到成功/.test(data)) return '签到成功';
        if (/您今天已经签到过了/.test(data)) return '今日已签';
        throw '访问失败';
    };
    
    for (let i = 1; i <= 2; i++) {
        try {
            return await runOnce();
        } catch (error) {
            console.log(`第${i}次尝试失败：${error}`);
            if (i === 2) throw '两次尝试都失败';
        }
    }
};