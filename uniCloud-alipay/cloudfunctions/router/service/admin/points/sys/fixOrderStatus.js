module.exports = {
	/**
	 * 修复订单状态（有积分流水但订单状态不是success的情况）
	 * @url admin/points/sys/fixOrderStatus 前端调用的url参数地址
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		const { trade_nos } = data;
		
		if (!trade_nos || !Array.isArray(trade_nos) || trade_nos.length === 0) {
			return { code: -1, msg: '请提供订单号列表' };
		}
		
		const results = [];
		
		for (const trade_no of trade_nos) {
			try {
				// 1. 查询订单
				const orderRes = await db.collection('vk-recharge-orders')
					.where({ trade_no })
					.get();
				
				if (!orderRes.data || orderRes.data.length === 0) {
					results.push({
						trade_no,
						success: false,
						message: '订单不存在'
					});
					continue;
				}
				
				const order = orderRes.data[0];
				
				// 2. 查询积分流水
				const logRes = await db.collection('vk-points-log')
					.where({ order_id: trade_no, source: 'recharge' })
					.get();
				
				if (!logRes.data || logRes.data.length === 0) {
					results.push({
						trade_no,
						success: false,
						message: '没有积分流水记录，无法修复'
					});
					continue;
				}
				
				// 3. 如果订单状态不是success，但有积分流水，则更新订单状态
				if (order.status !== 'success') {
					await db.collection('vk-recharge-orders')
						.where({ trade_no })
						.update({
							status: 'success',
							_update_time: Date.now()
						});
					
					results.push({
						trade_no,
						success: true,
						message: `订单状态已从 ${order.status} 更新为 success`
					});
				} else {
					results.push({
						trade_no,
						success: true,
						message: '订单状态已经是success，无需修复'
					});
				}
			} catch (err) {
				results.push({
					trade_no,
					success: false,
					message: err.message || '修复失败'
				});
			}
		}
		
		const successCount = results.filter(r => r.success).length;
		const failCount = results.filter(r => !r.success).length;
		
		res.msg = `修复完成：成功 ${successCount} 个，失败 ${failCount} 个`;
		res.data = { results, successCount, failCount };
		
		return res;
	}
};
