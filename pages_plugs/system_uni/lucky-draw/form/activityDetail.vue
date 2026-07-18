<template>
	<vk-data-drawer v-model="value.show" :title="page.title" v-loading="page.loading" :width="page.width" direction="rtl" @open="onOpen" @closed="onClose">
		<view class="drawer-content">
			<!-- 活动基本信息 -->
			<view class="module-container">
				<el-card shadow="never">
					<text class="h2">{{ activityData.title }}</text>
				</el-card>

				<view class="tags-group">
					<el-tag type="warning">{{ activityData.status_text }}</el-tag>
					<el-tag type="success">{{ activityData.mode_text }}</el-tag>
					<el-tag type="info">{{ activityData.lottery_type_text }}</el-tag>
				</view>

				<view class="time-info" v-if="activityData.lottery_type === 1">
					活动时间: {{ activityData.start_time_text }} - {{ activityData.end_time_text }}
				</view>

				<view v-if="activityData.lottery_type === 2" class="people-limit">
					开奖人数要求: {{ activityData.max_people }}
				</view>
			</view>

			<!-- 数据统计 -->
			<view class="module-container">
				<view class="h3">活动数据</view>
				<el-row :gutter="16">
					<el-col :span="6" v-for="(item, key) in statItems" :key="key">
						<view class="stat-card">
							<view class="stat-value" v-if="activityData.stat_data">{{ activityData.stat_data[key] }}</view>
							<view class="stat-label"> {{ item.label }} </view>
						</view>
					</el-col>
				</el-row>
			</view>

			<!-- 奖品信息 -->
			<view class="module-container">
				<view class="h3">奖品列表</view>
				<el-table :data="activityData.prize_list" size="small">
					<el-table-column prop="name" label="奖品名称">
						<template slot-scope="scope">
							<view class="tags-group">
								<el-tag>{{ scope.row.lv_text ? scope.row.lv_text + '：' : '' }} {{ scope.row.name }}</el-tag>
							</view>
						</template>
					</el-table-column>
					<el-table-column prop="num" label="数量" width="80"></el-table-column>
				</el-table>
			</view>

			<!-- 预览二维码 -->
			<view class="module-container" v-if="activityData.qrcode">
				<view class="h3">活动二维码</view>
				<vk-data-qrcode :text="activityData.qrcode" :size="400"></vk-data-qrcode>
				<view class="tips">使用微信扫一扫进入活动详情</view>
			</view>

		</view>
	</vk-data-drawer>
</template>

<script>
	let that; // 当前页面对象
	let vk = uni.vk; // vk实例
	export default {
		props: {
			value: {
				type: Object,
				default: function() {
					return {
						show: false,
						mode: "",
						item: {},
					};
				}
			}
		},
		data: function() {
			// 组件创建时，进行数据初始化
			return {
				page: {
					title: "活动详情",
					submitText: "确定",
					cancelText: "关闭",
					showCancel: true,
					width: "600px"
				},
				activityData: {},
				loading: false,
				statItems: {
					pv: { label: "浏览" },
					sc: { label: "参与" },
					uc: { label: "分享" },
					wc: { label: "中奖" }
				}
			};
		},
		mounted() {
			that = this;
			that.init();
		},
		methods: {
			// 初始化
			init() {
				let { value } = that;
				that.$emit("input", value);
			},
			// 监听 - 页面打开
			onOpen() {
				that = this;
				let { item = {} } = that.value;
				// 每次打开时，重新设置表单的值 = value.item 的值，item通过 vk.pubfn.openForm('表单名',{ item:{ _id:"1" } }) 传递值
				that.activityData = item;
			},
			// 监听 - 页面关闭
			onClose() {

			}
		},
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>

<style lang="scss" scoped>
	.drawer-content {
		padding: 0 20px;

		.h2 {
			font-size: 24px;
			margin-bottom: 12px;
			font-weight: bold;
		}

		.h3 {
			font-size: 20px;
			margin-bottom: 12px;
			font-weight: bold;
		}

		.module-container {
			margin-bottom: 24px;
		}

		.tags-group {
			margin: 12px 0;
		}

		.tags-group .el-tag {
			margin-right: 8px;
		}

		.time-info {
			color: #666;
			font-size: 14px;
			margin: 12px 0;
		}

		.people-limit {
			color: #e6a23c;
			font-size: 14px;
		}

		.stat-card {
			background: #f8f9fa;
			border-radius: 8px;
			padding: 16px;
			text-align: center;
		}

		.stat-value {
			font-size: 25px;
			font-weight: bold;
			margin-bottom: 10px;
		}

		.stat-label {
			color: #666;
			font-size: 12px;
		}

		.tips {
			margin-top: 10px;
			color: #666;
			font-size: 14px;
		}

	}
</style>
