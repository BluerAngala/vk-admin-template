<template>
	<view class="points-shop">
		<!-- 页面标题 -->
		<view class="page-header">
			<div class="header-content">
				<h2>购买积分</h2>
				<p>请按需选择合适的积分套餐，开启您的会员之旅！</p>
			</div>
		</view>

		<!-- 当前积分显示 -->
		<el-card class="current-points-card">
			<div class="current-points">
				<div class="points-icon">
					<i class="el-icon-coin"></i>
				</div>
				<div class="points-info">
					<div class="points-label">当前可用积分</div>
					<div class="points-value">{{ userPoints || 0 }}</div>
				</div>
				<el-button type="text" @click="refreshPoints" icon="el-icon-refresh">刷新</el-button>
				<el-button type="text" @click="showServiceQRCode" icon="el-icon-service" style="margin-left: 10px;">遇到问题？联系客服</el-button>
			</div>
		</el-card>

		<!-- 支付未到账自助修复 -->
		<el-card class="repair-card">
			<div class="repair-inline">
				<i class="el-icon-warning-outline"></i>
				<span class="repair-label">支付成功但积分未到账？输入订单号自动核查补发</span>
				<el-input
					v-model="repairTradeNo"
					placeholder="输入订单号"
					size="small"
					clearable
					class="repair-input"
					@keyup.enter.native="submitRepair"
				/>
				<el-button
					type="warning"
					size="small"
					:loading="repairLoading"
					:disabled="repairLoading"
					@click="submitRepair"
				>{{ repairLoading ? '查询中...' : '立即核查' }}</el-button>
			</div>
			<div class="repair-result" v-if="repairResult">
				<el-alert :title="repairResult.title" :type="repairResult.type" show-icon :closable="false">
					<template slot="default">
						<div v-if="repairResult.order" class="repair-order-info">
							<p>订单号：{{ repairResult.order.trade_no }}</p>
							<p>套餐名称：{{ repairResult.order.goods_name }}</p>
							<p>支付金额：¥{{ repairResult.order.total_amount }}</p>
							<p>购买时间：{{ repairResult.order.create_time }}</p>
							<p>支付状态：{{ repairResult.order.is_paid ? '已支付' : '未支付' }}</p>
							<p>到账状态：{{ repairResult.order.is_credited ? '已到账' : '未到账' }}</p>
						</div>
						<div v-else>{{ repairResult.desc }}</div>
					</template>
				</el-alert>
			</div>
		</el-card>

		<!-- 积分套餐列表 -->
		<view class="packages-section">
			<h3 class="section-title">选择积分套餐</h3>
			<view class="packages-grid">
				<el-card 
					v-for="pkg in packages" 
					:key="pkg.id" 
					class="package-card"
					:class="{ 'recommended': pkg.recommended, 'selected': selectedPackage === pkg.id }"
					@click.native="selectPackage(pkg)"
				>
					<!-- 推荐标签 -->
					<div class="recommended-badge" v-if="pkg.recommended">
						<i class="el-icon-star-on"></i> 推荐
					</div>

					<!-- 套餐名称 -->
					<div class="package-name">{{ pkg.name }}</div>

					<!-- 积分数量 -->
					<div class="package-points">
						<span class="points-number">{{ pkg.points }}</span>
						<span class="points-unit">积分</span>
					</div>


					<!-- 价格 -->
					<div class="package-price">
						<span class="price-symbol">¥</span>
						<span class="price-number">{{ pkg.price }}</span>
					</div>

					<!-- 优惠信息 -->
					<div class="package-discount" v-if="pkg.discount">
						<el-tag type="danger" size="mini">{{ pkg.discount }}</el-tag>
					</div>

					<!-- 说明 -->
					<div class="package-desc">{{ pkg.description }}</div>

					<!-- 选择按钮 -->
					<el-button 
						:type="selectedPackage === pkg.id ? 'primary' : 'default'" 
						class="select-btn"
						@click.stop="selectPackage(pkg)"
						:loading="creatingOrder && selectedPackage === pkg.id"
						:disabled="creatingOrder || paymentLoading"
					>
						{{ selectedPackage === pkg.id && creatingOrder ? '跳转中...' : '立即支付' }}
					</el-button>
				</el-card>

				<!-- 客服联系卡片 -->
				<el-card class="package-card service-card" @click.native="showServiceQRCode">
					<div class="service-icon">
						<i class="el-icon-service"></i>
					</div>
					<div class="package-name">联系客服</div>
					<div class="service-desc">
						<p>遇到问题？</p>
						<p>扫码添加QQ客服</p>
						<p>专属客服为您服务</p>
					</div>
					<el-button type="success" class="select-btn">
						查看二维码
					</el-button>
				</el-card>
			</view>
		</view>

		<!-- 客服二维码弹窗 -->
		<ServiceQrcode :show.sync="serviceDialog.show" work-time="9:00 - 21:00" />

		<!-- 支付加载遮罩 -->
		<view class="payment-mask" v-if="paymentLoading">
			<div class="payment-modal">
				<div class="payment-icon">
					<i class="el-icon-loading"></i>
				</div>
				<div class="payment-title">{{ pollingStartTime ? '正在自动查询支付结果...' : '订单已创建，请前往支付' }}</div>
				<div class="payment-desc">为避免浏览器拦截，支付页改为点击按钮后打开。支付完成后可自动或手动查询到账结果。</div>
				<div class="payment-timer" v-if="pollingStartTime">已自动查询 {{ paymentElapsed }} 秒 / 300 秒</div>
				<div class="payment-progress">
					<el-progress 
						:percentage="Math.floor((paymentElapsed / 300) * 100)" 
						:stroke-width="6"
						color="#409EFF"
					></el-progress>
				</div>
				<div class="payment-tips">
					<i class="el-icon-info"></i> 订单号：{{ currentTradeNo || '-' }}
				</div>
				<div class="payment-actions" v-if="paymentUrl">
					<el-button type="primary" plain @click="openPaymentPage">立即前往支付</el-button>
					<el-button type="success" plain @click="manualCheckPayment">我已完成支付，立即查询</el-button>
					<el-button plain @click="copyPaymentLink">复制支付链接</el-button>
				</div>
				<div class="payment-warning">
					支付页没有自动弹出属于正常现象，请点击上方按钮继续支付。
				</div>
				<el-button type="danger" plain @click="cancelPayment">暂不支付</el-button>
			</div>
		</view>
	</view>
</template>

<script>
import * as paymentService from '@/common/services/payment.js';
import ServiceQrcode from '@/components/service-qrcode/index.vue';

let vk = uni.vk;

export default {
	components: { ServiceQrcode },
	data() {
		return {
			// userPoints -> computed
			selectedPackage: null,
			pollingTimer: null,
			pollingStartTime: null,
			pollingTimeout: 5 * 60 * 1000,
			paymentLoading: false,
			paymentElapsed: 0,
			currentTradeNo: '',
			currentPackageInfo: null,
			paymentUrl: '',
			creatingOrder: false,
			checkingPayment: false,
			serviceDialog: { show: false },
			repairTradeNo: '',
			repairLoading: false,
			repairResult: null,
			// 支付接口配置（后台「支付接口配置」页面维护，前端加载失败时用默认值兜底）
			payConfig: {
				base_url: 'https://yunxiangit.com.cn',
				channel_id: 3,
				query_password: '',
				store_name: '',
				pay_order_path: '/shopApi/Pay/order',
				pay_query_path: '/shopApi/Pay/query'
			},
			// 积分套餐配置（与支付平台商品对应，goods_key 为兜底，实际以后台「支付接口配置」为准）
			packages: [
				{ id: 1, name: '体验套餐（10积分）', points: 10, price: 10, discount: '', description: '适合新手体验', recommended: false, goods_key: 't1hw3w' },
				{ id: 2, name: '基础套餐（50积分）', points: 50, price: 45, discount: '省5元', description: '性价比之选', recommended: false, goods_key: 'u4zjhq' },
				{ id: 3, name: '超值套餐（100积分）', points: 100, price: 90, discount: '省10元', description: '最受欢迎', recommended: true, goods_key: 'mw9di3' },
				{ id: 4, name: '豪华套餐（300积分）', points: 300, price: 270, discount: '省30元', description: '超值优惠', recommended: false, goods_key: '8wouhk' },
				{ id: 5, name: '至尊套餐（500积分）', points: 500, price: 450, discount: '省50元', description: '刚需必选', recommended: false, goods_key: 'qv19cx' },
				{ id: 6, name: '终极套餐（1000积分）', points: 1000, price: 900, discount: '省100元', description: '土豪专属', recommended: false, goods_key: 'y3qiel' }
			]
		};
	},
	computed: {
		userPoints() { return this.$store.state.$user.pointsInfo.available_points || 0; },
	},
	onLoad() {
		vk = this.vk;
		this.init();
		this.restorePendingOrder();
	},
	onShow() {
		if (this.currentTradeNo && this.paymentLoading && !this.pollingTimer) {
			this.startPolling(this.currentTradeNo, false);
		}
	},
	onHide() {},
	onUnload() { this.clearPollingTimer(); },
	methods: {
		async init() {
			this.$store.dispatch('$user/loadPointsInfo');
			this.loadPayConfig();
		},

		// 加载支付接口配置
		async loadPayConfig() {
			const { packages, payConfig } = await paymentService.loadPayConfig();
			if (packages.length > 0) {
				this.packages = packages.map(p => ({
					id: p.id,
					name: p.name,
					points: p.points,
					price: p.price,
					discount: p.discount || '',
					description: p.description || '',
					recommended: !!p.recommended,
					goods_key: p.goods_key || ''
				}));
			}
			this.payConfig = payConfig;
		},

		// 加载用户积分（从 store 响应式读取）
		loadUserPoints() {
			this.$store.dispatch('$user/loadPointsInfo', { force: true });
		},
		refreshPoints() {
			this.loadUserPoints();
			vk.toast("刷新成功");
		},

		// ========== 核心流程：选套餐 → 创建订单 → 跳支付 → 轮询 ==========
		selectPackage(pkg) {
			if (this.creatingOrder || this.paymentLoading) return;
			this.createOrder(pkg);
		},

		async createOrder(pkg) {
			this.creatingOrder = true;
			try {
				const { trade_no, payurl } = await paymentService.createOrder(this.payConfig, pkg);
				console.log('[支付] 订单创建成功:', { trade_no, payurl, package: pkg.name });
				this.currentTradeNo = trade_no;
				this.currentPackageInfo = { ...pkg };
				this.paymentUrl = payurl;
				this.paymentLoading = true;
				this.pollingStartTime = null;
				this.paymentElapsed = 0;
				paymentService.savePendingOrder(trade_no, payurl, pkg);

				window.open(payurl, '_blank');
				this.startPolling(trade_no);
			} catch (err) {
				console.error('[支付] 创建订单异常:', err.message);
				vk.alert(`创建订单失败\n原因：${err.message}\n套餐：${pkg.name}`, '创建订单失败');
			} finally {
				this.creatingOrder = false;
			}
		},

		// ========== 轮询 ==========
		startPolling(trade_no, immediate = true) {
			if (!trade_no) return;
			this.paymentLoading = true;
			if (!this.pollingStartTime) this.pollingStartTime = Date.now();
			this.clearPollingTimer();
			this.pollingTimer = setInterval(() => {
				this.paymentElapsed = Math.floor((Date.now() - this.pollingStartTime) / 1000);
				this.checkPaymentStatus(trade_no, true);
			}, 3000);
			if (immediate) this.checkPaymentStatus(trade_no, true);
		},

		async checkPaymentStatus(trade_no, fromPolling = false) {
			if (!trade_no) return;
			if (this.pollingStartTime && (Date.now() - this.pollingStartTime) > this.pollingTimeout) {
				this.clearPollingTimer();
				this.paymentElapsed = Math.floor(this.pollingTimeout / 1000);
				if (fromPolling) vk.toast('自动查询已停止，请点击"我已完成支付，立即查询"');
				return;
			}
			if (this.checkingPayment) return;
			this.checkingPayment = true;

			try {
				const isPaid = await paymentService.queryPayment(this.payConfig, trade_no);
				if (!isPaid) {
					this.checkingPayment = false;
					if (!fromPolling) vk.alert(`订单暂未支付\n订单号：${trade_no}`, '未支付');
					return;
				}

				// 已支付 → 入账
				const packageInfo = this.currentPackageInfo;
				const addRes = await paymentService.creditPoints(trade_no, packageInfo.id);

				this.checkingPayment = false;
				this.clearPollingTimer();
				this.paymentLoading = false;
				paymentService.clearPendingOrder();
				await this.loadUserPoints();

				if (addRes.code !== 0 && addRes.code !== 1) {
					vk.alert(
						`支付成功但充值失败！\n\n订单号：${trade_no}\n套餐：${packageInfo.name}\n错误：${addRes.msg || '未知'}\n\n请联系客服处理，提供以上信息`,
						'充值失败'
					);
					return;
				}
				const totalPoints = (addRes.data && addRes.data.total_points) || packageInfo.points || 0;
				const balance = (addRes.data && addRes.data.balance !== undefined) ? addRes.data.balance : this.userPoints;
				vk.alert(`支付成功！\n获得积分：${totalPoints}积分\n当前余额：${balance}积分`, '支付成功', () => { this.selectedPackage = null; });
			} catch (err) {
				this.checkingPayment = false;
				if (!fromPolling) {
					vk.alert(`支付查询异常\n订单号：${trade_no}\n错误：${err.message}`, '查询异常', () => { this.resetPaymentFlowState(); });
				}
			}
		},

		manualCheckPayment() {
			if (!this.currentTradeNo) return vk.toast('订单不存在');
			this.checkPaymentStatus(this.currentTradeNo);
		},
		cancelPayment() {
			vk.confirm('确定要取消支付吗？', '确认取消', res => {
				if (res.confirm) { this.resetPaymentFlowState(); vk.toast('已取消支付'); }
			});
		},
		copyPaymentLink() {
			if (!this.paymentUrl) return vk.toast('支付链接不存在');
			uni.setClipboardData({ data: this.paymentUrl, success: () => vk.toast('支付链接已复制'), fail: () => vk.toast('复制失败') });
		},
		openPaymentPage() {
			if (!this.paymentUrl) return vk.toast('支付链接不存在');
			window.open(this.paymentUrl, '_blank');
			this.startPolling(this.currentTradeNo);
		},

		// ========== localStorage 持久化 ==========
		_savePendingOrder(trade_no, payurl, pkg) {
			paymentService.savePendingOrder(trade_no, payurl, pkg);
		},
		restorePendingOrder() {
			const d = paymentService.restorePendingOrder();
			if (!d) return;
			this.currentTradeNo = d.trade_no;
			this.paymentUrl = d.payurl;
			this.currentPackageInfo = { id: d.package_id, name: d.package_name, points: d.points, price: d.price };
			this.paymentLoading = true;
			this.pollingStartTime = null;
			this.paymentElapsed = 0;
			this.startPolling(d.trade_no, true);
		},
		clearPendingOrder() {
			paymentService.clearPendingOrder();
		},

		// ========== 工具 ==========
		resetPaymentFlowState() {
			this.clearPollingTimer();
			this.pollingStartTime = null;
			this.paymentLoading = false;
			this.paymentElapsed = 0;
			this.currentTradeNo = '';
			this.currentPackageInfo = null;
			this.paymentUrl = '';
			this.checkingPayment = false;
			this.creatingOrder = false;
			this.clearPendingOrder();
		},
		clearPollingTimer() {
			if (this.pollingTimer) clearInterval(this.pollingTimer);
			this.pollingTimer = null;
		},
		showServiceQRCode() { this.serviceDialog.show = true; },

		// ========== 自助修复 ==========
		async submitRepair() {
			const trade_no = this.repairTradeNo;
			if (!trade_no || !trade_no.trim()) return vk.toast('请输入订单号');

			this.repairLoading = true;
			this.repairResult = null;

			try {
				const res = await paymentService.submitRepair(trade_no);
				const d = res.data || {};
				const order = d.order || null;

				if (res.code === 0 && d.status === 'credited') {
					this.repairResult = { type: 'success', title: '修复成功，积分已到账', order };
					this.repairTradeNo = '';
					await this.loadUserPoints();
				} else if (res.code === 0 && d.status === 'already_credited') {
					this.repairResult = { type: 'success', title: '该订单积分已到账，无需修复', order };
				} else if (res.code === 0 && d.status === 'not_paid') {
					this.repairResult = { type: 'warning', title: '该订单尚未支付', order };
				} else {
					this.repairResult = { type: 'error', title: res.msg || '核查失败', order };
				}
			} catch (err) {
				this.repairResult = { type: 'error', title: '请求异常', desc: err.message || '网络异常' };
			} finally {
				this.repairLoading = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.points-shop {
	min-height: 100vh;
	background: linear-gradient(135deg, #4facfe 55%, #e1e8f2 100%);
	padding: 20px;
}

/* 页面标题 */
.page-header {
	text-align: center;
	padding: 30px 20px 20px;
	color: white;

	h2 {
		font-size: 32px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	p {
		font-size: 16px;
		opacity: 0.9;
	}
}

/* 当前积分卡片 */
.current-points-card {
	margin-bottom: 30px;
	border-radius: 16px;
	overflow: hidden;

	.current-points {
		display: flex;
		align-items: center;
		padding: 10px;

		.points-icon {
			font-size: 48px;
			color: #f39c12;
			margin-right: 20px;
		}

		.points-info {
			flex: 1;

			.points-label {
				font-size: 14px;
				color: #909399;
				margin-bottom: 5px;
			}

			.points-value {
				font-size: 32px;
				font-weight: bold;
				color: #409EFF;
			}
		}
	}
}

/* 套餐区域 */
.packages-section {
	margin-bottom: 30px;

	.section-title {
		color: white;
		font-size: 24px;
		margin-bottom: 20px;
		text-align: center;
	}
}

/* 套餐网格 */
.packages-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
}

/* 套餐卡片 */
.package-card {
	position: relative;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
	overflow: hidden;

	&:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}

	&.recommended {
		border: 3px solid #f39c12;

		.recommended-badge {
			position: absolute;
			top: 12px;
			right: -35px;
			background: linear-gradient(45deg, #f39c12, #e67e22);
			color: white;
			padding: 5px 40px;
			font-size: 12px;
			font-weight: bold;
			transform: rotate(45deg);
			box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
		}
	}

	&.selected {
		border: 3px solid #409EFF;
		box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
	}

	::v-deep .el-card__body {
		padding: 30px 20px;
		text-align: center;
	}

	.package-name {
		font-size: 22px;
		font-weight: bold;
		color: #303133;
		margin-bottom: 15px;
	}

	.package-points {
		margin-bottom: 10px;

		.points-number {
			font-size: 48px;
			font-weight: bold;
			color: #409EFF;
		}

		.points-unit {
			font-size: 16px;
			color: #909399;
			margin-left: 5px;
		}
	}


	.package-price {
		margin-bottom: 10px;

		.price-symbol {
			font-size: 20px;
			color: #F56C6C;
		}

		.price-number {
			font-size: 36px;
			font-weight: bold;
			color: #F56C6C;
		}
	}

	.package-discount {
		margin-bottom: 10px;
		min-height: 20px;
	}

	.package-desc {
		font-size: 14px;
		color: #909399;
		margin-bottom: 20px;
	}

	.select-btn {
		width: 100%;
	}
}

/* 支付加载遮罩 */
.payment-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	backdrop-filter: blur(5px);

	.payment-modal {
		background: white;
		border-radius: 20px;
		padding: 40px;
		width: 90%;
		max-width: 450px;
		text-align: center;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		animation: slideDown 0.3s ease;

		.payment-icon {
			font-size: 64px;
			color: #409EFF;
			margin-bottom: 20px;
			
			i {
				animation: rotate 1s linear infinite;
			}
		}

		.payment-title {
			font-size: 24px;
			font-weight: bold;
			color: #303133;
			margin-bottom: 10px;
		}

		.payment-desc {
			font-size: 14px;
			color: #909399;
			margin-bottom: 20px;
		}

		.payment-timer {
			font-size: 18px;
			color: #409EFF;
			font-weight: bold;
			margin-bottom: 15px;
		}

		.payment-progress {
			margin-bottom: 20px;
		}

		.payment-tips {
			background: #f0f9ff;
			border: 1px solid #b3d8ff;
			border-radius: 8px;
			padding: 12px;
			color: #409EFF;
			font-size: 13px;
			margin-bottom: 20px;

			i {
				margin-right: 5px;
			}
		}

		.payment-actions {
			display: flex;
			justify-content: center;
			gap: 12px;
			margin-bottom: 12px;
			flex-wrap: wrap;
		}

		.payment-warning {
			font-size: 13px;
			line-height: 1.6;
			color: #e6a23c;
			background: #fff7e6;
			border-radius: 12px;
			padding: 12px 14px;
			margin-bottom: 18px;
		}
	}
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-50px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* 客服卡片样式 */
.service-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	
	::v-deep .el-card__body {
		background: transparent;
	}
	
	.service-icon {
		font-size: 64px;
		margin-bottom: 15px;
		
		i {
			animation: pulse 2s ease-in-out infinite;
		}
	}
	
	.package-name {
		color: white;
	}
	
	.service-desc {
		color: rgba(255, 255, 255, 0.9);
		margin: 20px 0;
		line-height: 1.8;
		
		p {
			margin: 5px 0;
			font-size: 14px;
		}
	}
	
	&:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
	}
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

/* 支付未到账修复卡片 */
.repair-card {
	margin-bottom: 20px;
	border-radius: 12px;
	border: 1px solid #faecd8;
	background: #fdf6ec;

	::v-deep .el-card__body {
		padding: 14px 20px;
	}

	.repair-inline {
		display: flex;
		align-items: center;
		gap: 12px;

		> i {
			font-size: 20px;
			color: #e6a23c;
		}

		.repair-label {
			font-size: 14px;
			color: #909399;
			white-space: nowrap;
		}

		.repair-input {
			flex: 1;
			max-width: 300px;
		}
	}

	.repair-result {
		margin-top: 12px;

		.repair-order-info {
			p {
				margin: 4px 0;
				font-size: 13px;
				color: #606266;
			}
		}
	}
}
</style>

