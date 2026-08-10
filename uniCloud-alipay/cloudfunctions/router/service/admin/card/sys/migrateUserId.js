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
				let lastId = '';
				let allRecords = [];

				while (true) {
					const q = lastId
						? db.collection('vk-card-key').where({ _id: _.gt(lastId) })
						: db.collection('vk-card-key');
					const batch = await q
						.field({ _id: true, card_code: true, buy_user_id: true })
						.orderBy('_id', 'asc')
						.limit(batchSize)
						.get();

					if (!batch.data || batch.data.length === 0) break;
					allRecords = allRecords.concat(batch.data);
					lastId = batch.data[batch.data.length - 1]._id;
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
					.orderBy('_id', 'asc')
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
				// 1. 先获取所有不同的 buy_user_id 值
				// uniCloud group 没有 limit，但不同用户ID数量通常不多
				const groupRes = await db.collection('vk-card-key')
					.groupBy('buy_user_id')
					.groupField('buy_user_id')
					.get();

				const uniqueIds = (groupRes.data || [])
					.map(r => r.buy_user_id)
					.filter(Boolean); // 过滤掉 null/undefined/空

				// 也处理 buy_user_id 为空的记录
				const hasEmpty = (groupRes.data || []).some(r => !r.buy_user_id);

				let updated = 0;

				// 2. 按 buy_user_id 分组批量更新（每组一次 where().update() 调用）
				for (const oldId of uniqueIds) {
					const newId = prefix + oldId + suffix;
					const updateRes = await db.collection('vk-card-key')
						.where({ buy_user_id: oldId })
						.update({ buy_user_id: newId });
					updated += updateRes.updated || 0;
				}

				// 3. 处理 buy_user_id 为空的记录
				if (hasEmpty) {
					const newId = prefix + suffix;
					const updateRes = await db.collection('vk-card-key')
						.where({ buy_user_id: _.in([null, '', undefined]) })
						.update({ buy_user_id: newId });
					updated += updateRes.updated || 0;
				}

				res.msg = `迁移完成，共更新 ${updated} 条记录（${uniqueIds.length + (hasEmpty ? 1 : 0)} 组）`;
				res.data = { updated, groups: uniqueIds.length, prefix, suffix };
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
