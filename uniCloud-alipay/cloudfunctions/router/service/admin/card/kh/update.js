module.exports = {
	/**
	 * 更新卡密信息
	 * @url admin/card/kh/update 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} _id 卡密ID
	 * @param {String} card_code 卡密代码（可选）
	 * @param {String} remark 备注（可选）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let { _id, card_code, remark } = data;
		
		// 业务逻辑开始-----------------------------------------------------------
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		if (!_id) {
			return { code: -1, msg: '缺少必要参数_id' };
		}
		
		let dbName = "vk-card-key";
		
		try {
			// 先检查这个卡密是否属于当前用户
			let cardInfo = await vk.baseDao.findById({
				dbName,
				id: _id
			});
			
			if (!cardInfo) {
				return { code: -1, msg: '卡密不存在' };
			}
			
			// 如果卡密有 buy_user_id，则验证是否属于当前用户
			if (cardInfo.buy_user_id && cardInfo.buy_user_id !== user_id) {
				return { code: -1, msg: '无权修改此卡密' };
			}
			
			// 构建更新数据
			let updateData = {};
			if (card_code !== undefined) {
				updateData.card_code = card_code;
			}
			if (remark !== undefined) {
				updateData.remark = remark;
			}
			
			// 如果没有要更新的字段，直接返回
			if (Object.keys(updateData).length === 0) {
				return { code: -1, msg: '没有要更新的字段' };
			}
			
			// 更新卡密
			await db.collection(dbName).doc(_id).update(updateData);
			
			return { code: 0, msg: '更新成功' };
		} catch (error) {
			console.error('更新卡密失败：', error);
			return { 
				code: -1, 
				msg: '更新失败：' + (error.message || '未知错误')
			};
		}
	}
};

