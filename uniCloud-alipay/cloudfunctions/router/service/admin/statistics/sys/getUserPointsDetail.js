module.exports = {
	/**
	 * 查询用户积分详细收支记录
	 * @url admin/statistics/sys/getUserPointsDetail 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} user_id 用户ID（必需）
	 * @param {Number} pageIndex 当前页码
	 * @param {Number} pageSize 每页显示数量
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let { user_id } = data;
		
		if (!user_id) {
			return { code: -1, msg: '用户ID不能为空' };
		}
		
		let dbName = "vk-points-log";
		
		// 查询该用户的所有积分流水
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson: {
				user_id: user_id
			},
			sortArr: [{ name: "_add_time", type: "desc" }], // 按时间倒序
		});
		
		// 处理返回数据，格式化时间
		if (res.rows && res.rows.length > 0) {
			res.rows = res.rows.map(item => {
				// 格式化时间
				if (item._add_time) {
					item._add_time_str = vk.pubfn.timeFormat(item._add_time, 'yyyy-MM-dd hh:mm:ss');
				}
				
				// 格式化类型
				item.type_text = item.type === 'income' ? '收入' : '支出';
				
				// 格式化来源
				const sourceMap = {
					'recharge': '充值',
					'card_buy': '购买卡密',
					'card_renew': '续费卡密',
					'reward': '奖励',
					'refund': '退款',
					'buy_product': '购买产品'
				};
				item.source_text = sourceMap[item.source] || item.source || '未知';
				
				return item;
			});
		}
		
		return res;
	}
};

