module.exports = {
	/**
	 * 获取充值异常告警（管理员登录后调用）
	 * @url admin/points/sys/getRechargeAlerts
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		
		// 检查是否是管理员
		if (!userInfo.role || !Array.isArray(userInfo.role) || !userInfo.role.includes('admin')) {
			return { code: 0, data: { alerts: [] } };
		}
		
		// 查询失败的订单（最近24小时）
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		const failedOrders = await db.collection('vk-recharge-orders').where({
			status: 'failed',
			_update_time: db.command.gte(oneDayAgo)
		}).orderBy('_update_time', 'desc').limit(10).get();
		
		const alerts = [];
		
		if (failedOrders.data && failedOrders.data.length > 0) {
			for (const order of failedOrders.data) {
				// 获取用户信息
				let userName = order.user_id;
				try {
					const user = await db.collection('uni-id-users').doc(order.user_id).field({ nickname: 1, username: 1 }).get();
					if (user.data) {
						userName = user.data.nickname || user.data.username || order.user_id;
					}
				} catch (e) {}
				
				alerts.push({
					type: 'recharge_failed',
					title: '充值失败',
					message: `用户 ${userName} 的充值订单 ${order.trade_no} 处理失败：${order.fail_reason || '未知原因'}`,
					time: order._update_time,
					order_id: order._id,
					trade_no: order.trade_no,
					user_id: order.user_id,
					points: order.points + (order.bonus || 0)
				});
			}
		}
		
		return { 
			code: 0, 
			data: { 
				alerts,
				count: alerts.length
			}
		};
	}
};
