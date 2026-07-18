<template>
  <view class="page-body">
    <!-- 数据统计卡片 -->
    <view class="stats-cards">
      <el-card v-for="item in statsItems" :key="item.key" class="stats-card">
        <div class="stats-item">
          <div class="stats-label">{{ item.label }}</div>
          <div class="stats-value" :style="{ color: item.color }">
            {{ stats[item.key] }}
          </div>
        </div>
      </el-card>
    </view>

    <!-- 表格搜索组件 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
      <!-- 自定义时间筛选插槽 -->
      <template v-slot:time_filter>
        <div style="display: flex; gap: 10px; align-items: center;">
          <el-select
            v-model="queryForm1.formData.time_field"
            placeholder="选择时间类型"
            clearable
            style="width: 140px;"
          >
            <el-option label="购买时间" value="_add_time"></el-option>
            <el-option label="开始使用时间" value="activate_time"></el-option>
            <el-option label="过期时间" value="expire_time"></el-option>
          </el-select>
          <el-date-picker
            v-model="queryForm1.formData.time_range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            clearable
            style="width: 380px;"
          >
          </el-date-picker>
        </div>
      </template>
      
      <template slot="right-btns">
        <el-button
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="addBtn"
          >购买卡密</el-button>
        <el-button
          type="info"
          icon="el-icon-setting"
          @click="batchSetPrefixSuffixBtn"
          :disabled="table1.multipleSelection.length === 0"
          >批量设置前缀后缀</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          @click="exportBtn"
          :disabled="table1.multipleSelection.length === 0"
          >导出卡密</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="batchDeleteBtn"
          :disabled="table1.multipleSelection.length === 0"
          >批量删除</el-button>
      </template>
    </vk-data-table-query>

    <!-- 表格组件 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :query-form-param="queryForm1"
      :right-btns="['delete']"
      :custom-right-btns="table1.customRightBtns"
      :row-no="true"
      :pagination="true"
      :selection="true"
      @delete="deleteBtn"
      @selection-change="selectionChange"
    >
      <!-- 卡密列 -->
      <template v-slot:key="{ row }">
        <div class="card-code-cell">
          <span 
            class="code-text" 
            @dblclick="copyCode(row.card_code)"
            :title="'双击复制: ' + row.card_code"
          >
            {{ row.card_code }}
          </span>
          <el-tooltip content="点击复制卡密" placement="top">
            <i 
              class="el-icon-document-copy copy-icon"
              @click="copyCode(row.card_code)"
            ></i>
          </el-tooltip>
        </div>
      </template>

      <!-- 状态列 -->
      <template v-slot:status_text="{ row }">
        <el-tag :type="row.status_color || 'info'" size="small">
          {{ row.status_text || '未知' }}
        </el-tag>
      </template>

      <!-- 产品类型列 -->
      <template v-slot:product_type="{ row }">
        <el-tag
          :type="row.product_type === 'software' ? 'primary' : 'success'"
          size="small"
        >
          {{ row.product_type === "software" ? "软件" : "插件" }}
        </el-tag>
      </template>
    </vk-data-table>

    <!-- 购买卡密弹窗 -->
    <vk-data-dialog
      v-model="form1.props.show"
      :title="form1.props.title"
      width="1100px"
      mode="form"
    >
      <div class="dialog-layout">
        <!-- 左侧：表单区域 -->
        <div class="form-area">
          <vk-data-form
            ref="form1"
            v-model="form1.data"
            :rules="form1.props.rules"
            :action="form1.props.action"
            :form-type="form1.props.formType"
            :columns="form1.props.columns"
            label-width="130px"
            @success="formSuccess"
            @before-submit="beforeSubmit"
          >
            <!-- 机器数量字段提示插槽 -->
            <template v-slot:max_machine_count-tips>
              <div style="color: #909399; font-size: 12px; line-height: 1.5">
                月价 = 单价 × 机器数量
              </div>
            </template>
          </vk-data-form>
        </div>

        <!-- 右侧：积分扣费预览 -->
        <div v-if="form1.props.formType === 'add'" class="pricing-area">
          <div
            v-if="selectedProduct"
            class="points-cost-box"
          >
            <div class="cost-header">
              <i class="el-icon-wallet"></i>
              <span>积分扣费预览</span>
            </div>
            <div class="cost-content">
              <!-- 单栏信息 -->
              <div class="cost-info-single">
                <div class="cost-line">
                  <span class="cost-label">产品：</span>
                  <strong>{{ selectedProduct.product_name }}</strong>
                </div>
                <div class="cost-line">
                  <span class="cost-label">机器数：</span>
                  <strong class="cost-scale">&nbsp {{ pointsCalculation.machineCount }}</strong> &nbsp 机器
                </div>
                <div class="cost-line">
                  <span class="cost-label">时长：</span>
                  <strong> &nbsp {{ form1.data.limit_days || 30 }}</strong> &nbsp 天
                  <span class="cost-detail">&nbsp （{{ pointsCalculation.months }} &nbsp 月）</span>
                </div>
                <div class="cost-line">
                  <span class="cost-label">月价：</span>
                  <strong class="cost-monthly">{{ pointsCalculation.monthlyPrice }}</strong> &nbsp 积分/月
                </div>
                <div class="cost-line">
                  <span class="cost-label">单价：</span>
                  <strong class="cost-unit">&nbsp {{ pointsCalculation.unitPrice }}</strong> &nbsp 积分/张
                  <span class="cost-detail">（{{ pointsCalculation.monthlyPrice }} × {{ pointsCalculation.months }}）</span>
                </div>
                <div class="cost-line cost-line-total">
                  <span class="cost-label">合计：</span>
                  <strong class="cost-total">&nbsp {{ pointsCalculation.totalCost }} &nbsp</strong> 积分
                  <span class="cost-detail"> （{{ pointsCalculation.count }} 张）</span>
                </div>
              </div>

              <!-- 余额信息 -->
              <div class="cost-balance-info">
                <div class="balance-row">
                  <span class="balance-label">买前：</span>
                  <strong class="available">{{ pointsCalculation.available }}</strong>
                  <span class="balance-unit">积分</span>
                </div>
                <div class="balance-arrow">→</div>
                <div class="balance-row">
                  <span class="balance-label">买后：</span>
                  <strong
                    :class="
                      pointsCalculation.afterBalance < 0
                        ? 'insufficient'
                        : 'balance'
                    "
                  >
                    {{ pointsCalculation.afterBalance }}
                  </strong>
                  <span class="balance-unit">积分</span>
                </div>
              </div>

              <!-- 积分不足提示 -->
              <div
                v-if="pointsCalculation.afterBalance < 0"
                class="cost-warning"
              >
                <i class="el-icon-warning"></i>
                <span
                  >积分不足！还需
                  {{ Math.abs(pointsCalculation.afterBalance) }} 积分</span
                >
                <el-button type="text" @click="goToPointsShop" class="buy-btn"
                  >去购买 →</el-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </vk-data-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      title="编辑卡密"
      :visible.sync="editDialog.visible"
      width="700px"
      :close-on-click-modal="false"
      custom-class="edit-dialog-custom"
    >
      <div class="edit-dialog-content">
        <el-tabs v-model="editDialog.activeTab">
          <!-- 备注设置 -->
          <el-tab-pane label="备注设置" name="remark" v-if="editDialog.cardId">
            <el-input
              v-model="editDialog.remark"
              type="textarea"
              :rows="5"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
              style="margin-top: 20px;"
            ></el-input>
          </el-tab-pane>
          
          <!-- 字段顺序 -->
          <el-tab-pane label="字段顺序" name="columns">
            <div class="columns-tab-content">
              <div class="columns-tip">
                拖拽或使用按钮调整字段显示顺序
              </div>
              <div 
                class="column-sort-list"
                @wheel.stop
                @touchmove.stop
              >
                <div
                  v-for="(col, index) in editDialog.columns"
                  :key="col.key"
                  class="column-sort-item"
                  :class="{
                    'drag-active': editDialog.dragIndex === index,
                    'drag-over': editDialog.dragOverIndex === index && editDialog.dragIndex !== index
                  }"
                  :draggable="true"
                  @dragstart="handleDragStart(index)"
                  @dragover.prevent="handleDragOver(index)"
                  @drop="handleDrop(index)"
                  @dragenter.prevent="handleDragEnter(index)"
                  @dragleave="handleDragLeave"
                  @dragend="handleDragEnd"
                >
                  <i class="el-icon-rank drag-handle"></i>
                  <span class="column-title">{{ col.title }}</span>
                  <div class="column-actions">
                    <el-button
                      type="text"
                      :disabled="index === 0"
                      @click="moveColumn(index, 'up')"
                      size="mini"
                    >上移</el-button>
                    <el-button
                      type="text"
                      :disabled="index === editDialog.columns.length - 1"
                      @click="moveColumn(index, 'down')"
                      size="mini"
                    >下移</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 批量设置前缀后缀弹窗 -->
    <el-dialog
      title="设置前后缀"
      :visible.sync="batchSetDialog.visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="batch-set-dialog-content">
        <div class="batch-set-tip">
          <i class="el-icon-info"></i>
          <span>将为选中的 {{ table1.multipleSelection.length }} 条卡密批量设置前缀和后缀</span>
        </div>
        <el-form :model="batchSetDialog.form" label-width="120px">
          <el-form-item label="卡密前缀">
            <el-input
              v-model="batchSetDialog.form.prefix"
              placeholder="请输入卡密前缀（可选，留空则不设置）"
              maxlength="20"
              clearable
            >
              <template slot="prepend">前缀</template>
            </el-input>
            <div class="form-tip">设置后，卡密将以此前缀开头</div>
          </el-form-item>
          <el-form-item label="卡密后缀">
            <el-input
              v-model="batchSetDialog.form.suffix"
              placeholder="请输入卡密后缀（可选，留空则不设置）"
              maxlength="20"
              clearable
            >
              <template slot="prepend">后缀</template>
            </el-input>
            <div class="form-tip">设置后，卡密将以此后缀结尾</div>
          </el-form-item>
          <el-form-item label="预览效果">
            <div class="preview-box">
              <div class="preview-label">示例卡密：</div>
              <div class="preview-code">
                <span class="preview-prefix">{{ batchSetDialog.form.prefix || '' }}</span>
                <span class="preview-original">a7f83b63d5f244c7bcdb4987e5694ac7</span>
                <span class="preview-suffix">{{ batchSetDialog.form.suffix || '' }}</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchSetDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveBatchSetPrefixSuffix">确 定</el-button>
      </span>
    </el-dialog>

  </view>
</template>

<script>
let that;
let vk = uni.vk;
let originalForms = {};

// 状态数据（合并类型映射）
const statusData = [
  { value: 0, label: "未使用", type: "success" },
  { value: 1, label: "已使用", type: "info" },
  { value: 2, label: "已过期", type: "danger" },
  { value: 3, label: "已禁用", type: "warning" },
];

// 默认续费天数选项（无时长折扣）
const DEFAULT_RENEW_DAYS_OPTIONS = [
  { days: 30, label: "月卡(30天)", discount: 1 },
  { days: 90, label: "季卡(90天)", discount: 1 },
  { days: 180, label: "半年卡(180天)", discount: 1 },
  { days: 365, label: "年卡(365天)", discount: 1 },
];

// 状态映射辅助函数
const getStatusInfo = (status) =>
  statusData.find((s) => s.value === status) || { label: "未知", type: "info" };

export default {
  filters: {
    timeFormat(timestamp) {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", { hour12: false });
    },
  },
  data() {
    return {
      loading: false,
      stats: {
        total: 0,
        unused: 0,
        used: 0,
        expired: 0,
      },
      // 编辑弹窗
      editDialog: {
        visible: false,
        activeTab: "remark",
        remark: "",
        cardId: null,
        columns: [], // 字段顺序列表
        originalColumns: [], // 原始字段列表（用于重置）
        dragIndex: -1, // 当前拖拽的索引
        dragOverIndex: -1, // 当前拖拽经过的索引
      },
      // 批量设置前缀后缀弹窗
      batchSetDialog: {
        visible: false,
        form: {
          prefix: "",
          suffix: "",
        },
      },
      // 统计卡片配置
      statsItems: [
        { key: "total", label: "总卡密数", color: "#303133" },
        { key: "unused", label: "未使用", color: "#67C23A" },
        { key: "used", label: "已使用", color: "#909399" },
        { key: "expired", label: "已过期", color: "#F56C6C" },
      ],
      // 产品列表
      productList: [],
      // 用户积分信息
      userPoints: {
        available_points: 0,
        total_points: 0,
      },
      // 用户绑定机器统计
      machineStats: {
        total_machines: 0,
      },
      // 折叠面板激活状态
      pricingCollapseActive: "",
      table1: {
        action: "admin/card/kh/getList",
        columns: [
          {
            key: "key",
            title: "卡密",
            type: "text",
            width: 300,
            slot: true,
          },
          { key: "product_name", title: "产品名称", type: "text", width: 150 },
          {
            key: "product_type",
            title: "产品类型",
            type: "text",
            width: 100,
            slot: true,
          },
          {
            key: "status_text",
            title: "状态",
            type: "text",
            width: 100,
            slot: true,
          },
          { key: "limit_days_str", title: "有效天数", type: "text", width: 100 },
          {
            key: "max_machine_str",
            title: "机器数",
            type: "text",
            width: 100,
            defaultValue: "-",
          },
          {
            key: "current_machine_count",
            title: "已绑定",
            type: "text",
            width: 100,
            defaultValue: "0",
          },
          {
            key: "total_times_str",
            title: "使用次数",
            type: "text",
            width: 100,
            defaultValue: "-",
          },
          { key: "_add_time", title: "购买时间", type: "time", width: 180 },
          {
            key: "activate_time_str",
            title: "开始使用时间",
            type: "text",
            width: 180,
            defaultValue: "-",
          },
          {
            key: "expire_time_str",
            title: "卡密过期时间",
            type: "text",
            width: 180,
            defaultValue: "-",
          },
          {
            key: "remark",
            title: "备注",
            type: "text",
            width: 200,
            defaultValue: "-",
          },
        ],
        multipleSelection: [],
        customRightBtns: [
          {
            title: "续费",
            icon: "el-icon-refresh",
            type: "warning",
            onClick: (item) => that.renewBtn({ item }),
            show: () => true, // 所有卡密都可以续费
          },
          {
            title: "编辑",
            icon: "el-icon-edit",
            type: "primary",
            onClick: (item) => that.editBtn({ item }),
            show: () => true, // 所有卡密都可以编辑
          },
        ],
      },
      queryForm1: {
        formData: {
          time_field: "_add_time", // 默认筛选购买时间
        },
        columns: [
          {
            key: "card_code",
            type: "text",
            title: "卡密",
            placeholder: "请输入卡密",
            mode: "%%",
            col: { span: 5 },
          },
          {
            key: "product_name",
            type: "select",
            title: "产品",
            placeholder: "选择产品",
            data: [],
            col: { span: 4 },
            mode: "=",
          },
          {
            key: "status_text",
            type: "select",
            title: "状态",
            placeholder: "选择状态",
            data: [
              { value: "未激活", label: "未激活" },
              { value: "使用中", label: "使用中" },
              { value: "已过期", label: "已过期" },
              { value: "次数用完", label: "次数用完" },
            ],
            col: { span: 2 },
          },
          {
            key: "time_filter",
            type: "slot",
            title: "时间筛选",
            col: { span: 8 },
          },
        ],
      },
      form1: {
        data: {},
        props: {
          action: "",
          columns: [
            {
              key: "card_key",
              title: "卡密",
              type: "text",
              placeholder: "",
              disabled: true,
              show: ["renew"], // 只在续费时显示
            },
            {
              key: "current_expire_time",
              title: "当前到期时间",
              type: "text",
              placeholder: "",
              disabled: true,
              show: ["renew"], // 只在续费时显示
            },
            {
              key: "product_id",
              title: "选择产品",
              type: "select",
              data: [],
              placeholder: "请选择产品",
              defaultValue: "",
              disabled: (formData) => {
                // 续费时禁用产品选择
                return that.form1.props.formType === "renew";
              },
              change: (val) => {
                that.onProductChange(val);
                that.forceUpdate();
              },
            },
            {
              key: "limit_days",
              title: "购买类型", // 购买时的标题
              type: "select",
              data: [],
              placeholder: "请选择购买类型",
              defaultValue: 30,
              show: ["add"], // 只在购买时显示
              change: () => {
                that.forceUpdate();
              },
            },
            {
              key: "renew_days",
              title: "续费天数",
              type: "select",
              data: [],
              placeholder: "请选择续费天数",
              defaultValue: 30,
              show: ["renew"], // 只在续费时显示
              change: () => that.forceUpdate(),
            },
            {
              key: "max_machine_count",
              title: "机器数量",
              type: "number",
              placeholder: "请输入机器数量(1-999台)",
              defaultValue: 1,
              min: 1,
              max: 999,
              show: ["add"], // 只在购买时显示
              change: () => that.forceUpdate(),
            },
            {
              key: "numKeys",
              title: "购买数量",
              type: "number",
              placeholder: "请输入购买数量",
              tips: "一次性购买的卡密数量",
              defaultValue: 1,
              min: 1,
              max: 100,
              show: ["add"], // 只在购买时显示
              change: () => that.forceUpdate(),
            },
            {
              key: "keyPrefix",
              title: "卡密前缀",
              type: "text",
              placeholder: "请输入卡密前缀（可选）",
              tips: "生成的卡密将以此前缀开头",
              defaultValue: "",
              maxlength: 20,
              show: ["add"], // 只在购买时显示
            },
            {
              key: "keySuffix",
              title: "卡密后缀",
              type: "text",
              placeholder: "请输入卡密后缀（可选）",
              tips: "生成的卡密将以此后缀结尾",
              defaultValue: "",
              maxlength: 20,
              show: ["add"], // 只在购买时显示
            },
            {
              key: "keyLength",
              title: "密钥长度",
              type: "number",
              placeholder: "请输入密钥长度(10-64位)",
              tips: "密钥字符串长度",
              defaultValue: 32,
              min: 10,
              max: 64,
              show: [], // 隐藏此字段，不让用户设置
            },
            {
              key: "remark",
              title: "备注",
              type: "textarea",
              placeholder: "请输入备注信息",
            },
          ],
          rules: {
            product_id: [
              { required: true, message: "请选择产品", trigger: "change" },
            ],
            limit_days: [
              { required: true, message: "请选择购买类型", trigger: "change" },
            ],
            renew_days: [
              { required: true, message: "请选择续费天数", trigger: "change" },
            ],
            max_machine_count: [
              { required: true, message: "请输入机器数量", trigger: "blur" },
              {
                type: "number",
                min: 1,
                max: 999,
                message: "机器数量必须在1-999之间",
                trigger: "blur",
              },
            ],
            numKeys: [
              { required: true, message: "请输入购买数量", trigger: "blur" },
              {
                type: "number",
                min: 1,
                max: 100,
                message: "购买数量必须在1-100之间",
                trigger: "blur",
              },
            ],
            keyLength: [
              { required: true, message: "请输入密钥长度", trigger: "blur" },
              {
                type: "number",
                min: 10,
                max: 64,
                message: "密钥长度必须在10-64之间",
                trigger: "blur",
              },
            ],
          },
          formType: "",
          title: "",
          show: false,
        },
      },
    };
  },
  computed: {
    // 当前选中的产品
    selectedProduct() {
      if (!this.form1.data.product_id || !this.productList.length) {
        return null;
      }
      
      // 解析产品值（可能是 JSON 字符串或 product_id）
      let productId, productName;
      try {
        const parsed = JSON.parse(this.form1.data.product_id);
        productId = parsed.product_id;
        productName = parsed.product_name;
      } catch (e) {
        // 兼容旧格式：只使用 product_id
        productId = this.form1.data.product_id;
        productName = null;
      }
      
      return this.productList.find((p) => 
        p.product_id === productId && (!productName || p.product_name === productName)
      );
    },
    // 当前机器规模信息
    currentMachineScale() {
      const maxMachineCount = this.form1.data?.max_machine_count || 1;
      const productBasePrice = this.selectedProduct?.base_price || 5;
      return this.getMachineScaleInfo(maxMachineCount, productBasePrice);
    },
    // 当前产品基础价格
    currentBasePrice() {
      return this.selectedProduct && this.selectedProduct.base_price ? this.selectedProduct.base_price : 5;
    },
    // 当前用户ID
    currentUserId() {
      return vk.getVuex('userInfo._id');
    },
    // 积分计算信息
    pointsCalculation() {
      const defaultResult = {
        months: 0,
        scaleLevel: "",
        monthlyPrice: 0,
        unitPrice: 0,
        count: 0,
        timeDiscount: 1,
        discountText: "",
        totalCost: 0,
        available: this.userPoints.available_points || 0,
        afterBalance: this.userPoints.available_points || 0,
      };

      if (!this.selectedProduct) return defaultResult;

      // 续费模式使用 renew_days，购买模式使用 limit_days
      const isRenewMode = this.form1.props.formType === "renew";
      const limitDays = isRenewMode ? (this.form1.data.renew_days || 30) : (this.form1.data.limit_days || 30);
      
      // 续费模式：数量固定为1，使用卡密的机器数量
      // 购买模式：使用表单的购买数量和机器数量
      const count = isRenewMode ? 1 : (this.form1.data.numKeys || 1);
      const machineCount = isRenewMode ? (this.form1.data.renew_machine_count || 1) : (this.form1.data?.max_machine_count || 1);
      
      // 计算基础价格（应用特殊价格逻辑）
      let productBasePrice = this.selectedProduct?.base_price || 5;

      // 特殊价格逻辑：如果是特殊价格用户且绑定机器数不超过1000台，则使用产品配置的特殊价格
      const userInfo = vk.getVuex("$user.userInfo");
      const userId = userInfo?._id;
      const specialPriceUserIds = this.selectedProduct?.special_price_user_ids || [];
      const isSpecialPriceUser = userId &&
        Array.isArray(specialPriceUserIds) &&
        specialPriceUserIds.length > 0 &&
        specialPriceUserIds.includes(userId);
      const totalMachines = this.machineStats?.total_machines || 0;

      if (isSpecialPriceUser && totalMachines <= 1000) {
        // 使用产品配置的特殊价格，默认为1
        productBasePrice = this.selectedProduct?.special_price || 1;
      }
      
      const scaleInfo = this.getMachineScaleInfo(machineCount, productBasePrice);

      // 时长折扣固定为1（不再有时长折扣）
      let timeDiscount = 1;
      let discountText = "";

      // 使用统一的价格计算方法
      const priceInfo = this.calculatePrice(
        scaleInfo.monthlyPrice,
        limitDays,
        timeDiscount
      );

      // 单价（不再应用定制用户折扣）
      const unitPrice = priceInfo.unitPrice;
      const totalCost = unitPrice * count;
      const available = this.userPoints.available_points || 0;
      const afterBalance = available - totalCost;

      return {
        months: priceInfo.months,
        scaleLevel: scaleInfo.level,
        monthlyPrice: scaleInfo.monthlyPrice,
        machineCount: machineCount,
        unitPrice: unitPrice,
        count,
        timeDiscount,
        discountText,
        totalCost,
        available,
        afterBalance,
      };
    },
  },
  onLoad(options = {}) {
    that = this;
    vk = that.vk;
    that.init();
  },
  methods: {
    // 获取机器规模信息（简化版）
    getMachineScaleInfo(maxUseCount, productBasePrice = 5) {
      const basePrice = productBasePrice; // 使用产品的基础价格
      const monthlyPrice = basePrice * maxUseCount; // 月价 = 单价 × 机器数

      return {
        level: `${maxUseCount}台`,
        monthlyPrice,
        machineCount: maxUseCount,
        unitPrice: basePrice, // 单台价格
        basePrice, // 返回基础价格，方便显示
      };
    },
    // 计算价格（提取公共逻辑，无时长折扣）
    calculatePrice(baseMonthlyPrice, validDays, timeDiscount = 1) {
      // 计算月数（年卡特殊处理为12个月）
      const months = validDays === 365 ? 12 : Math.ceil(validDays / 30);
      const unitPrice = Math.ceil(baseMonthlyPrice * months);

      return {
        unitPrice,
        months,
      };
    },
    // 初始化
    async init() {
      await that.loadProducts();
      
      // 在产品加载完成后再保存原始表单（确保产品选项已加载）
      originalForms["form1"] = vk.pubfn.copyObject(that.form1);
      
      // 加载保存的字段顺序
      that.loadColumnOrder();
      
      that.loadStats();
      that.loadUserPoints();
      that.loadMachineStats();
    },
    // 加载字段顺序
    loadColumnOrder() {
      const savedOrder = uni.getStorageSync('card_columns_order');
      if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
        const currentColumns = that.table1.columns || [];
        const columnMap = {};
        currentColumns.forEach(col => {
          columnMap[col.key] = col;
        });
        
        const orderedColumns = [];
        savedOrder.forEach(key => {
          if (columnMap[key]) {
            orderedColumns.push(columnMap[key]);
          }
        });
        
        // 添加未在保存顺序中的字段
        currentColumns.forEach(col => {
          if (!savedOrder.includes(col.key)) {
            orderedColumns.push(col);
          }
        });
        
        that.table1.columns = orderedColumns;
      }
    },
    // 加载产品列表（只加载已购买的产品）
    async loadProducts() {
      const res = await vk.callFunction({
        url: "admin/product/kh/getList",
      });

      if (res.code === 0 && res.data) {
        // 只筛选当前用户已购买的产品
        const purchasedProducts = res.data.filter(product => {
          // 必须是已购买的产品（is_purchased=true）
          return product.is_purchased === true;
        });
        
        that.productList = purchasedProducts;
        
        // 为表单准备产品选项（使用 product_id + product_name 作为唯一标识）
        const formProductOptions = purchasedProducts.map((p) => ({
          value: JSON.stringify({ product_id: p.product_id, product_name: p.product_name }),
          label: p.product_name,
        }));
        
        // 为筛选准备产品选项（使用 product_name，因为 product_id 不是唯一值）
        const queryProductOptions = purchasedProducts.map((p) => ({
          value: p.product_name,
          label: p.product_name,
        }));
        
        that.updateProductOptions(formProductOptions, queryProductOptions);
      }
    },
    // 产品改变时
    onProductChange(productValue) {
      // 解析产品值（可能是 JSON 字符串或 product_id）
      let productId, productName;
      try {
        const parsed = JSON.parse(productValue);
        productId = parsed.product_id;
        productName = parsed.product_name;
      } catch (e) {
        // 兼容旧格式：只使用 product_id
        productId = productValue;
        productName = null;
      }
      
      const product = that.productList.find((p) => 
        p.product_id === productId && (!productName || p.product_name === productName)
      );
      if (!product) return;

      // 直接从产品的 valid_days_options 加载购买类型选项，过滤掉体验卡（days <= 7）
      if (product.valid_days_options && product.valid_days_options.length > 0) {
        const options = product.valid_days_options
          .filter((opt) => opt.days > 7) // 过滤掉体验卡
          .map((opt) => ({
            value: opt.days,
            label: opt.label,
          }));
        
        if (options.length > 0) {
          that.updateValidDaysOptions(options);
          // 设置默认选中第一个选项
          that.$set(that.form1.data, "limit_days", options[0].value);
          that.$set(that.form1.data, "max_machine_count", 1);
        }
      }
    },
    // 加载统计数据
    loadStats() {
      vk.callFunction({
        url: "admin/card/kh/getStats",
        success: (data) => (that.stats = data),
      });
    },
    // 加载用户积分
    loadUserPoints() {
      vk.callFunction({
        url: "admin/points/kh/getBalance",
        success: (data) => {
          that.userPoints = data.data || {
            available_points: 0,
            total_points: 0,
          };
        },
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
    // 跳转到积分商城
    goToPointsShop() {
      that.form1.props.show = false;
      // 延迟一下再跳转，确保弹窗已关闭
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/points-shop/points-shop",
          fail: (err) => {
            console.error('跳转失败：', err);
            vk.toast("页面跳转失败，请重试");
          }
        });
      }, 100);
    },
    // 搜索
    search(obj) {
      that.$refs.table1.query(obj);
    },
    // 刷新（批量调用）
    refresh() {
      that.$refs.table1.refresh();
      that.loadStats();
      that.loadUserPoints();
    },
    // 显示积分不足提示（提取公共逻辑）
    showInsufficientPointsAlert(neededPoints) {
      const deficit = neededPoints - that.userPoints.available_points;
      vk.alert(`积分不足！还需 ${deficit} 积分`, "提示", () => {
        that.goToPointsShop();
      });
    },
    // 多选变化
    selectionChange(list) {
      that.table1.multipleSelection = list;
    },
    // 购买卡密
    async addBtn() {
      that.form1.props.action = "admin/card/kh/add";
      that.form1.props.formType = "add";
      that.form1.props.title = "购买卡密";

      const firstProduct = that.productList?.[0];
      if (!firstProduct) {
        vk.alert("暂无可用产品，请先购买产品后再生成卡密", "提示", () => {
          uni.navigateTo({
            url: "/pages/my-products/my-products",
            fail: (err) => {
              console.error('跳转失败：', err);
              vk.toast("页面跳转失败，请重试");
            }
          });
        });
        return;
      }

      // 使用 product_id + product_name 作为唯一标识
      const defaultProductValue = JSON.stringify({ 
        product_id: firstProduct.product_id, 
        product_name: firstProduct.product_name 
      });
      
      // 先更新购买类型选项（关键：必须在打开弹窗前设置），过滤掉体验卡（days <= 7）
      if (firstProduct.valid_days_options && firstProduct.valid_days_options.length > 0) {
        const options = firstProduct.valid_days_options
          .filter((opt) => opt.days > 7) // 过滤掉体验卡
          .map((opt) => ({
            value: opt.days,
            label: opt.label,
          }));
        if (options.length > 0) {
          that.updateValidDaysOptions(options);
        }
      }

      // 动态设置 limit_days 字段的标题和占位符
      const limitDaysCol = that.form1.props.columns.find(c => c.key === 'limit_days');
      if (limitDaysCol) {
        limitDaysCol.title = "购买类型";
        limitDaysCol.placeholder = "请选择购买类型";
      }

      // 确定默认购买类型（过滤掉体验卡后取第一个）
      const validOptions = firstProduct.valid_days_options?.filter((opt) => opt.days > 7) || [];
      const defaultValidDays = validOptions.length > 0 ? validOptions[0].days : 30;

      // 设置表单数据
      that.form1.data = {
        product_id: defaultProductValue,
        product_name: firstProduct.product_name, // 同时传递 product_name 到后端
        limit_days: defaultValidDays,
        max_machine_count: 1,
        numKeys: 1,
        keyPrefix: "", // 卡密前缀
        keySuffix: "", // 卡密后缀
        keyLength: 32, // 默认32位密钥长度
        remark: ""
      };

      that.form1.props.show = true;
    },
    // 编辑
    editBtn({ item }) {
      that.editDialog.cardId = item._id;
      that.editDialog.remark = item.remark || "";
      // 如果有卡密ID，默认显示备注标签页；否则显示字段顺序标签页
      that.editDialog.activeTab = item._id ? "remark" : "columns";
      
      // 初始化字段顺序列表（从当前表格配置复制）
      const currentColumns = that.table1.columns || [];
      that.editDialog.originalColumns = vk.pubfn.copyObject(currentColumns);
      
      // 尝试从localStorage加载保存的字段顺序
      const savedOrder = uni.getStorageSync('card_columns_order');
      if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
        // 使用保存的顺序重新排列字段
        const orderedColumns = [];
        const columnMap = {};
        currentColumns.forEach(col => {
          columnMap[col.key] = col;
        });
        
        savedOrder.forEach(key => {
          if (columnMap[key]) {
            orderedColumns.push(columnMap[key]);
          }
        });
        
        // 添加未在保存顺序中的字段
        currentColumns.forEach(col => {
          if (!savedOrder.includes(col.key)) {
            orderedColumns.push(col);
          }
        });
        
        that.editDialog.columns = orderedColumns;
      } else {
        that.editDialog.columns = vk.pubfn.copyObject(currentColumns);
      }
      
      that.editDialog.visible = true;
    },
    // 移动字段位置
    moveColumn(index, direction) {
      const columns = that.editDialog.columns;
      if (direction === 'up' && index > 0) {
        const temp = columns[index];
        that.$set(columns, index, columns[index - 1]);
        that.$set(columns, index - 1, temp);
      } else if (direction === 'down' && index < columns.length - 1) {
        const temp = columns[index];
        that.$set(columns, index, columns[index + 1]);
        that.$set(columns, index + 1, temp);
      }
    },
    // 拖拽开始
    handleDragStart(index) {
      that.editDialog.dragIndex = index;
    },
    // 拖拽进入
    handleDragEnter(index) {
      if (that.editDialog.dragIndex !== -1 && that.editDialog.dragIndex !== index) {
        that.editDialog.dragOverIndex = index;
      }
    },
    // 拖拽经过
    handleDragOver(index) {
      // 允许放置
      if (that.editDialog.dragIndex !== -1 && that.editDialog.dragIndex !== index) {
        that.editDialog.dragOverIndex = index;
      }
    },
    // 拖拽离开
    handleDragLeave() {
      that.editDialog.dragOverIndex = -1;
    },
    // 拖拽结束
    handleDragEnd() {
      that.editDialog.dragIndex = -1;
      that.editDialog.dragOverIndex = -1;
    },
    // 拖拽放置
    handleDrop(dropIndex) {
      const dragIndex = that.editDialog.dragIndex;
      
      if (dragIndex === -1 || dragIndex === dropIndex) {
        that.editDialog.dragIndex = -1;
        that.editDialog.dragOverIndex = -1;
        return;
      }
      
      // 移动元素
      const columns = [...that.editDialog.columns];
      const draggedItem = columns[dragIndex];
      
      // 从原位置移除
      columns.splice(dragIndex, 1);
      // 插入到新位置
      columns.splice(dropIndex, 0, draggedItem);
      
      // 更新数组
      that.editDialog.columns = columns;
      
      // 重置拖拽状态
      that.editDialog.dragIndex = -1;
      that.editDialog.dragOverIndex = -1;
    },
    // 保存编辑
    saveEdit() {
      // 保存备注
      if (that.editDialog.cardId) {
        vk.callFunction({
          url: 'admin/card/kh/updateRemark',
          data: {
            _id: that.editDialog.cardId,
            remark: that.editDialog.remark
          },
          success: () => {
            // 保存字段顺序到localStorage
            const columnOrder = that.editDialog.columns.map(col => col.key);
            uni.setStorageSync('card_columns_order', columnOrder);
            
            // 更新表格字段顺序
            that.table1.columns = vk.pubfn.copyObject(that.editDialog.columns);
            
            vk.toast('保存成功');
            that.editDialog.visible = false;
            that.refresh();
          }
        });
      } else {
        // 只保存字段顺序
        const columnOrder = that.editDialog.columns.map(col => col.key);
        uni.setStorageSync('card_columns_order', columnOrder);
        
        // 更新表格字段顺序
        that.table1.columns = vk.pubfn.copyObject(that.editDialog.columns);
        
        vk.toast('字段顺序已保存');
        that.editDialog.visible = false;
        that.refresh();
      }
    },
    // 续费（复用购买卡密弹窗）
    async renewBtn({ item }) {
      // 检查是否已激活
      if (item.activate_time === 0) {
        return vk.toast("该卡密尚未激活，无法续费");
      }
      
      // 检查是否有时间限制
      if (item.limit_days === -1) {
        return vk.toast("永久有效的卡密无需续费");
      }

      // 获取产品信息（使用 product_id + product_name 双重验证）
      const product = that.productList.find((p) => 
        p.product_id === item.product_id && 
        (!item.product_name || p.product_name === item.product_name)
      );
      if (!product) {
        return vk.toast("产品不存在");
      }

      // 刷新积分
      await that.loadUserPoints();

      // 设置续费天数选项（更新 renew_days 字段的选项），过滤掉体验卡（days <= 7）
      let renewOptions = [];
      if (product.valid_days_options && product.valid_days_options.length > 0) {
        renewOptions = product.valid_days_options
          .filter((opt) => opt.days > 7) // 过滤掉体验卡
          .map((opt) => ({
            value: opt.days,
            label: opt.label,
          }));
      }
      // 如果没有可用选项，使用默认选项
      if (renewOptions.length === 0) {
        renewOptions = DEFAULT_RENEW_DAYS_OPTIONS.map((opt) => ({
          value: opt.days,
          label: opt.label,
        }));
      }
      that.updateValidDaysOptions(renewOptions, 'renew_days');

      // 复用购买卡密弹窗
      that.form1.props.action = "admin/card/kh/renew";
      that.form1.props.formType = "renew";
      that.form1.props.title = "续费卡密";

      // 设置表单数据
      that.form1.data = {
        card_id: item._id,
        card_key: item.card_code,
        current_expire_time: vk.pubfn.timeFormat(item.expire_time, 'yyyy-MM-dd hh:mm:ss'),
        product_id: item.product_id,
        product_name: item.product_name || product.product_name, // 传递 product_name 到后端
        renew_days: (product.valid_days_options?.filter((opt) => opt.days > 7)?.[0]?.days) || 30,
        renew_machine_count: item.max_machine_count,
        remark: ""
      };

      that.form1.props.show = true;
    },
    // 删除
    deleteBtn({ item, deleteFn }) {
      vk.confirm(
        `确定要删除卡密【${item.card_code}】吗？`,
        "提示",
        "确定",
        "取消",
        (res) => {
          if (res.confirm) {
            deleteFn({
              action: "admin/card/kh/delete",
              data: { _id: item._id },
            });
          }
        }
      );
    },
    // 批量删除
    batchDeleteBtn() {
      if (that.table1.multipleSelection.length === 0) {
        return vk.toast("请先选择要删除的卡密");
      }
      vk.confirm(
        `确定要删除选中的 ${that.table1.multipleSelection.length} 条卡密吗？`,
        "提示",
        "确定",
        "取消",
        (res) => {
          if (res.confirm) {
          vk.callFunction({
            url: "admin/card/kh/batchDelete",
            data: {
              ids: that.table1.multipleSelection.map((item) => item._id),
            },
            success: () => {
              vk.toast("删除成功");
              that.refresh();
            },
          });
          }
        }
      );
    },
    // 批量设置前缀后缀
    batchSetPrefixSuffixBtn() {
      if (that.table1.multipleSelection.length === 0) {
        return vk.toast("请先选择要设置的卡密");
      }
      // 重置表单
      that.batchSetDialog.form = {
        prefix: "",
        suffix: "",
      };
      that.batchSetDialog.visible = true;
    },
    // 保存批量设置前缀后缀
    saveBatchSetPrefixSuffix() {
      const { prefix, suffix } = that.batchSetDialog.form;
      
      // 如果前缀和后缀都为空，提示用户
      if (!prefix && !suffix) {
        return vk.toast("请至少输入前缀或后缀");
      }
      
      vk.confirm(
        `确定要为选中的 ${that.table1.multipleSelection.length} 条卡密设置前缀和后缀吗？`,
        "提示",
        "确定",
        "取消",
        (res) => {
          if (res.confirm) {
            // 计算新的卡密并逐个更新
            const updatePromises = that.table1.multipleSelection.map((item) => {
              const originalCode = item.card_code || '';
              // 去除原有的前缀和后缀（如果存在）
              let codeWithoutPrefixSuffix = originalCode;
              
              // 构建新的卡密
              const newCode = (prefix || '') + codeWithoutPrefixSuffix + (suffix || '');
              
              return vk.callFunction({
                url: "admin/card/kh/update",
                data: {
                  _id: item._id,
                  card_code: newCode,
                },
              });
            });
            
            Promise.all(updatePromises).then(() => {
              vk.toast("设置成功");
              that.batchSetDialog.visible = false;
              that.refresh();
            }).catch((err) => {
              console.error('批量设置失败：', err);
              vk.toast("设置失败，请重试");
            });
          }
        }
      );
    },
    // 导出卡密
    exportBtn() {
      if (that.table1.multipleSelection.length === 0) {
        return vk.toast("请先选择要导出的卡密");
      }
      // 处理导出数据：映射字段并转换格式
      const exportData = that.table1.multipleSelection.map(item => {
        const processedItem = { ...item };
        // 将 card_code 映射到 key（卡密列配置的 key 是 "key"）
        if (item.card_code !== undefined) {
          processedItem.key = item.card_code;
        }
        // 通过 product_id + product_name 从产品列表中查找产品类型
        if (item.product_id && that.productList && that.productList.length > 0) {
          const product = that.productList.find(p => 
            p.product_id === item.product_id && 
            (!item.product_name || p.product_name === item.product_name)
          );
          if (product && product.product_type) {
            // 转换产品类型：software -> 软件，plugin -> 插件
            processedItem.product_type = product.product_type === "software" ? "软件" : "插件";
          } else {
            processedItem.product_type = "插件"; // 默认值
          }
        } else if (item.product_type !== undefined) {
          // 如果数据中已有 product_type，直接转换
          processedItem.product_type = item.product_type === "software" ? "软件" : "插件";
        } else {
          processedItem.product_type = "插件"; // 默认值
        }
        return processedItem;
      });
      that.$refs.table1.exportExcel({
        fileName: "卡密列表",
        title: "正在导出选中的卡密数据...",
        data: exportData,
      });
    },
    // 复制卡密
    copyCode(code) {
      // 去除前后空格
      const trimmedCode = code ? String(code).trim() : '';
      if (!trimmedCode) {
        return vk.toast("卡密为空");
      }
      uni.setClipboardData({
        data: trimmedCode,
        success: () => vk.toast("复制成功"),
      });
    },
    // 表单提交前验证
    async beforeSubmit(formData) {
      // 解析 product_id（可能是 JSON 字符串）
      if (formData.product_id) {
        try {
          const parsed = JSON.parse(formData.product_id);
          if (parsed.product_id && parsed.product_name) {
            // 将解析后的 product_id 和 product_name 分别设置到表单数据中
            formData.product_id = parsed.product_id;
            formData.product_name = parsed.product_name;
          }
        } catch (e) {
          // 如果不是 JSON 字符串，保持原样（兼容旧格式）
          // 但需要从产品列表中获取 product_name
          if (that.productList && that.productList.length > 0) {
            const product = that.productList.find(p => p.product_id === formData.product_id);
            if (product) {
              formData.product_name = product.product_name;
            }
          }
        }
      }
      return true;
    },
    // 表单提交成功
    formSuccess(data) {
      that.form1.props.show = false;
      
      if (that.form1.props.formType === "renew") {
        // 续费成功
        vk.toast("续费成功");
      } else {
        // 购买成功
        vk.toast("操作成功");
      }
      
      that.refresh();
    },
    // 强制更新（公共方法）
    forceUpdate() {
      this.$forceUpdate();
    },
    // 更新产品选项（公共方法）
    updateProductOptions(formProductOptions, queryProductOptions) {
      // 更新表单的产品选项（使用 JSON 格式的值）
      const formCol = this.form1.props.columns.find((c) => c.key === "product_id");
      if (formCol) {
        this.$set(formCol, 'data', formProductOptions);
      }
      
      // 更新筛选的产品选项（使用 product_name）
      const queryCol = this.queryForm1.columns.find((c) => c.key === "product_name");
      if (queryCol) {
        this.$set(queryCol, 'data', queryProductOptions || formProductOptions);
      }
    },
    // 更新购买类型选项（公共方法）
    updateValidDaysOptions(options, fieldKey = 'limit_days') {
      const col = this.form1.props.columns.find(
        (c) => c.key === fieldKey
      );
      if (col) {
        // 使用 $set 确保响应式更新
        this.$set(col, 'data', options);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./card-manage.scss";
</style>
