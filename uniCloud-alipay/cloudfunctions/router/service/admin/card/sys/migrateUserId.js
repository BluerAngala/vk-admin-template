/**
 * 批量迁移用户ID（给所有 buy_user_id 加前缀/后缀，自动跳过已迁移的）
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

		// 只有 preview 和 execute 才需要前后缀
		if (action !== 'backup' && !prefix && !suffix) {
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
				// 统计已迁移和未迁移的数量
				const countAll = await db.collection('vk-card-key').count();
				const totalCount = countAll.total || 0;

				// 统计已包含前缀的记录数
				let alreadyCount = 0;
				if (prefix) {
					const c1 = await db.collection('vk-card-key')
						.where({ buy_user_id: db.RegExp({ regexp: `^${escapeRegExp(prefix)}`, options: '' }) })
						.count();
					alreadyCount = c1.total || 0;
				}

				const pendingCount = totalCount - alreadyCount;

				// 取未迁移的前 20 条做预览
				let sampleQuery = db.collection('vk-card-key')
					.field({ _id: true, card_code: true, buy_user_id: true })
					.orderBy('_id', 'asc');

				if (prefix) {
					// 取不以 prefix 开头的记录
					// uniCloud 不支持 $not 正则，用分页跳过已迁移的
					// 简化：取前 100 条，在 JS 层过滤
					const all = await sampleQuery.limit(100).get();
					const filtered = (all.data || [])
						.filter(r => !(r.buy_user_id && r.buy_user_id.startsWith(prefix)))
						.slice(0, 20);

					const preview = filtered.map(r => ({
						_id: r._id,
						old_user_id: r.buy_user_id || '(空)',
						new_user_id: prefix + (r.buy_user_id || '') + suffix,
						already: false,
					}));

					res.data = { total: totalCount, already: alreadyCount, pending: pendingCount, preview };
				} else {
					const sample = await sampleQuery.limit(20).get();
					const preview = (sample.data || []).map(r => ({
						_id: r._id,
						old_user_id: r.buy_user_id || '(空)',
						new_user_id: (prefix || '') + (r.buy_user_id || '') + suffix,
						already: false,
					}));
					res.data = { total: totalCount, already: alreadyCount, pending: pendingCount, preview };
				}

				res.msg = `共 ${totalCount} 条，已迁移 ${alreadyCount} 条，待处理 ${pendingCount} 条`;
				return res;
			}

			// ==================== 执行 ====================
			if (action === 'execute') {
				// 获取所有不同的 buy_user_id 值
				const groupRes = await db.collection('vk-card-key')
					.groupBy('buy_user_id')
					.groupField('buy_user_id')
					.get();

				const uniqueIds = (groupRes.data || [])
					.map(r => r.buy_user_id)
					.filter(Boolean);

				const hasEmpty = (groupRes.data || []).some(r => !r.buy_user_id);

				let updated = 0;
				let skipped = 0;

				// 按 buy_user_id 分组批量更新，自动跳过已有前缀的
				for (const oldId of uniqueIds) {
					// 跳过已经包含前缀的记录
					if (prefix && oldId.startsWith(prefix)) {
						skipped++;
						continue;
					}
					const newId = prefix + oldId + suffix;
					const updateRes = await db.collection('vk-card-key')
						.where({ buy_user_id: oldId })
						.update({ buy_user_id: newId });
					updated += updateRes.updated || 0;
				}

				// 处理 buy_user_id 为空的记录
				if (hasEmpty) {
					const newId = prefix + suffix;
					const updateRes = await db.collection('vk-card-key')
						.where({ buy_user_id: _.in([null, '', undefined]) })
						.update({ buy_user_id: newId });
					updated += updateRes.updated || 0;
				}

				res.msg = `迁移完成，更新 ${updated} 条，跳过 ${skipped} 组已迁移记录`;
				res.data = { updated, skipped, groups: uniqueIds.length, prefix, suffix };
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

// 转义正则特殊字符
function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
