module.exports = {
	/**
	 * 根据ID获取产品详情
	 * @url admin/product/sys/findById
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		let { _id } = data;
		
		// 参数校验
		if (!_id) {
			return { code: -1, msg: '请提供产品ID' };
		}
		
		// 查询产品信息
		const productRes = await db.collection('vk-products')
			.doc(_id)
			.get();
		
		if (!productRes.data || productRes.data.length === 0) {
			return { code: -1, msg: '产品不存在' };
		}
		
		res.data = productRes.data[0];
		res.msg = '获取成功';
		
		return res;
	}
}

