module.exports = {
	/**
	 * 查询我的卡密列表
	 * @url admin/card/kh/getMyCards 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number} pageIndex 当前页码
	 * @param {Number} pageSize 每页显示数量
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		let dbName = "vk-card-key";
		
		// 查询当前用户购买的卡密
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson: {
				buy_user_id: user_id
			},
			sortArr: [{ name: "_add_time", type: "desc" }] // 按购买时间倒序
		});
		
		// 关联产品信息并格式化时间显示
		if (res.rows && res.rows.length > 0) {
			// 获取所有产品ID
			const productIds = [...new Set(res.rows.map(item => item.product_id).filter(Boolean))];
			
			// 批量查询产品信息
			let productsMap = {};
			if (productIds.length > 0) {
				const productsRes = await db.collection('vk-products')
					.where({
						product_id: db.command.in(productIds)
					})
					.field({
						product_id: true,
						download_url: true,
						product_image: true,
						version_logs: true
					})
					.get();
				
				if (productsRes.data && productsRes.data.length > 0) {
					productsRes.data.forEach(product => {
						productsMap[product.product_id] = product;
					});
				}
			}
			
			res.rows = res.rows.map(item => {
				// 关联产品的下载地址和版本信息
				if (item.product_id && productsMap[item.product_id]) {
					item.download_url = productsMap[item.product_id].download_url || '';
					item.product_image = productsMap[item.product_id].product_image || '';
					item.version_logs = productsMap[item.product_id].version_logs || [];
					// 获取最新版本号
					if (item.version_logs && item.version_logs.length > 0) {
						item.latest_version = item.version_logs[0].version || '';
					}
				}
				
				if (item._add_time) {
					item._add_time_str = vk.pubfn.timeFormat(item._add_time, 'yyyy-MM-dd hh:mm:ss');
				}
				if (item.expire_time && item.expire_time > 0) {
					item.expire_time_str = vk.pubfn.timeFormat(item.expire_time, 'yyyy-MM-dd hh:mm:ss');
				}
				if (item.used_time && item.used_time > 0) {
					item.used_time_str = vk.pubfn.timeFormat(item.used_time, 'yyyy-MM-dd hh:mm:ss');
				}
				return item;
			});
		}
		
		return res;
	}
};

