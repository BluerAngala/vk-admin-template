module.exports = {
	/**
	 * 更新展示配置
	 * @url admin/display-config/sys/update
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能修改展示配置' };
		}

		let { _id, config_value, enable } = data;

		if (!_id) {
			return { code: -1, msg: '缺少配置ID' };
		}

		// 更新数据
		let updateData = {
			_update_time: Date.now()
		};

		if (config_value !== undefined) {
			updateData.config_value = config_value;
		}
		if (enable !== undefined) {
			updateData.enable = !!enable;
		}

		// 执行更新
		const updateRes = await db.collection('vk-display-config')
			.doc(_id)
			.update(updateData);

		if (updateRes.updated === 0) {
			return { code: -1, msg: '配置不存在或更新失败' };
		}

		res.msg = '配置更新成功';

		return res;
	}
}
