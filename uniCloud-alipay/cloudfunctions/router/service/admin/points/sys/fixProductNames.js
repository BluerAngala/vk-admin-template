module.exports = {
	/**
	 * 修正产品表名称与积分流水备注不一致的记录
	 * @url admin/points/sys/fixProductNames 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Array} records 需要修正的记录列表（包含card_id、points_log_id、correct_product_name等）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 * @param {Object} data 修正结果统计
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 判断是否是管理员
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员可以执行此操作' };
		}
		
		let { records = [] } = data;
		
		if (!Array.isArray(records) || records.length === 0) {
			return { code: -1, msg: '请提供需要修正的记录列表' };
		}
		
		const stats = {
			total: records.length,
			pointsLogUpdated: 0,
			cardUpdated: 0,
			skipped: 0,
			errors: 0
		};
		
		// 处理每条记录
		for (const record of records) {
			try {
				// 使用前端传递过来的正确产品信息
				const correctProductId = record.correct_product_id;
				const correctProductName = record.correct_product_name;
				
				if (!correctProductId || !correctProductName) {
					stats.skipped++;
					continue;
				}
				
				// 1. 修正积分流水备注
				if (record.points_log_id) {
					// 获取当前积分流水记录
					const pointsLogRes = await db.collection('vk-points-log')
						.doc(record.points_log_id)
						.get();
					
					if (pointsLogRes.data && pointsLogRes.data.length > 0) {
						const pointsLog = pointsLogRes.data[0];
						const currentRemark = pointsLog.remark || '';
						
						// 检查备注中的产品名称是否需要修正
						// 备注格式通常是：购买 X 张【产品名称】卡密...
						const match = currentRemark.match(/【([^】]+)】/);
						const remarkProductName = match ? match[1] : '';
						
						// 如果备注中的产品名称与产品表中的不一致，需要修正
						if (remarkProductName && remarkProductName !== correctProductName) {
							// 替换备注中的产品名称
							const newRemark = currentRemark.replace(/【[^】]+】/, `【${correctProductName}】`);
							
							// 更新积分流水备注
							await db.collection('vk-points-log')
								.doc(record.points_log_id)
								.update({
									remark: newRemark
								});
							
							stats.pointsLogUpdated++;
						}
						
						// 同时更新积分流水中的product_name字段（如果存在且不一致）
						if (pointsLog.product_name && pointsLog.product_name !== correctProductName) {
							await db.collection('vk-points-log')
								.doc(record.points_log_id)
								.update({
									product_name: correctProductName
								});
						}
					}
				}
				
				// 2. 修正卡密记录中的产品名称
				if (record.card_id) {
					// 获取当前卡密记录
					const cardRes = await db.collection('vk-card-key')
						.doc(record.card_id)
						.get();
					
					if (cardRes.data && cardRes.data.length > 0) {
						const card = cardRes.data[0];
						
						// 如果卡密记录中的产品名称与产品表中的不一致，需要修正
						if (card.product_name !== correctProductName || card.product_id !== correctProductId) {
							await db.collection('vk-card-key')
								.doc(record.card_id)
								.update({
									product_id: correctProductId,
									product_name: correctProductName
								});
							
							stats.cardUpdated++;
						}
					}
				}
			} catch (err) {
				console.error('修正记录失败：', err, record);
				stats.errors++;
			}
		}
		
		res.data = stats;
		res.msg = `修正完成：积分流水修正 ${stats.pointsLogUpdated} 条，卡密记录修正 ${stats.cardUpdated} 条，跳过 ${stats.skipped} 条，错误 ${stats.errors} 条（共处理 ${stats.total} 条）`;
		
		return res;
	}
};

