module.exports = {
	/**
	 * 获取展示配置列表（管理员）
	 * @url admin/display-config/sys/getList
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能查看展示配置' };
		}

		res = await vk.baseDao.getTableData({
			dbName: "vk-display-config",
			data,
			sortArr: [{ name: "_add_time", type: "asc" }]
		});

		return res;
	}
}
