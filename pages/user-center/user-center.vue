<template>
	<view class="user-center">
		<!-- 用户信息卡片 -->
		<el-card class="user-info-card">
			<div class="user-header">
			<el-avatar :size="80" :src="userInfo.avatar">
				{{ userInfo.nickname ? userInfo.nickname.charAt(0).toUpperCase() : (userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U') }}
			</el-avatar>
				<div class="user-details">
					<div class="user-name">{{ userInfo.nickname || userInfo.username || '未设置昵称' }}</div>
					<div class="user-id">
						ID: {{ userInfo._id }}
						<el-button type="text" icon="el-icon-copy-document" size="mini" @click="copyCode(userInfo._id)" style="margin-left: 5px;"></el-button>
					</div>
				</div>
			<div class="user-points-inline">
				<div class="points-stats-inline">
					<div class="points-item-inline">
						<div class="points-label-inline">绑定机器</div>
						<div class="points-value-inline warning">{{ machineStats.total_machines || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">可用积分</div>
						<div class="points-value-inline primary">{{ pointsInfo.available_points || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">累计获得</div>
						<div class="points-value-inline">{{ pointsInfo.total_points || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">已消耗</div>
						<div class="points-value-inline">{{ pointsInfo.consumed_points || 0 }}</div>
					</div>
				</div>
				<el-button type="text" icon="el-icon-refresh" @click="refreshStats" size="small">刷新</el-button>
			</div>
			</div>
		</el-card>

		<!-- 快捷入口 -->
		<el-card class="quick-actions-card">
			<el-button type="primary" icon="el-icon-service" @click="contactCustomerService" plain>联系客服</el-button>
		</el-card>

		<!-- 标签页 -->
		<el-card class="tabs-card">
			<el-tabs v-model="activeTab" @tab-click="handleTabClick">
				<!-- 积分流水 -->
				<el-tab-pane label="积分流水" name="points">
					<vk-data-table
						ref="pointsTable"
						:action="pointsTable.action"
						:columns="pointsTable.columns"
						:row-no="true"
						:pagination="true"
					>
						<!-- 类型列 -->
						<template v-slot:type="{ row }">
							<el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
								{{ row.type === 'income' ? '收入' : '支出' }}
							</el-tag>
						</template>

						<!-- 积分数量列 -->
						<template v-slot:amount="{ row }">
							<span :style="{ color: row.amount > 0 ? '#67C23A' : '#F56C6C' }">
								{{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
							</span>
						</template>

						<!-- 来源列 -->
						<template v-slot:source="{ row }">
							<el-tag size="small" :type="getSourceType(row.source)">
								{{ getSourceText(row.source) }}
							</el-tag>
						</template>
					</vk-data-table>
				</el-tab-pane>

				<!-- 我的卡密 -->
				<el-tab-pane label="我的卡密" name="cards">
					<vk-data-table
						ref="cardsTable"
						:action="cardsTable.action"
						:columns="cardsTable.columns"
						:row-no="true"
						:pagination="true"
					>
						<!-- 卡密列 -->
						<template v-slot:card_code="{ row }">
							<div class="card-code-cell">
								<span class="code-text">{{ row.card_code }}</span>
								<el-button 
									type="text" 
									icon="el-icon-copy-document" 
									size="mini"
									@click="copyCode(row.card_code)"
									style="margin-left: 8px;"
								>
									复制
								</el-button>
							</div>
						</template>

						<!-- 状态列 -->
						<template v-slot:status="{ row }">
							<el-tag :type="getStatusType(row.status)" size="small">
								{{ getStatusText(row.status) }}
							</el-tag>
						</template>

					<!-- 产品类型列 -->
					<template v-slot:product_type="{ row }">
						<el-tag :type="row.product_type === 'software' ? 'primary' : 'success'" size="small">
							{{ getProductTypeText(row.product_type) }}
						</el-tag>
					</template>

					<!-- 下载地址列 -->
					<template v-slot:download_url="{ row }">
						<div class="download-url-cell">
							<div v-if="row.download_url" style="display: flex; gap: 5px;">
								<el-button 
									type="text" 
									icon="el-icon-download" 
									size="mini"
									@click="openDownloadUrl(row.download_url)"
								>
									下载
								</el-button>
								<el-button 
									type="text" 
									icon="el-icon-copy-document" 
									size="mini"
									@click="copyCode(row.download_url)"
								>
									复制链接
								</el-button>
							</div>
							<span v-else style="color: #909399;">-</span>
							<div v-if="row.latest_version" style="margin-top: 5px;">
								<el-tag size="mini" type="success">{{ row.latest_version }}</el-tag>
								<el-button 
									v-if="row.version_logs && row.version_logs.length > 0"
									type="text" 
									size="mini"
									@click="showCardVersionLogs(row)"
									style="padding: 0 5px;"
								>
									查看更新
								</el-button>
							</div>
						</div>
					</template>
				</vk-data-table>
				</el-tab-pane>

				<!-- 我的产品 -->
				<el-tab-pane label="我的产品" name="products">
					<div v-if="productList.length === 0" class="empty-state">
						<i class="el-icon-box" style="font-size: 64px; color: #DCDFE6;"></i>
						<p style="color: #909399; margin-top: 16px;">暂无可用产品</p>
					</div>
					<div v-else class="product-grid">
						<div 
							v-for="product in productList" 
							:key="product._id"
							class="product-card-wrapper"
							:class="{ 'is-flipped': flippedCards[product._id] }"
							@click="toggleCardFlip(product._id)"
						>
							<!-- 卡片正面 -->
							<el-card class="product-card product-card-front" shadow="hover">
							<div class="product-image">
								<img 
									v-if="hasProductImage(product)" 
									:src="getProductImageUrl(product)" 
									@error="onImageError"
								>
								<div v-else class="default-image-placeholder">
									<i class="el-icon-picture-outline"></i>
									<span>{{ product.product_name }}</span>
								</div>
							</div>
							<div class="product-header">
								<div class="product-title">
									<i class="el-icon-goods"></i>
									<span>{{ product.product_name }}</span>
								</div>
							<div class="product-tags">
								<el-tag v-if="isCustomProduct(product)" type="warning" size="mini" style="margin-right: 5px;">
									<i class="el-icon-star-on"></i> 定制 3折
								</el-tag>
								<el-tag v-if="product.status === 1" type="success" size="small">已上架</el-tag>
								<el-tag v-else type="info" size="small">已下架</el-tag>
							</div>
							</div>
							
							<div class="product-info">
								<div class="info-item">
									<span class="label">产品ID：</span>
									<span class="value">{{ product.product_id }}</span>
								</div>
								<div class="info-item">
									<span class="label">产品类型：</span>
									<span class="value">{{ getProductTypeText(product.product_type) }}</span>
								</div>
								<div class="info-item">
									<span class="label">收费标准：</span>
									<span class="value price">
										{{ product.price_points }}积分 / {{ product.price_months }}月 / {{ product.price_machines }}机器
									</span>
								</div>
								<div v-if="product.description" class="info-item description">
									<span class="label">描述：</span>
									<span class="value">{{ product.description }}</span>
								</div>
								<div v-if="product.remark" class="info-item description">
									<span class="label">备注：</span>
									<span class="value">{{ product.remark }}</span>
								</div>
							</div>

						<div class="product-footer">
							<div class="click-tip">
								<i class="el-icon-refresh-left"></i>
								点击卡片查看更多
							</div>
						</div>
							</el-card>

							<!-- 卡片背面 -->
							<el-card class="product-card product-card-back" shadow="hover">
								<div class="back-header">
									<h3>{{ product.product_name }}</h3>
									<div class="click-tip-back">
										<i class="el-icon-refresh-right"></i>
										点击返回
									</div>
								</div>

								<div class="back-content">
									<!-- 版本更新日志 -->
									<div v-if="product.version_logs && product.version_logs.length > 0" class="info-section">
										<div class="section-title">
											<i class="el-icon-document"></i>
											版本更新日志
										</div>
										<div class="version-list">
											<div 
												v-for="(log, index) in product.version_logs.slice(0, 3)" 
												:key="index"
												class="version-item-mini"
											>
												<div class="version-header-mini">
													<el-tag size="mini" :type="index === 0 ? 'success' : ''">
														{{ log.version }}
													</el-tag>
													<span class="version-date-mini">{{ formatDate(log.date) }}</span>
												</div>
												<div class="version-log-mini" v-html="formatLogPreview(log.log)"></div>
											</div>
											<el-button 
												v-if="product.version_logs.length > 3"
												type="text" 
												size="small"
												@click.stop="showVersionLogs(product)"
												style="margin-top: 10px;"
											>
												查看全部 {{ product.version_logs.length }} 个版本 →
											</el-button>
										</div>
									</div>

									<!-- 下载地址 -->
									<div v-if="product.download_url" class="info-section">
										<div class="section-title">
											<i class="el-icon-download"></i>
											下载地址
										</div>
										<div class="section-content">
											<el-input 
												:value="product.download_url" 
												readonly
												size="small"
												@click.native.stop
											>
												<el-button 
													slot="append" 
													icon="el-icon-copy-document"
													@click.stop="copyCode(product.download_url)"
												>
													复制
												</el-button>
											</el-input>
											<el-button 
												type="primary" 
												size="small" 
												icon="el-icon-download"
												@click.stop="openDownloadUrl(product.download_url)"
												style="margin-top: 10px; width: 100%;"
											>
												立即下载
											</el-button>
										</div>
									</div>

									<!-- 空状态提示 -->
									<div v-if="(!product.version_logs || product.version_logs.length === 0) && !product.download_url" class="empty-tips">
										<i class="el-icon-info"></i>
										<p>暂无更新日志和下载地址</p>
									</div>
								</div>
							</el-card>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!-- 版本更新日志弹窗 -->
		<el-dialog
			:visible.sync="versionLogDialog.show"
			:title="versionLogDialog.title"
			width="600px"
			class="version-log-dialog"
		>
			<div class="version-timeline">
				<div 
					v-for="(log, index) in versionLogDialog.logs" 
					:key="index"
					class="version-item"
					:class="{ 'is-latest': index === 0 }"
				>
					<div class="version-header">
						<div class="version-info">
							<span class="version-number">{{ log.version }}</span>
							<el-tag v-if="index === 0" type="success" size="mini" effect="dark">最新版本</el-tag>
						</div>
						<div class="version-date">{{ formatDate(log.date) }}</div>
					</div>
					<div class="version-content">
						<div class="update-log" v-html="formatLog(log.log)"></div>
					</div>
					<div v-if="log.download_url" class="version-download">
						<el-button 
							type="primary" 
							size="small" 
							icon="el-icon-download"
							@click="openDownloadUrl(log.download_url)"
						>
							下载 {{ log.version }}
						</el-button>
					</div>
				</div>
			</div>
		</el-dialog>
	</view>
</template>

<script>
let that;
let vk = uni.vk;

// 状态类型映射
const statusTypeMap = {
	0: "success",  // 未使用
	1: "info",     // 已使用
	2: "danger",   // 已过期
	3: "warning"   // 已禁用
};

// 状态文本映射
const statusTextMap = {
	0: "未使用",
	1: "已使用",
	2: "已过期",
	3: "已禁用"
};

export default {
	data() {
		return {
			activeTab: 'points',
			userInfo: {},
			pointsInfo: {
				available_points: 0,
				total_points: 0,
				consumed_points: 0
			},
			machineStats: {
				total_machines: 0
			},
			productList: [], // 产品列表
			flippedCards: {}, // 记录哪些卡片被翻转了
			// 版本日志弹窗
			versionLogDialog: {
				show: false,
				title: '',
				logs: []
			},
			// 积分流水表格
			pointsTable: {
				action: "admin/points/kh/getLog",
				columns: [
					{ key: "type", title: "类型", type: "text", width: 100, slot: true },
					{ key: "amount", title: "积分数量", type: "text", width: 120, slot: true },
					{ key: "balance", title: "余额", type: "text", width: 120 },
					{ key: "source", title: "来源", type: "text", width: 120, slot: true },
					{ key: "remark", title: "说明", type: "text", minWidth: 200 },
					{ key: "_add_time", title: "时间", type: "time", width: 180 }
				]
			},
			// 我的卡密表格
			cardsTable: {
				action: "admin/card/kh/getMyCards",
				columns: [
					{ key: "card_code", title: "卡密", type: "text", width: 250, slot: true },
					{ key: "product_name", title: "产品名称", type: "text", width: 150 },
					{ key: "product_type", title: "产品类型", type: "text", width: 120, slot: true },
					{ key: "download_url", title: "下载地址", type: "text", width: 200, slot: true },
					{ key: "status", title: "状态", type: "text", width: 100, slot: true },
					{ key: "_add_time", title: "购买时间", type: "time", width: 180 },
					{ key: "used_time", title: "开始使用时间", type: "time", width: 180, defaultValue: "-" },
					{ key: "expire_time", title: "卡密过期时间", type: "time", width: 180, defaultValue: "-" }
				]
			}
		};
	},
	onLoad() {
		that = this;
		vk = that.vk;
		that.init();
	},
	methods: {
		// 初始化
		init() {
			that.loadUserInfo();
			that.loadPointsInfo();
			that.loadMachineStats();
			that.loadProductList();
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
		// 加载积分信息
		loadPointsInfo() {
			vk.callFunction({
				url: "admin/points/kh/getBalance",
				success: (data) => {
					that.pointsInfo = data.data || {
						available_points: 0,
						total_points: 0,
						consumed_points: 0
					};
				}
			});
		},
		// 加载产品列表
		loadProductList() {
			vk.callFunction({
				url: "admin/product/kh/getList",
				success: (data) => {
					that.productList = data.data || [];
				}
			});
		},
		// 加载机器统计
		loadMachineStats() {
			vk.callFunction({
				url: "admin/card/kh/getMachineStats",
				success: (data) => {
					that.machineStats = data.data || {
						total_machines: 0
					};
				},
				fail: (err) => {
					console.error('加载机器统计失败：', err);
					that.machineStats = { total_machines: 0 };
				}
			});
		},
		// 刷新统计数据
		refreshStats() {
			that.loadPointsInfo();
			that.loadMachineStats();
			vk.toast("刷新成功");
		},
		// 联系客服(跳转到工单系统)
		contactCustomerService() {
			vk.navigateTo('/pages/ticket/list');
		},
		// 标签页切换
		handleTabClick(tab) {
			if (tab.name === 'points') {
				that.$refs.pointsTable && that.$refs.pointsTable.refresh();
			} else if (tab.name === 'cards') {
				that.$refs.cardsTable && that.$refs.cardsTable.refresh();
			} else if (tab.name === 'products') {
				that.loadProductList();
			}
		},
		// 复制卡密
		copyCode(code) {
			uni.setClipboardData({
				data: code,
				success: () => vk.toast("复制成功")
			});
		},
		// 获取来源类型
		getSourceType(source) {
			const typeMap = {
				'recharge': 'success',
				'card_buy': 'warning',
				'card_renew': 'warning',
				'buy_product': 'success',
				'reward': 'success',
				'refund': 'info'
			};
			return typeMap[source] || '';
		},
		// 获取来源文本
		getSourceText(source) {
			const textMap = {
				'recharge': '充值',
				'card_buy': '购买卡密',
				'card_renew': '续费卡密',
				'buy_product': '购买产品',
				'reward': '奖励',
				'refund': '退款'
			};
			return textMap[source] || source;
		},
		// 获取状态类型
		getStatusType(status) {
			return statusTypeMap[status] || "info";
		},
		// 获取状态文本
		getStatusText(status) {
			return statusTextMap[status] || "未知";
		},
		// 获取产品类型文本
		getProductTypeText(type) {
			const typeMap = {
				'software': '软件',
				'plugin': '浏览器插件',
				'normal': '通用'
			};
			return typeMap[type] || type;
		},
		// 去购买卡密
		goBuyCard(product) {
			uni.navigateTo({
				url: '/pages/card-manage/card-manage'
			});
		},
		// 切换卡片翻转状态
		toggleCardFlip(productId) {
			that.$set(that.flippedCards, productId, !that.flippedCards[productId]);
		},
		// 判断是否是定制产品
		isCustomProduct(product) {
			if (!product.custom_user_ids || !Array.isArray(product.custom_user_ids)) {
				return false;
			}
			// 如果包含 "all"，则不是定制产品
			if (product.custom_user_ids.includes('all')) {
				return false;
			}
			// 如果包含当前用户ID，则是定制产品
			return product.custom_user_ids.includes(that.userInfo._id);
		},
		// 判断是否有产品图
		hasProductImage(product) {
			if (!product.product_image) return false;
			
			// 字符串格式
			if (typeof product.product_image === 'string' && product.product_image.trim()) {
				return true;
			}
			
			// 对象格式
			if (typeof product.product_image === 'object') {
				if (product.product_image.url) return true;
				if (product.product_image[0]) return true;
			}
			
			return false;
		},
		// 获取产品图片URL
		getProductImageUrl(product) {
			if (!product.product_image) return '';
			
			// 字符串格式
			if (typeof product.product_image === 'string') {
				return product.product_image;
			}
			
			// 对象格式
			if (typeof product.product_image === 'object') {
				if (product.product_image.url) return product.product_image.url;
				if (product.product_image[0] && typeof product.product_image[0] === 'string') {
					return product.product_image[0];
				}
				if (product.product_image[0] && product.product_image[0].url) {
					return product.product_image[0].url;
				}
			}
			
			return '';
		},
		// 图片加载失败处理
		onImageError(e) {
			// 图片加载失败时隐藏图片，显示默认占位符
			e.target.style.display = 'none';
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
		},
		// 格式化日期
		formatDate(timestamp) {
			if (!timestamp) return '-';
			return vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm');
		},
		// 格式化更新日志
		formatLog(log) {
			if (!log) return '';
			
			// 将文本转换为HTML
			let html = log
				.split('\n')
				.map(line => {
					line = line.trim();
					if (!line) return '';
					
					// 识别特殊标记并添加图标
					if (line.match(/^[•\-\*]\s*/)) {
						// 移除开头的 •、- 或 *
						line = line.replace(/^[•\-\*]\s*/, '');
						
						// 根据关键词添加图标
						if (line.match(/^(新增|添加|增加)/)) {
							return `<li class="feature">✨ ${line}</li>`;
						} else if (line.match(/^(修复|修正|解决)/)) {
							return `<li class="bugfix">🐛 ${line}</li>`;
						} else if (line.match(/^(优化|改进|提升)/)) {
							return `<li class="optimization">⚡ ${line}</li>`;
						} else if (line.match(/^(删除|移除|废弃)/)) {
							return `<li class="deprecated">🗑️ ${line}</li>`;
						} else {
							return `<li>${line}</li>`;
						}
					}
					
					return `<p>${line}</p>`;
				})
				.filter(line => line)
				.join('');
			
			return `<ul class="update-list">${html}</ul>`;
		},
		// 格式化更新日志预览（用于卡片背面）
		formatLogPreview(log) {
			if (!log) return '';
			
			// 获取前3行，简化显示
			let lines = log.split('\n').filter(line => line.trim()).slice(0, 3);
			
			let html = lines.map(line => {
				line = line.trim();
				// 移除开头的标记
				line = line.replace(/^[•\-\*]\s*/, '');
				
				// 添加简化的图标
				if (line.match(/^(新增|添加|增加)/)) {
					return `<div class="log-item">✨ ${line}</div>`;
				} else if (line.match(/^(修复|修正|解决)/)) {
					return `<div class="log-item">🐛 ${line}</div>`;
				} else if (line.match(/^(优化|改进|提升)/)) {
					return `<div class="log-item">⚡ ${line}</div>`;
				} else {
					return `<div class="log-item">${line}</div>`;
				}
			}).join('');
			
			return html;
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

/* 用户信息卡片 */
.user-info-card {
	margin-bottom: 20px;
	flex-shrink: 0;

	.user-header {
		display: flex;
		align-items: center;
		gap: 20px;

		.user-details {
			.user-name {
				font-size: 24px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 8px;
			}

			.user-id {
				font-size: 14px;
				color: #909399;
			}
		}

		.user-points-inline {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 15px;
			margin-left: 60px;
			padding-right: 20px;

			.points-stats-inline {
				display: flex;
				gap: 50px;
				padding: 10px 30px;
				background: #f5f7fa;
				border-radius: 8px;

				.points-item-inline {
					text-align: center;
					min-width: 100px;

					.points-label-inline {
						font-size: 12px;
						color: #909399;
						margin-bottom: 5px;
					}

					.points-value-inline {
						font-size: 24px;
						font-weight: bold;
						color: #303133;

						&.primary {
							color: #409EFF;
						}

						&.warning {
							color: #E6A23C;
						}
					}
				}
			}
		}
	}
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
.product-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 20px;
	padding: 10px;
}

/* 卡片翻转容器 */
.product-card-wrapper {
	perspective: 1000px;
	height: 520px;
	position: relative;
	cursor: pointer;

	.product-card {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
		transform-style: preserve-3d;
	}

	.product-card-front {
		transform: rotateY(0deg);
		z-index: 2;
	}

	.product-card-back {
		transform: rotateY(180deg);
		z-index: 1;
	}

	&.is-flipped {
		.product-card-front {
			transform: rotateY(-180deg);
			z-index: 1;
		}

		.product-card-back {
			transform: rotateY(0deg);
			z-index: 2;
		}
	}
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
}

/* 产品卡片 */
.product-card {
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-4px);
	}

	.product-image {
		width: 100%;
		height: 180px;
		overflow: hidden;
		margin-bottom: 16px;
		border-radius: 4px;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.default-image-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #fff;
			text-align: center;
			padding: 20px;

			i {
				font-size: 48px;
				margin-bottom: 12px;
				opacity: 0.8;
			}

			span {
				font-size: 16px;
				font-weight: 500;
				opacity: 0.9;
			}
		}
	}

	.product-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #EBEEF5;

		.product-title {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 16px;
			font-weight: bold;
			color: #303133;

			i {
				font-size: 20px;
				color: #409EFF;
			}
		}

		.product-tags {
			display: flex;
			align-items: center;
			gap: 5px;
		}
	}

	.product-info {
		margin-bottom: 16px;

		.info-item {
			display: flex;
			margin-bottom: 8px;
			font-size: 14px;

			.label {
				color: #909399;
				min-width: 80px;
				flex-shrink: 0;
			}

			.value {
				color: #606266;
				flex: 1;

				&.price {
					color: #E6A23C;
					font-weight: bold;
				}
			}

			&.description {
				flex-direction: column;

				.value {
					margin-top: 4px;
					line-height: 1.6;
				}
			}
		}
	}

	.product-footer {
		display: flex;
		justify-content: center;
		padding-top: 12px;
		border-top: 1px solid #EBEEF5;

		.click-tip {
			display: flex;
			align-items: center;
			gap: 5px;
			color: #909399;
			font-size: 13px;

			i {
				font-size: 16px;
			}
		}
	}
}

/* 卡片背面样式 */
.product-card-back {
	display: flex;
	flex-direction: column;
	overflow: hidden;

	::v-deep .el-card__body {
		padding: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.back-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		color: #fff;

		h3 {
			margin: 0;
			font-size: 18px;
			font-weight: bold;
		}

		.click-tip-back {
			display: flex;
			align-items: center;
			gap: 5px;
			font-size: 13px;
			opacity: 0.9;

			i {
				font-size: 16px;
			}
		}
	}

	.back-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;

		.info-section {
			margin-bottom: 20px;

			&:last-child {
				margin-bottom: 0;
			}

			.section-title {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 14px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 12px;
				padding-bottom: 8px;
				border-bottom: 2px solid #409EFF;

				i {
					color: #409EFF;
					font-size: 16px;
				}
			}

			.section-content {
				padding-left: 4px;
			}
		}

		.version-list {
			.version-item-mini {
				padding: 12px;
				margin-bottom: 10px;
				background: #f5f7fa;
				border-radius: 6px;
				border-left: 3px solid #409EFF;

				&:last-child {
					margin-bottom: 0;
				}

				.version-header-mini {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 8px;

					.version-date-mini {
						font-size: 12px;
						color: #909399;
					}
				}

				.version-log-mini {
					font-size: 13px;
					color: #606266;
					line-height: 1.6;

					::v-deep .log-item {
						margin-bottom: 4px;
						
						&:last-child {
							margin-bottom: 0;
						}
					}
				}
			}
		}

		.empty-tips {
			text-align: center;
			padding: 40px 20px;
			color: #909399;

			i {
				font-size: 48px;
				margin-bottom: 12px;
				display: block;
			}

			p {
				margin: 0;
				font-size: 14px;
			}
		}

		.detail-item {
			display: flex;
			margin-bottom: 10px;
			font-size: 13px;

			&.full {
				flex-direction: column;
			}

			.detail-label {
				color: #909399;
				min-width: 80px;
				flex-shrink: 0;
			}

			.detail-value {
				color: #606266;
				flex: 1;

				&.price {
					color: #E6A23C;
					font-weight: bold;
				}
			}
		}
	}
}

/* 下载地址单元格样式 */
.download-url-cell {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

/* 卡密代码单元格样式 */
.card-code-cell {
	display: flex;
	align-items: center;

	.code-text {
		font-family: 'Courier New', monospace;
		color: #303133;
	}
}

/* 版本更新日志弹窗样式 */
::v-deep .version-log-dialog {
	.el-dialog__body {
		padding: 0 20px 20px;
		max-height: 60vh;
		overflow-y: auto;
	}
}

.version-timeline {
	.version-item {
		position: relative;
		padding: 20px;
		margin-bottom: 20px;
		background: #f5f7fa;
		border-radius: 8px;
		border-left: 4px solid #DCDFE6;
		
		&.is-latest {
			background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
			border-left-color: #67C23A;
		}

		.version-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
			padding-bottom: 10px;
			border-bottom: 1px solid #E4E7ED;

			.version-info {
				display: flex;
				align-items: center;
				gap: 10px;

				.version-number {
					font-size: 18px;
					font-weight: bold;
					color: #303133;
				}
			}

			.version-date {
				font-size: 13px;
				color: #909399;
			}
		}

		.version-content {
			margin-bottom: 15px;

			::v-deep .update-log {
				.update-list {
					list-style: none;
					padding: 0;
					margin: 0;

					li {
						padding: 8px 0;
						line-height: 1.6;
						color: #606266;
						font-size: 14px;

						&.feature {
							color: #409EFF;
						}

						&.bugfix {
							color: #F56C6C;
						}

						&.optimization {
							color: #E6A23C;
						}

						&.deprecated {
							color: #909399;
							text-decoration: line-through;
						}
					}

					p {
						margin: 8px 0;
						line-height: 1.6;
						color: #606266;
					}
				}
			}
		}

		.version-download {
			text-align: right;
		}
	}
}
</style>

