<template>
	<view class="user-center">
		<!-- 用户信息卡片 -->
		<user-center-header
			:user-info="userInfo"
			:points-info="pointsInfo"
			:machine-stats="machineStats"
			@copy="copyCode"
			@refresh="refreshStats"
		/>

		<!-- 标签页 -->
		<el-card class="tabs-card">
			<el-tabs v-model="activeTab" @tab-click="handleTabClick">
				<!-- 积分流水 -->
				<el-tab-pane label="积分流水" name="points">
					<points-table ref="pointsTable" />
				</el-tab-pane>

				<!-- 我的卡密 -->
				<el-tab-pane label="我的卡密" name="cards">
					<card-table
						ref="cardTable"
						@copy="copyCode"
						@download="openDownloadUrl"
						@show-version-logs="showCardVersionLogs"
					/>
				</el-tab-pane>

				<!-- 我的产品 -->
				<el-tab-pane label="我的产品" name="products">
					<view v-if="productList.length === 0" class="products-empty">
						<i class="el-icon-box" style="font-size: 64px; color: #DCDFE6;"></i>
						<p style="color: #909399; margin-top: 16px;">暂无可用产品</p>
					</view>
					<view v-else class="products-grid">
						<product-card
							v-for="product in productList"
							:key="product._id"
							:product="product"
							:user-info="userInfo"
							mode="purchased"
							@copy="copyCode"
							@download="openDownloadUrl"
							@show-version-logs="showVersionLogs"
						/>
					</view>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!-- 版本更新日志弹窗 -->
		<version-log-dialog
			:show.sync="versionLogDialog.show"
			:title="versionLogDialog.title"
			:logs="versionLogDialog.logs"
			@download="openDownloadUrl"
		/>
	</view>
</template>

<script>
import UserCenterHeader from './components/user-center-header.vue';
import PointsTable from './components/points-table.vue';
import CardTable from './components/card-table.vue';
import ProductCard from '@/components/product-card/index.vue';
import VersionLogDialog from './components/version-log-dialog.vue';

let that;
let vk = uni.vk;

export default {
	components: {
		UserCenterHeader,
		PointsTable,
		CardTable,
		ProductCard,
		VersionLogDialog
	},

	data() {
		return {
			activeTab: 'points',
			userInfo: {},
			versionLogDialog: {
				show: false,
				title: '',
				logs: []
			}
		};
	},

	computed: {
		pointsInfo() { return this.$store.state.$user.pointsInfo; },
		machineStats() { return this.$store.state.$user.machineStats; },
		productList() {
			const all = this.$store.state.$user.productList || [];
			// 只显示已购买的产品（定制产品 或 已购买的公开产品）
			return all.filter(p => p.is_custom || p.is_purchased);
		},
	},

	onLoad() {
		that = this;
		vk = that.vk;
		that.init();
	},

	methods: {
		// 初始化
		async init() {
			that.loadUserInfo();
			await Promise.all([
				that.$store.dispatch('$user/loadPointsInfo'),
				that.$store.dispatch('$user/loadMachineStats'),
				that.$store.dispatch('$user/loadProductList'),
			]);
		},

		// 加载用户信息
		loadUserInfo() {
			vk.callFunction({
				url: "user/kh/getMyUserInfo",
				success: (data) => {
					that.userInfo = data.userInfo || {};
				}
			});
		},

		// 刷新统计数据
		async refreshStats() {
			await Promise.all([
				that.$store.dispatch('$user/loadPointsInfo', { force: true }),
				that.$store.dispatch('$user/loadMachineStats', { force: true }),
			]);
			vk.toast("刷新成功");
		},

		// 标签页切换
		async handleTabClick(tab) {
			if (tab.name === 'points') {
				that.$refs.pointsTable && that.$refs.pointsTable.refresh();
			} else if (tab.name === 'cards') {
				that.$refs.cardTable && that.$refs.cardTable.refresh();
			} else if (tab.name === 'products') {
				await that.$store.dispatch('$user/loadProductList', { force: true });
			}
		},

		// 复制文本
		copyCode(text) {
			uni.setClipboardData({
				data: text,
				success: () => vk.toast("复制成功")
			});
		},

		// 打开下载地址
		openDownloadUrl(url) {
			if (!url) {
				vk.toast('下载地址为空');
				return;
			}
			window.open(url, '_blank');
		},

		// 显示版本更新日志（产品）
		showVersionLogs(product) {
			if (!product.version_logs || product.version_logs.length === 0) {
				vk.toast('暂无版本更新记录');
				return;
			}
			that.versionLogDialog.title = `${product.product_name} - 更新历史`;
			that.versionLogDialog.logs = product.version_logs;
			that.versionLogDialog.show = true;
		},

		// 显示版本更新日志（卡密）
		showCardVersionLogs(card) {
			if (!card.version_logs || card.version_logs.length === 0) {
				vk.toast('暂无版本更新记录');
				return;
			}
			that.versionLogDialog.title = `${card.product_name} - 更新历史`;
			that.versionLogDialog.logs = card.version_logs;
			that.versionLogDialog.show = true;
		}
	}
};
</script>

<style lang="scss" scoped>
.user-center {
	height: 86vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

/* 标签卡片 */
.tabs-card {
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;

	::v-deep .el-card__body {
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 20px 20px 0;
	}

	::v-deep .el-tabs {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	::v-deep .el-tabs__nav-wrap {
		text-align: center;
	}

	::v-deep .el-tabs__nav {
		float: none;
		display: inline-block;
	}

	::v-deep .el-tabs__content {
		flex: 1;
		overflow: hidden;
		padding: 0;
	}

	::v-deep .el-tab-pane {
		height: 100%;
		overflow: auto;
	}
}

/* 产品网格 */
.products-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 20px;
	padding: 10px;
}

.products-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
}
</style>
