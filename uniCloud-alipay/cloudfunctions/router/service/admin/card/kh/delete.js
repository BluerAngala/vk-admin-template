module.exports = {
	/**
	 * 删除当前用户的卡密
	 * @url admin/card/kh/delete 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} _id 卡密ID
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, originalParam } = event;
		let { uniID, config, pubFun, vk, db, _ } = util;
		let { _id } = data;
		let res = { code: 0, msg: '' };
		
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
			console.log('查询卡密，ID:', _id, '类型:', typeof _id);
			
			// 先检查这个卡密是否属于当前用户
			let cardInfo = await vk.baseDao.findById({
				dbName,
				id: _id
			});
			
			console.log('查询到的卡密信息:', cardInfo ? '存在' : '不存在');
			
			if (!cardInfo) {
				return { code: -1, msg: '卡密不存在' };
			}
			
			console.log('卡密buy_user_id:', cardInfo.buy_user_id, '当前user_id:', user_id);
			
			// 如果卡密有 buy_user_id，则验证是否属于当前用户
			// 如果没有 buy_user_id（旧数据），则允许删除
			if (cardInfo.buy_user_id && cardInfo.buy_user_id !== user_id) {
				return { code: -1, msg: '无权删除此卡密' };
			}
			
		// 删除卡密 - 直接使用数据库 API 绕过权限控制
		console.log('准备删除卡密，ID:', _id);
		
		// 直接使用 db.collection().doc().remove() 删除
		let delRes = await db.collection(dbName).doc(_id).remove();
		
		console.log('删除结果:', JSON.stringify(delRes));
		
		// uniCloud 数据库的 remove() 返回 { deleted: 删除数量 }
		if (delRes && delRes.deleted > 0) {
			return { code: 0, msg: '删除成功' };
		} else {
			console.error('删除失败，返回值:', delRes);
			return { 
				code: -1, 
				msg: '删除失败：未能删除记录'
			};
		}
		} catch (error) {
			console.error('删除卡密失败：', error);
			return { 
				code: -1, 
				msg: '删除失败：' + (error.message || '未知错误')
			};
		}
	}
};

