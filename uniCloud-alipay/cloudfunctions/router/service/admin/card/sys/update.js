module.exports = {
	/**
	 * 更新卡密信息
	 * @url admin/card/sys/update 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} _id 						记录ID
	 * @param {String} card_type 			卡密类型
	 * @param {Number} valid_days 		有效天数
	 * @param {Number} expire_time 		过期时间
	 * @param {String} remark 				备注
	 * res 返回参数说明
	 * @param {Number} code						错误码，0表示成功
	 * @param {String} msg						详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------
		let {
			_id,
			card_type,
			valid_days,
			expire_time,
			remark
		} = data;
		
		if (!_id) {
			return { code: -1, msg: '_id不能为空' };
		}
		
		let dbName = "vk-card-key";
		
		// 构建更新数据
		let updateData = {};
		if (card_type !== undefined) updateData.card_type = card_type;
		if (valid_days !== undefined) updateData.valid_days = Number(valid_days);
		if (expire_time !== undefined) updateData.expire_time = expire_time || 0;
		if (remark !== undefined) updateData.remark = remark;
		
		// 执行更新
		res.num = await vk.baseDao.update({
			dbName,
			whereJson: { _id },
			dataJson: updateData
		});
		
		return res;
	}
}

