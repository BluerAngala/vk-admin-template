<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query
			v-model="queryForm1.formData"
			:columns="queryForm1.columns"
			size="mini"
			@search="search"
		></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="danger" size="mini" icon="el-icon-circle-plus-outline" @click="showSetKey">设置key</el-button>
				<el-button type="success" size="mini" icon="el-icon-circle-plus-outline" @click="addBtn">添加</el-button>
				<el-dropdown v-if="table1.multipleSelection" :split-button="false"	trigger="click" @command="batchBtn">
					<el-button type="danger" size="mini" style="margin-left: 10px;" :disabled="table1.multipleSelection.length === 0" > 批量操作<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量启用（显示）</el-dropdown-item>
						<el-dropdown-item :command="2">批量停用（隐藏）</el-dropdown-item>
						<el-dropdown-item :command="3">批量删除</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<el-button type="success" size="mini" style="margin-left: 10px;" @click="showHelp">查看教程</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table
			ref="table1"
			:action="table1.action"
			:columns="table1.columns"
			:query-form-param="queryForm1"
			:right-btns="['update', 'delete']"
			:custom-right-btns="table1.customRightBtns"
			right-btns-align="right"
			:selection="true"
			:row-no="true"
			:pagination="true"
			:auto-action="false"
			:default-sort="{ name:'sort', type:'desc' }"
			size="mini"
			@update="updateBtn"
			@delete="deleteBtn"
			@current-change="currentChange"
			@selection-change="selectionChange"
			@table-mounted="init"
		>
			<!-- 排序值 -->
			<template v-slot:sort="{ row, column, index }">
				<el-input v-model="row.sort" size="mini" @change="sortChange($event, row)"/>
			</template>
		</vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog
			v-model="form1.props.show"
			:title="form1.props.title"
			width="600px"
			mode="form"
			:close-on-click-modal="true"
		>
			<vk-data-form
				v-model="form1.data"
				:rules="form1.props.rules"
				:action="form1.props.action"
				:form-type="form1.props.formType"
				:columns='form1.props.columns'
				label-width="120px"
				@success="form1.props.show = false;refresh();"
			>
				<template v-slot:qrcode="{ form, keyName, column }">
					<view class="qrcode-container">
						<view class="qrcode-card">
							<view class="qrcode-header">
								<text class="qrcode-title">创建活动</text>
							</view>
							<view class="qrcode-image-wrapper">
								<image :src="qrcode" mode="aspectFit" class="qrcode-image"></image>
							</view>
							<view class="qrcode-tips">
								<text class="tips-text">微信扫一扫上方小程序码</text>
								<text class="tips-sub">可创建活动，然后即可在此处选择</text>
							</view>
						</view>
					</view>
				</template>
			</vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<setKey v-model="formDatas.setKey" @success="refresh"></setKey>
		<activityDetail v-model="formDatas.activityDetail"></activityDetail>
		<winList v-model="formDatas.winList"></winList>
		<help v-model="formDatas.help"></help>
		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let that; // 当前页面对象
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	import setKey from './form/setKey'
	import activityDetail from './form/activityDetail'
	import winList from './form/winList'
	import help from './form/help'
	import { qrcodeAdd } from "./image.json"
	export default {
		components: {
			setKey,
			activityDetail,
			winList,
			help
		},
		data() {
			// 页面数据变量
			return {
				qrcode: qrcodeAdd,
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "plugs/lucky-draw/admin/sys.luckyDraw.getList",
					// 表格字段显示规则
					columns: [
						{ key: "sort", title: "排序", type: "number", width: 80, defaultValue: '0', sortable: "custom" },
						{ key: "cover_image", title: "封面图", type: "image", width: 120 },
						{ key: "title", title: "活动标题", type: "text", width: 340, align: "left" },
						{
							key: "enable", title: "是否启用", type: "switch", width: 80,
							watch: (res) => {
								let { value, row, change } = res;
								vk.callFunction({
									url: "plugs/lucky-draw/admin/sys.luckyDraw.update",
									title: "请求中...",
									data: {
										_id: row._id,
										enable: value
									},
									success: data => {
										if (data.num > 0) {
											change(value);
										}
									}
								});
							}
						},
						{ key: "_add_time", title: "添加时间", type: "time", width: 160, sortable: "custom" },
						{ key: "_add_time", title: "距离现在", type: "dateDiff", width: 120 },
						{ key: "activity_id", title: "活动ID", type: "text", width: 200 },
					],
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: "",
					customRightBtns: [{
							title: '活动数据',
							onClick: (item) => {
								vk.callFunction({
									url: 'plugs/lucky-draw/admin/sys.luckyDraw.getActivityInfo',
									title: '请求中...',
									data: {
										_id: item._id
									},
									success: (data) => {
										vk.pubfn.openForm('activityDetail', { item: data.info });
									}
								});
							}
						},
						{
							title: '中奖名单',
							type: 'success',
							onClick: (item) => {
								vk.pubfn.openForm('winList', { item });
							}
						}
					]
				},
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始 -----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {
						enable: "",
						status: ""
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							key: "enable", title: "是否启用", type: "select", width: 100, mode: "=", clearable: false,
							data: [
								{ value: "", label: "全部" },
								{ value: true, label: "启用" },
								{ value: false, label: "停用" },
							]
						},
						{ key: "title", title: "活动标题", type: "text", width: 200, mode: "%%" },
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						list: [],
						sort: 0,
						enable: true
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [
							{
								key: "list", title: "请选择活动", type: "table-select", placeholder: "请选择活动",
								show: ["add"],
								action: "plugs/lucky-draw/admin/sys.luckyDraw.getActivityList",
								multiple: true,
								multipleLimit: 500,
								valueFields: ["_id", "_add_time", "title", "prize_list", "prize_text", "start_time", "end_time", "max_people", "lottery_type", "mode"],
								columns: [
									{ key: "title", title: "活动标题", type: "text", minWidth: 200, nameKey: true, align: "left" },
									{
										key: "status", title: "活动状态", type: "tag", minWidth: 100,
										data: [
											{ value: 0, label: "未开始", tagType: "info" },
											{ value: 1, label: "进行中", tagType: "success" },
											{ value: 2, label: "已结束", tagType: "danger" }
										]
									},
									{ key: "_id", title: "活动ID", type: "text", idKey: true, show: ["none"] }, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
								],
								formData: {
									status: 1
								},
								queryColumns: [
									{
										key: "status", title: "活动状态", type: "select", width: 150, mode: "=", clearable: false,
										data: [
											{ value: "", label: "全部" },
											{ value: 0, label: "未开始" },
											{ value: 1, label: "进行中" },
											{ value: 2, label: "已结束" }
										]
									},
									{ key: "title", title: "活动标题", type: "text", width: 150, mode: "%%" }
								]
							},
							{ key: "enable", title: "是否启用", type: "switch" },
							{ key: "sort", title: "排序", type: "number", width: 150, precision: 0, controls: true, step: 1, stepStrictly: true },
							{ key: "cover_image", title: "活动封面", type: "file-select", placeholder: "请选择图片", fileType: "image", multiple: false, multipleLimit: 1, imageFit: "cover" },
							{ key: "qrcode", title: "", type: "text", showLabel: false },
						],
						// 表单验证规则
						rules: {
							list: [
								{ required: true, type: "array", min: 1, message: "请选择活动", trigger: "blur" }
							],
							cover_image: [
								{ required: true, message: "请上传活动封面图", trigger: "blur" }
							],
						},
						// add 代表添加 update 代表修改
						formType: "",
						// 是否显示表单的弹窗
						show: false
					}
				},
				// 其他弹窗表单
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
				key: ""
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			that = this;
			vk = that.vk;
			that.options = options;
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			// 页面数据初始化函数
			init() {
				let options = that.options;
				originalForms["form1"] = vk.pubfn.copyObject(that.form1);
				that.checkKey();
				that.search();
			},
			// 查看是否设置了key
			checkKey() {
				vk.callFunction({
					url: 'plugs/lucky-draw/admin/sys.luckyDraw.getKey',
					data: {},
					success: (data) => {
						if (data.key) {
							this.key = data.key;
						} else {
							this.showSetKey();
						}
					}
				});
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, that);
			},
			// 搜索
			search() {
				that.$refs.table1.search();
			},
			// 刷新
			refresh() {
				that.$refs.table1.refresh();
			},
			// 获取当前选中的行的数据
			getCurrentRow() {
				return that.$refs.table1.getCurrentRow();
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				that.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				that.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				that.resetForm();
				that.form1.props.action = 'plugs/lucky-draw/admin/sys.luckyDraw.add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加';
				that.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({ item }) {
				that.resetForm();
				that.form1.props.action = 'plugs/lucky-draw/admin/sys.luckyDraw.update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '修改';
				that.form1.data = vk.pubfn.copyObject(item);
				that.form1.props.show = true;
			},
			// 删除按钮
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "plugs/lucky-draw/admin/sys.luckyDraw.delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				let ids = this.table1.multipleSelection.map(item => item._id);
				switch (index) {
					case 1:
					case 2:
						// 批量启用或停用
						vk.callFunction({
							url: "plugs/lucky-draw/admin/sys.luckyDraw.update",
							title: "请求中...",
							data: {
								_id: ids,
								enable: index === 1 ? true : false
							},
							success: data => {
								if (data.num > 0) {
									let list = this.$refs.table1.getMultipleSelection();
									list.forEach(item => {
										item.enable = index === 1 ? true : false;
									});
								}
							}
						});
						break;
					case 3:
						// 批量删除
						vk.callFunction({
							url: 'plugs/lucky-draw/admin/sys.luckyDraw.delete',
							title: "请求中...",
							data: {
								_id: ids
							},
							success: (data) => {
								this.$message({
									message: data.msg,
									type: data.num > 0 ? 'success' : 'error'
								});
								if (data.num > 0) {
									this.refresh();
								}
							}
						});
						break;
					default:
						break;
				}
			},
			// 监听 - 排序值发生变化时触发
			sortChange(sort, item) {
				vk.callFunction({
					url: 'plugs/lucky-draw/admin/sys.luckyDraw.update',
					data: {
						_id: item._id,
						sort: Number(sort)
					},
					success: (data) => {

					}
				});
			},
			// 显示设置key的弹窗
			showSetKey() {
				vk.pubfn.openForm('setKey', {
					item: {
						key: this.key
					}
				});
			},
			// 显示帮助弹窗
			showHelp() {
				vk.pubfn.openForm('help', {});
			}
		},
		// 监听属性
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>

<style lang="scss" scoped>
	.qrcode-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px 0;

		.qrcode-card {
			border-radius: 16px;
			padding: 24px;
			border: 1px solid rgba(255, 255, 255, 0.8);
			backdrop-filter: blur(10px);
			transition: all 0.3s ease;
			max-width: 280px;
			width: 100%;
			border: 1px solid #ebebeb;

			.qrcode-header {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 20px;

				.qrcode-title {
					font-size: 18px;
					font-weight: 600;
					color: #2c3e50;
					letter-spacing: 0.5px;
				}
			}

			.qrcode-image-wrapper {
				position: relative;
				display: flex;
				justify-content: center;
				margin-bottom: 20px;

				.qrcode-image {
					width: 160px;
					height: 160px;
					border-radius: 12px;
					border: 1px solid #ebebeb;
					padding: 5px;
				}

			}

			.qrcode-tips {
				text-align: center;

				.tips-text {
					display: block;
					font-size: 15px;
					font-weight: 500;
					color: #34495e;
					margin-bottom: 6px;
					line-height: 1.4;
				}

				.tips-sub {
					display: block;
					font-size: 13px;
					color: #7f8c8d;
					line-height: 1.4;
				}
			}
		}
	}
</style>
