module.exports = {
	/**
	 * 查询应该为负数积分的用户（根据流水重新计算）
	 * @url admin/points/sys/checkNegativePoints
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		
		// 检查是否是管理员
		if (!userInfo.role || !Array.isArray(userInfo.role) || !userInfo.role.includes('admin')) {
			return { code: -1, msg: '无权限' };
		}
		
		// 获取所有用户积分账户
		const accounts = await db.collection('vk-user-points').limit(500).get();
		
		if (!accounts.data || accounts.data.length === 0) {
			return { code: 0, msg: '没有用户', data: { users: [] } };
		}
		
		const problemUsers = [];
		
		for (const account of accounts.data) {
			try {
				// 检查用户是否存在
				const user = await db.collection('uni-id-users').doc(account.user_id).field({ role: 1, nickname: 1, username: 1 }).get();
				
				// 跳过不存在的用户
				if (!user.data) {
					continue;
				}
				
				// 跳过管理员
				if (user.data.role && Array.isArray(user.data.role) && user.data.role.includes('admin')) {
					continue;
				}
				
				// 跳过积分超过1000万的（管理员默认积分）
				if (account.available_points >= 99999999) {
					continue;
				}
				
				// 查询该用户的所有积分流水
				const logs = await db.collection('vk-points-log').where({
					user_id: account.user_id
				}).get();
				
				if (!logs.data || logs.data.length === 0) continue;
				
				// 根据流水计算实际应有积分
				let calculatedPoints = 0;
				logs.data.forEach(log => {
					calculatedPoints += log.amount || 0;
				});
				
				// 只检查计算出来是负数的用户（真正欠费的）
				if (calculatedPoints < 0 && account.available_points === 0) {
					const userName = user.data.nickname || user.data.username || account.user_id;
					
					problemUsers.push({
						user_id: account.user_id,
						user_name: userName,
						current_points: account.available_points,
						calculated_points: calculatedPoints,
						should_pay: Math.abs(calculatedPoints)
					});
				}
			} catch (e) {
				console.error('检查用户失败：', account.user_id, e);
			}
		}
		
		// 按欠费金额排序
		problemUsers.sort((a, b) => b.should_pay - a.should_pay);
		
		return {
			code: 0,
			msg: `检查完成，发现 ${problemUsers.length} 个用户积分有问题`,
			data: { 
				users: problemUsers,
				total_should_pay: problemUsers.reduce((sum, u) => sum + u.should_pay, 0)
			}
		};
	}
};
