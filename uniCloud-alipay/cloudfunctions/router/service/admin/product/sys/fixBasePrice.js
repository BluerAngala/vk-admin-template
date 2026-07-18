module.exports = {
	/**
	 * 修复产品 base_price 字段
	 * @url admin/product/sys/fixBasePrice
	 */
	main: async (event) => {
		let { userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能执行此操作' };
		}
		
		try {
			// 获取所有产品（分批查询确保获取所有数据）
			const batchSize = 100;
			let allProducts = [];
			let hasMore = true;
			let pageIndex = 1;
			
			while (hasMore) {
				const productsRes = await vk.baseDao.selects({
					dbName: 'vk-products',
					whereJson: {},
					pageIndex: pageIndex,
					pageSize: batchSize,
					getCount: false
				});
				
				let products = [];
				if (Array.isArray(productsRes)) {
					products = productsRes;
				} else if (productsRes && productsRes.rows) {
					products = productsRes.rows;
				} else if (productsRes && productsRes.data) {
					products = productsRes.data;
				}
				
				if (products.length > 0) {
					allProducts = allProducts.concat(products);
					if (productsRes.hasMore === false || products.length < batchSize) {
						hasMore = false;
					} else {
						pageIndex++;
					}
				} else {
					hasMore = false;
				}
			}
			
			if (allProducts.length === 0) {
				return { code: 0, msg: '没有需要修复的产品', data: { count: 0 } };
			}
			
			let fixedCount = 0;
			const products = allProducts;
			
			// 遍历所有产品
			for (let product of products) {
				// 如果已经有 base_price 且值合理，跳过
				if (product.base_price && product.base_price > 0) {
					continue;
				}
				
				// 如果缺少必要字段，跳过
				if (!product.price_points || !product.price_months || !product.price_machines) {
					console.log(`产品 ${product.product_id} 缺少必要字段，跳过`);
					continue;
				}
				
				// 计算 base_price
				const basePrice = Number(product.price_points) / Number(product.price_months) / Number(product.price_machines);
				
				// 更新产品
				await db.collection('vk-products').doc(product._id).update({
					base_price: basePrice,
					_update_time: Date.now()
				});
				
				fixedCount++;
				console.log(`已修复产品 ${product.product_id}，base_price=${basePrice}`);
			}
			
			res.msg = `成功修复 ${fixedCount} 个产品的 base_price 字段`;
			res.data = {
				total: products.length,
				fixed: fixedCount
			};
			
		} catch (err) {
			console.error('修复 base_price 失败：', err);
			return { code: -1, msg: '修复失败：' + err.message };
		}
		
		return res;
	}
}

