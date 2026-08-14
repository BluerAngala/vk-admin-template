module.exports = {
	/**
	 * 加载预设展示配置（幂等，已有则更新）
	 * @url admin/display-config/sys/initPresets
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 仅管理员可用
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能操作' };
		}

		const log = [];
		const configs = [
			{
				config_key: "landing-features",
				config_name: "落地页核心功能卡片",
				config_value: {
					items: [
						{ icon: "📦", title: "产品管理", desc: "统一管理您的产品授权，支持多种授权类型，灵活分配与回收" },
						{ icon: "🔑", title: "卡密系统", desc: "一键生成卡密，支持批量操作，自动校验激活状态" },
						{ icon: "💰", title: "积分商城", desc: "灵活的积分体系，支持多种套餐购买，助力用户留存与转化" },
						{ icon: "🎫", title: "工单支持", desc: "完善的工单系统，快速响应客户需求，提升服务质量" },
						{ icon: "🤝", title: "邀请返利", desc: "邀请好友注册即可获得返利，裂变式增长获客成本低" },
						{ icon: "🤖", title: "AI 赋能", desc: "集成 AI 能力，智能辅助业务决策，提升运营效率" }
					]
				}
			},
			{
				config_key: "landing-advantages",
				config_name: "落地页优势板块",
				config_value: {
					items: [
						{ title: "云端部署，即开即用", desc: "基于 uniCloud 云开发，无需自建服务器，分钟级上线" },
						{ title: "数据安全，权限可控", desc: "完善的权限管理体系，数据隔离，操作可追溯" },
						{ title: "多端适配，统一管理", desc: "支持 H5、小程序、App 多端访问，一套代码全平台覆盖" },
						{ title: "持续迭代，功能丰富", desc: "持续更新迭代，更多实用功能陆续上线" }
					]
				}
			}
		];

		for (const config of configs) {
			const existing = await db.collection("vk-display-config")
				.where({ config_key: config.config_key })
				.count();

			if (existing.total > 0) {
				await db.collection("vk-display-config")
					.where({ config_key: config.config_key })
					.update({
						config_name: config.config_name,
						config_value: config.config_value,
						enable: true,
						_update_time: Date.now()
					});
				log.push(`🔄 更新「${config.config_name}」`);
			} else {
				await db.collection("vk-display-config").add({
					...config,
					enable: true,
					_add_time: Date.now()
				});
				log.push(`✅ 新增「${config.config_name}」`);
			}
		}

		res.msg = log.join('，');
		res.data = { count: configs.length };
		return res;
	}
}
