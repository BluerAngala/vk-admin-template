module.exports = {
	/**
	 * 用户回复工单
	 * @url admin/ticket/kh/reply
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { ticketId, content, attachments } = data;
		if (!ticketId) {
			return { code: -1, msg: '工单ID不能为空' };
		}
		if (!content || !content.trim()) {
			if (!attachments || attachments.length === 0) {
				return { code: -1, msg: '请输入回复内容或添加附件' };
			}
		}
		if (content && content.length > 2000) {
			return { code: -1, msg: '回复内容不能超过2000字' };
		}

		let addData = {
			ticket_id: ticketId,
			content: (content || '').trim(),
			user_id: userInfo._id,
			user_name: userInfo.nickname || userInfo.username || '未知用户',
			is_admin: false
		};
		if (attachments && Array.isArray(attachments) && attachments.length > 0) {
			addData.attachments = attachments.slice(0, 9);
		}

		// 检查工单是否存在且属于当前用户
		let ticket = await vk.baseDao.findById({
			dbName: "vk-tickets",
			id: ticketId
		});

		if (!ticket) {
			return { code: -1, msg: '工单不存在' };
		}
		if (ticket.user_id !== userInfo._id) {
			return { code: -1, msg: '无权回复此工单' };
		}
		if (ticket.status === 'closed') {
			return { code: -1, msg: '工单已关闭，无法回复' };
		}

		// 添加回复
		await vk.baseDao.add({
			dbName: "vk-ticket-replies",
			dataJson: addData
		});

		// 更新工单最后回复信息
		await vk.baseDao.updateById({
			dbName: "vk-tickets",
			id: ticketId,
			dataJson: {
				reply_count: _.inc(1),
				last_reply_time: Date.now(),
				last_reply_content: content.trim(),
				_update_time: Date.now()
			}
		});

		res.msg = '回复成功';
		return res;
	}
}
