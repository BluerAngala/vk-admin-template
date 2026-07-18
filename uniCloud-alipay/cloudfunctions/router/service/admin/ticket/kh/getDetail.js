module.exports = {
	/**
	 * 获取工单详情
	 * @url admin/ticket/kh/getDetail
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { ticketId } = data;
		if (!ticketId) {
			return { code: -1, msg: '工单ID不能为空' };
		}

		// 获取工单详情
		let ticket = await vk.baseDao.findById({
			dbName: "vk-tickets",
			id: ticketId
		});

		if (!ticket) {
			return { code: -1, msg: '工单不存在' };
		}

		// 权限检查：只能查看自己的工单
		if (ticket.user_id !== userInfo._id) {
			return { code: -1, msg: '无权查看此工单' };
		}

		// 获取回复列表
		let replies = await vk.baseDao.select({
			dbName: "vk-ticket-replies",
			whereJson: {
				ticket_id: ticketId
			},
			sortArr: [{ name: "_add_time", type: "asc" }],
			getMain: true
		});

		replies = Array.isArray(replies) ? replies : [];

		let hasFirst = replies.some(r => r.is_first);
		if (!hasFirst) {
			replies.unshift({
				ticket_id: ticketId,
				content: ticket.content,
				user_id: ticket.user_id,
				user_name: ticket.user_name,
				is_admin: false,
				is_first: true,
				title: ticket.title,
				type: ticket.type,
				priority: ticket.priority,
				_add_time: ticket._add_time
			});
		}

		res.data = {
			ticket,
			replies
		};

		return res;
	}
}
