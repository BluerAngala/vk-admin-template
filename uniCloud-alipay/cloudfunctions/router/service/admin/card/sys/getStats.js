module.exports = {
	/**
	 * 获取卡密统计数据
	 * @url admin/card/sys/getStats 前端调用的url参数地址
	 * res 返回参数说明
	 * @param {Number} code 		错误码，0表示成功
	 * @param {String} msg 			详细信息
	 * @param {Number} total 		总数
	 * @param {Number} unused 	未使用数量
	 * @param {Number} used 		已使用数量
	 * @param {Number} expired 	已过期数量
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "vk-card-key";
		
		// 获取所有卡密记录（分批查询确保获取所有数据）
		const batchSize = 100;
		let allCards = [];
		let hasMore = true;
		let pageIndex = 1;
		
		while (hasMore) {
			const cardsRes = await vk.baseDao.selects({
				dbName,
				whereJson: {},
				pageIndex: pageIndex,
				pageSize: batchSize,
				getCount: false,
				fieldJson: {
					activate_time: true,
					expire_time: true,
					limit_days: true,
					total_times: true,
					remaining_times: true
				}
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
		
		const now = Date.now();
		let total = 0;
		let unused = 0;
		let used = 0;
		let expired = 0;
		
		// 处理返回数据格式
		let records = allCards;
		total = records.length;
		
		// 根据新架构计算状态
		records.forEach(card => {
			if (card.activate_time === 0) {
				// 未激活
				unused++;
			} else {
				// 已激活，检查是否过期或次数用完
				if ((card.limit_days !== -1 && card.expire_time < now) || 
				    (card.total_times !== -1 && card.remaining_times <= 0)) {
					expired++;
				} else {
					used++;
				}
			}
		});
		
		res.total = total;
		res.unused = unused;
		res.used = used;
		res.expired = expired;
		
		return res;
	}
}

