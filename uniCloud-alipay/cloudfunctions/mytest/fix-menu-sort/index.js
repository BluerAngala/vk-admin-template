'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const log = [];

	const updates = [
		{ _id: "system-uni-product-center", sort: 1000 },
		{ _id: "system-uni", sort: 1010 },
		{ _id: "sys-admin", sort: 1020 },
	];

	for (const item of updates) {
		try {
			const res = await db.collection("opendb-admin-menus")
				.where({ _id: item._id })
				.update({ sort: item.sort });
			log.push(`✅ ${item._id} → sort: ${item.sort} (updated: ${res.updated})`);
		} catch (e) {
			log.push(`❌ ${item._id} 更新失败: ${e.message}`);
		}
	}

	return { code: 0, msg: "菜单排序修复完成", log };
};
