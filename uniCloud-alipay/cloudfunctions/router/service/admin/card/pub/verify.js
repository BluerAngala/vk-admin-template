module.exports = {
	/**
	 * 卡密校验接口（支持加密模式）
	 * @url admin/card/pub/verify 前端调用的url参数地址
	 * 
	 * 支持两种请求模式：
	 * 1. 明文模式：直接传递参数（兼容旧版本）
	 * 2. 加密模式：通过 encrypted_body 传递加密后的参数
	 * 
	 * data 请求参数 说明
	 * @param {String} encrypted_body 加密请求体（加密模式）
	 * @param {String} key 密钥（明文模式）
	 * @param {String} machineCode 机器码（设备唯一标识）
	 * @param {String} id 用户ID（必需）
	 * @param {String} product_id 产品ID（必需）
	 * 
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Object} data 返回数据
	 */
	main: async (event) => {
		let { data = {}, util } = event;
		let { pubFun, vk, db } = util;
		
		// 打印客户端原始请求参数
		console.log('verify raw request:', JSON.stringify(data));
		
		// ==================== 0. 检测加密模式 ====================
		const isEncrypted = pubFun.isEncryptedRequest(data);
		
		// 如果是加密请求，先解密
		if (isEncrypted) {
			try {
				data = pubFun.decryptRequest(data);
			} catch (err) {
				console.error('解密请求失败:', err.message);
				const errorRes = { code: -1, msg: '请求解密失败' };
				return pubFun.encryptResponse(errorRes);
			}
		}
		
		let res = { code: 0, msg: '' };
		
		let { key, machineCode, id, product_id, productId, card_code } = data;
		
		// 调试日志：查看实际收到的参数（注意：生产环境建议移除或脱敏）
		console.log('verify params:', JSON.stringify({ 
			isEncrypted, 
			product_id: product_id || productId,
			id,
			hasMachineCode: !!machineCode 
		}));
		
		// 兼容 key 和 card_code 两种参数名
		key = key || card_code;
		
		// ==================== 1. 参数校验 ====================
		if (!key || !key.trim()) {
			res = { code: -1, msg: '请输入密钥' };
			return isEncrypted ? pubFun.encryptResponse(res) : res;
		}
		
		key = key.trim();
		
		// machineCode 可选，取决于卡密是否限制机器数量
		if (machineCode) {
			machineCode = machineCode.trim();
		}
		
		// 兼容 productId && product_id，两者优先顺序为显式传入的 product_id
		const finalProductId = (product_id || productId || '').trim();
		if (!finalProductId) {
			res = { code: -1, msg: '请传入产品ID参数（product_id）' };
			return isEncrypted ? pubFun.encryptResponse(res) : res;
		}
		
		// 验证必须传入用户ID
		if (!id || !id.trim()) {
			res = { code: -1, msg: '请传入用户ID参数（id）' };
			return isEncrypted ? pubFun.encryptResponse(res) : res;
		}
		
		const user_id = id.trim();
		
		// ==================== 2. 查询卡密信息 ====================
		const cardRes = await db.collection('vk-card-key')
			.where({ card_code: key, product_id: finalProductId })
			.get();
		
		if (!cardRes.data || cardRes.data.length === 0) {
			res = { code: -1, msg: '卡密不存在或不属于该产品' };
			return isEncrypted ? pubFun.encryptResponse(res) : res;
		}
		
		const record = cardRes.data[0];
		
		// ==================== 3. 使用极简校验函数 ====================
		const validationResult = pubFun.validateCardKey(record, machineCode, user_id);
		
		if (!validationResult.valid) {
			res = { code: -1, msg: validationResult.message };
			return isEncrypted ? pubFun.encryptResponse(res) : res;
		}
			
		// ==================== 4. 更新数据库（如果有更新数据） ====================
		if (validationResult.updateData) {
			await db.collection('vk-card-key')
				.doc(record._id)
				.update(validationResult.updateData);
		}
		
		// ==================== 5. 返回结果 ====================
		const updatedRecord = {
			...record,
			...validationResult.updateData
		};
		
		// 判断是否首次激活
		const isActivated = record.activate_time === 0 && validationResult.updateData?.activate_time;
		
		// 判断是否新绑定机器
		const isNewMachine = validationResult.updateData?.authorized_machines ? true : false;
		
		// 判断各种限制类型
		const hasTimeLimit = record.limit_days !== -1;
		const hasTimesLimit = record.total_times !== -1;
		const hasMachineLimit = record.max_machine_count !== -1;
		
		res.msg = isNewMachine 
			? (isActivated ? '卡密激活成功，机器绑定成功' : '机器绑定成功') 
			: '校验成功';
		
		res.data = {
			card_id: record._id,
			card_code: record.card_code,
			card_type: record.card_type,
			product_id: record.product_id,
			product_name: record.product_name,
			
			// 激活和绑定状态
			is_activated: isActivated,
			is_new_machine: isNewMachine,
			
			// 时间信息
			has_time_limit: hasTimeLimit,
			limit_days: record.limit_days,
			activate_time: updatedRecord.activate_time,
			expire_time: updatedRecord.expire_time,
			activate_time_text: updatedRecord.activate_time > 0 
				? vk.pubfn.timeFormat(updatedRecord.activate_time, 'yyyy-MM-dd hh:mm:ss') 
				: '未激活',
			expire_time_text: hasTimeLimit 
				? (updatedRecord.expire_time > 0 
					? vk.pubfn.timeFormat(updatedRecord.expire_time, 'yyyy-MM-dd hh:mm:ss') 
					: '未激活') 
				: '永久有效',
			
			// 次数信息
			has_times_limit: hasTimesLimit,
			total_times: record.total_times,
			used_times: updatedRecord.used_times,
			remaining_times: updatedRecord.remaining_times,
			
			// 机器码信息
			has_machine_limit: hasMachineLimit,
			max_machine_count: record.max_machine_count,
			current_machine_count: updatedRecord.authorized_machines?.length || 0,
			authorized_machines: updatedRecord.authorized_machines || []
		};
		
		// 根据请求模式返回对应格式的响应
		return isEncrypted ? pubFun.encryptResponse(res) : res;
	}
}
