// ==UserScript==
// @name              Hdtime（时间）
// @namespace         https://soulsign.inu1255.cn?account=justdo888
// @version           1.0.0
// @author            justdo888
// @loginURL          https://hdtime.org/index.php
// @expire            14400000
// @domain            hdtime.org
// ==/UserScript==

exports.run = async function(param) {
    try {
        // 增加超时时间到 20 秒
        const { data } = await axios.get('https://hdtime.org/attendance.php', {
            timeout: 20000
        });
        
        if (/签到成功/.test(data)) return '签到成功';
        if (/您今天已经签到过了/.test(data)) return '今日已签';
        
        // 处理其他可能的响应
        return '未知响应: ' + data.substring(0, 50) + '...';
    } catch (error) {
        // 处理不同类型的错误
        if (error.response) {
            // 服务器响应了非 2xx 状态码
            return `服务器错误: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            // 请求已发送但未收到响应
            return '请求超时或网络错误';
        } else {
            // 其他错误
            return '请求失败: ' + error.message;
        }
    }
};

exports.check = async function(param) {
    try {
        // 增加超时时间到 20 秒
        const { data } = await axios.get('https://hdtime.org/index.php', {
            timeout: 20000
        });
        
        return /欢迎回来/.test(data);
    } catch (error) {
        // 登录检查失败时返回 false
        return false;
    }
};