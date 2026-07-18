module.exports = {
	/**
	 * 清理重复的卡密（只保留最新的一个）
	 * @url admin/card/sys/removeDuplicateCards 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {Boolean} dry_run 是否只预览不删除（默认true）
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		// 必须是管理员才能执行
		const isAdmin = userInfo && userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes("admin");
		if (!isAdmin) {
			return {
				code: -1,
				msg: '权限不足，只有管理员才能执行此操作'
			};
		}

		const { dry_run = true } = data;

		try {
			console.log(`开始清理重复卡密，模式: ${dry_run ? '预览模式' : '删除模式'}`);

			// 1. 分页查询所有卡密（uniCloud 单次查询限制100条）
			const cards = [];
			const batchSize = 1000; // 每批获取1000条
			let hasMore = true;
			let offset = 0;

			while (hasMore) {
				const batchRes = await db.collection('vk-card-key')
					.field({ _id: true, card_code: true, _add_time: true, buy_user_id: true })
					.orderBy('_add_time', 'desc')
					.skip(offset)
					.limit(batchSize)
					.get();

				if (batchRes.data && batchRes.data.length > 0) {
					cards.push(...batchRes.data);
					offset += batchRes.data.length;
					console.log(`已获取 ${cards.length} 条卡密记录...`);

					// 如果本批数量小于批次大小，说明已经取完了
					if (batchRes.data.length < batchSize) {
						hasMore = false;
					}
				} else {
					hasMore = false;
				}
			}

			if (cards.length === 0) {
				return {
					code: 0,
					msg: '数据库中没有卡密数据',
					data: { total: 0, duplicates: 0, to_delete: 0 }
				};
			}

			console.log(`共查询到 ${cards.length} 条卡密记录`);

			// 2. 按 card_code 分组，找出重复的
			const cardMap = new Map();

			for (const card of cards) {
				const code = card.card_code;
				if (!cardMap.has(code)) {
					cardMap.set(code, []);
				}
				cardMap.get(code).push(card);
			}

			// 3. 统计重复情况
			const duplicates = [];
			const toDeleteIds = [];

			for (const [code, cardList] of cardMap) {
				if (cardList.length > 1) {
					// 按时间排序，最新的排在最前面
					cardList.sort((a, b) => (b._add_time || 0) - (a._add_time || 0));

					const keepCard = cardList[0]; // 保留最新的
					const deleteCards = cardList.slice(1); // 删除其他的

					duplicates.push({
						card_code: code,
						count: cardList.length,
						keep: {
							_id: keepCard._id,
							_add_time: keepCard._add_time,
							buy_user_id: keepCard.buy_user_id
						},
						delete_list: deleteCards.map(c => ({
							_id: c._id,
							_add_time: c._add_time,
							buy_user_id: c.buy_user_id
						}))
					});

					deleteCards.forEach(c => toDeleteIds.push(c._id));
				}
			}

			console.log(`发现 ${duplicates.length} 个重复的卡密编码`);
			console.log(`需要删除 ${toDeleteIds.length} 条重复记录`);

			// 4. 如果不是预览模式，执行删除
			let deletedCount = 0;
			if (!dry_run && toDeleteIds.length > 0) {
				const batchSize = 100;

				for (let i = 0; i < toDeleteIds.length; i += batchSize) {
					const batch = toDeleteIds.slice(i, i + batchSize);

					const deleteRes = await db.collection('vk-card-key')
						.where({
							_id: db.command.in(batch)
						})
						.remove();

					deletedCount += deleteRes.deleted || 0;
					console.log(`已删除 ${deletedCount}/${toDeleteIds.length} 条记录`);
				}

				res.msg = `成功清理重复卡密，共删除 ${deletedCount} 条记录，保留 ${duplicates.length} 条唯一记录`;
			} else {
				res.msg = `预览模式：发现 ${duplicates.length} 个重复的卡密编码，涉及 ${toDeleteIds.length} 条记录待删除`;
			}

			res.data = {
				total: cards.length,
				unique_codes: cardMap.size,
				duplicates_count: duplicates.length,
				to_delete_count: toDeleteIds.length,
				deleted_count: deletedCount,
				dry_run: dry_run,
				details: duplicates.slice(0, 10) // 只返回前10个详情，避免数据过大
			};

			console.log(res.msg);

		} catch (error) {
			console.error('清理重复卡密失败：', error);
			return {
				code: -1,
				msg: '清理重复卡密失败：' + error.message,
				error: error
			};
		}

		return res;
	}
};
