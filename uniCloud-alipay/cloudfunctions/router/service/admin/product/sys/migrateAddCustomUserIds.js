module.exports = {
	/**
	 * 迁移脚本：为已存在的产品添加 custom_user_ids 字段
	 * @url admin/product/sys/migrateAddCustomUserIds
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 检查是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能执行迁移脚本' };
		}
		
		try {
			// 查询所有没有 custom_user_ids 字段的产品
			const products = await db.collection('vk-products')
				.where({
					custom_user_ids: db.command.exists(false)
				})
				.get();
			
			if (!products.data || products.data.length === 0) {
				return { code: 0, msg: '所有产品已包含 custom_user_ids 字段，无需迁移' };
			}
			
			// 批量更新产品，添加 custom_user_ids 字段
			let updateCount = 0;
			for (const product of products.data) {
				await db.collection('vk-products')
					.doc(product._id)
					.update({
						custom_user_ids: []
					});
				updateCount++;
			}
			
			res.msg = `成功为 ${updateCount} 个产品添加 custom_user_ids 字段`;
			res.data = {
				count: updateCount
			};
			
		} catch (err) {
			console.error('迁移失败：', err);
			return { code: -1, msg: '迁移失败：' + err.message };
		}
		
		return res;
	}
}

