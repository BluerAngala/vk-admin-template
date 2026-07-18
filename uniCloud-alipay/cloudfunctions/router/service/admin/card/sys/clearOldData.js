module.exports = {
	/**
	 * 清空旧卡密数据（数据库迁移前准备）
	 * @url admin/card/sys/clearOldData 前端调用的url参数地址
	 * ⚠️ 警告：此操作会删除所有卡密数据，请谨慎使用！
	 * data 请求参数 说明
	 * @param {String} confirm_code 确认码（必须输入 "CONFIRM_DELETE_ALL_CARDS" 才能执行）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };
		
		// 安全验证
		const { confirm_code } = data;
		
		if (confirm_code !== 'CONFIRM_DELETE_ALL_CARDS') {
			return { 
				code: -1, 
				msg: '请输入正确的确认码：CONFIRM_DELETE_ALL_CARDS' 
			};
		}
		
		// 必须是管理员才能执行
		if (!userInfo || userInfo.role !== 'admin') {
			return { 
				code: -1, 
				msg: '权限不足，只有管理员才能执行此操作' 
			};
		}
		
		try {
			// 1. 统计旧数据数量
			const countRes = await vk.baseDao.count({
				dbName: 'vk-card-key',
				whereJson: {}
			});
			
			console.log(`准备删除 ${countRes} 条卡密记录`);
			
			// 2. 删除所有卡密数据
			// 注意：uniCloud 数据库的删除操作需要分批进行
			const batchSize = 1000; // 每批删除1000条
			let deletedCount = 0;
			let hasMore = true;
			
			while (hasMore) {
				// 查询一批数据的ID
				const queryRes = await db.collection('vk-card-key')
					.limit(batchSize)
					.field({ _id: true })
					.get();
				
				if (!queryRes.data || queryRes.data.length === 0) {
					hasMore = false;
					break;
				}
				
				// 批量删除
				const ids = queryRes.data.map(item => item._id);
				const deleteRes = await db.collection('vk-card-key')
					.where({
						_id: db.command.in(ids)
					})
					.remove();
				
				deletedCount += deleteRes.deleted;
				console.log(`已删除 ${deletedCount} 条记录`);
				
				// 如果本批删除的数量小于批次大小，说明已经删完了
				if (queryRes.data.length < batchSize) {
					hasMore = false;
				}
			}
			
			res.msg = `成功清空旧卡密数据，共删除 ${deletedCount} 条记录`;
			res.data = {
				deleted_count: deletedCount,
				original_count: countRes
			};
			
			console.log(res.msg);
			
		} catch (error) {
			console.error('清空数据失败：', error);
			return {
				code: -1,
				msg: '清空数据失败：' + error.message,
				error: error
			};
		}
		
		return res;
	}
}

