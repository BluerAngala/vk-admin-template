module.exports = {
	/**
	 * 测试充值限制（仅管理员可用）
	 * @url admin/points/sys/testRechargeLimit
	 * @param {String} action - 操作类型：check-检查状态，simulate-模拟充值，clear-清除测试数据
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		
		// 检查是否是管理员
		if (!userInfo.role || !Array.isArray(userInfo.role) || !userInfo.role.includes('admin')) {
			return { code: -1, msg: '无权限' };
		}
		
		const { action = 'check' } = data;
		const user_id = userInfo._id;
		const oneHourAgo = Date.now() - 60 * 60 * 1000;
		const testOrderPrefix = 'TEST_RECHARGE_';
		
		// 模拟充值（插入测试记录）
		if (action === 'simulate') {
			const testOrderId = testOrderPrefix + Date.now();
			await db.collection('vk-points-log').add({
				user_id,
				type: 'income',
				amount: 100,
				balance: 0,
				source: 'recharge',
				order_id: testOrderId,
				remark: '[测试数据] 模拟充值100积分',
				_add_time: Date.now()
			});
			return { code: 0, msg: '已模拟一笔充值记录' };
		}
		
		// 清除测试数据
		if (action === 'clear') {
			// 查询所有测试数据
			const testLogs = await db.collection('vk-points-log').where({
				user_id,
				order_id: new RegExp(`^${testOrderPrefix}`)
			}).get();
			
			let deletedCount = 0;
			if (testLogs.data && testLogs.data.length > 0) {
				for (const log of testLogs.data) {
					await db.collection('vk-points-log').doc(log._id).remove();
					deletedCount++;
				}
			}
			return { code: 0, msg: `已清除 ${deletedCount} 条测试数据` };
		}
		
		// 默认：检查状态
		const recentLogs = await db.collection('vk-points-log').where({
			user_id,
			source: 'recharge',
			_add_time: db.command.gte(oneHourAgo)
		}).orderBy('_add_time', 'desc').limit(10).get();
		
		const count = recentLogs.data ? recentLogs.data.length : 0;
		const isBlocked = count >= 3;
		
		let message = `<div style="line-height: 1.8;">`;
		message += `<p><b>当前用户ID：</b>${user_id}</p>`;
		message += `<p><b>1小时内充值次数：</b><span style="color: ${isBlocked ? '#F56C6C' : '#67C23A'}; font-weight: bold;">${count} 次</span></p>`;
		message += `<p><b>充值限制阈值：</b>3 次/小时</p>`;
		message += `<p><b>当前状态：</b><span style="color: ${isBlocked ? '#F56C6C' : '#67C23A'};">${isBlocked ? '❌ 已触发限制，充值将被拒绝' : '✅ 正常，可以充值'}</span></p>`;
		
		if (count > 0) {
			message += `<hr style="margin: 10px 0;"/>`;
			message += `<p><b>最近充值记录：</b></p>`;
			message += `<ul style="margin: 5px 0; padding-left: 20px;">`;
			recentLogs.data.forEach((log, i) => {
				const time = vk.pubfn.timeFormat(log._add_time, 'yyyy-MM-dd hh:mm:ss');
				const isTest = log.order_id && log.order_id.startsWith(testOrderPrefix);
				message += `<li>${i + 1}. ${time} - ${log.amount > 0 ? '+' : ''}${log.amount}积分 ${isTest ? '<span style="color:#E6A23C;">[测试]</span>' : ''}</li>`;
			});
			message += `</ul>`;
		}
		
		message += `</div>`;
		
		return {
			code: 0,
			data: { count, isBlocked, message }
		};
	}
};
