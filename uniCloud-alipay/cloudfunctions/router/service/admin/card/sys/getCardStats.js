module.exports = {
	/**
	 * 获取卡密统计信息
	 * @url admin/card/sys/getCardStats 前端调用的url参数地址
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 必须是管理员才能执行
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return {
				code: -1,
				msg: '权限不足，只有管理员才能执行此操作'
			};
		}

		try {
			// 1. 统计总记录数
			const totalCountRes = await db.collection('vk-card-key').count();
			const totalCount = totalCountRes.total || 0;

			// 2. 按卡密类型统计
			const typeStats = await db.collection('vk-card-key')
				.aggregate()
				.group({
					_id: '$card_type',
					count: { $sum: 1 }
				})
				.end();

			// 3. 获取最近的卡密（用于查看格式）
			const recentCards = await db.collection('vk-card-key')
				.field({ card_code: true, _add_time: true, card_type: true, buy_user_id: true })
				.orderBy('_add_time', 'desc')
				.limit(10)
				.get();

			// 4. 统计卡密长度分布（分页获取所有卡密）
			const lengthStats = {};
			const batchSize = 1000;
			let hasMore = true;
			let offset = 0;

			while (hasMore) {
				const batchRes = await db.collection('vk-card-key')
					.field({ card_code: true })
					.skip(offset)
					.limit(batchSize)
					.get();

				if (batchRes.data && batchRes.data.length > 0) {
					batchRes.data.forEach(card => {
						const len = (card.card_code || '').length;
						lengthStats[len] = (lengthStats[len] || 0) + 1;
					});
					offset += batchRes.data.length;

					if (batchRes.data.length < batchSize) {
						hasMore = false;
					}
				} else {
					hasMore = false;
				}
			}

			res.data = {
				total: totalCount,
				type_distribution: typeStats.data || [],
				length_distribution: lengthStats,
				recent_cards: recentCards.data || []
			};

			res.msg = '获取卡密统计成功';

		} catch (error) {
			console.error('获取卡密统计失败：', error);
			return {
				code: -1,
				msg: '获取卡密统计失败：' + error.message
			};
		}

		return res;
	}
};
