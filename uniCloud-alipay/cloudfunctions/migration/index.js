module.exports = {
	/**
	 * 数据库迁移与初始化工具
	 * 调用方式：callFunction({ name: 'migration', data: { action: 'all' } })
	 * 
	 * action:
	 *   all        — 一键执行全部迁移
	 *   menu       — 产品中心菜单迁移
	 *   categories — 产品分类初始化
	 *   display    — 展示配置初始化
	 */
	main: async (event) => {
		let { data = {} } = event;
		let db = uniCloud.database();
		let res = { code: 0, msg: '' };
		let { action = 'all' } = data;
		let results = {};

		try {
			if (action === 'menu' || action === 'all') {
				results.menu = await migrateMenu(db);
			}
			if (action === 'categories' || action === 'all') {
				results.categories = await initCategories(db);
			}
			if (action === 'display' || action === 'all') {
				results.display = await initDisplayConfig(db);
			}

			res.data = results;
			res.msg = '执行完成';
		} catch (err) {
			res.code = -1;
			res.msg = '执行失败：' + err.message;
		}

		return res;
	}
}

// ======================== 产品中心菜单迁移 ========================
async function migrateMenu(db) {
	const log = [];

	// 1. 新增产品中心父菜单
	try {
		await db.collection("opendb-admin-menus").add({
			menu_id: "system-uni-product-center",
			name: "产品中心",
			icon: "el-icon-s-goods",
			comment: "产品分类、内容、展示、统计统一管理",
			sort: -1,
			parent_id: "system-uni",
			enable: true,
			_add_time: Date.now()
		});
		log.push('✅ 新增「产品中心」父菜单');
	} catch (e) {
		log.push('⏭️ 「产品中心」已存在，跳过');
	}

	// 2. 产品管理移入产品中心
	const manageRes = await db.collection("opendb-admin-menus")
		.where({ _id: "system-uni-product-manage" })
		.update({ parent_id: "system-uni-product-center", sort: 0 });
	log.push(`✅ 产品管理移入产品中心（更新 ${manageRes.updated} 条）`);

	// 3. 统计改名并移入
	const statsRes = await db.collection("opendb-admin-menus")
		.where({ _id: "system-uni-statistics" })
		.update({
			name: "销售统计",
			comment: "查看用户积分和购买统计",
			parent_id: "system-uni-product-center",
			sort: 3
		});
	log.push(`✅ 统计改名并移入（更新 ${statsRes.updated} 条）`);

	// 4. 新增产品分类菜单
	try {
		await db.collection("opendb-admin-menus").add({
			menu_id: "system-uni-product-category",
			name: "产品分类",
			icon: "el-icon-collection",
			url: "/pages/system/product-category/product-category",
			comment: "管理产品类型分类",
			sort: 1,
			parent_id: "system-uni-product-center",
			enable: true,
			_add_time: Date.now()
		});
		log.push('✅ 新增「产品分类」菜单');
	} catch (e) {
		log.push('⏭️ 「产品分类」菜单已存在，跳过');
	}

	// 5. 新增展示配置菜单
	try {
		await db.collection("opendb-admin-menus").add({
			menu_id: "system-uni-product-display",
			name: "展示配置",
			icon: "el-icon-picture-outline",
			url: "/pages/system/product-display/product-display",
			comment: "配置前端落地页展示内容",
			sort: 2,
			parent_id: "system-uni-product-center",
			enable: true,
			_add_time: Date.now()
		});
		log.push('✅ 新增「展示配置」菜单');
	} catch (e) {
		log.push('⏭️ 「展示配置」菜单已存在，跳过');
	}

	return log;
}

// ======================== 产品分类初始化 ========================
async function initCategories(db) {
	const log = [];
	const categories = [
		{ value: "software", label: "软件", icon: "el-icon-monitor", sort: 10 },
		{ value: "plugin", label: "插件", icon: "el-icon-connection", sort: 20 },
		{ value: "web", label: "网页", icon: "el-icon-platform-eleme", sort: 30 },
		{ value: "miniapp", label: "小程序", icon: "el-icon-chat-dot-round", sort: 40 },
		{ value: "other", label: "其他", icon: "el-icon-more-outline", sort: 50 }
	];

	for (const cat of categories) {
		const existing = await db.collection("vk-product-categories")
			.where({ value: cat.value })
			.count();

		if (existing.total > 0) {
			await db.collection("vk-product-categories")
				.where({ value: cat.value })
				.update({ label: cat.label, icon: cat.icon, sort: cat.sort, enable: true });
			log.push(`🔄 更新分类「${cat.label}」(${cat.value})`);
		} else {
			await db.collection("vk-product-categories").add({
				...cat,
				enable: true,
				_add_time: Date.now()
			});
			log.push(`✅ 新增分类「${cat.label}」(${cat.value})`);
		}
	}

	return log;
}

// ======================== 展示配置初始化 ========================
async function initDisplayConfig(db) {
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
			log.push(`🔄 更新配置「${config.config_name}」`);
		} else {
			await db.collection("vk-display-config").add({
				...config,
				enable: true,
				_add_time: Date.now()
			});
			log.push(`✅ 新增配置「${config.config_name}」`);
		}
	}

	return log;
}
