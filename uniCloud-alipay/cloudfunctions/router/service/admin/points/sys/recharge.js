module.exports = {
	/**
	 * 充值积分（管理员）
	 * @url admin/points/sys/recharge 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} user_id 用户ID
	 * @param {String} order_id 订单号（必填，用于防止重复充值）
	 * @param {Number} amount 充值积分数量
	 * @param {String} remark 备注
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let { user_id, order_id, amount, remark = '' } = data;
		
		// 参数校验
		if (!user_id) {
			return { code: -1, msg: '用户ID不能为空' };
		}
		
		if (!order_id || !order_id.trim()) {
			return { code: -1, msg: '订单号不能为空' };
		}
		
		order_id = order_id.trim();
		
		if (!amount || amount <= 0) {
			return { code: -1, msg: '充值积分数量必须大于0' };
		}
		
		// 检查订单号是否已存在（防止重复充值）
		const existLog = await db.collection('vk-points-log').where({
			order_id: order_id,
			source: 'recharge'
		}).get();
		
		if (existLog.data && existLog.data.length > 0) {
			const existRecord = existLog.data[0];
			return { 
				code: -1, 
				msg: `充值失败：订单号 ${order_id} 已存在，该订单已于 ${vk.pubfn.timeFormat(existRecord._add_time, 'yyyy-MM-dd hh:mm:ss')} 充值给用户 ${existRecord.user_id}` 
			};
		}
		
		// 充值积分
		const result = await pubFun.addPoints(
			vk,
			user_id,
			amount,
			'recharge',
			remark || `管理员充值${amount}积分，订单号：${order_id}`,
			order_id
		);
		
		if (result.success) {
			if (result.duplicate) {
				res.code = -1;
				res.msg = `充值失败：订单号 ${order_id} 已处理过`;
			} else {
				res.msg = '充值成功';
				res.data = {
					balance: result.balance,
					order_id: order_id
				};
			}
		} else {
			res.code = -1;
			res.msg = result.message || '充值失败';
		}
		
		return res;
	}
};

