module.exports = {
	/**
	 * 获取所有启用的产品分类（供下拉选择，不需要管理员权限）
	 * @url admin/product-category/sys/getAll
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 查询所有启用的分类，按排序字段升序
		const result = await db.collection('vk-product-categories')
			.where({ enable: true })
			.orderBy('sort', 'asc')
			.get();

		res.data = result.data || [];

		return res;
	}
}
