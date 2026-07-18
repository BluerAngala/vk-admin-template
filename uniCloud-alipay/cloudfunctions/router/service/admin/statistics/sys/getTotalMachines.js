module.exports = {
	/**
	 * 获取所有用户绑定的机器总数
	 * @url admin/statistics/sys/getTotalMachines 前端调用的url参数地址
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Number} data.totalMachines 所有用户绑定的机器总数
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		
		// 查询所有用户的积分账户（用于获取用户列表，排除超级管理员，分批查询确保获取所有数据）
		const batchSize = 100;
		let allPointsAccounts = [];
		let hasMore = true;
		let pageIndex = 1;
		
		while (hasMore) {
			const pointsRes = await vk.baseDao.selects({
				dbName: 'vk-user-points',
				whereJson: {},
				pageIndex: pageIndex,
				pageSize: batchSize,
				getCount: false
			});
			
			let accounts = [];
			if (Array.isArray(pointsRes)) {
				accounts = pointsRes;
			} else if (pointsRes && pointsRes.rows) {
				accounts = pointsRes.rows;
			} else if (pointsRes && pointsRes.data) {
				accounts = pointsRes.data;
			}
			
			if (accounts.length > 0) {
				allPointsAccounts = allPointsAccounts.concat(accounts);
				if (pointsRes.hasMore === false || accounts.length < batchSize) {
					hasMore = false;
				} else {
					pageIndex++;
				}
			} else {
				hasMore = false;
			}
		}
		
		if (allPointsAccounts.length === 0) {
			return {
				code: 0,
				data: {
					totalMachines: 0
				},
				msg: '获取成功'
			};
		}
		
		// 获取所有用户ID
		const userIds = allPointsAccounts.map(item => item.user_id).filter(Boolean);
		
		// 批量查询用户信息（排除超级管理员，分批查询确保获取所有数据）
		let validUserIds = [];
		if (userIds.length > 0) {
			// 分批查询用户（db.command.in 也有数量限制）
			const userIdBatchSize = 100;
			for (let i = 0; i < userIds.length; i += userIdBatchSize) {
				const userIdBatch = userIds.slice(i, i + userIdBatchSize);
				const usersRes = await db.collection('uni-id-users')
					.where({
						_id: db.command.in(userIdBatch)
					})
					.field({
						_id: true,
						role: true
					})
					.get();
				
				if (usersRes.data && usersRes.data.length > 0) {
					// 过滤掉超级管理员：role 数组包含 "admin" 的用户
					usersRes.data.forEach(user => {
						// 如果 role 是数组且包含 "admin"，则跳过（排除超级管理员）
						if (Array.isArray(user.role) && user.role.includes('admin')) {
							return;
						}
						validUserIds.push(user._id);
					});
				}
			}
		}
		
		// 查询所有卡密（只查询有效用户的卡密，分批查询确保获取所有数据）
		const now = Date.now();
		let totalMachines = 0;
		
		if (validUserIds.length > 0) {
			// 分批查询卡密（uniCloud默认限制100条，需要分批获取）
			const batchSize = 100;
			let allCards = [];
			
			// 如果用户数量较多，也需要分批查询
			for (let i = 0; i < validUserIds.length; i += batchSize) {
				const userIdBatch = validUserIds.slice(i, i + batchSize);
				let hasMore = true;
				let pageIndex = 1;
				
				// 对每个用户批次，循环获取所有卡密数据
				while (hasMore) {
					const cardsRes = await vk.baseDao.selects({
						dbName: 'vk-card-key',
						whereJson: {
							buy_user_id: db.command.in(userIdBatch)
						},
						pageIndex: pageIndex,
						pageSize: batchSize,
						getCount: false
					});
					
					let cards = [];
					if (Array.isArray(cardsRes)) {
						cards = cardsRes;
					} else if (cardsRes && cardsRes.rows) {
						cards = cardsRes.rows;
					} else if (cardsRes && cardsRes.data) {
						cards = cardsRes.data;
					}
					
					if (cards.length > 0) {
						allCards = allCards.concat(cards);
						// 检查是否还有更多数据
						if (cardsRes.hasMore === false || cards.length < batchSize) {
							hasMore = false;
						} else {
							pageIndex++;
						}
					} else {
						hasMore = false;
					}
				}
			}
			
			// 统计实际绑定的机器总数（authorized_machines数组长度，过滤掉已过期的）
			if (allCards.length > 0) {
				allCards.forEach(card => {
					// 未激活的卡密，还没有绑定任何机器，统计为0
					if (card.activate_time === 0) {
						// 未激活的卡密，实际绑定机器数为0
						// totalMachines += 0; // 不需要累加
					} else {
						// 已激活的卡密，检查是否过期
						const isExpired = (card.limit_days !== -1 && card.expire_time > 0 && card.expire_time < now) || 
						                  (card.total_times !== -1 && card.remaining_times <= 0);
						
						// 只统计未过期的卡密的实际绑定机器数
						if (!isExpired) {
							// 统计实际绑定的机器数量（authorized_machines数组的长度）
							const actualMachines = (card.authorized_machines && Array.isArray(card.authorized_machines)) 
								? card.authorized_machines.length 
								: 0;
							totalMachines += actualMachines;
						}
					}
				});
			}
		}
		
		res.data = {
			totalMachines: totalMachines
		};
		res.msg = '获取成功';
		
		return res;
	}
};

