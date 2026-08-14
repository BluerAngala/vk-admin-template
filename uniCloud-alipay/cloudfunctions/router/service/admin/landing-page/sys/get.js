module.exports = {
	/**
	 * 获取落地页配置
	 * @url admin/landing-page/sys/get
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 查询落地页配置（只有一条记录）
		const result = await db.collection("vk-landing-page")
			.limit(1)
			.get();

		if (result.data && result.data.length > 0) {
			res.data = result.data[0];
		} else {
			res.data = { sections: [] };
		}

		return res;
	}
}
