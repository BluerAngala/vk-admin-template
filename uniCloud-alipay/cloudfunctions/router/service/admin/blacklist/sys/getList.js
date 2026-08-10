/**
 * 获取黑名单列表
 * @url admin/blacklist/sys/getList
 */
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		try {
			res.data = await vk.baseDao.getTableData({
				dbName: 'vk-blacklist',
				data,
				sortArr: [{ name: '_add_time', type: 'desc' }],
				pageIndex: data.pageIndex || 1,
				pageSize: data.pageSize || 50,
			});
		} catch (err) {
			res.code = -1;
			res.msg = err.message;
		}

		return res;
	}
};
