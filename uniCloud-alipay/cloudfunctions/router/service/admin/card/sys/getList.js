module.exports = {
	/**
	 * 分页查询卡密列表
	 * @url admin/card/sys/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Number}         pageIndex 当前页码
	 * @param {Number}         pageSize  每页显示数量
	 * @param {Array<Object>}  sortRule  排序规则
	 * @param {object}         formData  查询条件数据源
	 * @param {Array<Object>}  columns   查询条件规则
	 * res 返回参数说明
	 * @param {Number}         code      错误码，0表示成功
	 * @param {String}         msg       详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "vk-card-key";
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			// 可以添加额外的查询条件
			whereJson: {
				// 例如：只查询当前应用的卡密
				// appid: config.appid
			},
			// 字段映射处理（新架构）
			fieldEq: ["card_code", "card_type"],
			sortArr: [{ name: "_add_time", type: "desc" }], // 默认按生成时间倒序
			// 关联查询购买用户信息
			foreignDB: [
				{
					dbName: "uni-id-users",
					localKey: "buy_user_id",
					foreignKey: "_id",
					as: "buyer_info",
					limit: 1
				}
			]
		});
		
		// 处理返回数据，添加状态计算和格式化
		if (res.rows && res.rows.length > 0) {
			const now = Date.now();
			res.rows = res.rows.map(item => {
				// 添加购买用户信息
				if (item.buyer_info && item.buyer_info.length > 0) {
					item.buy_user_nickname = item.buyer_info[0].nickname || item.buyer_info[0].username;
				}
				
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
}

