module.exports = {
	/**
	 * 管理员更新工单状态
	 * @url admin/ticket/sys/updateStatus
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };

		let { ticketId, status, assigneeId, assigneeName } = data;
		if (!ticketId) {
			return { code: -1, msg: '工单ID不能为空' };
		}
		if (!status) {
			return { code: -1, msg: '状态不能为空' };
		}

		let updateData = {
			status,
			_update_time: Date.now()
		};

		if (assigneeId) {
			updateData.assignee_id = assigneeId;
			updateData.assignee_name = assigneeName || '';
		}

		await vk.baseDao.updateById({
			dbName: "vk-tickets",
			id: ticketId,
			dataJson: updateData
		});

		res.msg = '状态更新成功';
		return res;
	}
}
