module.exports = {
	/**
	 * 获取当前用户的卡密统计数据
	 * @url admin/card/kh/getStats 前端调用的url参数地址
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
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		let dbName = "vk-card-key";
		
		// 只统计当前用户的卡密，使用足够大的 pageSize 确保获取所有数据
		const allCards = await vk.baseDao.selects({
			dbName,
			whereJson: { buy_user_id: user_id },
			pageIndex: 1,
			pageSize: 10000, // 设置足够大的页面大小，确保获取所有数据
			getCount: false, // 不需要总数，因为我们自己统计
			fieldJson: {
				activate_time: true,
				expire_time: true,
				limit_days: true,
				total_times: true,
				remaining_times: true
			}
		});
		
		const now = Date.now();
		let total = 0;
		let unused = 0;
		let used = 0;
		let expired = 0;
		
		// 处理返回数据格式
		let records = [];
		if (Array.isArray(allCards)) {
			records = allCards;
		} else if (allCards && allCards.rows) {
			records = allCards.rows;
		} else if (allCards && allCards.data) {
			records = allCards.data;
		}
		
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
};

