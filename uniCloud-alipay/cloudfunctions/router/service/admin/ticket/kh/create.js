module.exports = {
	/**
	 * 创建工单
	 * @url admin/ticket/kh/create
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { title, content, type = 'question', priority = 'normal' } = data;

		// 参数校验
		if (!title || !title.trim()) {
			return { code: -1, msg: '请输入工单标题' };
		}
		if (!content || !content.trim()) {
			return { code: -1, msg: '请输入工单内容' };
		}
		if (title.length > 100) {
			return { code: -1, msg: '标题不能超过100字' };
		}
		if (content.length > 5000) {
			return { code: -1, msg: '内容不能超过5000字' };
		}

		// 创建工单
		let ticketData = {
			title: title.trim(),
			content: content.trim(),
			type,
			priority,
			status: 'pending',
			user_id: userInfo._id,
			user_name: userInfo.nickname || userInfo.username || '未知用户',
			reply_count: 1,
			last_reply_time: Date.now(),
			last_reply_content: content.trim()
		};

		let addRes = await vk.baseDao.add({
			dbName: "vk-tickets",
			dataJson: ticketData
		});

		let ticketId = addRes.id || addRes;

		await vk.baseDao.add({
			dbName: "vk-ticket-replies",
			dataJson: {
				ticket_id: ticketId,
				content: content.trim(),
				user_id: userInfo._id,
				user_name: userInfo.nickname || userInfo.username || '未知用户',
				is_admin: false,
				is_first: true,
				title: title.trim(),
				type,
				priority
			}
		});

		res.msg = '工单提交成功';
		return res;
	}
}
