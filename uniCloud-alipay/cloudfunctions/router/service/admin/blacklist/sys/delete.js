/**
 * 从黑名单移除用户
 * @url admin/blacklist/sys/delete
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		let { _id, user_id } = data;

		// 支持按 _id 或 user_id 删除
		const whereJson = _id ? { _id } : { user_id: user_id };

		if (!_id && !user_id) {
			return { code: -1, msg: '请指定要移除的用户' };
		}

		try {
			const removeRes = await db.collection('vk-blacklist')
				.where(whereJson)
				.remove();

			if (removeRes.deleted > 0) {
				res.msg = '已从黑名单移除';
			} else {
				res.code = -1;
				res.msg = '未找到该黑名单记录';
			}
		} catch (err) {
			res.code = -1;
			res.msg = err.message;
		}

		return res;
	}
};
