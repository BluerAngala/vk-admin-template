module.exports = {
	/**
	 * 新增产品分类
	 * @url admin/product-category/sys/add
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能新增分类' };
		}

		let { value, label, icon, sort = 0, enable = true } = data;

		// 参数校验
		if (!value) {
			return { code: -1, msg: '请输入分类标识' };
		}
		if (!label) {
			return { code: -1, msg: '请输入分类名称' };
		}

		// 检查标识是否已存在
		const existing = await db.collection('vk-product-categories')
			.where({ value })
			.limit(1)
			.get();

		if (existing.data && existing.data.length > 0) {
			return { code: -1, msg: `分类标识 "${value}" 已存在` };
		}

		// 插入数据
		const insertRes = await db.collection('vk-product-categories').add({
			value,
			label,
			icon: icon || '',
			sort: Number(sort),
			enable: !!enable,
			_add_time: Date.now()
		});

		res.msg = '分类添加成功';
		res.data = { id: insertRes.id };

		return res;
	}
}
