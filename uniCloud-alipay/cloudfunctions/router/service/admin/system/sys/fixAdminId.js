/**
 * 修复管理员用户ID（紧急用）
 * @url admin/system/sys/fixAdminId
 * 
 * 将当前被迁移改名的管理员记录恢复为原始ID "001"
 * 操作：读取当前管理员 → 创建 ID=001 的记录 → 更新关联表 → 删除旧记录
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { db, _ } = util;
		let res = { code: 0, msg: '' };

		const OLD_ID = '001';
		// 查找当前包含 "001" 的管理员用户（迁移后可能变成 "new-001" 等）
		// 先尝试精确查找 ID=001 是否还存在
		let currentUser = null;
		let currentId = '';

		try {
			// 1. 先查 001 是否还在
			const check001 = await db.collection('uni-id-users')
				.where({ _id: OLD_ID })
				.get();

			if (check001.data && check001.data.length > 0) {
				return { code: 0, msg: '管理员 ID 已经是 001，无需修复' };
			}

			// 2. 查找管理员角色的用户
			const adminUsers = await db.collection('uni-id-users')
				.where({ role: _.in(['admin']) })
				.get();

			if (!adminUsers.data || adminUsers.data.length === 0) {
				return { code: -1, msg: '未找到管理员用户，请手动检查数据库' };
			}

			// 取第一个管理员
			currentUser = adminUsers.data[0];
			currentId = currentUser._id;

			if (currentId === OLD_ID) {
				return { code: 0, msg: '管理员 ID 已经是 001，无需修复' };
			}

			// 3. 创建 ID=001 的新记录
			const newData = { ...currentUser, _id: OLD_ID, token: [] };
			await db.collection('uni-id-users').add(newData);

			// 4. 更新关联表
			const REF_TABLES = [
				{ table: 'vk-card-key',          field: 'buy_user_id' },
				{ table: 'vk-user-points',       field: 'user_id' },
				{ table: 'vk-blacklist',         field: 'user_id' },
				{ table: 'vk-invite-rebate-log', field: 'user_id' },
			];

			for (const ref of REF_TABLES) {
				try {
					await db.collection(ref.table)
						.where({ [ref.field]: currentId })
						.update({ [ref.field]: OLD_ID });
				} catch (e) {
					console.log(`更新 ${ref.table} 跳过:`, e.message);
				}
			}

			// 5. 删除旧记录
			await db.collection('uni-id-users').doc(currentId).remove();

			res.msg = `管理员已修复：${currentId} → ${OLD_ID}，请重新登录`;
			res.data = { old_id: currentId, new_id: OLD_ID };

		} catch (err) {
			res.code = -1;
			res.msg = '修复失败：' + err.message;
			console.error('fixAdminId error:', err);
		}

		return res;
	}
};
