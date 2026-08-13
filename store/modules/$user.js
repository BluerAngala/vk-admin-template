/**
 * vuex 用户状态管理模块
 */
let lifeData = uni.getStorageSync('lifeData') || {};

let $user = lifeData.$user || {};

export default {
	// 通过添加 namespaced: true 的方式使其成为带命名空间的模块
	namespaced: true,
	/**
	 * vuex的基本数据，用来存储变量
	 */
	state: {
		/**
		 * 登录用户信息
		 * js调用示例
		 * (推荐) vk.getVuex('$user.userInfo');
		 * 或 vk.vuex.get('$user.userInfo');
		 * 页面上直接使用示例
		 * {{ vk.getVuex('$user.userInfo') }}
		 * js更新示例
		 * vk.setVuex('$user.userInfo.avatar', avatar);
		 */
		userInfo: $user.userInfo || {},
		permission: $user.permission || [],
		inviteCode: $user.inviteCode || "",
		login: $user.login || {},
		// ==================== 缓存数据 ====================
		// 用户积分信息
		pointsInfo: $user.pointsInfo || {
			available_points: 0,
			total_points: 0,
			consumed_points: 0,
		},
		// 机器绑定统计
		machineStats: $user.machineStats || {
			total_machines: 0,
		},
		// 产品列表（用户已购买的产品）
		productList: $user.productList || [],
	},
	/**
	 * 从基本数据(state)派生的数据，相当于state的计算属性
	 */
	getters: {
		pointsInfo: (state) => state.pointsInfo,
		machineStats: (state) => state.machineStats,
		productList: (state) => state.productList,
	},
	/**
	 * 提交更新数据的方法，必须是同步的(如果需要异步使用action)。
	 */
	mutations: {
		SET_POINTS_INFO(state, data) {
			state.pointsInfo = data || { available_points: 0, total_points: 0, consumed_points: 0 };
		},
		SET_MACHINE_STATS(state, data) {
			state.machineStats = data || { total_machines: 0 };
		},
		SET_PRODUCT_LIST(state, data) {
			state.productList = data || [];
		},
	},
	/**
	 * 和mutation的功能大致相同，不同之处在于 ==》
	 * 1. Action 提交的是 mutation，而不是直接变更状态。
	 * 2. Action 可以包含任意异步操作。
	 */
	actions: {
		/**
		 * 加载用户积分信息（带缓存）
		 * @param {boolean} force - 是否强制刷新
		 */
		async loadPointsInfo({ state, commit }, { force = false } = {}) {
			if (!force && state.pointsInfo.available_points > 0) {
				return state.pointsInfo;
			}
			const vk = uni.vk;
			const data = await new Promise((resolve) => {
				vk.callFunction({
					url: 'admin/points/kh/getBalance',
					success: (res) => resolve((res && res.data) || res || {}),
					fail: () => resolve({ available_points: 0, total_points: 0, consumed_points: 0 }),
				});
			});
			commit('SET_POINTS_INFO', data);
			return data;
		},
		/**
		 * 加载机器统计（带缓存）
		 * @param {boolean} force - 是否强制刷新
		 */
		async loadMachineStats({ state, commit }, { force = false } = {}) {
			if (!force && state.machineStats.total_machines > 0) {
				return state.machineStats;
			}
			const vk = uni.vk;
			const data = await new Promise((resolve) => {
				vk.callFunction({
					url: 'admin/card/kh/getStats',
					success: (res) => resolve({ total_machines: res.total_machines || 0 }),
					fail: () => resolve({ total_machines: 0 }),
				});
			});
			commit('SET_MACHINE_STATS', data);
			return data;
		},
		/**
		 * 加载产品列表（带缓存）
		 * @param {boolean} force - 是否强制刷新
		 */
		async loadProductList({ state, commit }, { force = false } = {}) {
			if (!force && state.productList.length > 0) {
				return state.productList;
			}
			const vk = uni.vk;
			const data = await new Promise((resolve) => {
				vk.callFunction({
					url: 'admin/product/kh/getList',
					success: (res) => resolve((res && res.data) || []),
					fail: () => resolve([]),
				});
			});
			commit('SET_PRODUCT_LIST', data);
			return data;
		},
	},
};
