module.exports = {
	/**
	 * 修复重复充值问题
	 * @url admin/points/sys/fixDuplicateRecharge
	 * @param {String} action - scan: 扫描问题, fix: 修复问题, fixUser: 修复单个用户
	 * @param {String} user_id - 用户ID（fixUser时必填）
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		
		// 检查是否是管理员
		if (!userInfo.role || !Array.isArray(userInfo.role) || !userInfo.role.includes('admin')) {
			return { code: -1, msg: '无权限' };
		}
		
		const { action = 'scan', user_id } = data;
		
		// 扫描所有用户的重复充值问题
		if (action === 'scan') {
			// 查询所有充值记录
			const allLogs = await db.collection('vk-points-log').where({
				source: 'recharge',
				order_id: db.command.neq('')
			}).orderBy('_add_time', 'asc').limit(1000).get();
			
			if (!allLogs.data || allLogs.data.length === 0) {
				return { code: 0, msg: '没有充值记录', data: { users: [] } };
			}
			
			// 按用户分组统计重复订单
			const userDuplicates = {};
			const orderCount = {};
			
			allLogs.data.forEach(log => {
				const key = `${log.user_id}_${log.order_id}`;
				orderCount[key] = (orderCount[key] || 0) + 1;
			});
			
			// 找出重复的
			for (const [key, count] of Object.entries(orderCount)) {
				if (count > 1) {
					const [userId, orderId] = key.split('_');
					if (!userDuplicates[userId]) {
						userDuplicates[userId] = [];
					}
					userDuplicates[userId].push({ order_id: orderId, count });
				}
			}
			
			// 计算每个用户多充的积分
			const users = [];
			for (const [userId, duplicates] of Object.entries(userDuplicates)) {
				let totalExtraPoints = 0;
				let totalExtraRecords = 0;
				
				for (const dup of duplicates) {
					// 查询该订单的充值记录
					const logs = allLogs.data.filter(l => l.user_id === userId && l.order_id === dup.order_id);
					// 多充的积分 = (重复次数 - 1) * 单次积分
					const extraRecords = dup.count - 1;
					const extraPoints = logs.length > 0 ? logs[0].amount * extraRecords : 0;
					totalExtraPoints += extraPoints;
					totalExtraRecords += extraRecords;
				}
				
				// 获取用户信息
				let userName = userId;
				try {
					const user = await db.collection('uni-id-users').doc(userId).field({ nickname: 1, username: 1 }).get();
					if (user.data) {
						userName = user.data.nickname || user.data.username || userId;
					}
				} catch (e) {}
				
				users.push({
					user_id: userId,
					user_name: userName,
					duplicates,
					extra_records: totalExtraRecords,
					extra_points: totalExtraPoints
				});
			}
			
			return {
				code: 0,
				msg: `扫描完成，发现 ${users.length} 个用户有重复充值问题`,
				data: { users }
			};
		}
		
		// 修复单个用户
		if (action === 'fixUser') {
			if (!user_id) {
				return { code: -1, msg: '用户ID不能为空' };
			}
			
			const result = await fixUserDuplicates(db, vk, user_id);
			return result;
		}
		
		// 修复所有用户
		if (action === 'fix') {
			// 先扫描
			const scanResult = await db.collection('vk-points-log').where({
				source: 'recharge',
				order_id: db.command.neq('')
			}).orderBy('_add_time', 'asc').limit(1000).get();
			
			if (!scanResult.data || scanResult.data.length === 0) {
				return { code: 0, msg: '没有需要修复的数据' };
			}
			
			// 找出有重复的用户
			const orderCount = {};
			scanResult.data.forEach(log => {
				const key = `${log.user_id}_${log.order_id}`;
				orderCount[key] = (orderCount[key] || 0) + 1;
			});
			
			const usersToFix = new Set();
			for (const [key, count] of Object.entries(orderCount)) {
				if (count > 1) {
					const userId = key.split('_')[0];
					usersToFix.add(userId);
				}
			}
			
			// 逐个修复
			let fixedCount = 0;
			let totalDeleted = 0;
			let totalPointsDeducted = 0;
			
			for (const userId of usersToFix) {
				const result = await fixUserDuplicates(db, vk, userId);
				if (result.code === 0) {
					fixedCount++;
					totalDeleted += result.data.deleted_records;
					totalPointsDeducted += result.data.deducted_points;
				}
			}
			
			return {
				code: 0,
				msg: `修复完成：${fixedCount} 个用户，删除 ${totalDeleted} 条重复记录，扣除 ${totalPointsDeducted} 积分`,
				data: {
					fixed_users: fixedCount,
					deleted_records: totalDeleted,
					deducted_points: totalPointsDeducted
				}
			};
		}
		
		return { code: -1, msg: '未知操作' };
	}
};

// 修复单个用户的重复充值
async function fixUserDuplicates(db, vk, userId) {
	// 查询该用户的所有充值记录
	const logs = await db.collection('vk-points-log').where({
		user_id: userId,
		source: 'recharge',
		order_id: db.command.neq('')
	}).orderBy('_add_time', 'asc').get();
	
	if (!logs.data || logs.data.length === 0) {
		return { code: 0, msg: '没有充值记录', data: { deleted_records: 0, deducted_points: 0 } };
	}
	
	// 按订单号分组
	const orderGroups = {};
	logs.data.forEach(log => {
		if (!orderGroups[log.order_id]) {
			orderGroups[log.order_id] = [];
		}
		orderGroups[log.order_id].push(log);
	});
	
	// 找出重复的，保留第一条，删除其他
	let deletedRecords = 0;
	let deductedPoints = 0;
	
	for (const [orderId, records] of Object.entries(orderGroups)) {
		if (records.length > 1) {
			// 保留第一条（最早的），删除其他
			for (let i = 1; i < records.length; i++) {
				await db.collection('vk-points-log').doc(records[i]._id).remove();
				deletedRecords++;
				deductedPoints += records[i].amount;
			}
		}
	}
	
	// 如果有删除，重新计算用户积分
	if (deductedPoints > 0) {
		// 获取当前积分
		const pointsAccount = await db.collection('vk-user-points').where({ user_id: userId }).get();
		if (pointsAccount.data && pointsAccount.data.length > 0) {
			const account = pointsAccount.data[0];
			// 允许负数，这样可以知道用户欠多少
			const newTotalPoints = account.total_points - deductedPoints;
			const newAvailablePoints = account.available_points - deductedPoints;
			
			await db.collection('vk-user-points').doc(account._id).update({
				total_points: newTotalPoints,
				available_points: newAvailablePoints,
				_update_time: Date.now()
			});
		}
	}
	
	return {
		code: 0,
		msg: `修复完成：删除 ${deletedRecords} 条重复记录，扣除 ${deductedPoints} 积分`,
		data: {
			deleted_records: deletedRecords,
			deducted_points: deductedPoints
		}
	};
}
