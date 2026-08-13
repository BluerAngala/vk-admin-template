module.exports = {
	/**
	 * 获取当前用户的卡密统计 + 机器绑定统计（合并接口，一次查询）
	 * @url admin/card/kh/getStats 前端调用的url参数地址
	 * res 返回参数说明
	 * @param {Number} code 		错误码，0表示成功
	 * @param {String} msg 			详细信息
	 * @param {Number} total 		总数
	 * @param {Number} unused 	未使用数量
	 * @param {Number} used 		已使用数量
	 * @param {Number} expired 	已过期数量
	 * @param {Number} total_machines 总绑定机器数
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let user_id = userInfo._id;

		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}

		// 分批获取当前用户所有卡密（一次查询，两种统计共用）
		const batchSize = 100;
		let allCards = [];
		let pageIndex = 1;

		while (true) {
			const cardsRes = await vk.baseDao.selects({
				dbName: "vk-card-key",
				whereJson: { buy_user_id: user_id },
				pageIndex: pageIndex,
				pageSize: batchSize,
				getCount: false,
				fieldJson: {
					activate_time: true,
					expire_time: true,
					limit_days: true,
					total_times: true,
					remaining_times: true,
					max_machine_count: true
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
			}

			if (cards.length < batchSize) {
				break;
			}
			pageIndex++;
		}

		const now = Date.now();
		let total = allCards.length;
		let unused = 0;
		let used = 0;
		let expired = 0;
		let total_machines = 0;

		allCards.forEach(card => {
			// 卡密状态统计
			if (card.activate_time === 0) {
				unused++;
				// 未激活卡密的机器数统计
				if (card.max_machine_count !== -1) {
					total_machines += card.max_machine_count;
				}
			} else {
				const isExpired = (card.limit_days !== -1 && card.expire_time > 0 && card.expire_time < now) ||
				                  (card.total_times !== -1 && card.remaining_times <= 0);
				if (isExpired) {
					expired++;
				} else {
					used++;
					// 未过期卡密的机器数统计（-1表示不限，不计入总数）
					if (card.max_machine_count !== -1) {
						total_machines += card.max_machine_count;
					}
				}
			}
		});

		res.total = total;
		res.unused = unused;
		res.used = used;
		res.expired = expired;
		res.total_machines = total_machines;

		return res;
	}
};
