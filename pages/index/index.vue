<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 欢迎区域 -->
		<view class="welcome-section">
			<view class="welcome-card animate-fade-in">
				<h1 class="welcome-title">
					<span class="gradient-text">欢迎回来</span>
					<span class="wave-emoji">👋</span>
				</h1>
				<p class="welcome-subtitle">今天也是充满活力的一天！</p>
			</view>
		</view>

		<!-- 快捷操作区域 -->
		<view class="quick-actions">
			<h2 class="section-title">
				<i class="el-icon-s-operation"></i>
				快捷操作
			</h2>
			<view class="action-grid">
				<view v-for="(action, index) in quickActions" :key="index" class="action-card ripple-effect"
					@click="handleQuickAction(action.path)">
					<view class="action-icon-bg" :style="{ background: action.gradient }">
						<i :class="action.icon" class="action-icon"></i>
					</view>
					<view class="action-label">{{ action.label }}</view>
				</view>
			</view>
		</view>

		<!-- 动态背景效果 -->
		<view class="animated-bg">
			<view v-for="i in 8" :key="i" class="floating-circle" :style="{
				left: Math.random() * 100 + '%',
				top: Math.random() * 100 + '%',
				animationDelay: Math.random() * 5 + 's',
				animationDuration: (5 + Math.random() * 10) + 's'
			}"></view>
		</view>

		<!-- 右下角公告弹窗开始 -->
		<transition name="slide-up">
			<view class="announcement-popup" v-if="dialog.show">
				<view class="popup-header">
					<span class="popup-title">🎉 系统公告</span>
					<i class="el-icon-close popup-close" @click="dialog.show = false"></i>
				</view>
				<view class="popup-body">
					<p class="popup-main-title">{{ announcement.title }}</p>
					<p class="popup-subtitle">{{ announcement.subtitle }}</p>

					<view class="popup-changelog" v-if="changelog && changelog.length > 0">
						<view v-for="(log, index) in changelog" :key="index" class="popup-log-item">
							<view class="popup-log-header">
								<span class="log-product" v-if="log.product_name">{{ log.product_name }}</span>
								<span class="log-version" v-if="log.version">v{{ log.version }}</span>
								<span class="log-date">{{ log.date }}</span>
								<span class="log-detail-btn" @click="goToProductList">
									<i class="el-icon-right"></i> 查看详情
								</span>
							</view>
							<ul class="popup-log-content">
								<li v-for="(item, itemIndex) in log.items" :key="itemIndex">{{ item }}</li>
							</ul>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<el-button size="small" @click="handleDontShowToday">今日不再提示</el-button>
					<el-button type="primary" size="small" @click="dialog.show = false">我知道了</el-button>
				</view>
			</view>
		</transition>
		<!-- 右下角公告弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
let vk = uni.vk; // vk实例

export default {
	data() {
		// 页面数据变量
		return {
			// init请求返回的数据
			data: {},
			// 表单请求数据
			form1: {},
			dialog: {
				show: false
			},
			// 更新日志
			changelog: [],
			// 公告配置
			announcement: {
				enabled: true,
				title: '欢迎来到AI自动化商务定制系统！',
				subtitle: '本系统仅用于定制用户内测使用，公开版敬请期待~'
			},
			// 快捷操作
			quickActions: [
				{
					label: '卡密管理',
					icon: 'el-icon-tickets',
					gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					path: '/pages/card-manage/card-manage'
				},
				{
					label: '定制插件',
					icon: 'el-icon-link',
					gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
					path: '/pages/docs/crx-extensions/crx-extensions'
				},
				{
					label: '定制AI工具',
					icon: 'el-icon-magic-stick',
					gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
					path: '/pages/docs/ai-tools/ai-tools'
				},
				{
					label: '定制软件',
					icon: 'el-icon-monitor',
					gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
					path: '/pages/docs/software/software'
				},
				{
					label: '定制多维表',
					icon: 'el-icon-data-board',
					gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
					path: '/pages/docs/table/table'
				},
				{
					label: '更多需求',
					icon: 'el-icon-plus',
					gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
					path: 'https://qm.qq.com/q/4x1zI4LkmI'
				}
			]
		}
	},
	// 监听 - 页面每次【加载时】执行(如：前进)
	onLoad(options = {}) {
		vk = this.vk;
		this.options = options;
		this.init(options);
		this.loadAnnouncement();
	},
	// 监听 - 页面【首次渲染完成时】执行
	onReady() { },
	// 监听 - 页面每次【显示时】执行
	onShow() { },
	// 监听 - 页面每次【隐藏时】执行
	onHide() { },
	// 函数
	methods: {
		// 页面数据初始化函数
		init(options) {
			// 这里可以加载实际的统计数据
		},
		// 加载公告数据
		loadAnnouncement() {
			vk.callFunction({
				url: 'client/pub/getAnnouncement',
				success: (res) => {
					if (res.data) {
						this.announcement = res.data;
						// 解析更新日志（将字符串转为数组）
						if (res.data.changelog && Array.isArray(res.data.changelog)) {
							this.changelog = res.data.changelog.map(log => ({
								version: log.version,
								date: log.date,
								product_id: log.product_id || '',
								product_name: log.product_name || '',
								download_url: log.download_url || '',
								items: log.items ? log.items.split('\n').filter(item => item.trim()) : []
							}));
						}
					}
					// 加载完成后检查是否显示弹窗
					this.checkDailyDialog();
				},
				fail: () => {
					// 加载失败也检查弹窗（使用默认数据）
					this.checkDailyDialog();
				}
			});
		},
		// 检查是否需要显示每日弹窗
		checkDailyDialog() {
			// 检查公告是否启用
			if (this.announcement.enabled === false) {
				return;
			}
			const today = this.getTodayString();

			// 检查是否选择了"今日不再提示"
			const dontShowToday = uni.getStorageSync('welcome_dialog_dont_show_today');
			if (dontShowToday === today) {
				// 今日已选择不再提示，不显示弹窗
				return;
			}

			// 检查今天是否已经显示过
			const lastShowDate = uni.getStorageSync('welcome_dialog_last_show');

			if (lastShowDate !== today) {
				this.dialog.show = true;
				uni.setStorageSync('welcome_dialog_last_show', today);
			}
		},
		// 获取今天的日期字符串
		getTodayString() {
			return new Date().toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			}).replace(/\//g, '-');
		},
		// 处理"今日不再提示"
		handleDontShowToday() {
			const today = this.getTodayString();
			uni.setStorageSync('welcome_dialog_dont_show_today', today);
			vk.toast('今日将不再显示此弹窗');
			this.dialog.show = false;
		},
		// 快捷操作点击
		handleQuickAction(path) {
			if (!path || path === '#' || path === '') {
				vk.toast('功能开发中...');
				return;
			}
			// 判断是否为外部链接
			if (path.startsWith('http://') || path.startsWith('https://')) {
				window.open(path, '_blank');
			} else {
				vk.navigateTo(path);
			}
		},
		pageTo(path) {
			vk.navigateTo(path);
		},
		// 跳转产品列表页
		goToProductList() {
			this.dialog.show = false;
			vk.navigateTo('/pages/my-products/my-products');
		}
	},
	// 计算属性
	computed: {}
}
</script>
<style lang="scss" scoped>
.page-body {
	position: relative;
	min-height: calc(100vh - 100px);
	padding: 30px;
	overflow: hidden;
	background: #f5f7fa;
}

/* 欢迎区域 */
.welcome-section {
	margin-bottom: 50px;
	position: relative;
	z-index: 1;
}

.welcome-card {
	text-align: center;
	padding: 60px 20px;
	background: linear-gradient(135deg, #4facfe 55%, #e1e8f2 100%);
	border-radius: 20px;
	box-shadow: 0 10px 40px rgba(79, 172, 254, 0.3);
	position: relative;
	overflow: hidden;
}

.welcome-title {
	margin: 0 0 10px 0;
	font-size: 48px;
	font-weight: 700;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
}

.gradient-text {
	background: linear-gradient(90deg, #fff 0%, #f0f0f0 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.wave-emoji {
	display: inline-block;
	animation: wave 1.5s ease-in-out infinite;
	transform-origin: 70% 70%;
}

.welcome-subtitle {
	margin: 0;
	font-size: 20px;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 300;
}

/* 快捷操作区域 */
.quick-actions {
	margin-bottom: 40px;
	position: relative;
	z-index: 1;
}

.section-title {
	font-size: 20px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 24px;
	display: flex;
	align-items: center;
	gap: 10px;

	i {
		font-size: 24px;
		color: #667eea;
	}
}

.action-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 20px;
}

.action-card {
	background: white;
	border-radius: 16px;
	padding: 28px 20px;
	text-align: center;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	position: relative;

	&:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

		.action-icon-bg {
			transform: scale(1.1) rotate(10deg);
		}
	}

	&:active {
		transform: translateY(-6px) scale(0.98);
	}
}

.action-icon-bg {
	width: 64px;
	height: 64px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 16px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-icon {
	font-size: 28px;
	color: white;
}

.action-label {
	font-size: 15px;
	font-weight: 500;
	color: #2c3e50;
}

/* 动态背景 */
.animated-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	z-index: 0;
	pointer-events: none;
}

.floating-circle {
	position: absolute;
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
	animation: float 10s ease-in-out infinite;
	box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

/* 弹窗样式 */
.dialog-content {
	padding: 20px 0;
	text-align: center;
}

.dialog-text {
	font-size: 22px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 12px;
}

.dialog-subtext {
	font-size: 16px;
	color: #8492a6;
	margin: 0 0 20px 0;
}

/* 更新日志样式 */
.changelog-section {
	margin-top: 20px;
	text-align: left;
	max-height: 400px;
	overflow-y: auto;
}

.changelog-title {
	font-size: 20px;
	font-weight: 600;
	color: #2c3e50;
	margin: 0 0 15px 0;
	padding-bottom: 10px;
	border-bottom: 2px solid #e4e7ed;
}

.changelog-list {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.changelog-item {
	background: #f8f9fa;
	border-radius: 8px;
	padding: 15px;
	border-left: 3px solid #409eff;
	transition: all 0.3s;

	&:hover {
		background: #f0f2f5;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
}

.changelog-header {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	gap: 10px;
	flex-wrap: wrap;
}

.changelog-product {
	font-size: 14px;
	font-weight: 600;
	color: #e6a23c;
}

.changelog-version {
	font-size: 16px;
	font-weight: 600;
	color: #409eff;
}

.changelog-date {
	font-size: 14px;
	color: #909399;
}

.changelog-download {
	font-size: 13px;
	color: #fff;
	background: #67c23a;
	padding: 4px 12px;
	border-radius: 4px;
	text-decoration: none;
	margin-left: auto;
	&:hover {
		background: #85ce61;
	}
}

.changelog-content {
	margin: 0;
	padding-left: 20px;
	list-style: none;
}

.changelog-item-text {
	font-size: 15px;
	color: #606266;
	line-height: 1.8;
	margin-bottom: 8px;
	position: relative;

	&::before {
		content: '•';
		position: absolute;
		left: -15px;
		color: #409eff;
		font-weight: bold;
	}

	&:last-child {
		margin-bottom: 0;
	}
}

/* 弹窗底部按钮样式 */
.dialog-footer-buttons {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
}

/* 动画效果 */
@keyframes wave {

	0%,
	100% {
		transform: rotate(0deg);
	}

	25% {
		transform: rotate(20deg);
	}

	75% {
		transform: rotate(-15deg);
	}
}

@keyframes float {

	0%,
	100% {
		transform: translateY(0) translateX(0) scale(1);
		opacity: 0.3;
	}

	25% {
		transform: translateY(-100px) translateX(100px) scale(1.2);
		opacity: 0.5;
	}

	50% {
		transform: translateY(-200px) translateX(-100px) scale(0.8);
		opacity: 0.2;
	}

	75% {
		transform: translateY(-100px) translateX(-150px) scale(1.1);
		opacity: 0.4;
	}
}

.animate-fade-in {
	animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-slide-up {
	animation: slideUp 0.6s ease-out backwards;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 波纹效果 */
.ripple-effect {
	position: relative;
	overflow: hidden;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		transform: translate(-50%, -50%);
		transition: width 0.6s, height 0.6s;
	}

	&:active::after {
		width: 300px;
		height: 300px;
	}
}

/* 右下角公告弹窗样式 */
.announcement-popup {
	position: fixed;
	right: 20px;
	bottom: 20px;
	width: 420px;
	max-height: 500px;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14px 18px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
}

.popup-title {
	font-size: 16px;
	font-weight: 600;
}

.popup-close {
	cursor: pointer;
	font-size: 18px;
	opacity: 0.8;
	transition: opacity 0.2s;
	&:hover {
		opacity: 1;
	}
}

.popup-body {
	padding: 16px 18px;
	overflow-y: auto;
	flex: 1;
	max-height: 350px;
}

.popup-main-title {
	font-size: 15px;
	font-weight: 600;
	color: #2c3e50;
	margin: 0 0 8px 0;
	line-height: 1.4;
}

.popup-subtitle {
	font-size: 13px;
	color: #8492a6;
	margin: 0 0 16px 0;
}

.popup-changelog {
	border-top: 1px solid #ebeef5;
	padding-top: 12px;
}

.popup-log-item {
	background: #f8f9fa;
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 10px;
	border-left: 3px solid #409eff;
	&:last-child {
		margin-bottom: 0;
	}
}

.popup-log-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
	flex-wrap: wrap;
}

.log-product {
	font-size: 13px;
	font-weight: 600;
	color: #f56c6c;
}

.log-version {
	font-size: 12px;
	color: #409eff;
	background: rgba(64, 158, 255, 0.1);
	padding: 2px 8px;
	border-radius: 4px;
}

.log-date {
	font-size: 12px;
	color: #909399;
}

.log-detail-btn {
	font-size: 12px;
	color: #fff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 3px 10px;
	border-radius: 4px;
	cursor: pointer;
	margin-left: auto;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	gap: 4px;
	&:hover {
		transform: translateX(2px);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
	}
}

.popup-log-content {
	margin: 0;
	padding-left: 16px;
	list-style: none;
	li {
		font-size: 13px;
		color: #606266;
		line-height: 1.6;
		margin-bottom: 4px;
		position: relative;
		&::before {
			content: '•';
			position: absolute;
			left: -12px;
			color: #409eff;
		}
		&:last-child {
			margin-bottom: 0;
		}
	}
}

.popup-footer {
	padding: 12px 18px;
	border-top: 1px solid #ebeef5;
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	background: #fafafa;
}

/* 弹窗动画 */
.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
	opacity: 0;
	transform: translateY(20px);
}

/* 响应式布局 */
@media (max-width: 768px) {
	.welcome-title {
		font-size: 32px;
	}

	.action-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	
	.announcement-popup {
		right: 10px;
		bottom: 10px;
		left: 10px;
		width: auto;
		max-height: 60vh;
	}
}
</style>