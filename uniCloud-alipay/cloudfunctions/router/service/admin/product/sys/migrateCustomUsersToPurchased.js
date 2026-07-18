module.exports = {
	/**
	 * 迁移脚本：将 custom_user_ids 中的用户ID迁移到 purchased_user_ids
	 * @url admin/product/sys/migrateCustomUsersToPurchased
	 * 
	 * 说明：
	 * - 将 custom_user_ids 中除了 'all' 之外的用户ID迁移到 purchased_user_ids
	 * - 从 custom_user_ids 中移除这些用户ID，只保留 'all'（如果有的话）
	 * - 如果 custom_user_ids 只包含 'all'，则保持不变
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
			// 查询所有产品
			const products = await db.collection('vk-products')
				.get();
			
			if (!products.data || products.data.length === 0) {
				return { code: 0, msg: '没有找到产品数据' };
			}
			
			let migratedCount = 0; // 迁移的产品数量
			let totalUsersMigrated = 0; // 迁移的用户总数
			
			// 遍历每个产品进行迁移
			for (const product of products.data) {
				const customUserIds = product.custom_user_ids || [];
				const purchasedUserIds = product.purchased_user_ids || [];
				
				// 找出 custom_user_ids 中除了 'all' 之外的用户ID
				const userIdsToMigrate = customUserIds.filter(id => id !== 'all');
				
				// 如果没有需要迁移的用户ID，跳过
				if (userIdsToMigrate.length === 0) {
					continue;
				}
				
				// 合并到 purchased_user_ids（去重）
				const newPurchasedUserIds = [...new Set([...purchasedUserIds, ...userIdsToMigrate])];
				
				// 更新 custom_user_ids，只保留 'all'（如果有的话）
				const newCustomUserIds = customUserIds.includes('all') ? ['all'] : [];
				
				// 更新产品
				await db.collection('vk-products')
					.doc(product._id)
					.update({
						custom_user_ids: newCustomUserIds,
						purchased_user_ids: newPurchasedUserIds
					});
				
				migratedCount++;
				totalUsersMigrated += userIdsToMigrate.length;
			}
			
			res.msg = `迁移完成：共处理 ${products.data.length} 个产品，${migratedCount} 个产品进行了迁移，共迁移 ${totalUsersMigrated} 个用户到已购买列表`;
			res.data = {
				totalProducts: products.data.length,
				migratedProducts: migratedCount,
				totalUsersMigrated: totalUsersMigrated
			};
			
		} catch (err) {
			console.error('迁移失败：', err);
			return { code: -1, msg: '迁移失败：' + err.message };
		}
		
		return res;
	}
}

