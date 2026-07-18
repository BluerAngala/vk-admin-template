<template>
  <view class="page-body">
    <!-- 表格搜索组件 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
      <template slot="right-btns">
        <el-button
          v-if="isAdmin"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="addBtn"
          >新增产品</el-button
        >
        <el-button
          v-if="isAdmin"
          type="warning"
          icon="el-icon-refresh"
          @click="fixBasePriceBtn"
          >修复基础价格</el-button
        >
      </template>
    </vk-data-table-query>

    <!-- 表格组件 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :query-form-param="queryForm1"
      :right-btns="isAdmin ? ['update', 'delete'] : []"
      :custom-right-btns="isAdmin ? table1.customRightBtns : []"
      :row-no="true"
      :pagination="true"
      @update="editBtn"
      @delete="deleteBtn"
    >
      <!-- 产品图列 -->
      <template v-slot:product_image="{ row }">
        <el-image
          v-if="getImageUrl(row.product_image)"
          :src="getImageUrl(row.product_image)"
          :preview-src-list="[getImageUrl(row.product_image)]"
          style="width: 80px; height: 80px; border-radius: 4px"
          fit="cover"
        >
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
        <div v-else class="no-image">
          <i class="el-icon-picture-outline"></i>
        </div>
      </template>

      <!-- 状态列 -->
      <template v-slot:status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          active-text="上架"
          inactive-text="下架"
          @change="changeStatus(row)"
        ></el-switch>
      </template>

      <!-- 收费标准列 -->
      <template v-slot:price_standard="{ row }">
        <div>
          <div style="color: #e6a23c; font-weight: bold">
            {{ row.price_points }}积分 / {{ row.price_months }}月 /
            {{ row.price_machines }} 机器
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            单价：{{ calculateBasePrice(row) }}积分/月/机器
          </div>
        </div>
      </template>

      <!-- 可见范围列 -->
      <template v-slot:custom_user_ids="{ row }">
        <el-tag
          v-if="!row.custom_user_ids || row.custom_user_ids.length === 0"
          type="info"
          size="small"
        >
          所有人不可见
        </el-tag>
        <el-tag
          v-else-if="row.custom_user_ids.includes('all')"
          type="success"
          size="small"
        >
          公开
        </el-tag>
        <el-tag v-else type="warning" size="small">
          指定用户({{ row.custom_user_ids.length }}人)
        </el-tag>
      </template>
    </vk-data-table>

    <!-- 表单弹窗 -->
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
        :columns="form1.props.columns"
        label-width="130px"
        @before-submit="beforeSubmit"
        @success="formSuccess"
      >
         <!-- 产品类型自定义插槽 -->
         <template v-slot:product_type>
           <el-select
             v-model="form1.data.product_type"
             filterable
             allow-create
             default-first-option
             placeholder="请选择或输入产品类型"
             style="width: 100%"
           >
             <el-option
               v-for="item in productTypeData"
               :key="item.value"
               :label="item.label"
               :value="item.value"
             ></el-option>
           </el-select>
         </template>

         <!-- 可见范围自定义插槽 -->
        <template v-slot:custom_user_ids>
          <el-select
            v-model="form1.data.custom_user_ids"
            multiple
            filterable
            placeholder="请选择可见用户（可多选）"
            style="width: 100%"
          >
            <!-- 所有人选项 -->
            <el-option
              key="all"
              label="🌐 所有人（公开）"
              value="all"
            >
              <span style="float: left; font-weight: bold; color: #67C23A;">
                <i class="el-icon-user"></i> 所有人（公开）
              </span>
            </el-option>
            <el-option disabled>───────── 指定用户 ─────────</el-option>
            <!-- 用户列表 -->
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i>
            <span v-if="!form1.data.custom_user_ids || form1.data.custom_user_ids.length === 0" style="color: #F56C6C;">
              未选择=产品不可见
            </span>
            <span v-else-if="form1.data.custom_user_ids.includes('all')" style="color: #67C23A;">
              已选择"所有人"=公开可见（原价）
            </span>
            <span v-else style="color: #E6A23C;">
              已选择{{ form1.data.custom_user_ids.length }}位用户=仅他们可见且享受3折优惠
            </span>
          </div>
        </template>

        <!-- 已购买用户自定义插槽 -->
        <template v-slot:purchased_user_ids>
          <el-select
            v-model="form1.data.purchased_user_ids"
            multiple
            filterable
            placeholder="请选择已购买用户（可多选）"
            style="width: 100%"
          >
            <el-option disabled value="">───────── 已购买用户 ─────────</el-option>
            <!-- 用户列表 -->
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i>
            <span v-if="!form1.data.purchased_user_ids || form1.data.purchased_user_ids.length === 0" style="color: #909399;">
              未选择=无已购买用户（用户购买后会自动添加）
            </span>
            <span v-else style="color: #67C23A;">
              已选择{{ form1.data.purchased_user_ids.length }}位用户=这些用户已拥有该产品
            </span>
          </div>
        </template>
        <!-- 收费标准自定义插槽 -->
        <template v-slot:price_standard>
          <div style="display: flex; gap: 10px; align-items: center">
            <el-input-number
              v-model="form1.data.price_points"
              :min="1"
              placeholder="积分"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">积分 /</span>
            <el-input-number
              v-model="form1.data.price_months"
              :min="1"
              placeholder="月数"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">月 /</span>
            <el-input-number
              v-model="form1.data.price_machines"
              :min="1"
              placeholder="机器数"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">机器数</span>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 收费标准：积分数 / 月数 / 机器数
          </div>
        </template>

        <!-- 有效期选项自定义插槽 -->
        <template v-slot:valid_days_options>
          <div class="valid-days-options">
            <div
              v-for="(option, index) in form1.data.valid_days_options"
              :key="index"
              class="option-item"
            >
              <el-input-number
                v-model="option.days"
                :min="1"
                :max="9999"
                placeholder="天数"
                style="width: 120px"
              ></el-input-number>
              <el-input
                v-model="option.label"
                placeholder="显示名称"
                style="width: 150px; margin-left: 10px"
              ></el-input>
              <el-input-number
                v-model="option.discount"
                :min="0.1"
                :max="1"
                :step="0.1"
                :precision="2"
                placeholder="折扣"
                style="width: 120px; margin-left: 10px"
              ></el-input-number>
              <span style="margin-left: 5px; color: #909399">折</span>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="removeOption(index)"
                style="margin-left: 10px"
              ></el-button>
            </div>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="addOption"
              style="margin-top: 10px"
            >
              添加选项
            </el-button>
          </div>
        </template>

        <!-- 版本更新日志自定义插槽 -->
        <template v-slot:version_logs>
          <div class="version-logs-editor">
            <div
              v-for="(versionLog, index) in form1.data.version_logs"
              :key="index"
              class="version-log-item"
            >
              <div class="version-log-header">
                <span class="version-tag">版本 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeVersionLog(index)"
                ></el-button>
              </div>
              <div class="version-log-content">
                <el-row :gutter="10">
                  <el-col :span="12">
                    <div class="form-item">
                      <label>版本号</label>
                      <el-input
                        v-model="versionLog.version"
                        placeholder="如: 1.2.0"
                        clearable
                      ></el-input>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="form-item">
                      <label>发布时间</label>
                      <el-date-picker
                        v-model="versionLog.date"
                        type="datetime"
                        placeholder="选择发布时间"
                        value-format="timestamp"
                        style="width: 100%"
                      ></el-date-picker>
                    </div>
                  </el-col>
                </el-row>
                <div class="form-item">
                  <label>更新内容</label>
                  <el-input
                    v-model="versionLog.log"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入更新内容，每行一条更新记录&#10;如：&#10;• 新增批量导出功能&#10;• 修复导入编码问题&#10;• 优化加载速度"
                  ></el-input>
                  <div style="color: #909399; font-size: 12px; margin-top: 5px">
                    <i class="el-icon-info"></i> 建议使用 "• " 或 "- " 开头，每行一条更新记录
                  </div>
                </div>
                <div class="form-item">
                  <label>下载地址（可选）</label>
                  <el-input
                    v-model="versionLog.download_url"
                    placeholder="留空则使用产品默认下载地址"
                    clearable
                  >
                    <template slot="prepend">
                      <i class="el-icon-link"></i>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="addVersionLog"
              style="margin-top: 10px"
            >
              添加新版本
            </el-button>
            <div v-if="!form1.data.version_logs || form1.data.version_logs.length === 0" 
                 style="color: #909399; text-align: center; padding: 20px;">
              <i class="el-icon-info"></i> 暂无版本记录，点击上方按钮添加
            </div>
          </div>
        </template>

      </vk-data-form>
    </vk-data-dialog>
  </view>
</template>

<script>
let that;
let vk = uni.vk;
let originalForms = {};

// 产品类型数据
const productTypeData = [
  { value: "software", label: "软件" },
  { value: "plugin", label: "浏览器插件" },
  { value: "normal", label: "通用" },
];

// 状态数据
const statusData = [
  { value: 0, label: "下架" },
  { value: 1, label: "上架" },
];

export default {
  data() {
    return {
      isAdmin: false, // 是否是管理员
      productTypeData: productTypeData, // 产品类型选项
      userList: [], // 用户列表
      customUserDialog: {
        show: false,
        product_id: "",
        product_name: "",
        selected_user_ids: [],
      },
      table1: {
        action: "admin/product/sys/getList",
        columns: [
          { key: "_add_time", title: "创建时间", type: "time", width: 180 },
          {
            key: "product_image",
            title: "产品图",
            type: "text",
            width: 120,
            slot: true,
          },
          { key: "product_id", title: "产品ID", type: "text", width: 180 },
          { key: "product_name", title: "产品名称", type: "text", width: 150 },
          { key: "product_type", title: "产品类型", type: "text", width: 120 },
          { key: "download_url", title: "下载地址", type: "text", width: 250 },
          {
            key: "price_standard",
            title: "收费标准",
            type: "text",
            width: 200,
            slot: true,
          },
          {
            key: "custom_user_ids",
            title: "可见范围",
            type: "text",
            width: 120,
            slot: true,
          },
          { key: "description", title: "产品描述", type: "text", width: 200 },
          { key: "remark", title: "备注", type: "text", width: 200 },
          {
            key: "status",
            title: "状态",
            type: "text",
            width: 150,
            slot: true,
          },
        ],
      },
      queryForm1: {
        formData: {},
        columns: [
          {
            key: "product_name",
            type: "text",
            title: "产品名称",
            placeholder: "请输入产品名称",
            mode: "%%",
            col: { span: 5 },
          },
          {
            key: "product_type",
            type: "select",
            title: "产品类型",
            placeholder: "选择类型",
            data: productTypeData,
            col: { span: 4 },
          },
          {
            key: "status",
            type: "select",
            title: "状态",
            placeholder: "选择状态",
            data: statusData,
            col: { span: 3 },
          },
        ],
      },
      form1: {
        data: {},
        props: {
          action: "",
          columns: [
            // ========== 基本信息 ==========
            {
              key: "product_id",
              title: "产品ID",
              type: "text",
              placeholder: "请输入产品唯一标识（英文）",
              tips: "产品唯一标识，创建后不可修改",
              show: ["add"],
            },
            {
              key: "product_name",
              title: "产品名称",
              type: "text",
              placeholder: "请输入产品名称",
            },
            {
              key: "product_type",
              title: "产品类型",
              slot: true,
            },
            {
              key: "product_image",
              title: "产品图",
              type: "image",
              limit: 1,
              tips: "支持jpg/png格式，建议尺寸400x300",
            },
            {
              key: "download_url",
              title: "下载地址",
              type: "text",
              placeholder: "请输入下载地址",
            },
            {
              key: "description",
              title: "产品描述",
              type: "textarea",
              placeholder: "请输入产品描述",
            },
            {
              key: "status",
              title: "状态",
              type: "radio",
              data: statusData,
              defaultValue: 1,
            },
            // ========== 收费配置 ==========
            {
              key: "price_standard",
              title: "收费标准",
              slot: true,
            },
            {
              key: "buy_price",
              title: "购买价格",
              type: "number",
              placeholder: "请输入公开产品的购买价格",
              tips: "公开产品的一次性购买价格（积分），0表示不可购买",
              defaultValue: 0,
            },
            {
              key: "valid_days_options",
              title: "有效期选项",
              slot: true,
            },
            {
              key: "version_logs",
              title: "版本更新日志",
              slot: true,
            },
            // ========== 高级配置 ==========
            {
              key: "custom_user_ids",
              title: "可见范围",
              slot: true,
            },
            {
              key: "purchased_user_ids",
              title: "已购买用户",
              slot: true,
            },
            // ========== 备注信息 ==========
            {
              key: "remark",
              title: "备注",
              type: "textarea",
              placeholder: "请输入备注",
            },
          ],
          rules: {
            product_id: [
              { required: true, message: "请输入产品ID", trigger: "blur" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "只能包含小写字母、数字和连字符",
                trigger: "blur",
              },
            ],
            product_name: [
              { required: true, message: "请输入产品名称", trigger: "blur" },
            ],
            product_type: [
              { required: true, message: "请选择产品类型", trigger: "change" },
            ],
            price_points: [
              { required: true, message: "请输入收费积分", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费积分必须大于0",
                trigger: "blur",
              },
            ],
            price_months: [
              { required: true, message: "请输入收费月数", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费月数必须大于0",
                trigger: "blur",
              },
            ],
            price_machines: [
              { required: true, message: "请输入收费机器数", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费机器数必须大于0",
                trigger: "blur",
              },
            ],
            status: [
              { required: true, message: "请选择状态", trigger: "change" },
            ],
          },
          formType: "",
          title: "",
          show: false,
        },
      },
    };
  },
  onLoad(options = {}) {
    that = this;
    vk = that.vk;
    that.init();
  },
  methods: {
    // 初始化
    init() {
      originalForms["form1"] = vk.pubfn.copyObject(that.form1);
      that.checkAdminRole();
      that.loadUserList();
    },
    // 检查是否是管理员
    checkAdminRole() {
      const userInfo = vk.getVuex("$user.userInfo");
      that.isAdmin =
        userInfo &&
        userInfo.role &&
        Array.isArray(userInfo.role) &&
        userInfo.role.includes("admin");
    },
    // 加载用户列表
    loadUserList() {
      if (!that.isAdmin) {
        return; // 非管理员不需要加载用户列表
      }
      vk.callFunction({
        url: "admin/system/user/sys/getList",
        data: {
          pageSize: 999,
        },
        success: (data) => {
          that.userList = data.rows || [];
          // 更新表单中的用户列表数据
          const customUserField = that.form1.props.columns.find(
            (col) => col.key === "custom_user_ids"
          );
          if (customUserField) {
            customUserField.data = that.userList.map((user) => ({
              value: user._id,
              label: `${user.nickname || user.username} (${user.username})`,
            }));
          }
        },
      });
    },
    // 搜索
    search(obj) {
      that.$refs.table1.query(obj);
    },
    // 刷新
    refresh() {
      that.$refs.table1.refresh();
    },
    // 新增
    addBtn() {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能新增产品");
        return;
      }
      vk.pubfn.resetForm(originalForms, that);
      that.form1.props.action = "admin/product/sys/add";
      that.form1.props.formType = "add";
      that.form1.props.title = "新增产品";
      that.$set(that.form1, "data", {
        product_id: "",
        product_name: "",
        product_type: "",
        product_image: "",
        download_url: "",
        price_points: 1,
        price_months: 1,
        price_machines: 1,
        buy_price: 0,
        description: "",
        remark: "",
        status: 1,
        valid_days_options: [
          { days: 30, label: "月卡(30天)", discount: 1 },
          { days: 90, label: "季卡(90天)", discount: 1 },
          { days: 180, label: "半年卡(180天)", discount: 1 },
          { days: 365, label: "年卡(365天)", discount: 1 },
        ],
        custom_user_ids: ["all"], // 默认为所有人可见
        purchased_user_ids: [], // 已购买用户列表
        version_logs: [], // 版本更新日志
      });
      that.form1.props.show = true;
    },
    // 编辑
    editBtn({ item }) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能编辑产品");
        return;
      }
      vk.pubfn.resetForm(originalForms, that);
      that.form1.props.action = "admin/product/sys/update";
      that.form1.props.formType = "edit";
      that.form1.props.title = "编辑产品";
      that.$set(that.form1, "data", {
        _id: item._id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_type: item.product_type,
        product_image: item.product_image || "",
        download_url: item.download_url || "",
        price_points: item.price_points || 5,
        price_months: item.price_months || 1,
        price_machines: item.price_machines || 1,
        buy_price: item.buy_price || 0,
        description: item.description || "",
        remark: item.remark || "",
        status: item.status,
        valid_days_options: item.valid_days_options || [],
        custom_user_ids: item.custom_user_ids || [],
        purchased_user_ids: item.purchased_user_ids || [],
        version_logs: item.version_logs || [],
      });
      that.form1.props.show = true;
    },
    // 删除
    deleteBtn({ item, deleteFn }) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能删除产品");
        return;
      }
      vk.confirm(`确定要删除产品【${item.product_name}】吗？`, "提示", "确定", "取消", (res) => {
        if (res.confirm) {
        deleteFn({
          action: "admin/product/sys/delete",
          data: { _id: item._id },
        });
        }
      });
    },
    // 改变状态
    changeStatus(row) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能修改产品状态");
        // 恢复原状态
        row.status = row.status === 1 ? 0 : 1;
        return;
      }
      vk.callFunction({
        url: "admin/product/sys/update",
        data: {
          _id: row._id,
          status: row.status,
        },
        success: () => {
          vk.toast("状态更新成功");
          that.refresh();
        },
        fail: () => {
          // 失败时恢复原状态
          row.status = row.status === 1 ? 0 : 1;
        },
      });
    },
    // 添加有效期选项
    addOption() {
      if (!that.form1.data.valid_days_options) {
        that.$set(that.form1.data, "valid_days_options", []);
      }
      that.form1.data.valid_days_options.push({
        days: 30,
        label: "月卡(30天)",
        discount: 1,
      });
    },
    // 移除有效期选项
    removeOption(index) {
      that.form1.data.valid_days_options.splice(index, 1);
    },
    // 添加版本日志
    addVersionLog() {
      if (!that.form1.data.version_logs) {
        that.$set(that.form1.data, "version_logs", []);
      }
      that.form1.data.version_logs.unshift({
        version: "",
        date: Date.now(),
        log: "",
        download_url: "",
      });
    },
    // 移除版本日志
    removeVersionLog(index) {
      that.form1.data.version_logs.splice(index, 1);
    },
     // 表单提交前处理
     async beforeSubmit() {
       // 检查是否有图片
       if (!that.form1.data.product_image) {
         vk.toast("请上传产品图");
         return false;
       }
       return true; // 返回true继续提交
     },
    // 表单提交成功
    formSuccess() {
      that.form1.props.show = false;
      vk.toast("操作成功");
      that.refresh();
    },
    // 获取图片URL（兼容多种数据格式）
    getImageUrl(imageData) {
      if (!imageData) return "";

      // 如果是字符串，直接返回
      if (typeof imageData === "string") {
        return imageData;
      }

      // 如果是对象，尝试获取url属性
      if (typeof imageData === "object") {
        if (imageData.url) return imageData.url;
        if (imageData[0] && typeof imageData[0] === "string")
          return imageData[0];
        if (imageData[0] && imageData[0].url) return imageData[0].url;
      }

      return "";
    },
    // 计算基础价格
    calculateBasePrice(row) {
      if (!row.price_points || !row.price_months || !row.price_machines) {
        return 0;
      }
      const basePrice = row.price_points / row.price_months / row.price_machines;
      return basePrice.toFixed(2);
    },
    // 修复基础价格
    fixBasePriceBtn() {
      vk.confirm(
        '此操作会为所有产品重新计算 base_price 字段，确定继续吗？',
        '提示',
        '确定',
        '取消',
        (res) => {
          if (res.confirm) {
          vk.callFunction({
            url: 'admin/product/sys/fixBasePrice',
            title: '修复中...',
            success: (data) => {
              vk.alert(
                `修复完成！\n总产品数：${data.data.total}\n已修复：${data.data.fixed}`,
                '修复成功',
                () => {
                  that.refresh();
                }
              );
            },
            fail: (err) => {
              vk.toast(err.msg || '修复失败');
            }
          });
          }
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

/* 有效期选项样式 */
.valid-days-options {
  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

/* 版本日志编辑样式 */
.version-logs-editor {
  .version-log-item {
    margin-bottom: 15px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    border-left: 3px solid #409EFF;

    .version-log-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;

      .version-tag {
        font-size: 14px;
        font-weight: bold;
        color: #409EFF;
      }
    }

    .version-log-content {
      .form-item {
        margin-bottom: 15px;

        label {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }
}

/* 产品图样式 */
.no-image {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #c0c4cc;
  font-size: 24px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}

</style>
