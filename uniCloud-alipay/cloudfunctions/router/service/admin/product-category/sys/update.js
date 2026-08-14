module.exports = {
	/**
	 * 更新产品分类
	 * @url admin/product-category/sys/update
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能修改分类' };
		}

		let { _id, ...updateData } = data;

		if (!_id) {
			return { code: -1, msg: '缺少分类ID' };
		}

		// 移除不允许修改的字段
		delete updateData.value;  // 分类标识创建后不可改
		delete updateData._add_time;

		// 如果修改了 label，同步更新 vk-products 中对应 product_type 的显示
		if (updateData.label) {
			// 获取原分类信息
			const categoryRes = await db.collection('vk-product-categories').doc(_id).get();
			if (categoryRes.data && categoryRes.data.length > 0) {
				const oldCategory = categoryRes.data[0];
				// label 变化不影响已有产品，因为产品存储的是 value 而非 label
				// 但需要记录日志或通知（此处暂不做）
			}
		}

		// 更新时间
		updateData._update_time = Date.now();

		// 执行更新
		const updateRes = await db.collection('vk-product-categories')
			.doc(_id)
			.update(updateData);

		if (updateRes.updated === 0) {
			return { code: -1, msg: '分类不存在或更新失败' };
		}

		res.msg = '分类更新成功';

		return res;
	}
}
