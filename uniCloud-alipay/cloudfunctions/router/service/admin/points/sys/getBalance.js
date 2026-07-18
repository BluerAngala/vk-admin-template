module.exports = {
	/**
	 * 查询用户积分余额
	 * @url admin/points/sys/getBalance 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} user_id 用户ID（可选，默认查询当前用户）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let { user_id } = data;
		
		// 如果没有指定user_id，则查询当前登录用户
		if (!user_id) {
			user_id = userInfo._id;
		}
		
		if (!user_id) {
			return { code: -1, msg: '用户ID不能为空' };
		}
		
		// 查询积分余额
		const balance = await pubFun.getPointsBalance(vk, user_id);
		
		res.data = balance;
		res.msg = '查询成功';
		
		return res;
	}
};

