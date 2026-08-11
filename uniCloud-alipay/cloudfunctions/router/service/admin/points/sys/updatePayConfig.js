'use strict';
module.exports = {
	/**
	 * 更新支付接口配置（管理端，多店铺）
	 * @url admin/points/sys/updatePayConfig 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Array}  stores          店铺列表，每个店铺含 store_id/name/base_url/channel_id/query_password/merchant_user/merchant_pass/goods_key_map
	 * @param {String} active_store_id 当前启用店铺的 store_id
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk } = util;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------

		const pointsPayConfig = vk.require('service/admin/points/util/pointsPayConfig');

		const container = {
			stores: data.stores,
			active_store_id: data.active_store_id
		};

		// 校验
		const validateResult = pointsPayConfig.validateConfig(container);
		if (!validateResult.valid) {
			return { code: -1, msg: validateResult.error };
		}

		// 保存（内部会归一化为多店铺结构）
		await pointsPayConfig.saveConfig(util, container);

		res.msg = '配置保存成功';

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
};
