'use strict';
/**
 * 积分购买支付接口配置工具（店铺自包含）
 * 配置存储在 vk-global-data（key: points_pay_config），后台「支付接口配置」页面维护。
 *
 * 模型：每个店铺是一套完整配置（网关 + 商户凭证 + 接口路径 + 它自己的套餐含商品key）。
 * 选中哪个店铺，前端下单与自助修复就使用哪个店铺。
 *
 * 配置结构：
 *  {
 *    active_store_id: 'default',      // 当前启用店铺
 *    stores: [
 *      {
 *        store_id, name,              // 店铺唯一标识 / 显示名
 *        base_url,                    // 支付网关域名
 *        channel_id,                  // 支付通道ID
 *        query_password,              // 查询密码
 *        pay_order_path, pay_query_path,          // 创建/查询订单接口路径
 *        merchant_login_path, merchant_order_info_path, // 商户登录/订单详情接口路径
 *        merchant_user, merchant_pass, // 商户API账号/密码（仅服务端可见）
 *        packages: [                  // 该店铺自己的套餐（含商品key）
 *          { id, name, points, price, discount, description, recommended, goods_key }
 *        ]
 *      }
 *    ]
 *  }
 */

const CONFIG_KEY = 'points_pay_config';

// 默认套餐（含当前支付平台 yunxiangit.com.cn 的商品key）
const DEFAULT_PACKAGES = [
	{ id: 1, name: '体验套餐（10积分）', points: 10, price: 10, discount: '', description: '适合新手体验', recommended: false, goods_key: 't1hw3w' },
	{ id: 2, name: '基础套餐（50积分）', points: 50, price: 45, discount: '省5元', description: '性价比之选', recommended: false, goods_key: 'u4zjhq' },
	{ id: 3, name: '超值套餐（100积分）', points: 100, price: 90, discount: '省10元', description: '最受欢迎', recommended: true, goods_key: 'mw9di3' },
	{ id: 4, name: '豪华套餐（300积分）', points: 300, price: 270, discount: '省30元', description: '超值优惠', recommended: false, goods_key: '8wouhk' },
	{ id: 5, name: '至尊套餐（500积分）', points: 500, price: 450, discount: '省50元', description: '刚需必选', recommended: false, goods_key: 'qv19cx' },
	{ id: 6, name: '终极套餐（1000积分）', points: 1000, price: 900, discount: '省100元', description: '土豪专属', recommended: false, goods_key: 'y3qiel' }
];

// 默认接口路径（当前平台为同套「小店」软件）
const DEFAULT_STORE = {
	store_id: 'default',
	name: '默认店铺',
	base_url: 'https://yunxiangit.com.cn',
	channel_id: 3,
	query_password: '',
	pay_order_path: '/shopApi/Pay/order',
	pay_query_path: '/shopApi/Pay/query',
	merchant_login_path: '/merchantApi/user/login',
	merchant_order_info_path: '/merchantApi/Order/orderInfo',
	merchant_user: 'ai-auto-man',
	merchant_pass: 'Aa123456'
};

/**
 * 返回默认配置（深拷贝，避免共享引用）
 */
function getDefaultConfig() {
	return {
		active_store_id: 'default',
		stores: [ mergeStore({ ...DEFAULT_STORE, packages: DEFAULT_PACKAGES.map(mergePackage) }) ]
	};
}

/**
 * 补齐单个套餐字段
 */
function mergePackage(p) {
	const id = p && p.id;
	return {
		id: id,
		name: (p && p.name) || `套餐${id}`,
		points: (p && Number(p.points)) || 0,
		price: (p && Number(p.price)) || 0,
		discount: (p && p.discount) || '',
		description: (p && p.description) || '',
		recommended: !!(p && p.recommended),
		goods_key: (p && p.goods_key !== undefined && p.goods_key !== null) ? String(p.goods_key) : ''
	};
}

/**
 * 补齐单个店铺字段（套餐缺失时用默认套餐兜底）
 */
function mergeStore(store) {
	let packages = (Array.isArray(store && store.packages) && store.packages.length)
		? store.packages.map(mergePackage)
		: DEFAULT_PACKAGES.map(mergePackage);
	return {
		store_id: (store && store.store_id) || 'default',
		name: (store && store.name) || '未命名店铺',
		base_url: (store && store.base_url) || DEFAULT_STORE.base_url,
		channel_id: (store && store.channel_id) || DEFAULT_STORE.channel_id,
		query_password: (store && store.query_password !== undefined) ? String(store.query_password) : '',
		pay_order_path: (store && store.pay_order_path) || DEFAULT_STORE.pay_order_path,
		pay_query_path: (store && store.pay_query_path) || DEFAULT_STORE.pay_query_path,
		merchant_login_path: (store && store.merchant_login_path) || DEFAULT_STORE.merchant_login_path,
		merchant_order_info_path: (store && store.merchant_order_info_path) || DEFAULT_STORE.merchant_order_info_path,
		merchant_user: (store && store.merchant_user) || DEFAULT_STORE.merchant_user,
		merchant_pass: (store && store.merchant_pass) || DEFAULT_STORE.merchant_pass,
		packages: packages
	};
}

/**
 * 将任意存量配置归一化为「店铺自包含」结构（兼容旧版：全局套餐+每店铺key、扁平配置）
 */
function normalizeContainer(value) {
	let stores = [];
	let active_store_id = 'default';

	if (value) {
		if (Array.isArray(value.packages) && value.packages.length) {
			// 旧版结构：全局 packages + 每店铺 goods_key_map → 迁移为每店铺 packages
			const globalPackages = value.packages.map(mergePackage);
			if (Array.isArray(value.stores) && value.stores.length) {
				stores = value.stores.map(s => {
					const keyMap = (s && s.goods_key_map) || {};
					return mergeStore({
						...s,
						packages: globalPackages.map(p => ({ ...p, goods_key: keyMap[p.id] || '' }))
					});
				});
			}
		} else if (Array.isArray(value.stores) && value.stores.length) {
			// 新结构：stores 自带 packages
			stores = value.stores.map(mergeStore);
		} else if (value.base_url) {
			// 最旧扁平配置 → 单店铺默认
			stores = [ mergeStore({ store_id: 'default', name: '当前店铺', ...value }) ];
		}

		if (stores.length) {
			active_store_id = value.active_store_id;
			if (!active_store_id || !stores.some(s => s.store_id === active_store_id)) {
				active_store_id = stores[0].store_id;
			}
		}
	}

	if (!stores.length) {
		stores = [ mergeStore(DEFAULT_STORE) ];
	}

	return { active_store_id, stores };
}

/**
 * 读取完整配置（含所有店铺与商户凭证，仅服务端调用）
 * @param {Object} util 云函数事件里的 util 对象
 * @returns {Promise<Object>} { active_store_id, stores }
 */
async function getConfig(util) {
	const { vk } = util;
	try {
		const config = await vk.baseDao.findByWhereJson({
			dbName: 'vk-global-data',
			whereJson: { key: CONFIG_KEY }
		});
		if (config && config.value) {
			return normalizeContainer(config.value);
		}
	} catch (err) {
		console.warn('[pointsPayConfig] 读取配置失败，使用默认配置:', err.message);
	}
	return getDefaultConfig();
}

/**
 * 获取当前启用店铺的完整配置（含商户凭证，仅服务端调用）
 */
async function getActiveStore(util) {
	const config = await getConfig(util);
	const active = config.stores.find(s => s.store_id === config.active_store_id);
	return active || config.stores[0] || mergeStore(DEFAULT_STORE);
}

/**
 * 获取客户端安全配置（当前店铺的套餐 + 网关，不含商户凭证，供前端下单使用）
 * @returns {Promise<Object>} { packages, store: { store_id, store_name, base_url, channel_id, query_password, pay_order_path, pay_query_path } }
 */
async function getClientConfig(util) {
	const store = await getActiveStore(util);
	return {
		packages: store.packages,
		store: {
			store_id: store.store_id,
			store_name: store.name,
			base_url: store.base_url,
			channel_id: store.channel_id,
			query_password: store.query_password,
			pay_order_path: store.pay_order_path,
			pay_query_path: store.pay_query_path
		}
	};
}

/**
 * 保存配置（不存在则新增，存在则覆盖）
 * @param {Object} util
 * @param {Object} container { active_store_id, stores }
 */
async function saveConfig(util, container) {
	const { vk } = util;
	const configData = normalizeContainer(container);

	const existConfig = await vk.baseDao.findByWhereJson({
		dbName: 'vk-global-data',
		whereJson: { key: CONFIG_KEY }
	});

	if (existConfig) {
		await vk.baseDao.updateById({
			dbName: 'vk-global-data',
			id: existConfig._id,
			dataJson: { value: configData }
		});
	} else {
		await vk.baseDao.add({
			dbName: 'vk-global-data',
			dataJson: {
				key: CONFIG_KEY,
				value: configData,
				_add_time: Date.now()
			}
		});
	}
}

/**
 * 校验配置，返回 { valid, error }
 * @param {Object} container { active_store_id, stores }
 */
function validateConfig(container) {
	const stores = container && container.stores;
	if (!Array.isArray(stores) || stores.length === 0) {
		return { valid: false, error: '至少需要一个店铺' };
	}
	if (!container.active_store_id || !stores.some(s => s.store_id === container.active_store_id)) {
		return { valid: false, error: '当前启用店铺不存在' };
	}
	for (const store of stores) {
		if (!store.store_id) {
			return { valid: false, error: '店铺标识不能为空' };
		}
		if (!store.base_url || typeof store.base_url !== 'string' || !/^https?:\/\//.test(store.base_url)) {
			return { valid: false, error: `店铺「${store.name}」的网关地址必须以 http:// 或 https:// 开头` };
		}
		if (!store.channel_id || !Number.isInteger(Number(store.channel_id)) || Number(store.channel_id) <= 0) {
			return { valid: false, error: `店铺「${store.name}」的支付通道ID必须是正整数` };
		}
		if (!store.merchant_user || typeof store.merchant_user !== 'string') {
			return { valid: false, error: `店铺「${store.name}」的商户API账号不能为空` };
		}
		if (!store.merchant_pass || typeof store.merchant_pass !== 'string') {
			return { valid: false, error: `店铺「${store.name}」的商户API密码不能为空` };
		}
		const packages = store.packages;
		if (!Array.isArray(packages) || packages.length === 0) {
			return { valid: false, error: `店铺「${store.name}」至少需要一个套餐` };
		}
		const seenIds = new Set();
		for (const p of packages) {
			if (!p.id || seenIds.has(p.id)) {
				return { valid: false, error: `店铺「${store.name}」的套餐标识重复或为空` };
			}
			seenIds.add(p.id);
			if (!p.name || !String(p.name).trim()) {
				return { valid: false, error: `店铺「${store.name}」套餐 ${p.id} 的名称不能为空` };
			}
			if (!p.points || Number(p.points) <= 0) {
				return { valid: false, error: `店铺「${store.name}」套餐「${p.name}」的积分必须为正数` };
			}
			if (Number(p.price) < 0) {
				return { valid: false, error: `店铺「${store.name}」套餐「${p.name}」的价格不能为负数` };
			}
			if (!p.goods_key || !String(p.goods_key).trim()) {
				return { valid: false, error: `店铺「${store.name}」套餐「${p.name}」的商品key不能为空` };
			}
		}
	}
	return { valid: true, error: '' };
}

module.exports = {
	CONFIG_KEY,
	DEFAULT_PACKAGES,
	DEFAULT_STORE,
	getDefaultConfig,
	mergePackage,
	mergeStore,
	normalizeContainer,
	getConfig,
	getActiveStore,
	getClientConfig,
	saveConfig,
	validateConfig
};
