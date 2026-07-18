module.exports = {
	/**
	 * 查询我的卡密列表
	 * @url admin/card/sys/getMyCards 前端调用的url参数地址
	 * data 请求参数 说明
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
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		let dbName = "vk-card-key";
		
		// 查询当前用户购买的卡密
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson: {
				buy_user_id: user_id
			},
			sortArr: [{ name: "_add_time", type: "desc" }] // 按购买时间倒序
		});
		
		// 格式化时间显示和计算状态
		if (res.rows && res.rows.length > 0) {
			const now = Date.now();
			res.rows = res.rows.map(item => {
				// 计算卡密状态（新架构）
				let status = '未激活';
				let statusColor = 'info';
				
				if (item.activate_time > 0) {
					// 已激活
					if (item.limit_days !== -1 && item.expire_time < now) {
						status = '已过期';
						statusColor = 'error';
					} else if (item.total_times !== -1 && item.remaining_times <= 0) {
						status = '次数用完';
						statusColor = 'warning';
					} else {
						status = '使用中';
						statusColor = 'success';
					}
				}
				
				item.status_text = status;
				item.status_color = statusColor;
				
				// 格式化时间显示
				if (item._add_time) {
					item._add_time_str = vk.pubfn.timeFormat(item._add_time, 'yyyy-MM-dd hh:mm:ss');
				}
				if (item.activate_time && item.activate_time > 0) {
					item.activate_time_str = vk.pubfn.timeFormat(item.activate_time, 'yyyy-MM-dd hh:mm:ss');
				}
				if (item.expire_time && item.expire_time > 0) {
					item.expire_time_str = vk.pubfn.timeFormat(item.expire_time, 'yyyy-MM-dd hh:mm:ss');
				} else if (item.limit_days === -1) {
					item.expire_time_str = '永久有效';
				}
				
				// 格式化限制说明
				item.limit_days_str = item.limit_days === -1 ? '不限' : `${item.limit_days}天`;
				item.total_times_str = item.total_times === -1 ? '不限' : `${item.total_times}次`;
				item.max_machine_str = item.max_machine_count === -1 ? '不限' : `${item.max_machine_count}机器`;
				item.current_machine_count = item.authorized_machines ? item.authorized_machines.length : 0;
				
				return item;
			});
		}
		
		return res;
	}
};

