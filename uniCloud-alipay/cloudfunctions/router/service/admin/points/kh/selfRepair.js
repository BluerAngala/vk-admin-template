/**
 * 自助修复积分充值（用户自助）
 * 用户支付成功但积分未到账时，输入订单号自助修复
 *
 * 流程：
 *  1. 查 vk-points-log → 已入账直接返回（幂等）
 *  2. 登录链动小店商家API获取 merchant_token（缓存24h）
 *  3. 用 merchant_token 查询订单详情
 *  4. 根据订单状态判断是否已支付，根据 goods_name 识别套餐积分
 *  5. 确认已支付且未入账 → 调 pubFun.addPoints 入账
 *  6. 返回订单详情给前端展示
 *
 * @url admin/points/kh/selfRepair
 * @param {String} trade_no 支付网关订单号（必填）
 */
module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { pubFun, vk, db } = util;
		let res = { code: 0, msg: '' };

		let { trade_no } = data;
		let user_id = userInfo._id;

		if (!user_id) return { code: -1, msg: '请先登录' };
		if (!trade_no) return { code: -1, msg: '请输入订单号' };

		trade_no = String(trade_no).trim();

		// ========== ① 查积分流水 —— 已入账直接返回 ==========
		const existLog = await db.collection('vk-points-log')
			.where({ order_id: trade_no, source: 'recharge' })
			.get();

		const alreadyCredited = existLog.data && existLog.data.length > 0;

		// ========== ② 获取 merchant_token（缓存24h） ==========
		let merchantToken = await getMerchantToken(db, vk);

		// ========== ③ 查询订单详情 ==========
		let orderInfo = null;
		try {
			orderInfo = await queryOrderInfo(merchantToken, trade_no);
		} catch (err) {
			// token 过期时重新登录一次
			if (err.message && err.message.includes('token')) {
				merchantToken = await getMerchantToken(db, vk, true);
				try {
					orderInfo = await queryOrderInfo(merchantToken, trade_no);
				} catch (err2) {
					return { code: -1, msg: `查询订单失败: ${err2.message}` };
				}
			} else {
				return { code: -1, msg: `查询订单失败: ${err.message}` };
			}
		}

		if (!orderInfo) {
			return { code: -1, msg: '未查到该订单，请检查订单号是否正确' };
		}

		// ========== ④ 从 goods_name 提取积分数量 ==========
		const points = parsePointsFromGoodsName(orderInfo.goods_name);

		// 构建返回给前端的订单信息
		const orderDetail = {
			trade_no: orderInfo.trade_no,
			goods_name: orderInfo.goods_name || '-',
			total_amount: orderInfo.total_amount || 0,
			create_time: orderInfo.create_time ? vk.pubfn.timeFormat(orderInfo.create_time * 1000, 'yyyy-MM-dd hh:mm:ss') : '-',
			is_paid: orderInfo.status === 1,
			is_credited: alreadyCredited,
			points: points
		};

		// ========== ⑤ 判断是否需要入账 ==========
		if (!orderInfo.status || orderInfo.status !== 1) {
			return {
				code: 0,
				msg: '该订单尚未支付',
				data: { status: 'not_paid', order: orderDetail }
			};
		}

		if (alreadyCredited) {
			const balance = await pubFun.getPointsBalance(vk, user_id);
			orderDetail.balance = balance.available_points;
			return {
				code: 0,
				msg: '该订单积分已到账，无需修复',
				data: { status: 'already_credited', order: orderDetail }
			};
		}

		if (!points || points <= 0) {
			return {
				code: -1,
				msg: `无法识别套餐（${orderInfo.goods_name}），请联系客服处理`,
				data: { status: 'unknown_package', order: orderDetail }
			};
		}

		// ========== ⑥ 入账 ==========
		console.log(`[selfRepair] 入账: user=${user_id}, trade_no=${trade_no}, goods=${orderInfo.goods_name}, points=${points}`);
		const remark = `自助修复-${orderInfo.goods_name}`;

		let result;
		try {
			result = await pubFun.addPoints(vk, user_id, points, 'recharge', remark, trade_no);
		} catch (err) {
			console.error(`[selfRepair] 入账异常: user=${user_id}, trade_no=${trade_no}`, err);
			return {
				code: -1,
				msg: `入账异常: ${err.message}，请截图联系客服`,
				data: { status: 'credit_error', order: orderDetail }
			};
		}

		if (!result || !result.success) {
			console.error(`[selfRepair] 入账失败: user=${user_id}, trade_no=${trade_no}, err=${result && result.message}`);
			return {
				code: -1,
				msg: (result && result.message) || '入账失败，请联系客服处理',
				data: { status: 'credit_failed', order: orderDetail }
			};
		}

		console.log(`[selfRepair] 入账成功: user=${user_id}, trade_no=${trade_no}, points=${points}, balance=${result.balance}`);
		orderDetail.is_credited = true;
		orderDetail.balance = result.balance;

		return {
			code: 0,
			msg: '修复成功，积分已到账',
			data: { status: 'credited', order: orderDetail }
		};
	}
};

// ======================== 工具函数 ========================

/**
 * 获取 merchant_token，优先从缓存读取，过期重新登录
 */
async function getMerchantToken(db, vk, forceRefresh = false) {
	const TOKEN_KEY = 'ldxp_merchant_token';
	const GLOBAL_DB = 'vk-global-data';
	const CACHE_HOURS = 20;

	// 读缓存
	if (!forceRefresh) {
		try {
			const cached = await vk.baseDao.selects({
				dbName: GLOBAL_DB,
				whereJson: { key: TOKEN_KEY }
			});
			let records = [];
			if (Array.isArray(cached)) records = cached;
			else if (cached && cached.rows) records = cached.rows;
			else if (cached && cached.data) records = cached.data;

			if (records.length > 0) {
				const record = records[0];
				const parts = (record.value || '').split('|');
				if (parts.length === 2 && parts[0]) {
					const tokenAge = Date.now() - (parseInt(parts[1]) || 0);
					if (tokenAge < CACHE_HOURS * 60 * 60 * 1000) {
						console.log(`[selfRepair] 使用缓存token, 已缓存${Math.floor(tokenAge / 60000)}分钟`);
						return parts[0];
					}
					console.log(`[selfRepair] token已过期(${Math.floor(tokenAge / 60000)}分钟), 重新登录`);
				}
			}
		} catch (_) {}
	}

	// 登录获取新 token
	const loginRes = await uniCloud.httpclient.request(
		'https://pay.ldxp.cn/merchantApi/user/login',
		{
			method: 'POST',
			contentType: 'json',
			data: { username: 'ai-auto-man', password: 'Aa123456' },
			dataType: 'json',
			timeout: 10000
		}
	);

	const loginData = loginRes.data || loginRes.body;
	if (!loginData || loginData.code !== 1 || !loginData.data || !loginData.data.merchant_token) {
		throw new Error('链动小店登录失败: ' + JSON.stringify(loginData));
	}

	const newToken = loginData.data.merchant_token;
	const cacheValue = newToken + '|' + Date.now();

	// 写入缓存
	try {
		const existing = await vk.baseDao.selects({
			dbName: GLOBAL_DB,
			whereJson: { key: TOKEN_KEY }
		});
		let existingRecords = [];
		if (Array.isArray(existing)) existingRecords = existing;
		else if (existing && existing.rows) existingRecords = existing.rows;
		else if (existing && existing.data) existingRecords = existing.data;

		if (existingRecords.length > 0) {
			await vk.baseDao.update({
				dbName: GLOBAL_DB,
				whereJson: { key: TOKEN_KEY },
				dataJson: { value: cacheValue }
			});
		} else {
			await vk.baseDao.add({
				dbName: GLOBAL_DB,
				dataJson: { key: TOKEN_KEY, value: cacheValue, _add_time: Date.now() }
			});
		}
	} catch (err) {
		console.warn('[selfRepair] 缓存token失败:', err.message);
	}

	return newToken;
}

/**
 * 查询订单详情
 */
async function queryOrderInfo(merchantToken, trade_no) {
	const res = await uniCloud.httpclient.request(
		'https://pay.ldxp.cn/merchantApi/Order/orderInfo',
		{
			method: 'POST',
			contentType: 'json',
			headers: { 'merchant-token': merchantToken },
			data: { trade_no },
			dataType: 'json',
			timeout: 10000
		}
	);

	const result = res.data || res.body;
	if (!result || result.code !== 1) {
		throw new Error((result && result.msg) || '查询失败');
	}

	return result.data;
}

/**
 * 从 goods_name 提取积分数量
 * "体验卡（10积分）" → 10
 * "基础套餐（50积分）" → 50
 */
function parsePointsFromGoodsName(goods_name) {
	if (!goods_name) return 0;
	const match = goods_name.match(/(\d+)\s*积分/);
	return match ? parseInt(match[1], 10) : 0;
}
