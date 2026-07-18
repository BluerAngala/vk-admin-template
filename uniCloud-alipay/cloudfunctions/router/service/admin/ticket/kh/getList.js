module.exports = {
	/**
	 * 获取用户自己的工单列表
	 * @url admin/ticket/kh/getList
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let whereJson = {
			user_id: userInfo._id
		};

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
