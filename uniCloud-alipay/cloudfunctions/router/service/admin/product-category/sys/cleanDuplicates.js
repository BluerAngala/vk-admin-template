module.exports = {
	/**
	 * 清理产品分类中的重复记录（保留每组第一条）
	 * @url admin/product-category/sys/cleanDuplicates
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;

		// 仅管理员可用
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能操作' };
		}

		// 查询所有分类
		const result = await db.collection('vk-product-categories')
			.orderBy('sort', 'asc')
			.get();

		const all = result.data || [];
		const seen = new Map(); // value -> 第一条记录的 _id
		const toDelete = [];

		for (const item of all) {
			if (seen.has(item.value)) {
				// 重复记录，标记删除
				toDelete.push(item._id);
			} else {
				seen.set(item.value, item._id);
			}
		}

		if (toDelete.length === 0) {
			return { code: 0, msg: '没有重复记录', data: { deleted: 0 } };
		}

		// 批量删除重复记录
		await db.collection('vk-product-categories')
			.where({
				_id: db.command.in(toDelete)
			})
			.remove();

		return {
			code: 0,
			msg: `已清理 ${toDelete.length} 条重复记录`,
			data: { deleted: toDelete.length }
		};
	}
}
