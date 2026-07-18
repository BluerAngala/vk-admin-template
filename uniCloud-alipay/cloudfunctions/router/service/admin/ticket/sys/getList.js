module.exports = {
	/**
	 * 管理员获取所有工单列表
	 * @url admin/ticket/sys/getList
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let whereJson = {};

		// 关键词搜索（标题或用户名）
		if (data.title) {
			whereJson["title"] = new RegExp(data.title, "i");
		}
		if (data.user_name) {
			whereJson["user_name"] = new RegExp(data.user_name, "i");
		}

		res = await vk.baseDao.getTableData({
			dbName: "vk-tickets",
			data,
			whereJson,
			fieldEq: ["status", "type", "priority"],
			sortArr: [{ name: "_add_time", type: "desc" }]
		});

		return res;
	}
}
