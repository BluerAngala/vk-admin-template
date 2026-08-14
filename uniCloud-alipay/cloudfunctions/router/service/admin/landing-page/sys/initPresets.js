module.exports = {
	/**
	 * 加载落地页预设配置
	 * @url admin/landing-page/sys/initPresets
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

		const presets = [
			{
				type: "hero", enable: true,
				data: {
					title: "AI自动化\n商务定制化平台",
					subtitle: "智能管理，高效运营\n一站式产品授权、卡密管理、积分商城",
					bg_color: "#0a1628",
					btn_primary: { text: "了解更多", action: "scroll" },
					btn_ghost: { text: "登录后台", action: "login" }
				}
			},
			{
				type: "stats", enable: true,
				data: {
					items: [
						{ num: "1000+", label: "活跃用户" },
						{ num: "50+", label: "产品授权" },
						{ num: "99.9%", label: "系统可用率" },
						{ num: "7×24", label: "技术支持" }
					]
				}
			},
			{
				type: "features", enable: true,
				data: {
					title: "核心功能",
					subtitle: "为您的业务提供全方位智能化管理",
					columns: 3,
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
				type: "advantages", enable: true,
				data: {
					title: "为什么选择我们",
					subtitle: "稳定可靠的技术底座，助力业务快速增长",
					items: [
						{ title: "云端部署，即开即用", desc: "基于 uniCloud 云开发，无需自建服务器，分钟级上线" },
						{ title: "数据安全，权限可控", desc: "完善的权限管理体系，数据隔离，操作可追溯" },
						{ title: "多端适配，统一管理", desc: "支持 H5、小程序、App 多端访问，一套代码全平台覆盖" },
						{ title: "持续迭代，功能丰富", desc: "持续更新迭代，更多实用功能陆续上线" }
					]
				}
			},
			{
				type: "cta", enable: true,
				data: {
					title: "准备好开始了吗？",
					subtitle: "几分钟即可完成注册，立即体验智能化管理",
					btn_text: "免费注册"
				}
			}
		];

		// 检查是否已有配置
		const existing = await db.collection("vk-landing-page").limit(1).get();

		if (existing.data && existing.data.length > 0) {
			await db.collection("vk-landing-page")
				.doc(existing.data[0]._id)
				.update({ sections: presets, _update_time: Date.now() });
			res.msg = '预设已更新';
		} else {
			await db.collection("vk-landing-page").add({
				sections: presets,
				_add_time: Date.now()
			});
			res.msg = '预设已加载';
		}

		res.data = { count: presets.length };
		return res;
	}
}
