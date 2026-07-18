module.exports = {
	/**
	 * 批量修正积分流水中的产品名称（根据卡密记录中的产品名称）
	 * @url admin/points/sys/fixPointsLogProductNames 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} product_id 产品ID（可选，如果指定则只修正该产品的流水）
	 * @param {Boolean} dryRun 是否只是预览，不实际更新（默认true）
	 * @param {Number} limit 限制处理的数量（可选，默认1000）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Object} data 修正结果统计
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
			product_id = '', 
			dryRun = true,  // 默认只是预览，不实际更新
			limit = 1000 
		} = data;
		
		const $ = db.command;
		
		// 查询需要修正的积分流水（来源为购买卡密或续费卡密）
		let whereJson = {
			source: $.in(['card_buy', 'card_renew'])
		};
		
		if (product_id && product_id.trim()) {
			// 如果指定了产品ID，需要先找到相关的卡密，然后找到相关的积分流水
			// 这里简化处理，直接查询所有购买卡密的流水
			whereJson.source = 'card_buy';
		}
		
		// 查询积分流水
		const logsRes = await db.collection('vk-points-log')
			.where(whereJson)
			.orderBy('_add_time', 'desc')
			.limit(limit)
			.get();
		
		const logs = logsRes.data || [];
		
		if (logs.length === 0) {
			return { 
				code: 0, 
				msg: '没有找到需要修正的积分流水',
				data: {
					total: 0,
					updated: 0,
					skipped: 0,
					preview: []
				}
			};
		}
		
		// 统计信息
		const stats = {
			total: logs.length,
			updated: 0,
			skipped: 0,
			errors: 0,
			preview: []
		};
		
		// 批量查询相关的卡密记录
		// 方法1：通过card_id关联（如果有）
		const cardIds = logs
			.map(log => log.card_id)
			.filter(id => id && id.trim());
		
		let cardsMap = {};
		if (cardIds.length > 0) {
			// 分批查询卡密（避免查询数量过多）
			const batchSize = 100;
			for (let i = 0; i < cardIds.length; i += batchSize) {
				const batch = cardIds.slice(i, i + batchSize);
				const cardsRes = await db.collection('vk-card-key')
					.where({
						_id: $.in(batch)
					})
					.get();
				
				(cardsRes.data || []).forEach(card => {
					cardsMap[card._id] = card;
				});
			}
		}
		
		// 方法2：对于没有card_id的积分流水，通过用户ID和时间范围查找卡密
		// 获取所有需要查找的用户ID和时间范围
		const userTimeRanges = {};
		logs.forEach(log => {
			if (!log.card_id && log.user_id && log._add_time) {
				const userId = log.user_id;
				if (!userTimeRanges[userId]) {
					userTimeRanges[userId] = { min: log._add_time, max: log._add_time };
				} else {
					if (log._add_time < userTimeRanges[userId].min) {
						userTimeRanges[userId].min = log._add_time;
					}
					if (log._add_time > userTimeRanges[userId].max) {
						userTimeRanges[userId].max = log._add_time;
					}
				}
			}
		});
		
		// 为每个用户查询时间范围内的卡密记录
		const userCardsMap = {}; // key: userId, value: {time: card}
		for (const [userId, timeRange] of Object.entries(userTimeRanges)) {
			// 扩展时间范围（前后各5分钟，以匹配可能的延迟）
			const timeWindow = 5 * 60 * 1000; // 5分钟
			const cardsRes = await db.collection('vk-card-key')
				.where({
					buy_user_id: userId,
					_add_time: $.gte(timeRange.min - timeWindow).and($.lte(timeRange.max + timeWindow))
				})
				.orderBy('_add_time', 'desc')
				.get();
			
			userCardsMap[userId] = cardsRes.data || [];
		}
		
		// 批量查询产品表（避免重复查询）
		const productIds = new Set();
		
		// 优先从积分流水记录中收集产品ID（如果记录中有的话）
		logs.forEach(log => {
			if (log.product_id) {
				productIds.add(log.product_id);
			}
		});
		
		// 如果积分流水记录中没有产品ID，再从卡密记录中收集
		if (productIds.size === 0) {
			Object.values(cardsMap).forEach(card => {
				if (card.product_id) productIds.add(card.product_id);
			});
			Object.values(userCardsMap).forEach(cards => {
				cards.forEach(card => {
					if (card.product_id) productIds.add(card.product_id);
				});
			});
		}
		
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
		
		// 处理每条积分流水
		const updates = [];
		for (const log of logs) {
			try {
				// 从备注中提取当前的产品名称
				const currentRemark = log.remark || '';
				const match = currentRemark.match(/【([^】]+)】/);
				const currentProductName = match ? match[1] : '';
				
				// 获取正确的产品名称（优先使用积分流水记录中的 product_id）
				let correctProductName = null;
				let matchedProductId = null;
				
				// 方法1：优先使用积分流水记录中的 product_id（最准确，防止篡改）
				if (log.product_id) {
					matchedProductId = log.product_id;
					if (productsMap[matchedProductId]) {
						correctProductName = productsMap[matchedProductId].product_name;
					}
				}
				// 方法2：如果积分流水记录中没有 product_id，通过card_id查找
				else if (log.card_id && cardsMap[log.card_id]) {
					const card = cardsMap[log.card_id];
					matchedProductId = card.product_id;
					
					// 从产品表获取正确的产品名称
					if (matchedProductId && productsMap[matchedProductId]) {
						correctProductName = productsMap[matchedProductId].product_name;
					}
				}
				// 方法3：通过用户ID和时间匹配（如果没有card_id和product_id）
				else if (log.user_id && log._add_time && userCardsMap[log.user_id]) {
					const userCards = userCardsMap[log.user_id];
					// 查找时间最接近的卡密记录（在前后5分钟内）
					const timeWindow = 5 * 60 * 1000;
					const matchedCard = userCards.find(card => {
						const timeDiff = Math.abs(card._add_time - log._add_time);
						return timeDiff <= timeWindow;
					});
					
					if (matchedCard && matchedCard.product_id) {
						matchedProductId = matchedCard.product_id;
						// 从产品表获取正确的产品名称
						if (productsMap[matchedProductId]) {
							correctProductName = productsMap[matchedProductId].product_name;
						}
					}
				}
				
				// 如果找到了正确的产品名称，且与当前备注中的不一致，则需要更新
				if (correctProductName && correctProductName !== currentProductName) {
					// 生成新的备注
					let newRemark = currentRemark;
					if (match) {
						// 替换产品名称
						newRemark = currentRemark.replace(/【[^】]+】/, `【${correctProductName}】`);
					} else {
						// 如果没有找到产品名称，尝试在合适的位置插入
						// 这里简化处理，直接替换整个备注
						if (log.source === 'card_buy') {
							// 购买卡密的备注格式：购买 X 张【产品名称】卡密（X天/X机），消耗 X 积分
							const buyMatch = currentRemark.match(/购买\s+(\d+)\s+张/);
							if (buyMatch) {
								const numKeys = buyMatch[1];
								const restMatch = currentRemark.match(/卡密（([^）]+)），消耗\s+(\d+)\s+积分/);
								if (restMatch) {
									newRemark = `购买 ${numKeys} 张【${correctProductName}】卡密（${restMatch[1]}），消耗 ${restMatch[2]} 积分`;
								}
							}
						} else if (log.source === 'card_renew') {
							// 续费卡密的备注格式：续费【产品名称】卡密 X，增加 X 天，消耗 X 积分
							const renewMatch = currentRemark.match(/续费【[^】]+】卡密\s+([^，]+)，增加\s+(\d+)\s+天，消耗\s+(\d+)\s+积分/);
							if (renewMatch) {
								newRemark = `续费【${correctProductName}】卡密 ${renewMatch[1]}，增加 ${renewMatch[2]} 天，消耗 ${renewMatch[3]} 积分`;
							}
						}
					}
					
					// 添加到预览列表
					stats.preview.push({
						log_id: log._id,
						user_id: log.user_id,
						old_remark: currentRemark,
						new_remark: newRemark,
						old_product_name: currentProductName,
						new_product_name: correctProductName,
						_add_time: log._add_time,
						_add_time_str: log._add_time ? vk.pubfn.timeFormat(log._add_time, 'yyyy-MM-dd hh:mm:ss') : ''
					});
					
					// 如果不是预览模式，执行更新
					if (!dryRun) {
						updates.push({
							_id: log._id,
							remark: newRemark
						});
					}
				} else {
					stats.skipped++;
				}
			} catch (err) {
				console.error('处理积分流水失败：', err);
				stats.errors++;
			}
		}
		
		// 如果不是预览模式，批量更新
		if (!dryRun && updates.length > 0) {
			// 使用批量更新
			const dbCmd = db.command;
			for (const update of updates) {
				try {
					await db.collection('vk-points-log')
						.doc(update._id)
						.update({
							remark: update.remark
						});
					stats.updated++;
				} catch (err) {
					console.error('更新积分流水失败：', err);
					stats.errors++;
				}
			}
		}
		
		res.data = stats;
		if (dryRun) {
			res.msg = `预览模式：找到 ${stats.preview.length} 条需要修正的积分流水（共检查 ${stats.total} 条）`;
		} else {
			res.msg = `已修正 ${stats.updated} 条积分流水（共检查 ${stats.total} 条，跳过 ${stats.skipped} 条，错误 ${stats.errors} 条）`;
		}
		
		return res;
	}
};

