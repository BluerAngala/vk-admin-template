/**
 * 全量用户ID迁移（更新 uni-id-users._id + 所有关联表）
 * @url admin/card/sys/migrateUserId
 * 
 * @param {String} action       backup | preview | execute
 * @param {String} prefix       要加的前缀（可选）
 * @param {String} suffix       要加的后缀（可选）
 * @param {String} skip_prefix  跳过已包含此前缀的记录（可选）
 * @param {String} start_from   续接：从哪个 _id 开始（空=从头）
 * @param {Number} batch_size   本批次处理多少个用户（默认 50）
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { action, prefix, suffix, skip_prefix, start_from, batch_size } = data;
		prefix = (prefix || '').trim();
		suffix = (suffix || '').trim();
		skip_prefix = (skip_prefix || '').trim();
		batch_size = Math.min(Math.max(batch_size || 50, 1), 200);

		if (action !== 'backup' && !prefix && !suffix) {
			return { code: -1, msg: '请至少填写前缀或后缀' };
		}

		const shouldSkip = (id) => skip_prefix && id && id.startsWith(skip_prefix);
		const makeNewId = (oldId) => prefix + (oldId || '') + suffix;

		// 需要同步更新的关联表
		const REF_TABLES = [
			{ table: 'vk-card-key',         field: 'buy_user_id' },
			{ table: 'vk-user-points',      field: 'user_id' },
			{ table: 'vk-points-log',       field: 'user_id' },
			{ table: 'vk-blacklist',        field: 'user_id' },
			{ table: 'vk-invite-rebate-log', field: 'user_id' },
		];

		try {
			// ==================== 备份 ====================
			if (action === 'backup') {
				const pageSize = 1000;
				let lastId = '';
				let allUsers = [];

				while (true) {
					const q = lastId
						? db.collection('uni-id-users').where({ _id: _.gt(lastId) })
						: db.collection('uni-id-users');
					const batch = await q
						.field({ _id: true, username: true, nickname: true, mobile: true })
						.orderBy('_id', 'asc')
						.limit(pageSize)
						.get();

					if (!batch.data || batch.data.length === 0) break;
					allUsers = allUsers.concat(batch.data);
					lastId = batch.data[batch.data.length - 1]._id;
					if (batch.data.length < pageSize) break;
				}

				let refCounts = {};
				for (const ref of REF_TABLES) {
					const c = await db.collection(ref.table).count();
					refCounts[ref.table] = c.total || 0;
				}

				res.data = {
					total_users: allUsers.length,
					users: allUsers,
					ref_counts: refCounts,
					backup_time: Date.now(),
				};
				res.msg = `备份完成，共 ${allUsers.length} 个用户`;
				return res;
			}

			// ==================== 预览 ====================
			if (action === 'preview') {
				const countAll = await db.collection('uni-id-users').count();
				const totalCount = countAll.total || 0;

				const sample = await db.collection('uni-id-users')
					.field({ _id: true, username: true, nickname: true })
					.orderBy('_id', 'asc')
					.limit(100)
					.get();

				let alreadyCount = 0;
				let pendingSample = [];

				for (const u of (sample.data || [])) {
					if (shouldSkip(u._id)) {
						alreadyCount++;
					} else {
						if (pendingSample.length < 20) {
							pendingSample.push({
								_id: u._id,
								username: u.username || '-',
								nickname: u.nickname || '-',
								new_id: makeNewId(u._id),
							});
						}
					}
				}

				const sampleSize = sample.data ? sample.data.length : 0;
				const ratio = sampleSize > 0 ? alreadyCount / sampleSize : 0;
				const estimatedAlready = Math.round(totalCount * ratio);

				let refCounts = {};
				for (const ref of REF_TABLES) {
					const c = await db.collection(ref.table).count();
					refCounts[ref.table] = c.total || 0;
				}

				res.data = {
					total_users: totalCount,
					already: estimatedAlready,
					pending: totalCount - estimatedAlready,
					ref_counts: refCounts,
					preview: pendingSample,
				};
				res.msg = `共 ${totalCount} 个用户，约 ${estimatedAlready} 个将跳过，约 ${totalCount - estimatedAlready} 个待处理`;
				return res;
			}

			// ==================== 执行（分批续接） ====================
			if (action === 'execute') {
				// 读取一批用户
				let query = db.collection('uni-id-users')
					.field({ _id: true })
					.orderBy('_id', 'asc')
					.limit(batch_size);

				if (start_from) {
					query = db.collection('uni-id-users')
						.where({ _id: _.gt(start_from) })
						.field({ _id: true })
						.orderBy('_id', 'asc')
						.limit(batch_size);
				}

				const batch = await query.get();
				const users = batch.data || [];

				if (users.length === 0) {
					return {
						code: 0,
						msg: '全部迁移完成',
						data: { done: true, updated: 0, skipped: 0, total_processed: 0 },
					};
				}

				let updated = 0;
				let skipped = 0;
				let errors = [];
				let lastProcessedId = start_from || '';

				for (const user of users) {
					const oldId = user._id;

					if (shouldSkip(oldId)) {
						skipped++;
						lastProcessedId = oldId;
						continue;
					}

					const targetId = makeNewId(oldId);

					try {
						// 检查新 ID 是否已存在
						const exists = await db.collection('uni-id-users')
							.where({ _id: targetId })
							.count();
						if (exists.total > 0) {
							errors.push(`${oldId}: 目标ID已存在`);
							lastProcessedId = oldId;
							continue;
						}

						// 读取完整用户记录
						const userDoc = await db.collection('uni-id-users')
							.doc(oldId)
							.get();
						if (!userDoc.data) {
							errors.push(`${oldId}: 记录不存在`);
							lastProcessedId = oldId;
							continue;
						}

						// 创建新 ID 用户，清空 token 强制重新登录
						const newData = { ...userDoc.data, _id: targetId, token: [] };
						await db.collection('uni-id-users').add(newData);

						// 更新所有关联表
						for (const ref of REF_TABLES) {
							await db.collection(ref.table)
								.where({ [ref.field]: oldId })
								.update({ [ref.field]: targetId });
						}

						// 删除旧记录
						await db.collection('uni-id-users').doc(oldId).remove();

						updated++;
					} catch (err) {
						errors.push(`${oldId}: ${err.message}`);
					}

					lastProcessedId = oldId;
				}

				// 判断是否还有后续批次
				const hasMore = users.length >= batch_size;

				res.code = 0;
				res.data = {
					done: !hasMore,
					has_more: hasMore,
					last_id: lastProcessedId,
					batch_updated: updated,
					batch_skipped: skipped,
					batch_errors: errors,
				};

				if (hasMore) {
					res.msg = `本批次完成：更新 ${updated}，跳过 ${skipped}，还有后续批次`;
				} else {
					res.msg = `全部完成：最后批次更新 ${updated}，跳过 ${skipped}`;
				}

				if (errors.length > 0) {
					res.msg += `，${errors.length} 个失败`;
				}

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
