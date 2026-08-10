/**
 * 批量迁移用户ID（给所有 buy_user_id 加前缀/后缀）
 * @url admin/card/sys/migrateUserId
 * 
 * @param {String} action    backup | preview | execute
 * @param {String} prefix    要加的前缀（可选）
 * @param {String} suffix    要加的后缀（可选）
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { action, prefix, suffix } = data;
		prefix = (prefix || '').trim();
		suffix = (suffix || '').trim();

		if (!prefix && !suffix) {
			return { code: -1, msg: '请至少填写前缀或后缀' };
		}

		try {
			// ==================== 备份 ====================
			if (action === 'backup') {
				const batchSize = 1000;
				let offset = 0;
				let allRecords = [];

				while (true) {
					const batch = await db.collection('vk-card-key')
						.field({ _id: true, card_code: true, buy_user_id: true })
						.skip(offset)
						.limit(batchSize)
						.get();

					if (!batch.data || batch.data.length === 0) break;
					allRecords = allRecords.concat(batch.data);
					offset += batchSize;
					if (batch.data.length < batchSize) break;
				}

				res.data = {
					total: allRecords.length,
					records: allRecords,
					backup_time: Date.now(),
				};
				res.msg = `备份完成，共 ${allRecords.length} 条记录`;
				return res;
			}

			// ==================== 预览 ====================
			if (action === 'preview') {
				// 取前 20 条做预览
				const sample = await db.collection('vk-card-key')
					.field({ _id: true, card_code: true, buy_user_id: true })
					.limit(20)
					.get();

				const preview = (sample.data || []).map(r => ({
					_id: r._id,
					old_user_id: r.buy_user_id || '(空)',
					new_user_id: (prefix || '') + (r.buy_user_id || '') + (suffix || ''),
				}));

				// 总数
				const countRes = await db.collection('vk-card-key').count();
				const total = countRes.total || 0;

				res.data = { total, preview };
				res.msg = `预览完成，共 ${total} 条记录，以下是前 ${preview.length} 条示例`;
				return res;
			}

			// ==================== 执行 ====================
			if (action === 'execute') {
				// 分批读取 + 更新（uniCloud 单次 update 无 where 条件限制，但建议分批）
				const batchSize = 500;
				let offset = 0;
				let updated = 0;

				while (true) {
					const batch = await db.collection('vk-card-key')
						.field({ _id: true, buy_user_id: true })
						.skip(offset)
						.limit(batchSize)
						.get();

					if (!batch.data || batch.data.length === 0) break;

					// 逐条更新（因为每条的旧 ID 不同，新 ID 也不同）
					for (const record of batch.data) {
						const oldId = record.buy_user_id || '';
						const newId = prefix + oldId + suffix;
						await db.collection('vk-card-key')
							.doc(record._id)
							.update({ buy_user_id: newId });
						updated++;
					}

					offset += batchSize;
					if (batch.data.length < batchSize) break;
				}

				res.msg = `迁移完成，共更新 ${updated} 条记录`;
				res.data = { updated, prefix, suffix };
				return res;
			}

			return { code: -1, msg: '未知操作，请指定 action: backup / preview / execute' };

		} catch (err) {
			res.code = -1;
			res.msg = '操作失败：' + err.message;
		}

		return res;
	}
};
