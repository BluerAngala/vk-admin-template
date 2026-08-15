module.exports = {
	/**
	 * 获取产品列表（用户端 - 带权限过滤）
	 * @url admin/product/kh/getList 前端调用的url参数地址
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 获取当前用户ID
		const userId = userInfo ? userInfo._id : null;
		
		// 判断是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		
		// 只返回上架的产品，按创建时间倒序排序
		const products = await db.collection('vk-products')
			.where({ status: 1 })
			.orderBy('_add_time', 'desc')
			.get();
		
		let filteredProducts = products.data || [];
		
		// 如果不是管理员，需要过滤产品
		if (!isAdmin && userId) {
			filteredProducts = filteredProducts.filter(product => {
				// 如果 custom_user_ids 为空，表示产品不可见
				if (!product.custom_user_ids || product.custom_user_ids.length === 0) {
					return false;
				}
				// 如果 custom_user_ids 包含 "all"，表示公开产品，所有人可见
				if (product.custom_user_ids.includes('all')) {
					return true;
				}
				// 如果 custom_user_ids 有具体用户ID，只有列表中的用户可见
				return product.custom_user_ids.includes(userId);
			});
		}
		// 管理员可以看到所有产品（不过滤）
		
		// 为每个产品添加购买状态和可见类型
		filteredProducts = filteredProducts.map(product => {
			// 判断是否为公开产品（包含'all'）
			const isPublic = product.custom_user_ids && product.custom_user_ids.includes('all');

			// 判断当前用户是否在可见范围列表中（指定用户可见，且不包含'all'）
			// 指定用户可见：custom_user_ids 包含用户ID，但不包含 'all'
			const isCustom = userId && product.custom_user_ids &&
			                 product.custom_user_ids.includes(userId) &&
			                 !product.custom_user_ids.includes('all');

			// 判断用户是否已购买（通过 purchased_user_ids 字段）
			const isPurchased = userId && product.purchased_user_ids &&
			                    Array.isArray(product.purchased_user_ids) &&
			                    product.purchased_user_ids.includes(userId);

			// 计算用户实际的购买价格（优先使用特殊价格配置）
			let userBuyPrice = product.buy_price || 0;
			if (product.special_price_configs && Array.isArray(product.special_price_configs)) {
				const userConfig = product.special_price_configs.find(config =>
					config.user_ids && config.user_ids.includes(userId)
				);
				if (userConfig && userConfig.buy_price > 0) {
					userBuyPrice = userConfig.buy_price;
				}
			}

			return {
				...product,
				is_public: isPublic,
				is_custom: isCustom,
				is_purchased: isPurchased,
				user_buy_price: userBuyPrice // 用户实际购买价格
			};
		});
		
		res.data = filteredProducts;
		return res;
	}
}

