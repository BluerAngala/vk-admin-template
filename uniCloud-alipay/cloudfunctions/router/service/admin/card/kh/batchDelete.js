module.exports = {
	/**
	 * 批量删除当前用户的卡密
	 * @url admin/card/kh/batchDelete 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Array} ids 卡密ID数组
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, originalParam } = event;
		let { uniID, config, pubFun, vk, db, _ } = util;
		let { ids } = data;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return { code: -1, msg: '请选择要删除的卡密' };
		}
		
		let dbName = "vk-card-key";
		
		try {
			// 先查询所有要删除的卡密
			const $ = db.command;
			const cardsRes = await db.collection(dbName)
				.where({
					_id: $.in(ids)
				})
				.get();
			
			if (!cardsRes.data || cardsRes.data.length === 0) {
				return { code: -1, msg: '未找到要删除的卡密' };
			}
			
			// 过滤出可以删除的卡密（属于当前用户或没有 buy_user_id 的旧数据）
			const canDeleteIds = cardsRes.data
				.filter(card => !card.buy_user_id || card.buy_user_id === user_id)
				.map(card => card._id);
			
			if (canDeleteIds.length === 0) {
				return { code: -1, msg: '没有可删除的卡密（所选卡密都不属于您）' };
			}
			
		// 删除可以删除的卡密 - 直接使用数据库 API
		let delRes = await db.collection(dbName)
			.where({
				_id: $.in(canDeleteIds)
			})
			.remove();
		
		console.log('批量删除结果:', JSON.stringify(delRes));
		
		// uniCloud 数据库的 remove() 返回 { deleted: 删除数量 }
		const actualDeletedCount = delRes?.deleted || 0;
		const totalCount = ids.length;
		
		if (actualDeletedCount > 0) {
			let msg;
			if (actualDeletedCount < totalCount) {
				msg = `成功删除 ${actualDeletedCount} 条卡密，${totalCount - actualDeletedCount} 条无权删除或不存在`;
			} else {
				msg = `成功删除 ${actualDeletedCount} 条卡密`;
			}
			return { code: 0, msg };
		} else {
			return { 
				code: -1, 
				msg: '删除失败：没有记录被删除'
			};
		}
		} catch (error) {
			console.error('批量删除卡密失败：', error);
			return { 
				code: -1, 
				msg: '删除失败：' + (error.message || '未知错误')
			};
		}
	}
};

