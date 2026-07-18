module.exports = {
	/**
	 * 卡密续费（新架构）
	 * @url admin/card/kh/renew 前端调用的url参数地址
	 * data 请求参数
	 * @param {String} card_id 卡密ID
	 * @param {String} product_id 产品ID（从卡密记录中获取）
	 * @param {String} product_name 产品名称（从卡密记录中获取，用于双重验证）
	 * @param {Number} renew_days 续费天数
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { pubFun, vk, db, _ } = util;
		let uid = userInfo._id; // 修复：使用 _id 而不是 uid，与其他接口保持一致
		let { card_id, renew_days } = data;
		let res = { code: 0, msg: '续费成功' };
		
		// 参数验证
		if (!card_id) return { code: -1, msg: '缺少卡密ID' };
		if (!renew_days || renew_days <= 0) return { code: -1, msg: '请选择续费天数' };
		
		// 续费天数上限验证
		if (renew_days > 3650) {
			return { code: -1, msg: '续费天数不能超过3650天' };
		}
		
		// 查询卡密信息
		const cardRes = await db.collection('vk-card-key').doc(card_id).get();
		if (!cardRes.data || cardRes.data.length === 0) {
			return { code: -1, msg: '卡密不存在' };
		}
		const card = cardRes.data[0];
		
		// 新架构：检查卡密是否已激活（activate_time > 0）
		if (card.activate_time === 0) {
			return { code: -1, msg: '该卡密尚未激活，无法续费' };
		}
		
		// 新架构：只有有时间限制的卡密才能续费（limit_days !== -1）
		if (card.limit_days === -1) {
			return { code: -1, msg: '永久有效的卡密无需续费' };
		}
		
		// 验证卡密所有者（管理员可以续费任何卡密）
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		
		// 调试日志：输出用户信息和卡密信息
		console.log('=== 续费权限验证 ===');
		console.log('当前用户 uid:', uid);
		console.log('当前用户 userInfo._id:', userInfo._id);
		console.log('当前用户 role:', userInfo.role);
		console.log('是否管理员:', isAdmin);
		console.log('卡密 buy_user_id:', card.buy_user_id);
		console.log('buy_user_id === uid:', card.buy_user_id === uid);
		console.log('====================');
		
		// 如果卡密有 buy_user_id，则验证是否属于当前用户
		// 如果没有 buy_user_id（旧数据），则允许续费
		if (!isAdmin && card.buy_user_id && card.buy_user_id !== uid) {
			console.log('续费权限验证失败：buy_user_id 不匹配');
			return { code: -1, msg: '只能续费自己购买的卡密' };
		}
		
		// 获取产品信息（使用 product_id + product_name 双重验证）
		// 优先使用卡密记录中的 product_name，如果没有则只使用 product_id（兼容旧数据）
		const productName = card.product_name && card.product_name.trim() 
			? card.product_name.trim() 
			: null;
		
		const product = productName 
			? await pubFun.getProduct(vk, { product_id: card.product_id, product_name: productName })
			: await pubFun.getProduct(vk, card.product_id); // 兼容旧数据：只使用 product_id
		
		if (!product) {
			return { code: -1, msg: '产品不存在或已下架' };
		}
		
		// 获取用户绑定机器总数（用于特殊价格计算）
		const totalMachines = await pubFun.getUserTotalMachines(vk, db, uid);
		
		// 处理机器数量：-1 表示不限，按 1 台计算积分
		const machineCountForCalc = card.max_machine_count === -1 ? 1 : card.max_machine_count;
		
		// 计算基础积分（使用新架构的 max_machine_count，传入用户ID和绑定机器数量用于特殊价格计算，开启调试模式）
		const basePoints = pubFun.calculateProductPoints(product, renew_days, 1, machineCountForCalc, { userId: uid, totalMachines, debug: true });
		
		// 调试信息：输出积分计算详情
		const specialPriceUserIds = product.special_price_user_ids || [];
		const isSpecialPriceUser = specialPriceUserIds.includes(uid);
		const specialPrice = product.special_price || 1;
		console.log('=== 续费积分计算详情 ===');
		console.log('产品名称:', product.product_name);
		console.log('产品基础价格:', product.base_price, '积分/月/机器');
		console.log('续费天数:', renew_days, '天');
		console.log('机器数:', card.max_machine_count, '台');
		console.log('用户绑定机器总数:', totalMachines);
		console.log('是否为特殊价格用户:', isSpecialPriceUser, `(特殊价格用户享受${specialPrice}积分/月/机器)`);
		console.log('基础积分计算结果:', basePoints, '积分');
		
		// 计算续费所需积分（不再应用定制用户折扣）
		const points_needed = basePoints;
		
		console.log('最终扣除积分:', points_needed, '积分');
		console.log('====================');
		
		// 查询用户积分，如果不存在则自动创建
		let pointsRes = await db.collection('vk-user-points').where({ user_id: uid }).get();
		let pointsAccount;
		
		if (!pointsRes.data || pointsRes.data.length === 0) {
			// 自动创建积分账户
			const newAccount = {
				user_id: uid,
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
		
		// 验证积分是否足够
		if (pointsAccount.available_points < points_needed) {
			const shortfall = points_needed - pointsAccount.available_points;
			return { code: -1, msg: `积分不足，还需 ${shortfall} 积分` };
		}
		
		// 计算新的到期时间（新架构）
		// 如果当前已过期，从现在开始计算；否则在原到期时间基础上延长
		const now = Date.now();
		const baseTime = card.expire_time > now ? card.expire_time : now;
		const newEndTime = baseTime + (renew_days * 24 * 60 * 60 * 1000);
		
		// 防并发：使用乐观锁（检查积分是否被修改）
		const currentPoints = pointsAccount.available_points;
		
		// 开启事务
		const transaction = await db.startTransaction();
		try {
			// 1. 扣除积分（带乐观锁验证）
			const updatePointsRes = await transaction.collection('vk-user-points')
				.where({
					_id: pointsAccount._id,
					available_points: currentPoints // 乐观锁：只有当积分未变化时才更新
				})
				.update({
					available_points: _.inc(-points_needed),
					consumed_points: _.inc(points_needed)
				});
			
			// 如果更新失败，说明积分已被其他操作修改
			if (updatePointsRes.updated === 0) {
				await transaction.rollback();
				return { code: -1, msg: '积分余额已变化，请刷新后重试' };
			}
			
			// 2. 记录积分流水
			// 优先使用卡密记录中的产品名称（如果存在且正确），否则使用产品表中的
			// 这样可以解决产品名称错误的问题（比如黑色版本被标记为白色）
			const displayProductName = card.product_name && card.product_name.trim() 
				? card.product_name.trim() 
				: product.product_name;
			
			// 注意：product_id 和 product_name 必须从后端获取，不能由前端传入，防止篡改
			await transaction.collection('vk-points-log').add({
				user_id: uid,
				type: 'consume',
				amount: -points_needed,
				balance: currentPoints - points_needed,
				source: 'card_renew',
				card_id: card_id, // 关联卡密ID
				product_id: product.product_id, // 从后端获取，防止前端篡改
				product_name: displayProductName, // 从后端获取，防止前端篡改
				remark: `续费【${displayProductName}】卡密 ${card.card_code}，增加 ${renew_days} 天，消耗 ${points_needed} 积分`,
				_add_time: now
			});
			
			// 3. 更新卡密信息（新架构）
			const updateData = {
				expire_time: newEndTime,
				// 新架构：limit_days 保持不变，不需要更新
				_update_time: now
			};
			
			await transaction.collection('vk-card-key').doc(card_id).update(updateData);
			
			// 提交事务
			await transaction.commit();
			
			res.data = {
				new_end_time: newEndTime,
				new_end_time_text: vk.pubfn.timeFormat(newEndTime, 'yyyy-MM-dd hh:mm:ss'),
				points_used: points_needed,
				points_balance: currentPoints - points_needed,
				renew_days: renew_days
			};
			
		} catch (err) {
			await transaction.rollback();
			console.error('续费失败：', err);
			return { code: -1, msg: '续费失败：' + err.message };
		}
		
		return res;
	}
}

