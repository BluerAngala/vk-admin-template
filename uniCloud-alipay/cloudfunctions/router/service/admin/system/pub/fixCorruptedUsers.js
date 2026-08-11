/**
 * 修复损坏的用户数据（嵌套 "0" key 问题）- 免登录版 v2
 * @url admin/system/pub/fixCorruptedUsers
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { db, _ } = util;
		let res = { code: 0, msg: '' };

		let { action } = data;

		// 从任意嵌套层级提取真实用户对象
		const extractUser = (r) => {
			let u = r['0'];
			while (u && typeof u === 'object' && !u.username && u['0'] && typeof u['0'] === 'object') {
				u = u['0'];
			}
			return (u && u.username) ? u : null;
		};

		try {
			if (action === 'preview') {
				const all = await db.collection('uni-id-users').get();
				let corrupted = [];
				let normal = [];

				for (const r of (all.data || [])) {
					const u = extractUser(r);
					if (u) {
						corrupted.push({ _id: r._id, real_id: u._id, username: u.username });
					} else if (r.username) {
						normal.push({ _id: r._id, username: r.username });
					}
				}

				res.data = { corrupted, normal, corrupted_count: corrupted.length, normal_count: normal.length };
				res.msg = `损坏 ${corrupted.length} 个，正常 ${normal.length} 个`;
				return res;
			}

			if (action === 'fix') {
				const all = await db.collection('uni-id-users').get();
				let fixed = 0;
				let skipped = 0;
				let errors = [];

				for (const r of (all.data || [])) {
					const u = extractUser(r);
					if (!u) continue;

					const realId = u._id || r._id;

					try {
						if (r._id === realId) {
							// ===== 情况1：顶层 _id 已是真实 ID → 就地展平 =====
							// 把嵌套里的字段全部提到顶层，并删除 "0" 字段
							const newData = { ...u };
							delete newData._id;   // _id 不能出现在 update 里
							delete newData['0'];
							newData['0'] = _.remove();  // 删除顶层残留的 "0" 字段
							await db.collection('uni-id-users').doc(r._id).update(newData);
							fixed++;
						} else {
							// ===== 情况2：顶层 _id 是 ID 前缀的残留 → 重建 + 删除 =====
							const exists = await db.collection('uni-id-users')
								.where({ _id: realId })
								.count();
							if (exists.total > 0) {
								// 真实 ID 已有记录，只删残留
								await db.collection('uni-id-users').doc(r._id).remove();
								skipped++;
							} else {
								// 创建正常记录（保留原 token）
								await db.collection('uni-id-users').add({ ...u, _id: realId });
								await db.collection('uni-id-users').doc(r._id).remove();
								fixed++;
							}
						}
					} catch (err) {
						errors.push(`${r._id}: ${err.message}`);
					}
				}

				res.msg = `修复完成：${fixed} 个，跳过 ${skipped} 个`;
				if (errors.length > 0) {
					res.msg += `，${errors.length} 个失败`;
				}
				res.data = { fixed, skipped, errors };
				return res;
			}

			return { code: -1, msg: '请指定 action: preview 或 fix' };

		} catch (err) {
			res.code = -1;
			res.msg = '操作失败：' + err.message;
		}

		return res;
	}
};
