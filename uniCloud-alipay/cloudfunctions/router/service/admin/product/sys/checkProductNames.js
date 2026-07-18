module.exports = {
	/**
	 * 检查产品表中的产品名称（用于发现产品名称错误问题）
	 * @url admin/product/sys/checkProductNames 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} keyword 搜索关键词（可选，如"投屏+AI讲解插件"）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Array} data 产品列表
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
		
		let { keyword = '' } = data;
		
		// 构建查询条件
		let whereJson = {};
		if (keyword && keyword.trim()) {
			// 使用正则表达式模糊匹配产品名称
			whereJson.product_name = new RegExp(keyword.trim(), 'i');
		}
		
		// 查询产品
		const productsRes = await db.collection('vk-products')
			.where(whereJson)
			.orderBy('_add_time', 'desc')
			.get();
		
		const products = productsRes.data || [];
		
		// 分析产品名称，查找可能的问题
		const analysis = {
			total: products.length,
			potentialIssues: [],
			products: products.map(p => ({
				_id: p._id,
				product_id: p.product_id,
				product_name: p.product_name,
				product_type: p.product_type,
				status: p.status,
				_add_time: p._add_time,
				_add_time_str: p._add_time ? vk.pubfn.timeFormat(p._add_time, 'yyyy-MM-dd hh:mm:ss') : ''
			}))
		};
		
		// 查找可能的产品名称错误（如包含"白"但应该是"黑"，或相反）
		products.forEach(product => {
			const name = product.product_name || '';
			// 检查是否包含版本标识
			if (name.includes('(白)') || name.includes('(黑)') || name.includes('白') || name.includes('黑')) {
				// 可以在这里添加更多的检查逻辑
				analysis.potentialIssues.push({
					product_id: product.product_id,
					product_name: product.product_name,
					issue: '包含版本标识，请确认是否正确'
				});
			}
		});
		
		res.data = analysis;
		res.msg = `共找到 ${products.length} 个产品`;
		
		return res;
	}
};

