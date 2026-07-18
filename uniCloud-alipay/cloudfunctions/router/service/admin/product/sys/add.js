module.exports = {
	/**
	 * 新增产品
	 * @url admin/product/sys/add
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能新增产品' };
		}
		
	let {
		product_id,
		product_name,
		product_type,
		product_image,
		download_url,
		price_points = 5,
		price_months = 1,
		price_machines = 1,
		description,
		remark,
		status = 1,
		valid_days_options,
		custom_user_ids = [],
		special_price = 1,
		special_price_user_ids = []
	} = data;
		
		// 参数校验
		if (!product_id) {
			return { code: -1, msg: '请输入产品ID' };
		}
		
		if (!product_name) {
			return { code: -1, msg: '请输入产品名称' };
		}
		
		if (!product_type) {
			return { code: -1, msg: '请选择产品类型' };
		}
		
	if (!price_points || price_points <= 0) {
		return { code: -1, msg: '请输入有效的收费积分' };
	}
	
	if (!price_months || price_months <= 0) {
		return { code: -1, msg: '请输入有效的收费月数' };
	}
	
	if (!price_machines || price_machines <= 0) {
		return { code: -1, msg: '请输入有效的收费机器数' };
	}
	// 计算 base_price（基础价格 = 积分 / 月数 / 机器数）
	const basePrice = Number(price_points) / Number(price_months) / Number(price_machines);
	
	// 插入产品数据
	const insertRes = await db.collection('vk-products').add({
		product_id,
		product_name,
		product_type,
		product_image: product_image || '',
		download_url: download_url || '',
		price_points: Number(price_points),
		price_months: Number(price_months),
		price_machines: Number(price_machines),
		base_price: basePrice,
		description: description || '',
		remark: remark || '',
		status: Number(status),
		valid_days_options: valid_days_options || [],
		custom_user_ids: custom_user_ids || [],
		special_price: Number(special_price) || 1,
		special_price_user_ids: special_price_user_ids || [],
		_add_time: Date.now()
	});
		
		res.msg = '产品添加成功';
		res.data = {
			id: insertRes.id
		};
		
		return res;
	}
}

