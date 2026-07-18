module.exports = {
	/**
	 * 初始化产品数据（仅管理员可用）
	 * @url admin/product/sys/initProducts
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 初始产品数据（积分1:1对应金额，去除时长折扣）
		const products = [
			{
				product_id: "ai-script-generator",
				product_name: "AI生成话术",
				product_type: "software",
				base_price: 50,
				machine_unit: 1,
				description: "AI智能生成营销话术，提升转化率",
				icon: "el-icon-chat-dot-round",
				status: 1,
				sort: 10,
				custom_user_ids: [],
				valid_days_options: [
					{days: 30, label: "月卡(30天)", discount: 1},
					{days: 90, label: "季卡(90天)", discount: 1},
					{days: 180, label: "半年卡(180天)", discount: 1},
					{days: 365, label: "年卡(365天)", discount: 1}
				],
				_add_time: Date.now()
			},
			{
				product_id: "jd-screen-helper",
				product_name: "京东投屏助手",
				product_type: "plugin",
				base_price: 5,
				machine_unit: 10,
				description: "京东商品投屏展示助手",
				icon: "el-icon-monitor",
				status: 1,
				sort: 20,
				custom_user_ids: [],
				valid_days_options: [
					{days: 30, label: "月卡(30天)", discount: 1},
					{days: 90, label: "季卡(90天)", discount: 1},
					{days: 180, label: "半年卡(180天)", discount: 1},
					{days: 365, label: "年卡(365天)", discount: 1}
				],
				_add_time: Date.now()
			},
			{
				product_id: "general-software",
				product_name: "通用软件",
				product_type: "software",
				base_price: 5,
				machine_unit: 1,
				description: "通用型软件授权",
				icon: "el-icon-s-platform",
				status: 1,
				sort: 30,
				custom_user_ids: [],
				valid_days_options: [
					{days: 30, label: "月卡(30天)", discount: 1},
					{days: 90, label: "季卡(90天)", discount: 1},
					{days: 180, label: "半年卡(180天)", discount: 1},
					{days: 365, label: "年卡(365天)", discount: 1}
				],
				_add_time: Date.now()
			},
			{
				product_id: "general-plugin",
				product_name: "通用浏览器插件",
				product_type: "plugin",
				base_price: 5,
				machine_unit: 10,
				description: "通用型浏览器插件授权",
				icon: "el-icon-link",
				status: 1,
				sort: 40,
				custom_user_ids: [],
				valid_days_options: [
					{days: 30, label: "月卡(30天)", discount: 1},
					{days: 90, label: "季卡(90天)", discount: 1},
					{days: 180, label: "半年卡(180天)", discount: 1},
					{days: 365, label: "年卡(365天)", discount: 1}
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

