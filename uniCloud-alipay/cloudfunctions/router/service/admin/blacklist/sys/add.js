/**
 * 添加黑名单用户
 * @url admin/blacklist/sys/add
 */
module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		let { user_id, reason } = data;

		if (!user_id || !user_id.trim()) {
			return { code: -1, msg: '请输入用户ID' };
		}

		user_id = user_id.trim();

		// 检查是否已存在
		const existing = await db.collection('vk-blacklist')
			.where({ user_id })
			.count();

		if (existing.total > 0) {
			return { code: -1, msg: '该用户已在黑名单中' };
		}

		try {
			await db.collection('vk-blacklist').add({
				user_id,
				reason: reason || '',
				add_by: userInfo && userInfo._id ? userInfo._id : '',
			});
			res.msg = '已加入黑名单';
		} catch (err) {
			res.code = -1;
			res.msg = err.message;
		}

		return res;
	}
};
