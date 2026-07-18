module.exports = {
	/**
	 * 获取当前用户的机器绑定统计
	 * @url admin/card/kh/getMachineStats
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 获取当前用户ID
		const userId = userInfo._id;
		
		if (!userId) {
			return { code: -1, msg: '请先登录' };
		}
		
		// 查询当前用户所有卡密（分批查询确保获取所有数据）
		const now = Date.now();
		const batchSize = 100;
		let allCards = [];
		let hasMore = true;
		let pageIndex = 1;
		
		while (hasMore) {
			const cardsRes = await vk.baseDao.selects({
				dbName: 'vk-card-key',
				whereJson: { buy_user_id: userId },
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
				if (cardsRes.hasMore === false || cards.length < batchSize) {
					hasMore = false;
				} else {
					pageIndex++;
				}
			} else {
				hasMore = false;
			}
		}
		
		// 统计所有卡密能绑定的机器总数（排除已过期的）
		let totalMachines = 0;
		if (allCards.length > 0) {
			allCards.forEach(card => {
				// 未激活的卡密直接统计，不检查过期
				if (card.activate_time === 0) {
					// 未激活的卡密，直接统计机器数量（-1表示不限，不计入总数）
					if (card.max_machine_count !== -1) {
						totalMachines += card.max_machine_count;
					}
				} else {
					// 已激活的卡密，检查是否过期
					const isExpired = (card.limit_days !== -1 && card.expire_time > 0 && card.expire_time < now) || 
					                  (card.total_times !== -1 && card.remaining_times <= 0);
					
					// 只统计未过期的卡密（-1表示不限，不计入总数）
					if (!isExpired && card.max_machine_count !== -1) {
						totalMachines += card.max_machine_count;
					}
				}
			});
		}
		
		res.data = {
			total_machines: totalMachines,
			total_cards: allCards.length
		};
		res.msg = '获取成功';
		
		return res;
	}
}

