module.exports = {
	/**
	 * 用户购买卡密（使用积分）- 新架构
	 * @url admin/card/kh/add 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} product_id 			产品ID
	 * @param {String} product_name 		产品名称（用于双重验证）
	 * @param {Number} limit_days 				限制天数
	 * @param {Number} max_machine_count 	最大机器数
	 * @param {Number} total_times 			总次数（-1表示不限）
	 * @param {Number} numKeys 					购买数量
	 * @param {Number} keyLength 				密钥长度
	 * @param {String} keyPrefix 				卡密前缀（可选）
	 * @param {String} keySuffix 				卡密后缀（可选）
	 * @param {String} remark 					备注
	 * 注意：product_id 和 product_name 必须同时提供，用于双重验证，防止同一 product_id 多个版本的混淆
	 * res 返回参数说明
	 * @param {Number} code							错误码，0表示成功
	 * @param {String} msg							详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		let {
			product_id,
			limit_days = 30,
			max_machine_count = 1,
			total_times = -1,
			numKeys = 1,
			keyLength = 20,
			keyPrefix = '',
			keySuffix = '',
			remark = ''
			// 注意：product_name_override 已移除，产品名称必须从后端获取，防止前端篡改
		} = data;
		
		// 解析 product_id（可能是 JSON 字符串格式）
		let finalProductId = product_id;
		let finalProductName = data.product_name;
		
		if (product_id && typeof product_id === 'string') {
			try {
				const parsed = JSON.parse(product_id);
				if (parsed.product_id && parsed.product_name) {
					finalProductId = parsed.product_id;
					finalProductName = parsed.product_name;
				}
			} catch (e) {
				// 不是 JSON 字符串，使用原始值
			}
		}
		
		// 参数校验
		if (!finalProductId) {
			return { code: -1, msg: '请选择产品' };
		}
		
		// 获取产品名称（用于双重验证）
		if (!finalProductName) {
			return { code: -1, msg: '请提供产品名称' };
		}
		
		if (numKeys < 1 || numKeys > 100) {
			return { code: -1, msg: '购买数量必须在1-100之间' };
		}
		
		if (max_machine_count < 1 || max_machine_count > 1000) {
			return { code: -1, msg: '允许使用的机器数量必须在1-1000之间' };
		}
		
		if (keyLength < 10 || keyLength > 64) {
			return { code: -1, msg: '密钥长度必须在10-64之间' };
		}
		
		// 获取当前用户ID
		let user_id = userInfo._id;
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		// 获取产品信息（使用 product_id + product_name 双重验证）
		const product = await pubFun.getProduct(vk, { product_id: finalProductId, product_name: finalProductName });
		if (!product) {
			// 尝试只使用 product_id 查询，看看是否存在（用于调试）
			const productByIdOnly = await pubFun.getProduct(vk, finalProductId);
			if (productByIdOnly) {
				console.log('调试信息：使用 product_id 查询到产品，但 product_name 不匹配');
				console.log('查询的 product_name:', finalProductName);
				console.log('产品表中的 product_name:', productByIdOnly.product_name);
				return { code: -1, msg: `产品名称不匹配。查询的名称："${finalProductName}"，产品表中的名称："${productByIdOnly.product_name}"` };
			}
			return { code: -1, msg: `产品不存在或已下架。product_id: ${finalProductId}, product_name: ${finalProductName}` };
		}
		
		// 获取用户绑定机器总数（用于特殊价格计算）
		const totalMachines = await pubFun.getUserTotalMachines(vk, db, user_id);
		
		// 计算基础积分（传入用户ID和绑定机器数量用于特殊价格计算，开启调试模式）
		const basePoints = pubFun.calculateProductPoints(product, limit_days, numKeys, max_machine_count, { userId: user_id, totalMachines, debug: true });
		
		// 调试信息：输出积分计算详情
		const specialPriceUserIds = product.special_price_user_ids || [];
		const isSpecialPriceUser = specialPriceUserIds.includes(user_id);
		const specialPrice = product.special_price || 1;
		console.log('=== 积分计算详情 ===');
		console.log('产品名称:', product.product_name);
		console.log('产品基础价格:', product.base_price, '积分/月/机器');
		console.log('购买数量:', numKeys, '张');
		console.log('有效期:', limit_days, '天');
		console.log('机器数:', max_machine_count, '台');
		console.log('用户绑定机器总数:', totalMachines);
		console.log('是否为特殊价格用户:', isSpecialPriceUser, `(特殊价格用户享受${specialPrice}积分/月/机器)`);
		console.log('基础积分计算结果:', basePoints, '积分');
		
		// 计算所需积分（不再应用定制用户折扣）
		const needPoints = basePoints;
		const unitPoints = pubFun.calculateProductPoints(product, limit_days, 1, max_machine_count, { userId: user_id, totalMachines, debug: false });
		
		console.log('最终扣除积分:', needPoints, '积分');
		console.log('==================');
		
		// 查询用户积分，如果不存在则自动创建
		let pointsRes = await db.collection('vk-user-points').where({ user_id }).get();
		let pointsAccount;
		
		if (!pointsRes.data || pointsRes.data.length === 0) {
			// 自动创建积分账户
			const newAccount = {
				user_id,
				total_points: 0,
				available_points: 0,
				frozen_points: 0,
				consumed_points: 0,
				_add_time: Date.now()
			};
			const addRes = await db.collection('vk-user-points').add(newAccount);
			pointsAccount = { ...newAccount, _id: addRes.id };
		} else {
			pointsAccount = pointsRes.data[0];
		}
		
		// 检查积分是否足够
		if (pointsAccount.available_points < needPoints) {
			const shortfall = needPoints - pointsAccount.available_points;
			return { code: -1, msg: `积分不足，还需 ${shortfall} 积分` };
		}
		
		// 生成唯一密钥
		const uniqueKeys = pubFun.generateUniqueKeys(numKeys, keyLength);
		
		// 产品名称必须从后端产品表获取，不能由前端传入，防止篡改
		// 如果产品表中的产品名称错误，需要先修正产品表
		const displayProductName = product.product_name;
		
		// 构造卡密列表
		let cardList = uniqueKeys.map((card_code) => {
			// 应用前缀和后缀
			const finalCardCode = (keyPrefix || '') + card_code + (keySuffix || '');
			return {
			card_code: finalCardCode,
			card_type: product.product_type,
			product_id: product.product_id,
			product_name: displayProductName, // 使用处理后的产品名称
			
			// 时间相关字段
			limit_days: limit_days,
			activate_time: 0, // 首次使用时设置
			expire_time: 0,   // 首次使用时计算
			
			// 次数相关字段
			total_times: total_times,
			used_times: 0,
			remaining_times: total_times,
			
			// 机器码相关字段
			max_machine_count: max_machine_count,
			authorized_machines: [],
			
			// 购买信息
			points_price: unitPoints,
			buy_user_id: user_id,
			remark: remark,
			_add_time: Date.now()
			};
		});
		
		// 开启事务
		const transaction = await db.startTransaction();
		try {
			// 1. 扣除积分（带乐观锁）
			const updatePointsRes = await transaction.collection('vk-user-points')
				.where({
					_id: pointsAccount._id,
					available_points: pointsAccount.available_points
				})
				.update({
					available_points: _.inc(-needPoints),
					consumed_points: _.inc(needPoints)
				});
			
			if (updatePointsRes.updated === 0) {
				await transaction.rollback();
				return { code: -1, msg: '积分余额已变化，请刷新后重试' };
			}
			
			// 2. 批量插入卡密（先插入卡密，获取卡密ID）
			const insertRes = await transaction.collection('vk-card-key').add(cardList);
			
			// 3. 记录积分流水（使用处理后的产品名称）
			// 注意：product_id 和 product_name 必须从后端获取，不能由前端传入，防止篡改
			// 如果购买了多张卡密，使用第一张卡密的ID作为关联（或者不关联，因为是多张卡密）
			const firstCardId = insertRes.ids && insertRes.ids.length > 0 ? insertRes.ids[0] : null;
			
			await transaction.collection('vk-points-log').add({
				user_id,
				type: 'consume',
				amount: -needPoints,
				balance: pointsAccount.available_points - needPoints,
				source: 'card_buy',
				card_id: firstCardId, // 关联第一张卡密的ID（如果购买了多张，只关联第一张）
				product_id: product.product_id, // 从后端获取，防止前端篡改
				product_name: displayProductName, // 从后端获取，防止前端篡改
				remark: `购买 ${numKeys} 张【${displayProductName}】卡密（${limit_days}天/${max_machine_count}机），消耗 ${needPoints} 积分`,
				_add_time: Date.now()
			});
			
			// 提交事务
			await transaction.commit();
			
			// 自动生成CSV
			let csvResult = null;
			try {
				const insertedIds = insertRes.ids || [];
				if (insertedIds.length > 0) {
					csvResult = await pubFun.exportCardsToCSV(insertedIds, db);
				}
			} catch (csvError) {
				console.error('CSV导出失败：', csvError);
			}
			
			res.msg = `成功购买 ${numKeys} 张卡密`;
			res.data = {
				count: numKeys,
				points_used: needPoints,
				points_balance: pointsAccount.available_points - needPoints,
				csvExport: csvResult,
				cards: cardList.map(c => ({ 
					card_code: c.card_code, 
					product_id: c.product_id,
					product_name: c.product_name
				}))
			};
			
		} catch (err) {
			await transaction.rollback();
			console.error('购买卡密失败：', err);
			return { code: -1, msg: '购买失败：' + err.message };
		}
		
		return res;
	}
}


