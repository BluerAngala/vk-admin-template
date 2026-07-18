module.exports = {
	/**
	 * 生成卡密（新架构）
	 * @url admin/card/sys/add 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} card_type 				卡密类型
	 * @param {Number} limit_days 		限制天数（-1表示不限）
	 * @param {Number} max_machine_count 最大机器数（-1表示不限）
	 * @param {Number} total_times 	总次数（-1表示不限）
	 * @param {Number} numKeys 			生成数量
	 * @param {Number} keyLength 		密钥长度
	 * @param {Boolean} isDefaultTime 是否立即设置开始时间
	 * @param {String} remark 			备注
	 * res 返回参数说明
	 * @param {Number} code					错误码，0表示成功
	 * @param {String} msg					详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
	// 业务逻辑开始-----------------------------------------------------------
	let {
			card_type,
			limit_days = -1,
			max_machine_count = -1,
			total_times = -1,
			numKeys = 1,
			keyLength = 20,
			isDefaultTime = false,
			remark = ''
	} = data;
	
	// 参数校验
		if (!card_type) {
			return { code: -1, msg: '请指定卡密类型' };
	}
	
		if (numKeys < 1 || numKeys > 100) {
		return { code: -1, msg: '生成数量必须在1-100之间' };
	}
	
	if (keyLength < 10 || keyLength > 64) {
		return { code: -1, msg: '密钥长度必须在10-64之间' };
	}
	
		// 获取当前用户ID
	let user_id = userInfo._id;
	if (!user_id) {
		return { code: -1, msg: '请先登录' };
	}
	
		try {
			// 生成唯一密钥
			const uniqueKeys = pubFun.generateUniqueKeys(numKeys, keyLength);
			
			// 构造数据库插入数据
			const insertData = uniqueKeys.map((card_code) => {
				const baseData = {
					card_type: card_type,
					card_code: card_code,
					
					// 时间相关字段
					limit_days: limit_days,
					activate_time: (limit_days !== -1 && isDefaultTime) ? Date.now() : 0,
					expire_time: (limit_days !== -1 && isDefaultTime) ? 
						Date.now() + limit_days * 24 * 60 * 60 * 1000 : 0,
					
					// 次数相关字段
					total_times: total_times,
					used_times: 0,
					remaining_times: total_times,
					
					// 机器码相关字段
					max_machine_count: max_machine_count,
					authorized_machines: [],
					
					// 购买信息
					buy_user_id: user_id,
					remark: remark,
					_add_time: Date.now()
				};
				
				return baseData;
			});
		
		// 批量插入数据库
		let insertRes = await vk.baseDao.adds({
				dbName: 'vk-card-key',
				dataJson: insertData
			});
			
			// 自动生成CSV
			let csvResult = null;
			try {
				const insertedIds = insertRes.ids || [];
				if (insertedIds.length > 0) {
					csvResult = await pubFun.exportCardsToCSV(insertedIds, db);
				}
			} catch (csvError) {
				console.error('CSV导出失败：', csvError);
			}
			
			res.msg = `成功生成 ${numKeys} 个卡密`;
			res.data = {
				count: numKeys,
				ids: insertRes.ids,
				csvExport: csvResult
			};
			
			return res;
			
		} catch (error) {
			console.error('生成卡密失败：', error);
			return { 
				code: -1, 
				msg: '生成卡密失败：' + error.message 
			};
	}
	}
}

