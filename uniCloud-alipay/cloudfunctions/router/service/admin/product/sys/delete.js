module.exports = {
	/**
	 * 删除产品
	 * @url admin/product/sys/delete
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能删除产品' };
		}
		
		let { _id } = data;
		
		if (!_id) {
			return { code: -1, msg: '缺少产品ID' };
		}
		
		// 检查是否有卡密使用该产品
		const cards = await db.collection('vk-card-key')
			.where({ product_id: _id })
			.limit(1)
			.get();
		
		if (cards.data && cards.data.length > 0) {
			return { code: -1, msg: '该产品已被使用，无法删除' };
		}
		
		// 删除产品
		const deleteRes = await db.collection('vk-products')
			.doc(_id)
			.remove();
		
		if (deleteRes.deleted === 0) {
			return { code: -1, msg: '产品不存在或删除失败' };
		}
		
		res.msg = '产品删除成功';
		
		return res;
	}
}

