module.exports = {
	/**
	 * 删除产品分类
	 * @url admin/product-category/sys/delete
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能删除分类' };
		}

		let { _id } = data;

		if (!_id) {
			return { code: -1, msg: '缺少分类ID' };
		}

		// 获取分类信息
		const categoryRes = await db.collection('vk-product-categories').doc(_id).get();
		if (!categoryRes.data || categoryRes.data.length === 0) {
			return { code: -1, msg: '分类不存在' };
		}
		const category = categoryRes.data[0];

		// 检查是否有产品使用该分类
		const products = await db.collection('vk-products')
			.where({ product_type: category.value })
			.limit(1)
			.get();

		if (products.data && products.data.length > 0) {
			return { code: -1, msg: `该分类下还有 ${products.data.length} 个产品，无法删除` };
		}

		// 执行删除
		const deleteRes = await db.collection('vk-product-categories')
			.doc(_id)
			.remove();

		if (deleteRes.deleted === 0) {
			return { code: -1, msg: '删除失败' };
		}

		res.msg = '分类删除成功';

		return res;
	}
}
