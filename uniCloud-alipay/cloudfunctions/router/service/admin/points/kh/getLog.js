module.exports = {
	/**
	 * 查询积分流水
	 * @url admin/points/kh/getLog 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number} pageIndex 当前页码
	 * @param {Number} pageSize 每页显示数量
	 * @param {String} type 类型筛选（可选：income/consume）
	 * @param {String} source 来源筛选（可选）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let { type, source } = data;
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		let dbName = "vk-points-log";
		
		// 构建查询条件
		let whereJson = { user_id };
		if (type) whereJson.type = type;
		if (source) whereJson.source = source;
		
		// 查询积分流水
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			sortArr: [{ name: "_add_time", type: "desc" }] // 按时间倒序
		});
		
		return res;
	}
};

