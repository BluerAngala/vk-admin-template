module.exports = {
	/**
	 * 加载预设分类（幂等，已有则跳过）
	 * @url admin/product-category/sys/initPresets
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
				log.push(`🔄 更新「${cat.label}」`);
			} else {
				await db.collection("vk-product-categories").add({
					...cat,
					enable: true,
					_add_time: Date.now()
				});
				log.push(`✅ 新增「${cat.label}」`);
			}
		}

		res.msg = log.join('，');
		res.data = { count: categories.length };
		return res;
	}
}
