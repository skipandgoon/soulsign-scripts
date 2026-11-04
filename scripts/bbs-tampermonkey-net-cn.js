// ==UserScript==
// @name              油猴中文网（改版）
// @namespace         https://soulsign.inu1255.cn?account=zszczh
// @version           1.0.0
// @author            zszczh
// @loginURL          https://bbs.tampermonkey.net.cn/plugin.php?id=dsu_paulsign:sign
// @updateURL         https://soulsign.inu1255.cn/script/zszczh/油猴中文网
// @expire            300000
// @domain            bbs.tampermonkey.net.cn
// @param            name 账号
// @param            pwd 密码
// ==/UserScript==

exports.run = async function(param) {
    return await open("https://bbs.tampermonkey.net.cn/plugin.php?id=dsu_paulsign:sign", false, async (fb) => {
        const rate = 0.5;
        
        // 预检查是否已签到
        const preCheck = await fb.eval(() => {
            return document.body.innerText.includes('您今天已经签到过了或者签到时间还未开始');
        });
        if(preCheck) return "签到成功（已检测到签到提示）";
        // 原有操作流程
        await fb.sleep(1327 * rate);
        await fb.click("#kx>center>img");
        await fb.sleep(1771 * rate);
        await fb.click(".tfm>tbody>tr>td>:nth-child(3)");
        await fb.sleep(3 * rate);
        await fb.click(".tfm>tbody>tr>td>:nth-child(3)>input");
        await fb.sleep(0 * rate);
        await fb.value(".tfm>tbody>tr>td>:nth-child(3)>input","3");
        await fb.sleep(1 * rate);
        await fb.value(".tfm>tbody>tr>td>:nth-child(3)>input","3");
        await fb.sleep(1781 * rate);
        await fb.click(".tr3>div>a>img");
        await fb.waitLoaded(); // undefined
        if(!(await fb.eval("location.href")).startsWith("https://bbs.tampermonkey.net.cn/plugin.php")) throw '签到失败'
        return "签到成功";
	});
};

exports.check = async function(param) {
return true;
};