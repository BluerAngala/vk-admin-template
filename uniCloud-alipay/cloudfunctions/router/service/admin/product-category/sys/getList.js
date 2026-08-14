module.exports = {
	/**
	 * 获取产品分类列表（管理员）
	 * @url admin/product-category/sys/getList
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能查看分类列表' };
		}

		res = await vk.baseDao.getTableData({
			dbName: "vk-product-categories",
			data,
			sortArr: [{ name: "sort", type: "asc" }, { name: "_add_time", type: "asc" }]
		});

		return res;
	}
}
