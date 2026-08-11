'use strict';
module.exports = {
	/**
	 * 获取支付接口配置（客户端安全版，不含商户凭证）
	 * @url admin/points/kh/getPayConfig 前端调用的url参数地址
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Object} data { base_url, channel_id, query_password, goods_key_map }
	 */
	main: async (event) => {
		let { util } = event;
		let { vk } = util;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------

		const pointsPayConfig = vk.require('service/admin/points/util/pointsPayConfig');
		res.data = await pointsPayConfig.getClientConfig(util);

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
};
