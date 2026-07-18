module.exports = {
	/**
	 * 批量删除卡密
	 * @url admin/card/sys/batchDelete 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Array} ids 			记录ID数组
	 * res 返回参数说明
	 * @param {Number} code 		错误码，0表示成功
	 * @param {String} msg 			详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------
		let { ids } = data;
		
		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return { code: -1, msg: 'ids不能为空' };
		}
		
		let dbName = "vk-card-key";
		
		// 批量删除
		res.num = await vk.baseDao.delete({
			dbName,
			whereJson: {
				_id: _.in(ids)
			}
		});
		
		res.msg = `成功删除 ${res.num} 条记录`;
		
		return res;
	}
}

