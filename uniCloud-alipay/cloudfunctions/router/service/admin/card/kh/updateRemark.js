module.exports = {
	/**
	 * 更新卡密备注
	 * @url admin/card/kh/updateRemark 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} _id 卡密ID
	 * @param {String} remark 备注内容
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let { _id, remark } = data;
		
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
			
			// 更新备注
			await db.collection(dbName).doc(_id).update({
				remark: remark || ''
			});
			
			return { code: 0, msg: '备注更新成功' };
		} catch (error) {
			console.error('更新备注失败：', error);
			return { 
				code: -1, 
				msg: '更新失败：' + (error.message || '未知错误')
			};
		}
	}
};

