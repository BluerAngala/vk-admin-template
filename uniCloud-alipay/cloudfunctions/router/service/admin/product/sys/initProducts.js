module.exports = {
	/**
	 * 初始化产品数据（仅管理员可用）
	 * @url admin/product/sys/initProducts
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 初始产品数据（price_points/price_months/price_machines 为必填字段）
		const products = [
			{
				product_id: "demo-software",
				product_name: "示例软件",
				product_type: "software",
				price_points: 5,
				price_months: 1,
				price_machines: 1,
				base_price: 5,
				description: "示例软件产品，仅供测试",
				status: 1,
				custom_user_ids: ["all"],
				valid_days_options: [
					{ days: 30, label: "月卡(30天)", discount: 1 },
					{ days: 90, label: "季卡(90天)", discount: 1 },
					{ days: 365, label: "年卡(365天)", discount: 1 }
				],
				_add_time: Date.now()
			},
			{
				product_id: "demo-plugin",
				product_name: "示例插件",
				product_type: "plugin",
				price_points: 10,
				price_months: 1,
				price_machines: 1,
				base_price: 10,
				description: "示例浏览器插件，仅供测试",
				status: 1,
				custom_user_ids: ["all"],
				valid_days_options: [
					{ days: 30, label: "月卡(30天)", discount: 1 },
					{ days: 90, label: "季卡(90天)", discount: 1 },
					{ days: 365, label: "年卡(365天)", discount: 1 }
				],
				_add_time: Date.now()
			},
			{
				product_id: "demo-web",
				product_name: "示例网页服务",
				product_type: "web",
				price_points: 3,
				price_months: 1,
				price_machines: 1,
				base_price: 3,
				description: "示例网页服务，仅供测试",
				status: 1,
				custom_user_ids: ["all"],
				valid_days_options: [
					{ days: 30, label: "月卡(30天)", discount: 1 },
					{ days: 90, label: "季卡(90天)", discount: 1 },
					{ days: 365, label: "年卡(365天)", discount: 1 }
				],
				_add_time: Date.now()
			}
		];
		
		try {
			// 检查表是否存在数据（分批查询确保获取所有数据）
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
			
			const existingProducts = { data: allProducts };
			
			if (existingProducts.data && existingProducts.data.length > 0) {
				return { code: -1, msg: '产品数据已存在，无需重复初始化' };
			}
			
			// 批量插入产品数据
			const insertRes = await db.collection('vk-products').add(products);
			
			res.msg = `成功初始化 ${products.length} 个产品`;
			res.data = {
				count: products.length,
				ids: insertRes.ids
			};
			
		} catch (err) {
			console.error('初始化产品数据失败：', err);
			return { code: -1, msg: '初始化失败：' + err.message };
		}
		
		return res;
	}
}

