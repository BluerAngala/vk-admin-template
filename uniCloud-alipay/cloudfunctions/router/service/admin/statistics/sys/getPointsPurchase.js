module.exports = {
	/**
	 * 查询积分购买统计
	 * @url admin/statistics/sys/getPointsPurchase 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number} pageIndex 当前页码
	 * @param {Number} pageSize 每页显示数量
	 * @param {String} user_id 用户ID（可选）
	 * @param {String} start_time 开始时间（可选）
	 * @param {String} end_time 结束时间（可选）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let { user_id, start_time, end_time, formData } = data;
		
		// 处理日期范围：支持数组格式（来自 vk-data-table-query）和单独参数
		let dateRange = null;
		if (formData && formData._add_time && Array.isArray(formData._add_time)) {
			dateRange = formData._add_time;
		} else if (start_time || end_time) {
			dateRange = [start_time, end_time];
		}
		
		let dbName = "vk-points-log";
		
		// 构建查询条件：只查询积分充值记录
		let whereJson = {
			type: 'income',
			source: 'recharge'
		};
		
		if (user_id) {
			whereJson.user_id = user_id;
		}
		
		// 时间范围查询
		if (dateRange && dateRange.length > 0) {
			const $ = db.command;
			const timeRange = {};
			if (dateRange[0]) {
				timeRange['>='] = new Date(dateRange[0]).getTime();
			}
			if (dateRange[1]) {
				// 结束时间需要包含当天的23:59:59
				const endDate = new Date(dateRange[1]);
				endDate.setHours(23, 59, 59, 999);
				timeRange['<='] = endDate.getTime();
			}
			if (Object.keys(timeRange).length > 0) {
				whereJson._add_time = timeRange;
			}
		}
		
		// 查询积分购买记录
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			sortArr: [{ name: "_add_time", type: "desc" }], // 按时间倒序
			// 关联查询用户信息
			foreignDB: [
				{
					dbName: "uni-id-users",
					localKey: "user_id",
					foreignKey: "_id",
					as: "user_info",
					limit: 1
				}
			]
		});
		
		// 处理返回数据，添加用户信息
		if (res.rows && res.rows.length > 0) {
			res.rows = res.rows.map(item => {
				// 添加用户信息
				if (item.user_info && item.user_info.length > 0) {
					const user = item.user_info[0];
					item.username = user.username || '';
					item.nickname = user.nickname || '';
					item.user_display_name = user.nickname || user.username || '未知用户';
				} else {
					item.username = '';
					item.nickname = '';
					item.user_display_name = '未知用户';
				}
				
				// 格式化时间
				if (item._add_time) {
					item._add_time_str = vk.pubfn.timeFormat(item._add_time, 'yyyy-MM-dd hh:mm:ss');
				}
				
				return item;
			});
		}
		
		return res;
	}
};

