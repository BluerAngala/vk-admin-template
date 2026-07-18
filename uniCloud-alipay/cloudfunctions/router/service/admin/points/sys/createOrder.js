module.exports = {
	/**
	 * 创建积分购买订单
	 * @url admin/points/sys/createOrder 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number} package_id 套餐ID
	 * @param {String} package_name 套餐名称
	 * @param {Number} points 基础积分
	 * @param {Number} bonus 赠送积分
	 * @param {Number} price 价格
	 * @param {String} payment_method 支付方式
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let {
			package_id,
			package_name,
			points,
			bonus = 0,
			price,
			payment_method = 'wechat'
		} = data;
		
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		// 参数校验
		if (!package_id || !package_name || !points || !price) {
			return { code: -1, msg: '参数不完整' };
		}
		
		// 计算总积分
		const totalPoints = points + bonus;
		
		// 生成订单号
		const orderNo = 'PO' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
		
		// 检查订单号是否已存在（防止重复充值）
		const existLog = await db.collection('vk-points-log').where({
			order_id: orderNo,
			source: 'recharge'
		}).get();
		
		if (existLog.data && existLog.data.length > 0) {
			return {
				code: -1,
				msg: `订单号 ${orderNo} 已存在，请重试`
			};
		}
		
		// 创建订单记录（这里简化处理，实际项目应该有专门的订单表）
		// 暂时直接充值积分，模拟支付成功
		
		// 充值积分
		// 生成备注信息
		let remark = `购买${package_name}`;
		if (bonus > 0) {
			remark += `，获得${totalPoints}积分（基础${points}+赠送${bonus}）`;
		} else {
			remark += `，获得${totalPoints}积分`;
		}
		
		const result = await pubFun.addPoints(
			vk,
			user_id,
			totalPoints,
			'recharge',
			remark,
			orderNo
		);
		
		if (result.success) {
			res.msg = '购买成功';
			res.data = {
				order_no: orderNo,
				total_points: totalPoints,
				balance: result.balance
			};
		} else {
			res.code = -1;
			res.msg = result.message || '购买失败';
		}
		
		return res;
	}
};

