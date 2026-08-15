module.exports = {
	/**
	 * 更新产品
	 * @url admin/product/sys/update
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能修改产品' };
		}
		
		let { _id, ...updateData } = data;
		
		if (!_id) {
			return { code: -1, msg: '缺少产品ID' };
		}
		
	// 移除不允许修改的字段
	delete updateData.product_id;
	delete updateData._add_time;
	
	// 如果收费标准有更新，重新计算 base_price
	if (updateData.price_points || updateData.price_months || updateData.price_machines) {
		// 获取现有产品数据
		const existingProduct = await db.collection('vk-products').doc(_id).get();
		if (existingProduct.data && existingProduct.data.length > 0) {
			const product = existingProduct.data[0];
			const pricePoints = Number(updateData.price_points || product.price_points);
			const priceMonths = Number(updateData.price_months || product.price_months);
			const priceMachines = Number(updateData.price_machines || product.price_machines);
			updateData.base_price = pricePoints / priceMonths / priceMachines;
		}
	}

	// 确保 special_price 是数字类型
	if (updateData.special_price !== undefined) {
		updateData.special_price = Number(updateData.special_price) || 1;
	}

	// 更新时间
	updateData._update_time = Date.now();

	// 如果修改了 purchased_user_ids，需要同步 vk-user-products 表
	if (updateData.purchased_user_ids !== undefined) {
		// 获取旧的产品数据
		const oldProduct = await db.collection('vk-products').doc(_id).get();
		if (oldProduct.data && oldProduct.data.length > 0) {
			const oldPurchasedUserIds = oldProduct.data[0].purchased_user_ids || [];
			const newPurchasedUserIds = updateData.purchased_user_ids || [];

			// 找出被移除的用户ID
			const removedUserIds = oldPurchasedUserIds.filter(uid => !newPurchasedUserIds.includes(uid));

			// 删除被移除用户的购买记录
			if (removedUserIds.length > 0) {
				const productProductId = oldProduct.data[0].product_id;
				for (const uid of removedUserIds) {
					await db.collection('vk-user-products')
						.where({
							user_id: uid,
							product_record_id: _id
						})
						.remove();
				}
			}
		}
	}

	// 更新产品数据
	const updateRes = await db.collection('vk-products')
		.doc(_id)
		.update(updateData);
		
		if (updateRes.updated === 0) {
			return { code: -1, msg: '产品不存在或更新失败' };
		}
		
		res.msg = '产品更新成功';
		
		return res;
	}
}

