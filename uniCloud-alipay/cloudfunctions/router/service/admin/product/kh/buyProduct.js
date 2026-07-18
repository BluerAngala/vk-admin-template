module.exports = {
	/**
	 * 购买产品（用户端）
	 * @url admin/product/kh/buyProduct 前端调用的url参数地址
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _, pubFun } = util;
		let res = { code: 0, msg: '' };
		
		// 参数
		let { product_id, product_name } = data;
		
		// 获取当前用户ID
		const userId = userInfo ? userInfo._id : null;
		
		if (!userId) {
			return { code: -1, msg: '请先登录' };
		}
		
		// 参数验证：必须同时提供 product_id 和 product_name
		if (!product_id || !product_name) {
			return { code: -1, msg: '请提供产品ID和产品名称' };
		}
		
		// 使用产品ID和产品名称双重验证查询产品
		const productRes = await db.collection('vk-products')
			.where({ 
				product_id: product_id, 
				product_name: product_name,
				status: 1 
			})
			.get();
		
		if (!productRes.data || productRes.data.length === 0) {
			return { code: -1, msg: '产品不存在或已下架，请确认产品信息' };
		}
		
		if (productRes.data.length > 1) {
			return { code: -1, msg: '找到多个相同产品ID和名称的产品，请联系管理员' };
		}
		
		const product = productRes.data[0];
		
		// 检查产品是否为公开产品
		if (!product.custom_user_ids || !product.custom_user_ids.includes('all')) {
			return { code: -1, msg: '该产品不是公开可购买产品' };
		}
		
		// 检查用户是否已经购买过该产品记录（通过 purchased_user_ids）
		if (product.purchased_user_ids && Array.isArray(product.purchased_user_ids) && 
		    product.purchased_user_ids.includes(userId)) {
			return { code: -1, msg: '您已经购买过该产品' };
		}
		
	// 计算需要支付的积分（使用购买价格）
	const pricePoints = product.buy_price || 0;
	
	// 如果购买价格为0，说明不允许购买
	if (pricePoints === 0) {
		return { code: -1, msg: '该产品暂不支持购买' };
	}
	
	// 查询用户当前积分（使用 pubFun.getPointsBalance 自动处理管理员积分）
	const pointsBalance = await pubFun.getPointsBalance(vk, userId);
	const currentPoints = pointsBalance.available_points || 0;
	
	// 检查积分是否足够
	if (currentPoints < pricePoints) {
		return { code: -1, msg: `积分不足，需要${pricePoints}积分，当前仅有${currentPoints}积分` };
	}
	
	// 生成唯一订单号（用于防止重复购买）
	const orderId = `product_${product._id}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	
	// 先扣除用户积分（传递订单号防止重复）
	const pointsResult = await pubFun.addPoints(
		vk,
		userId,
		-pricePoints,
		'buy_product',
		`购买产品：${product.product_name}`,
		orderId
	);
	
	if (!pointsResult.success) {
		return { code: -1, msg: pointsResult.message || '积分扣除失败' };
	}
	
	// 开始事务处理（积分扣除成功后再处理购买记录）
	const transaction = await db.startTransaction();
	try {
		// 1. 再次检查用户是否已经购买过（事务中检查，防止并发）
		const productDoc = await transaction.collection('vk-products').doc(product._id).get();
		if (!productDoc.data) {
			await transaction.rollback();
			// 回滚积分
			await pubFun.addPoints(
				vk,
				userId,
				pricePoints,
				'buy_product_rollback',
				`购买产品失败回滚：${product.product_name}`,
				`${orderId}_rollback`
			);
			return { code: -1, msg: '产品不存在' };
		}
		
		const currentPurchasedUserIds = productDoc.data.purchased_user_ids || [];
		if (currentPurchasedUserIds.includes(userId)) {
			await transaction.rollback();
			// 回滚积分
			await pubFun.addPoints(
				vk,
				userId,
				pricePoints,
				'buy_product_rollback',
				`购买产品失败回滚：${product.product_name}`,
				`${orderId}_rollback`
			);
			return { code: -1, msg: '您已经购买过该产品' };
		}
		
		// 2. 将用户ID添加到产品的 purchased_user_ids 数组（事务中更新）
		const updatedPurchasedUserIds = [...currentPurchasedUserIds, userId];
		await transaction.collection('vk-products').doc(product._id).update({
			purchased_user_ids: updatedPurchasedUserIds
		});
		
		// 3. 记录购买信息（同时保存 product_id、product_record_id 和 product_name）
		await transaction.collection('vk-user-products').add({
			user_id: userId,
			product_id: product.product_id, // 使用查询到的产品ID
			product_record_id: product._id, // 产品记录ID（精确标识）
			product_name: product.product_name, // 产品名称（用于显示和验证）
			price_paid: pricePoints,
			buy_time: Date.now(),
			_add_time: Date.now()
		});
		
		// 4. 提交事务
		await transaction.commit();
			
			res.msg = '购买成功';
			res.data = {
				product_id: product.product_id,
				product_record_id: product._id,
				product_name: product.product_name,
				download_url: product.download_url,
				remaining_points: pointsResult.balance
			};
			
	} catch (err) {
		// 如果事务已开始但未提交，回滚
		if (transaction) {
			try {
				await transaction.rollback();
			} catch (rollbackErr) {
				console.error('事务回滚失败:', rollbackErr);
			}
		}
		// 积分已扣除但事务失败，回滚积分（通过添加等额积分）
		try {
			console.log('事务失败，回滚积分:', { userId, orderId, amount: pricePoints });
			await pubFun.addPoints(
				vk,
				userId,
				pricePoints,
				'buy_product_rollback',
				`购买产品失败回滚：${product.product_name}`,
				`${orderId}_rollback`
			);
		} catch (rollbackPointsErr) {
			console.error('回滚积分失败:', rollbackPointsErr);
		}
		console.error('购买产品失败:', err);
		return { code: -1, msg: '购买失败：' + (err.message || err) };
	}
		
		return res;
	}
}

