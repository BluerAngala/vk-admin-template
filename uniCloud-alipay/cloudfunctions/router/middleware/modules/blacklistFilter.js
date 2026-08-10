/**
 * 用户黑名单拦截器 - 前置
 * 作用：拦截黑名单用户的请求，返回封禁提示
 * 支持两种用户标识来源：
 *   1. data.id（客户端显式传入，如卡密校验）
 *   2. userInfo._id（token 解析后的登录用户）
 */

module.exports = [{
	id: "blacklistFilter",
	regExp: [
		"(.*)"
	],
	description: "用户黑名单拦截器",
	index: 5, // 尽早执行
	mode: "onActionExecuting",
	enable: true,
	main: async function(event) {
		let { data = {}, util, userInfo } = event;
		let { db } = util;

		// 收集需要检查的用户ID（去重）
		let userIds = [];
		if (data.id) userIds.push(data.id.trim());
		if (data.user_id) userIds.push(data.user_id.trim());
		if (userInfo && userInfo._id) userIds.push(userInfo._id);

		// 去重
		userIds = [...new Set(userIds.filter(Boolean))];
		if (userIds.length === 0) {
			return { code: 0, msg: "ok" };
		}

		try {
			const blacklistRes = await db.collection('vk-blacklist')
				.where({
					user_id: db.command.in(userIds)
				})
				.count();

			if (blacklistRes.total > 0) {
				return {
					code: -403,
					msg: "您的账号已被封禁，请联系管理员解除"
				};
			}
		} catch (err) {
			// 黑名单表不存在时不影响正常请求
			console.log('黑名单检查跳过:', err.message);
		}

		return { code: 0, msg: "ok" };
	}
}]
