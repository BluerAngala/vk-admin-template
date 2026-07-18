module.exports = {
	/**
	 * 查询用户购买记录（用于排查产品名称问题）
	 * @url admin/points/sys/getPurchaseRecords 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} user_id 用户ID（可选）
	 * @param {String} product_id 产品ID（可选）
	 * @param {String} start_time 开始时间（可选，时间戳）
	 * @param {String} end_time 结束时间（可选，时间戳）
	 * @param {Number} pageIndex 页码
	 * @param {Number} pageSize 每页数量
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Array} rows 购买记录列表
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 判断是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员可以执行此操作' };
		}
		
		let { 
			user_id = '',
			product_id = '',
			start_time = '',
			end_time = '',
			pageIndex = 1,
			pageSize = 50
		} = data;
		
		const $ = db.command;
		
		// 构建查询条件
		let whereJson = {};
		if (user_id && user_id.trim()) {
			whereJson.buy_user_id = user_id.trim();
		}
		if (product_id && product_id.trim()) {
			whereJson.product_id = product_id.trim();
		}
		if (start_time) {
			whereJson._add_time = whereJson._add_time || {};
			whereJson._add_time = $.gte(Number(start_time));
		}
		if (end_time) {
			whereJson._add_time = whereJson._add_time || {};
			if (typeof whereJson._add_time === 'object') {
				whereJson._add_time = whereJson._add_time.and($.lte(Number(end_time)));
			} else {
				whereJson._add_time = $.lte(Number(end_time));
			}
		}
		
		// 查询卡密记录（这是最准确的购买记录）
		const cardsRes = await vk.baseDao.selects({
			dbName: 'vk-card-key',
			pageIndex,
			pageSize,
			sortRule: [{ name: '_add_time', type: 'desc' }],
			whereJson
		});
		
		const cards = cardsRes.rows || cardsRes.data || [];
		
		if (cards.length === 0) {
			return {
				code: 0,
				msg: '没有找到购买记录',
				rows: [],
				total: 0
			};
		}
		
		// 收集所有产品ID和用户ID
		const productIds = new Set();
		const userIds = new Set();
		cards.forEach(card => {
			if (card.product_id) productIds.add(card.product_id);
			if (card.buy_user_id) userIds.add(card.buy_user_id);
		});
		
		// 批量查询产品表
		const productsMap = {};
		if (productIds.size > 0) {
			const productIdsArray = Array.from(productIds);
			const batchSize = 100;
			for (let i = 0; i < productIdsArray.length; i += batchSize) {
				const batch = productIdsArray.slice(i, i + batchSize);
				const productsRes = await db.collection('vk-products')
					.where({
						product_id: $.in(batch)
					})
					.get();
				
				(productsRes.data || []).forEach(product => {
					productsMap[product.product_id] = product;
				});
			}
		}
		
		// 批量查询用户信息
		const usersMap = {};
		if (userIds.size > 0) {
			const userIdsArray = Array.from(userIds);
			const batchSize = 100;
			for (let i = 0; i < userIdsArray.length; i += batchSize) {
				const batch = userIdsArray.slice(i, i + batchSize);
				const usersRes = await db.collection('uni-id-users')
					.where({
						_id: $.in(batch)
					})
					.field({
						_id: true,
						username: true,
						nickname: true
					})
					.get();
				
				(usersRes.data || []).forEach(user => {
					usersMap[user._id] = user;
				});
			}
		}
		
		// 查询对应的积分流水记录（通过用户ID和时间匹配）
		const records = [];
		for (const card of cards) {
			// 查找对应的积分流水（优先通过card_id匹配，如果没有则通过用户ID和时间匹配）
			let pointsLog = null;
			
			// 方法1：通过card_id精确匹配（最准确）
			if (card._id) {
				const cardIdLogRes = await db.collection('vk-points-log')
					.where({
						card_id: card._id
					})
					.orderBy('_add_time', 'desc')
					.limit(1)
					.get();
				
				if (cardIdLogRes.data && cardIdLogRes.data.length > 0) {
					pointsLog = cardIdLogRes.data[0];
				}
			}
			
			// 方法2：如果方法1没找到，通过用户ID和时间窗口匹配
			if (!pointsLog) {
				const timeWindow = 5 * 60 * 1000; // 前后5分钟
				const pointsLogRes = await db.collection('vk-points-log')
					.where({
						user_id: card.buy_user_id,
						source: 'card_buy',
						_add_time: $.gte(card._add_time - timeWindow).and($.lte(card._add_time + timeWindow))
					})
					.orderBy('_add_time', 'desc')
					.limit(1)
					.get();
				
				if (pointsLogRes.data && pointsLogRes.data.length > 0) {
					pointsLog = pointsLogRes.data[0];
				}
			}
			
			// 获取产品表中的正确产品信息（基于卡密记录中的product_id）
			const cardProduct = productsMap[card.product_id] || null;
			const cardProductName = cardProduct ? cardProduct.product_name : null;
			
			// 获取积分流水记录中的产品信息（这是购买时实际使用的产品ID和名称）
			const pointsLogProductId = pointsLog ? pointsLog.product_id : null;
			const pointsLogProductName = pointsLog ? pointsLog.product_name : null;
			const pointsLogProduct = pointsLogProductId ? (productsMap[pointsLogProductId] || null) : null;
			const pointsLogProductNameFromTable = pointsLogProduct ? pointsLogProduct.product_name : null;
			
			// 从积分流水备注中提取产品名称（用于对比）
			let pointsLogProductNameFromRemark = null;
			if (pointsLog && pointsLog.remark) {
				const match = pointsLog.remark.match(/【([^】]+)】/);
				if (match) {
					pointsLogProductNameFromRemark = match[1];
				}
			}
			
			// 判断问题类型
			let issueDesc = null;
			let hasIssue = false;
			
			// 问题1：卡密记录中的product_id和积分流水记录中的product_id不一致（说明购买时搞错了产品ID）
			if (pointsLog && card.product_id !== pointsLogProductId) {
				hasIssue = true;
				issueDesc = `产品ID不一致：卡密记录中为${card.product_id}，积分流水中为${pointsLogProductId || '无'}（购买时可能搞错了产品ID）`;
			}
			// 问题2：积分流水记录中的product_id存在，但产品表中找不到该产品
			else if (pointsLogProductId && !pointsLogProduct) {
				hasIssue = true;
				issueDesc = `积分流水中的产品ID(${pointsLogProductId})在产品表中不存在`;
			}
			// 问题3：卡密记录中的产品名称和产品表中的不一致
			else if (card.product_name !== cardProductName) {
				hasIssue = true;
				issueDesc = `卡密记录中的产品名称错误：记录为"${card.product_name}"，产品表中应为"${cardProductName || '未知'}"`;
			}
			// 问题4：积分流水记录中的product_name和产品表中的不一致（说明购买时产品表中的产品名称就是错的，或者后来被修改了）
			else if (pointsLogProductName && pointsLogProductNameFromTable && pointsLogProductName !== pointsLogProductNameFromTable) {
				hasIssue = true;
				issueDesc = `积分流水中的产品名称与产品表不一致：流水中为"${pointsLogProductName}"，产品表中应为"${pointsLogProductNameFromTable}"（可能是购买后产品名称被修改）`;
			}
			// 问题5：积分流水备注中的产品名称和积分流水记录中的product_name不一致（说明备注写错了）
			else if (pointsLogProductNameFromRemark && pointsLogProductName && pointsLogProductNameFromRemark !== pointsLogProductName) {
				hasIssue = true;
				issueDesc = `积分流水备注中的产品名称错误：备注中为"${pointsLogProductNameFromRemark}"，记录中应为"${pointsLogProductName}"（备注写错了）`;
			}
			// 问题6：积分流水备注中的产品名称和产品表中的不一致（备注写错了）
			else if (pointsLogProductNameFromRemark && pointsLogProductNameFromTable && pointsLogProductNameFromRemark !== pointsLogProductNameFromTable) {
				hasIssue = true;
				issueDesc = `积分流水备注中的产品名称错误：备注中为"${pointsLogProductNameFromRemark}"，产品表中应为"${pointsLogProductNameFromTable}"（备注写错了）`;
			}
			
			// 获取用户信息
			const user = usersMap[card.buy_user_id] || null;
			
			records.push({
				// 卡密信息
				card_id: card._id,
				card_code: card.card_code,
				card_product_id: card.product_id,
				card_product_name: card.product_name, // 卡密记录中的产品名称
				card_add_time: card._add_time,
				card_add_time_str: card._add_time ? vk.pubfn.timeFormat(card._add_time, 'yyyy-MM-dd hh:mm:ss') : '',
				
				// 产品表中的正确信息（基于卡密记录中的product_id）
				correct_product_id: cardProduct ? cardProduct.product_id : null,
				correct_product_name: cardProductName, // 产品表中的正确产品名称（基于卡密记录中的product_id）
				
				// 积分流水信息
				points_log_id: pointsLog ? pointsLog._id : null,
				points_log_product_id: pointsLogProductId, // 积分流水记录中的产品ID（购买时实际使用的产品ID）
				points_log_product_name: pointsLogProductName, // 积分流水记录中的产品名称（购买时实际使用的产品名称）
				points_log_product_name_from_table: pointsLogProductNameFromTable, // 基于积分流水中的product_id，从产品表中查询到的正确名称
				points_log_product_name_from_remark: pointsLogProductNameFromRemark, // 从积分流水备注中提取的产品名称
				points_log_remark: pointsLog ? pointsLog.remark : null,
				points_log_amount: pointsLog ? pointsLog.amount : null,
				points_log_time: pointsLog ? pointsLog._add_time : null,
				points_log_time_str: pointsLog && pointsLog._add_time ? vk.pubfn.timeFormat(pointsLog._add_time, 'yyyy-MM-dd hh:mm:ss') : null,
				
				// 用户信息
				user_id: card.buy_user_id,
				user_name: user ? (user.nickname || user.username) : card.buy_user_id,
				user_username: user ? user.username : null,
				
				// 问题标识
				has_issue: hasIssue,
				issue_desc: issueDesc
			});
		}
		
		res.rows = records;
		res.total = cardsRes.total || cards.length;
		res.msg = `找到 ${records.length} 条购买记录`;
		
		return res;
	}
};

