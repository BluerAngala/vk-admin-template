module.exports = {
	/**
	 * 查询当前用户的卡密列表
	 * @url admin/card/kh/getList 前端调用的url参数地址
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
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		let user_id = userInfo._id;
		
		if (!user_id) {
			return { code: -1, msg: '请先登录' };
		}
		
		let dbName = "vk-card-key";
		
		// 构建查询条件
		let whereJson = {
			buy_user_id: user_id // 限制只查询当前用户的卡密
		};
		
		// 处理状态筛选（前端传入 status_text）
		const now = Date.now();
		if (data.formData && data.formData.status_text) {
			const statusText = data.formData.status_text;
			if (statusText === "未激活") {
				whereJson.activate_time = 0;
			} else if (statusText === "使用中") {
				whereJson.activate_time = _.gt(0);
				// 未过期且次数未用完
			} else if (statusText === "已过期") {
				whereJson.activate_time = _.gt(0);
				whereJson.expire_time = _.lt(now);
				whereJson.limit_days = _.neq(-1);
			} else if (statusText === "次数用完") {
				whereJson.activate_time = _.gt(0);
				whereJson.remaining_times = _.lte(0);
				whereJson.total_times = _.neq(-1);
			}
			// 删除 formData 中的 status_text，避免干扰后续查询
			delete data.formData.status_text;
		}
		
		// 处理日期范围筛选（支持动态时间字段）
		if (data.formData && data.formData.time_range && Array.isArray(data.formData.time_range) && data.formData.time_range.length === 2) {
			const startTime = data.formData.time_range[0];
			const endTime = data.formData.time_range[1];
			const timeField = data.formData.time_field || "_add_time"; // 默认筛选购买时间
			
			if (startTime && endTime) {
				// 根据选择的时间字段进行筛选
				whereJson[timeField] = _.and(_.gte(startTime), _.lte(endTime));
			}
			
			// 删除 formData 中的时间相关字段，避免干扰后续查询
			delete data.formData.time_range;
			delete data.formData.time_field;
		}
		
		// 只查询当前用户购买的卡密
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			fieldEq: ["product_name"], // 产品名称精确匹配
			fieldLike: ["card_code"], // 卡密模糊匹配
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

