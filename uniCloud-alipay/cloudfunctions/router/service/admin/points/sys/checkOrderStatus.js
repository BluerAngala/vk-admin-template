module.exports = {
	/**
	 * 查询充值订单状态和积分发放情况
	 * @url admin/points/sys/checkOrderStatus 前端调用的url参数地址
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { config, pubFun, vk, db } = util;
		let res = { code: 0, msg: '' };
		
		let { trade_no } = data;
		
		if (!trade_no) {
			return { code: -1, msg: '请输入订单号' };
		}
		
		// 1. 查询充值订单信息
		const orderRes = await db.collection('vk-recharge-orders')
			.where({ trade_no })
			.get();
		
		if (!orderRes.data || orderRes.data.length === 0) {
			return { code: -1, msg: '未找到充值订单记录' };
		}
		
		const order = orderRes.data[0];
		
		// 2. 查询积分流水记录
		const pointsLogRes = await db.collection('vk-points-log')
			.where({
				order_id: trade_no,
				source: 'recharge'
			})
			.get();
		
		const hasPointsLog = pointsLogRes.data && pointsLogRes.data.length > 0;
		
		// 3. 查询用户当前积分余额
		let userPoints = null;
		if (order.user_id) {
			const userPointsRes = await db.collection('vk-user-points')
				.where({ user_id: order.user_id })
				.get();
			
			if (userPointsRes.data && userPointsRes.data.length > 0) {
				userPoints = userPointsRes.data[0];
			}
		}
		
		// 4. 查询用户信息
		let userInfo_data = null;
		if (order.user_id) {
			const userRes = await db.collection('uni-id-users')
				.doc(order.user_id)
				.field({ username: 1, nickname: 1, mobile: 1, role: 1 })
				.get();
			
			if (userRes.data && userRes.data.length > 0) {
				userInfo_data = userRes.data[0];
			}
		}
		
		// 5. 诊断结果
		let diagnosis = '';
		let canManualRecharge = false;
		
		if (order.status === 'pending') {
			diagnosis = '订单状态为"待支付"，用户可能还未完成支付';
		} else if (order.status === 'paid') {
			diagnosis = '订单状态为"已支付待充值"，积分尚未发放。建议：用户需要在前端点击"查询支付状态"按钮来触发积分发放';
			canManualRecharge = true;
		} else if (order.status === 'success') {
			if (!hasPointsLog) {
				diagnosis = '订单状态为"充值成功"，但未找到积分流水记录。可能原因：数据不一致，需要手动补发积分';
				canManualRecharge = true;
			} else {
				diagnosis = '订单状态正常，积分已发放';
			}
		} else if (order.status === 'failed') {
			diagnosis = '订单状态为"充值失败"';
			if (order.fail_reason) {
				diagnosis += '，失败原因：' + order.fail_reason;
			}
		}
		
		res.data = {
			order: {
				...order,
				_add_time_str: vk.pubfn.timeFormat(order._add_time, 'yyyy-MM-dd hh:mm:ss'),
				_update_time_str: vk.pubfn.timeFormat(order._update_time, 'yyyy-MM-dd hh:mm:ss'),
			},
			pointsLog: hasPointsLog ? pointsLogRes.data.map(log => ({
				...log,
				_add_time_str: vk.pubfn.timeFormat(log._add_time, 'yyyy-MM-dd hh:mm:ss'),
			})) : null,
			userPoints,
			userInfo: userInfo_data,
			diagnosis,
			canManualRecharge,
		};
		
		res.msg = '查询成功';
		
		return res;
	}
};
