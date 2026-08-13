module.exports = {
	/**
	 * 查询用户积分汇总统计
	 * @url admin/statistics/sys/getUserPointsSummary 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number} pageIndex 当前页码
	 * @param {Number} pageSize 每页显示数量
	 * @param {String} user_id 用户ID（可选）
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
		
		// 查询所有用户的积分账户（分批查询确保获取所有数据）
		let pointsWhereJson = {};
		if (user_id) {
			pointsWhereJson.user_id = user_id;
		}
		
		// 使用 vk.baseDao.selects 循环获取所有积分账户
		const batchSize = 100;
		let allPointsAccounts = [];
		let queryPageIndex = 1;
		
		while (true) {
			const pointsRes = await vk.baseDao.selects({
				dbName: 'vk-user-points',
				whereJson: pointsWhereJson,
				pageIndex: queryPageIndex,
				pageSize: batchSize,
				getCount: false
			});
			
			// 获取返回的数据数组
			let accounts = pointsRes.rows || [];
			
			if (accounts.length > 0) {
				allPointsAccounts = allPointsAccounts.concat(accounts);
			}
			
			// 如果返回数量小于 batchSize，说明没有更多数据了
			if (accounts.length < batchSize) {
				break;
			}
			queryPageIndex++;
		}
		
		if (allPointsAccounts.length === 0) {
			return {
				code: 0,
				rows: [],
				total: 0
			};
		}
		
		// 获取所有用户ID
		const userIds = allPointsAccounts.map(item => item.user_id).filter(Boolean);
		
		// 批量查询用户信息（排除超级管理员，分批查询确保获取所有数据）
		let usersMap = {};
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
						username: true,
						nickname: true,
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
						usersMap[user._id] = user;
					});
				}
			}
		}
		
		// 计算每个用户的积分统计（只包含非超级管理员）
		const validUserIds = Object.keys(usersMap);
		const summaryList = allPointsAccounts
			.filter(account => {
				// 只保留在 usersMap 中的用户（即非超级管理员）
				return usersMap[account.user_id];
			})
			.map(account => {
				const user = usersMap[account.user_id] || {};
				
				return {
					user_id: account.user_id,
					username: user.username || '未知用户',
					nickname: user.nickname || '',
					user_display_name: user.nickname || user.username || '未知用户',
					// 当前剩余积分
					available_points: account.available_points || 0,
					// 总获得积分（历史累计）
					total_points: account.total_points || 0,
					// 已消耗积分（历史累计）
					consumed_points: account.consumed_points || 0,
					// 冻结积分
					frozen_points: account.frozen_points || 0,
					// 更新时间
					_update_time: account._update_time || account._add_time
				};
			})
			// 按照购买积分（total_points）从大到小排序
			.sort((a, b) => {
				return (b.total_points || 0) - (a.total_points || 0);
			});
		
		// 批量查询所有用户的卡密，用于计算机器数量（分批查询确保获取所有数据）
		let userMachinesMap = {};
		if (validUserIds.length > 0) {
			const now = Date.now();
			const cardBatchSize = 100;
			let allCards = [];
			
			// 如果用户数量较多，也需要分批查询
			for (let i = 0; i < validUserIds.length; i += cardBatchSize) {
				const userIdBatch = validUserIds.slice(i, i + cardBatchSize);
				let pageIndex = 1;
				
				// 对每个用户批次，循环获取所有卡密数据
				while (true) {
					const cardsRes = await vk.baseDao.selects({
						dbName: 'vk-card-key',
						whereJson: {
							buy_user_id: db.command.in(userIdBatch)
						},
						pageIndex: pageIndex,
						pageSize: cardBatchSize,
						getCount: false
					});
					
					let cards = cardsRes.rows || [];
					
					if (cards.length > 0) {
						allCards = allCards.concat(cards);
					}
					
					// 如果返回数量小于 batchSize，说明没有更多数据了
					if (cards.length < cardBatchSize) {
						break;
					}
					pageIndex++;
				}
			}
			
			// 统计每个用户实际绑定的机器数量（authorized_machines数组长度）
			if (allCards.length > 0) {
				allCards.forEach(card => {
					const userId = card.buy_user_id;
					if (!userMachinesMap[userId]) {
						userMachinesMap[userId] = 0;
					}
					
					// 未激活的卡密，还没有绑定任何机器，统计为0
					if (card.activate_time === 0) {
						// 未激活的卡密，实际绑定机器数为0
						// userMachinesMap[userId] += 0; // 不需要累加
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
							userMachinesMap[userId] += actualMachines;
						}
					}
				});
			}
		}
		
		// 为每个用户添加机器数量
		summaryList.forEach(item => {
			item.total_machines = userMachinesMap[item.user_id] || 0;
		});

		// 计算汇总统计（顺手算，零额外开销）
		const summary = {
			totalUsers: summaryList.length,
			totalPoints: 0,
			totalConsumed: 0,
			totalAvailable: 0,
			totalMachines: 0,
		};
		summaryList.forEach(item => {
			summary.totalPoints += item.total_points || 0;
			summary.totalConsumed += item.consumed_points || 0;
			summary.totalAvailable += item.available_points || 0;
			summary.totalMachines += item.total_machines || 0;
		});

		// 分页处理
		const pageIndex = data.pageIndex || 1;
		const pageSize = data.pageSize || 10;
		const total = summaryList.length;
		const start = (pageIndex - 1) * pageSize;
		const end = start + pageSize;
		const rows = summaryList.slice(start, end);
		
		// 格式化更新时间
		rows.forEach(item => {
			if (item._update_time) {
				item._update_time_str = vk.pubfn.timeFormat(item._update_time, 'yyyy-MM-dd hh:mm:ss');
			}
		});
		
		return {
			code: 0,
			rows: rows,
			total: total,
			summary: summary
		};
	}
};

