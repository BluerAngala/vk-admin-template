/**
 * 确认支付并充值积分
 * 前端流程:fetch(pay.ldxp.cn/shopApi/Pay/order) → window.open(payurl) → 轮询 fetch(Pay/query) → 调本接口
 * @url admin/points/kh/addPoints 前端调用的url参数地址
 * data 请求参数
 * @param {String} trade_no  支付网关返回的订单号
 * @param {Number} package_id 前端选中的套餐 id(用于服务端二次校验积分数量)
 * res 返回参数说明
 * @param {Number} code 错误码，0表示成功
 * @param {String} msg 详细信息
 * @param {Object} data.total_points 本次充值的积分
 * @param {Number} data.balance 当前可用积分余额
 */
module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { pubFun, vk, db } = util;
		let res = { code: 0, msg: '' };

		let { trade_no, package_id } = data;
		let user_id = userInfo._id;

		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		if (!trade_no) {
			return { code: -1, msg: '订单号不能为空' };
		}
		if (!package_id) {
			return { code: -1, msg: '套餐参数缺失' };
		}

		// ① 服务端校验套餐(防止前端传大数字刷积分)
		const PACKAGES = {
			1: { name: '体验套餐（10积分）', points: 10 },
			2: { name: '基础套餐（50积分）', points: 50 },
			3: { name: '超值套餐（100积分）', points: 100 },
			4: { name: '豪华套餐（300积分）', points: 300 },
			5: { name: '至尊套餐（500积分）', points: 500 },
			6: { name: '终极套餐（1000积分）', points: 1000 }
		};
		const pkg = PACKAGES[package_id];
		if (!pkg) {
			return { code: -1, msg: '套餐不存在' };
		}

		// ② 二次校验:必须去支付网关确认这笔订单真的付了款
		// 防止前端伪造 trade_no 直接调此接口刷积分
		// 支付网关对不同IP可能返回不同结果，需要重试等待状态同步
		let queryRes;
		const MAX_RETRIES = 3;
		const RETRY_DELAY = 3000; // 3秒
		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				queryRes = await vk.request({
					url: 'https://pay.ldxp.cn/shopApi/Pay/query',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: { trade_no },
					timeout: 10000
				});
			} catch (err) {
				console.error(`查询支付网关失败(第${attempt}次):`, err);
				if (attempt === MAX_RETRIES) {
					return { code: -1, msg: '支付验证失败，请稍后重试' };
				}
				await new Promise(r => setTimeout(r, RETRY_DELAY));
				continue;
			}

			if (queryRes && queryRes.code === 1 && queryRes.msg === 'success') {
				break; // 验证通过
			}

			console.warn(`支付网关返回未支付(第${attempt}/${MAX_RETRIES}次):`, JSON.stringify(queryRes));
			if (attempt < MAX_RETRIES) {
				await new Promise(r => setTimeout(r, RETRY_DELAY));
			}
		}

		if (!queryRes || queryRes.code !== 1 || queryRes.msg !== 'success') {
			return { code: -1, msg: '该订单尚未完成支付，请稍后重试' };
		}

		// ③ 加积分(内部已含幂等:同一 trade_no 重复调用不会重复到账)
		const remark = `购买${pkg.name}`;
		const result = await pubFun.addPoints(
			vk,
			user_id,
			pkg.points,
			'recharge',
			remark,
			trade_no
		);

		if (!result || !result.success) {
			return { code: -1, msg: (result && result.message) || '充值失败' };
		}

		res.msg = '充值成功';
		res.data = {
			trade_no,
			total_points: pkg.points,
			balance: result.balance || 0,
			duplicate: !!result.duplicate
		};
		return res;
	}
};
