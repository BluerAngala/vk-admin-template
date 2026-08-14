module.exports = {
	/**
	 * 保存落地页配置
	 * @url admin/landing-page/sys/save
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 仅管理员可用
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return { code: -1, msg: '只有管理员才能修改' };
		}

		let { _id, sections } = data;

		if (!sections || !Array.isArray(sections)) {
			return { code: -1, msg: 'sections 数据格式错误' };
		}

		if (_id) {
			// 更新
			await db.collection("vk-landing-page")
				.doc(_id)
				.update({
					sections,
					_update_time: Date.now()
				});
			res.msg = '保存成功';
		} else {
			// 新增
			const addRes = await db.collection("vk-landing-page").add({
				sections,
				_add_time: Date.now()
			});
			res.msg = '保存成功';
			res.data = { _id: addRes.id };
		}

		return res;
	}
}
