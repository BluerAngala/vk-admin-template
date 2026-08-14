module.exports = {
	/**
	 * 根据 config_key 获取展示配置（前端用，不需要管理员权限）
	 * @url admin/display-config/sys/getByKey
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		let { config_key } = data;

		if (!config_key) {
			return { code: -1, msg: '缺少配置标识' };
		}

		// 查询启用的配置
		const result = await db.collection('vk-display-config')
			.where({ config_key, enable: true })
			.limit(1)
			.get();

		if (result.data && result.data.length > 0) {
			res.data = result.data[0];
		} else {
			res.data = null;
		}

		return res;
	}
}
