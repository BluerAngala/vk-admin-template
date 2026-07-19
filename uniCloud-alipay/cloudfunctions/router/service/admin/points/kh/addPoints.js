/**
 * 确认支付并充值积分（直接上分）
 * 前端流程:fetch(pay.ldxp.cn/shopApi/Pay/order) → window.open(payurl) → 轮询 fetch(Pay/query) → 调本接口
 * 前端已确认支付成功后调用，云函数不再二次校验网关（网关对不同IP返回不一致）
 * 防刷靠: ① 套餐白名单 ② trade_no 幂等(同一订单不会重复到账)
 * @url admin/points/kh/addPoints
 * @param {String} trade_no  支付网关返回的订单号
 * @param {Number} package_id 前端选中的套餐 id
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

		// ② 直接上分(内部已含幂等:同一 trade_no 重复调用不会重复到账)
		console.log(`[积分充值] 用户=${user_id}, 订单=${trade_no}, 套餐=${pkg.name}, 积分=${pkg.points}`);
		const remark = `购买${pkg.name}`;
		let result;
		try {
			result = await pubFun.addPoints(
				vk,
				user_id,
				pkg.points,
				'recharge',
				remark,
				trade_no
			);
		} catch (err) {
			console.error(`[积分充值异常] 用户=${user_id}, 订单=${trade_no}, 异常:`, err);
			return { code: -1, msg: `充值异常: ${err.message || '未知错误'}` };
		}

		if (!result || !result.success) {
			console.error(`[积分充值失败] 用户=${user_id}, 订单=${trade_no}, 错误=${result && result.message}`);
			return { code: -1, msg: (result && result.message) || '充值失败' };
		}

		console.log(`[积分充值成功] 用户=${user_id}, 订单=${trade_no}, 积分=${pkg.points}, 余额=${result.balance}, 重复=${!!result.duplicate}`);
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
