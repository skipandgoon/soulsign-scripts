// ==UserScript==
// @name              wps
// @version           1.0.0
// @author            魂签录制
// @loginURL          https://bbs.wps.cn/
// @expire            300e3
// @domain            bbs.wps.cn
// ==/UserScript==

exports.run = async function(param) {
	// 使用浏览器打开登录界面，并获取窗口句柄
	return await open("https://bbs.wps.cn/", /** 调试时设置成true */ false, async (fb) => {
		var rate = 0.5; // 间隔时间倍率,值越小脚本执行越快
		await fb.sleep(528 * rate)
		if(!await fb.click(".el-tooltip")) throw '签到失败'
		return "签到成功";
	});
};

exports.check = async function(param) {
	return true;
};