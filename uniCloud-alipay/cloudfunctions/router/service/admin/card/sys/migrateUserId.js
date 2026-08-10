/**
 * 批量迁移用户ID（给所有 buy_user_id 加前缀/后缀）
 * @url admin/card/sys/migrateUserId
 * 
 * @param {String} action       backup | preview | execute
 * @param {String} prefix       要加的前缀（可选）
 * @param {String} suffix       要加的后缀（可选）
 * @param {String} skip_prefix  跳过已包含此前缀的记录（可选）
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { action, prefix, suffix, skip_prefix } = data;
		prefix = (prefix || '').trim();
		suffix = (suffix || '').trim();
		skip_prefix = (skip_prefix || '').trim();

		// 只有 preview 和 execute 才需要前后缀
		if (action !== 'backup' && !prefix && !suffix) {
			return { code: -1, msg: '请至少填写前缀或后缀' };
		}

		// 判断是否需要跳过
		const shouldSkip = (id) => skip_prefix && id && id.startsWith(skip_prefix);

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
				const countAll = await db.collection('vk-card-key').count();
				const totalCount = countAll.total || 0;

				// 取前 200 条在 JS 层过滤做预览
				const all = await db.collection('vk-card-key')
					.field({ _id: true, buy_user_id: true })
					.orderBy('_id', 'asc')
					.limit(200)
					.get();

				let alreadyCount = 0;
				let pendingSample = [];

				for (const r of (all.data || [])) {
					if (shouldSkip(r.buy_user_id)) {
						alreadyCount++;
					} else {
						if (pendingSample.length < 20) {
							pendingSample.push({
								_id: r._id,
								old_user_id: r.buy_user_id || '(空)',
								new_user_id: prefix + (r.buy_user_id || '') + suffix,
							});
						}
					}
				}

				// 粗估：从前 200 条的比例推算总数
				const ratio = all.data && all.data.length > 0 ? alreadyCount / all.data.length : 0;
				const estimatedAlready = Math.round(totalCount * ratio);
				const estimatedPending = totalCount - estimatedAlready;

				res.data = {
					total: totalCount,
					already: estimatedAlready,
					pending: estimatedPending,
					sample_size: all.data ? all.data.length : 0,
					preview: pendingSample,
				};
				res.msg = `共 ${totalCount} 条，约 ${estimatedAlready} 条将跳过，约 ${estimatedPending} 条待处理`;
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

				for (const oldId of uniqueIds) {
					// 跳过已有 skip_prefix 的记录
					if (shouldSkip(oldId)) {
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
				if (hasEmpty && !shouldSkip('')) {
					const newId = prefix + suffix;
					const updateRes = await db.collection('vk-card-key')
						.where({ buy_user_id: _.in([null, '', undefined]) })
						.update({ buy_user_id: newId });
					updated += updateRes.updated || 0;
				}

				res.msg = `迁移完成，更新 ${updated} 条，跳过 ${skipped} 组`;
				res.data = { updated, skipped, groups: uniqueIds.length, prefix, suffix, skip_prefix };
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
