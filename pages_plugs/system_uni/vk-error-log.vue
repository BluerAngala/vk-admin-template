<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query
			v-model="queryForm1.formData"
			:columns="queryForm1.columns"
			@search="search"
		></vk-data-table-query>
		<!-- 表格搜索组件结束 -->
		<!-- 表格组件开始 -->
		<vk-data-table
			ref="table1"
			:action="table1.action"
			:columns="table1.columns"
			:query-form-param="queryForm1"
			:right-btns="['detail_auto']"
			:custom-right-btns="table1.customRightBtns"
			:default-sort="{ name:'count', type:'desc' }"
			secondary-sort-key="_id"
			:row-no="true"
			:pagination="true"
		></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog
			v-model="form1.props.show"
			:title="form1.props.title"
			width="800px"
			mode="form"
		>
			<vk-data-form
				ref="form1"
				v-model="form1.data"
				:rules="form1.props.rules"
				:action="form1.props.action"
				:form-type="form1.props.formType"
				:columns='form1.props.columns'
				label-width="80px"
				@success="updateSuccess"
			>
				<template v-slot:stack="{ form, keyName }">
					<view class="stack-view">
						<text space="ensp" style="font-size: 13px;" v-if="form.err">{{ form.err.stack }}</text>
					</view>
				</template>
			</vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
let that; // 当前页面对象
let vk = uni.vk; // vk实例
let dcloudAppidData = [];

let statusData = [
	{ value: 0, label: "待处理", tagType:"danger" },
	{ value: 1, label: "已处理", tagType:"success" },
	{ value: 2, label: "不处理", tagType:"info" }
];

export default {
	data() {
		// 页面数据变量
		return {
			// 页面是否请求中或加载中
			loading: false,
			// init请求返回的数据
			data: {},
			// 表格相关开始 -----------------------------------------------------------
			table1: {
				// 表格数据请求地址
				action: "admin/system_uni/error-log/sys/getList",
				// 表格字段显示规则
				columns: [
					{ key: "userInfo", title: "用户信息", type: "userInfo", width: 150 },
					{ key: "request_id", title: "请求ID", type: "text", width: 300 },
					{ key: "url", title: "请求地址", type: "text", width: 300 },
					{ key: "data", title: "请求参数", type: "json", width: 190 },
					{ key: "count", title: "出现次数", type: "number", width: 110, sortable:"custom" },
					{ key: "status", title: "当前状态", type: "tag", width: 100, data: statusData },
					{ key: "err.message", title: "错误信息", type: "text", width: 300, show: ["rows"] },
					{ key: "err", title: "错误堆栈", type: "html", width: 200, show: ["detail"],
						formatter: (val, row, column, index) => {
							let str = val.stack.replace(/\n/g, "<br>")
							return str;
						}
					},
					{ key: "_add_time", title: "添加时间", type: "time", width: 160, sortable:"custom" },
					{ key: "_add_time", title: "距离现在", type: "dateDiff", width: 120 },
					{ key: "md5", title: "MD5值", type: "text", width: 280 },
				],
				// 多选框选中的值
				multipleSelection: [],
				// 当前高亮的记录
				selectItem: "",
				customRightBtns: [
					{
						title: '处理', type: 'primary', icon: 'el-icon-edit',
						disabled:(formData)=>{
							return formData.status === 0 ? false : true;
						},
						onClick: (item)=>{
							this.updateBtn({ item: vk.pubfn.copyObject(item) });
						}
					}
				],
			},
			// 表格相关结束 -----------------------------------------------------------
			// 表单相关开始 -----------------------------------------------------------
			// 查询表单请求数据
			queryForm1: {
				// 查询表单数据源，可在此设置默认值
				formData: {
					dcloud_appid: "",
					status: 0,
					_add_time: []
				},
				// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
				columns: [
					{ key: "request_id", title: "请求ID", type: "text", width: 140, mode: "=" },
					{ key: "user_id", title: "用户ID", type: "text", width: 140, mode: "=" },
					{ key: "url", title: "请求地址", type: "text", width: 140, mode: "=" },
					{
						key: "status", title: "当前状态", type: "select", width: 140, mode: "=", clearable: false,
						data: [
							{ value: "", label: "全部" },
							...statusData,
						]
					},
					{ key: "_add_time", title: "添加时间", type: "datetimerange", width: 380, mode: "[]", clearable: false }
				]
			},
			form1: {
				// 表单请求数据，此处可以设置默认值
				data: {

				},
				// 表单属性
				props: {
					// 表单请求地址
					action: "",
					// 表单字段显示规则
					columns: [
						//{ key: "request_id", title: "请求ID", type: "text-view" },
						{ key: "md5", title: "md5", type: "text-view" },
						{ key: "stack", title: "错误堆栈", type: "text-view" },
						{ key: "status", title: "当前状态", type: "radio", optionType: "button", width: 140, clearable: false, data: statusData },
						{
							key: "comment", title: "备注", type: "textarea", placeholder: "请输入备注",
							autosize: { minRows: 4, maxRows: 10 },
							maxlength: 1000,
							showWordLimit: true,
						}
					],
					// 表单验证规则
					rules: {

					},
					// add 代表添加 update 代表修改
					formType: "",
					// 是否显示表单的弹窗
					show: false
				}
			},
			// 表单相关结束 -----------------------------------------------------------
		};
	},
	// 监听 - 页面每次【加载时】执行(如：前进)
	onLoad(options = {}) {
		that = this;
		vk = that.vk;
		that.options = options;
		that.init(options);
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
		init(options) {
			// 默认查询近7天的数据
			let { startTime } = vk.pubfn.getDayOffsetStartAndEnd(-7);
			let { endTime } = vk.pubfn.getDayOffsetStartAndEnd(0);
			that.queryForm1.formData._add_time = [startTime, endTime];
		},
		// 搜索
		search(obj) {
			that.$refs.table1.query(obj);
		},
		// 刷新
		refresh() {
			that.$refs.table1.refresh();
		},
		// 显示修改页面
		updateBtn({ item }) {
			that.form1.props.action = "admin/system_uni/error-log/sys/update";
			that.form1.props.formType = "update";
			that.form1.props.title = "处理";
			that.form1.props.show = true;
			that.form1.data = item;
		},
		updateSuccess() {
			that.form1.props.show = false;
			that.$refs.table1.updateRows({
				mode: "update", // update 局部字段更新 set 覆盖字段更新
				rows: [
					{
						_id: that.form1.data._id,
						status: that.form1.data.status
					}
				]
			});
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
.stack-view{
	background-color: #f6f8fa;
	padding: 5px 10px;
	line-height: 24px !important;
	max-height: 400px;
	overflow-y: auto;
}
</style>
