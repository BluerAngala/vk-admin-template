<template>
	<view class="points-pay-config">
		<!-- 配置说明 -->
		<div class="config-tips">
			<el-alert title="配置说明" type="info" :closable="false" show-icon>
				<ul>
					<li>选中哪个店铺，购买积分页与自助修复就使用哪个店铺的网关和套餐</li>
					<li>每个店铺自带一套套餐（含该平台商品key），店铺之间相互独立</li>
					<li>店铺列表点「选择」→ 该店铺成为当前店铺，下方显示其网关与套餐供编辑</li>
					<li>接口路径一般保持默认（同套软件），换不同平台接口才需要修改</li>
					<li>商户API账号/密码仅用于「自助修复」查单，不会暴露给前端用户</li>
					<li>保存后立即生效，无需改代码</li>
				</ul>
			</el-alert>
		</div>

		<!-- 店铺列表 -->
		<el-card class="config-card">
			<div slot="header" class="card-header">
				<span>店铺列表</span>
				<el-button type="primary" icon="el-icon-plus" size="small" @click="addStore">新增店铺</el-button>
			</div>
			<el-table
				:data="stores"
				style="width: 100%"
				border
				highlight-current-row
				:row-class-name="rowClassName"
				@row-click="selectStore"
			>
				<el-table-column prop="name" label="店铺名称" min-width="160">
					<template slot-scope="{ row }">
						{{ row.name }}
						<el-tag v-if="row.store_id === selected_store_id" type="success" size="mini" style="margin-left: 6px">当前</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="base_url" label="网关地址" min-width="220"></el-table-column>
				<el-table-column label="操作" width="180" align="center">
					<template slot-scope="{ row }">
						<el-button
							size="mini"
							:type="row.store_id === selected_store_id ? 'primary' : 'default'"
							@click.stop="selectStore(row)"
						>{{ row.store_id === selected_store_id ? '已选择' : '选择' }}</el-button>
						<el-button
							size="mini"
							type="danger"
							icon="el-icon-delete"
							:disabled="stores.length <= 1"
							@click.stop="removeStore(row.store_id)"
						></el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="tip-line">点击店铺行或「选择」按钮切换当前店铺；下方显示该店铺的网关与套餐，编辑后点「保存配置」生效。</div>
		</el-card>

		<!-- 当前选中店铺的完整配置 -->
		<el-card class="config-card" v-if="selectedStore">
			<div slot="header" class="card-header">
				<span>当前店铺：{{ selectedStore.name }}</span>
			</div>
			<el-form :model="selectedStore" label-width="150px" label-position="right">
				<el-form-item label="店铺名称">
					<el-input v-model="selectedStore.name" placeholder="店铺显示名"></el-input>
				</el-form-item>
				<el-form-item label="支付网关地址">
					<el-input v-model="selectedStore.base_url" placeholder="如 https://yunxiangit.com.cn"></el-input>
				</el-form-item>
				<el-form-item label="支付通道ID">
					<el-input-number v-model="selectedStore.channel_id" :min="1" :max="999" size="small"></el-input-number>
					<span style="margin-left: 8px; color: #909399; font-size: 12px;">创建订单时传给网关的 channel_id</span>
				</el-form-item>
				<el-form-item label="查询密码">
					<el-input v-model="selectedStore.query_password" placeholder="按需填写，通常留空"></el-input>
				</el-form-item>
			</el-form>

			<el-card class="inner-card">
				<div slot="header">接口路径</div>
				<el-form :model="selectedStore" label-width="150px" label-position="right">
					<el-form-item label="创建订单接口">
						<el-input v-model="selectedStore.pay_order_path" placeholder="/shopApi/Pay/order"></el-input>
					</el-form-item>
					<el-form-item label="查询订单接口">
						<el-input v-model="selectedStore.pay_query_path" placeholder="/shopApi/Pay/query"></el-input>
					</el-form-item>
					<el-form-item label="商户登录接口">
						<el-input v-model="selectedStore.merchant_login_path" placeholder="/merchantApi/user/login"></el-input>
					</el-form-item>
					<el-form-item label="商户订单详情接口">
						<el-input v-model="selectedStore.merchant_order_info_path" placeholder="/merchantApi/Order/orderInfo"></el-input>
					</el-form-item>
				</el-form>
			</el-card>

			<el-card class="inner-card">
				<div slot="header">商户凭证（自助修复查单用）</div>
				<el-form :model="selectedStore" label-width="150px" label-position="right">
					<el-form-item label="商户API账号">
						<el-input v-model="selectedStore.merchant_user"></el-input>
					</el-form-item>
					<el-form-item label="商户API密码">
						<el-input v-model="selectedStore.merchant_pass" type="password" show-password></el-input>
					</el-form-item>
				</el-form>
			</el-card>

			<!-- 该店铺自己的套餐（含商品key） -->
			<div class="sub-header">
				<span>本店铺套餐</span>
				<el-button type="primary" icon="el-icon-plus" size="small" @click="addPackage">新增套餐</el-button>
			</div>
			<el-table :data="selectedStore.packages" style="width: 100%" border>
				<el-table-column label="套餐名称" min-width="150">
					<template slot-scope="{ row }">
						<el-input v-model="row.name" size="small" placeholder="如 体验套餐（10积分）"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="积分" width="95" align="center">
					<template slot-scope="{ row }">
						<el-input-number v-model="row.points" :min="1" size="small"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="价格(¥)" width="105" align="center">
					<template slot-scope="{ row }">
						<el-input-number v-model="row.price" :min="0" size="small"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="折扣" width="100">
					<template slot-scope="{ row }">
						<el-input v-model="row.discount" size="small" placeholder="省5元"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="推荐" width="75" align="center">
					<template slot-scope="{ row }">
						<el-switch v-model="row.recommended"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="说明" min-width="120">
					<template slot-scope="{ row }">
						<el-input v-model="row.description" size="small" placeholder="套餐说明"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="商品key" min-width="140" align="center">
					<template slot-scope="{ row }">
						<el-input v-model="row.goods_key" size="small" placeholder="如 t1hw3w"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="80" align="center">
					<template slot-scope="{ $index }">
						<el-button size="mini" type="danger" icon="el-icon-delete" circle :disabled="selectedStore.packages.length <= 1" @click="removePackage($index)"></el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 操作按钮 -->
		<div class="action-bar">
			<el-button type="primary" icon="el-icon-check" size="small" @click="saveConfig" :loading="saving">
				保存配置
			</el-button>
		</div>
	</view>
</template>

<script>
let that;
let vk;

export default {
	data() {
		return {
			stores: [],
			selected_store_id: '',
			selectedStore: null,
			saving: false
		};
	},
	onLoad() {
		that = this;
		vk = that.vk;
		that.loadConfig();
	},
	methods: {
		// 加载配置
		loadConfig() {
			vk.callFunction({
				url: 'admin/points/sys/getPayConfig',
				success: (data) => {
					const cfg = data.data || {};
					that.stores = (cfg.stores && cfg.stores.length) ? cfg.stores : [];
					that.selected_store_id = cfg.active_store_id
						|| (that.stores[0] && that.stores[0].store_id)
						|| '';
					that.selectedStore = that.stores.find(s => s.store_id === that.selected_store_id) || null;
				},
				fail: (err) => {
					console.error('加载支付配置失败：', err);
					vk.toast('加载配置失败');
				}
			});
		},
		// 选择店铺（同时作为当前店铺；行点击或按钮都走这里）
		selectStore(store) {
			if (!store) return;
			that.selected_store_id = store.store_id;
			that.selectedStore = that.stores.find(s => s.store_id === store.store_id) || null;
		},
		// 行高亮当前店铺
		rowClassName({ row }) {
			return row.store_id === that.selected_store_id ? 'current-store-row' : '';
		},
		// 新增店铺
		addStore() {
			const store_id = 'store_' + Date.now();
			that.stores.push({
				store_id,
				name: '新店铺',
				base_url: 'https://yunxiangit.com.cn',
				channel_id: 3,
				query_password: '',
				pay_order_path: '/shopApi/Pay/order',
				pay_query_path: '/shopApi/Pay/query',
				merchant_login_path: '/merchantApi/user/login',
				merchant_order_info_path: '/merchantApi/Order/orderInfo',
				merchant_user: '',
				merchant_pass: '',
				packages: [
					{ id: 1, name: '新套餐1', points: 0, price: 0, discount: '', description: '', recommended: false, goods_key: '' }
				]
			});
			that.selectStore(that.stores[that.stores.length - 1]);
		},
		// 删除店铺
		removeStore(store_id) {
			that.$confirm('确定删除该店铺吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				const idx = that.stores.findIndex(s => s.store_id === store_id);
				if (idx > -1) that.stores.splice(idx, 1);
				if (that.selected_store_id === store_id) {
					if (that.stores.length) {
						that.selectStore(that.stores[0]);
					} else {
						that.selected_store_id = '';
						that.selectedStore = null;
					}
				}
			}).catch(() => {});
		},
		// 新增套餐（加到当前店铺）
		addPackage() {
			const nextId = that.selectedStore.packages.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
			that.selectedStore.packages.push({
				id: nextId,
				name: '新套餐',
				points: 0,
				price: 0,
				discount: '',
				description: '',
				recommended: false,
				goods_key: ''
			});
		},
		// 删除套餐
		removePackage(index) {
			if (that.selectedStore.packages.length <= 1) {
				vk.toast('至少保留一个套餐');
				return;
			}
			that.selectedStore.packages.splice(index, 1);
		},
		// 保存配置
		saveConfig() {
			if (!that.stores.length) {
				vk.toast('请至少保留一个店铺');
				return;
			}
			if (!that.selected_store_id || !that.stores.some(s => s.store_id === that.selected_store_id)) {
				vk.toast('当前店铺无效');
				return;
			}
			for (const s of that.stores) {
				if (!s.base_url || !/^https?:\/\//.test(s.base_url)) {
					vk.toast(`店铺「${s.name}」的网关地址必须以 http(s):// 开头`);
					return;
				}
				if (!s.channel_id || s.channel_id <= 0) {
					vk.toast(`店铺「${s.name}」的支付通道ID必须是正整数`);
					return;
				}
				if (!s.packages || !s.packages.length) {
					vk.toast(`店铺「${s.name}」至少需要一个套餐`);
					return;
				}
				const ids = new Set();
				for (const p of s.packages) {
					if (!p.id || ids.has(p.id)) {
						vk.toast(`店铺「${s.name}」的套餐标识重复或为空`);
						return;
					}
					ids.add(p.id);
					if (!p.name || !String(p.name).trim()) {
						vk.toast(`店铺「${s.name}」套餐 ${p.id} 的名称不能为空`);
						return;
					}
					if (!p.points || Number(p.points) <= 0) {
						vk.toast(`店铺「${s.name}」套餐「${p.name}」的积分必须为正数`);
						return;
					}
					if (Number(p.price) < 0) {
						vk.toast(`店铺「${s.name}」套餐「${p.name}」的价格不能为负数`);
						return;
					}
					if (!p.goods_key || !String(p.goods_key).trim()) {
						vk.toast(`店铺「${s.name}」套餐「${p.name}」的商品key不能为空`);
						return;
					}
				}
			}

			that.saving = true;
			vk.callFunction({
				url: 'admin/points/sys/updatePayConfig',
				data: {
					active_store_id: that.selected_store_id,
					stores: that.stores
				},
				success: () => {
					vk.toast('保存成功');
					that.loadConfig();
				},
				fail: (err) => {
					vk.toast(err.msg || '保存失败');
				},
				complete: () => {
					that.saving = false;
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.points-pay-config {
	padding: 20px;
}

.config-card {
	margin-bottom: 20px;
}

.inner-card {
	margin-bottom: 20px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.sub-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 20px 0 10px 0;
	font-weight: bold;
	color: #303133;
}

.tip-line {
	margin-top: 8px;
	color: #909399;
	font-size: 12px;
	line-height: 1.6;
}

.current-store-row {
	background: #ecf5ff;
}

.action-bar {
	margin-bottom: 20px;
}

.config-tips {
	ul {
		margin: 10px 0 0 0;
		padding-left: 20px;

		li {
			line-height: 1.8;
			color: #606266;
		}
	}
}
</style>
