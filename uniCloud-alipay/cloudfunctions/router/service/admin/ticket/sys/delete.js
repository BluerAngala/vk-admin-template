'use strict';
module.exports = {
	async _before() {
		// 通用预处理器
	},
	/**
	 * 删除工单
	 * @param {Object} data 请求参数
	 * @param {String} data.ticketId 工单ID
	 */
	async main(event) {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };

		// 参数校验
		let ticketId = data.ticketId;
		if (!ticketId) {
			return { code: -1, msg: '工单ID不能为空' };
		}

		// 删除工单关联的回复
		await vk.baseDao.del({
			dbName: "vk-ticket-replies",
			whereJson: {
				ticket_id: ticketId
			}
		});

		// 删除工单
		await vk.baseDao.del({
			dbName: "vk-tickets",
			whereJson: {
				_id: ticketId
			}
		});

		res.msg = '删除成功';
		return res;
	}
};
