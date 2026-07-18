module.exports = {
	/**
	 * 获取产品列表（管理员和普通用户）
	 * @url admin/product/sys/getList
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 判断是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		
		let whereJson = {};
		
		// 如果不是管理员，只能看到自己定制的产品
		if (!isAdmin) {
			whereJson.custom_user_ids = userInfo.uid;
		}
		
		// 使用 getTableData 支持前端筛选配置
		res = await vk.baseDao.getTableData({
			dbName: "vk-products",
			data,
			whereJson,
			fieldLike: ["product_name"], // 产品名称模糊匹配
			fieldEq: ["product_type", "status"], // 产品类型和状态精确匹配
			sortArr: [{ name: "_add_time", type: "desc" }]
		});
		
		return res;
	}
}

