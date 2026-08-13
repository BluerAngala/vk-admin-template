<template>
  <view class="page-body">
    <!-- 数据统计卡片 -->
    <stats-cards :items="statsItems" :stats="stats" />

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
    <purchase-dialog
      ref="purchaseDialog"
      :show.sync="purchaseDialogVisible"
      :product-list="productList"
      :user-points="userPoints"
      :machine-stats="machineStats"
      @success="onPurchaseSuccess"
      @go-to-points-shop="goToPointsShop"
      @update-query-options="onUpdateQueryOptions"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      :visible.sync="editDialog.visible"
      :card-id="editDialog.cardId"
      :remark="editDialog.remark"
      :columns="editDialog.columns"
      @save="onEditSave"
    />

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

import StatsCards from '@/components/stats-cards/index.vue';
import PurchaseDialog from './components/PurchaseDialog.vue';
import EditDialog from './components/EditDialog.vue';

export default {
  components: { StatsCards, PurchaseDialog, EditDialog },
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
      purchaseDialogVisible: false,
      stats: {
        total: 0,
        unused: 0,
        used: 0,
        expired: 0,
      },
      // 编辑弹窗
      editDialog: {
        visible: false,
        remark: "",
        cardId: null,
        columns: [],
        originalColumns: [],
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
    };
  },
  computed: {},
  onLoad(options = {}) {
    that = this;
    vk = that.vk;
    that.init();
  },
  methods: {
    // 初始化
    async init() {
      await that.loadProducts();
      
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
        
        // 更新子组件和查询组件的产品选项
        if (that.$refs.purchaseDialog) {
          that.$refs.purchaseDialog.updateFormProductOptions(formProductOptions, queryProductOptions);
        }
        // 更新查询组件的产品选项
        const queryCol = that.queryForm1.columns.find((c) => c.key === "product_name");
        if (queryCol) {
          that.$set(queryCol, 'data', queryProductOptions);
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
      that.purchaseDialogVisible = false;
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/points-shop/index",
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
      const firstProduct = that.productList?.[0];
      if (!firstProduct) {
        vk.alert("暂无可用产品，请先购买产品后再生成卡密", "提示", () => {
          uni.navigateTo({ url: "/pages/my-products/index" });
        });
        return;
      }

      // 准备购买类型选项，过滤掉体验卡（days <= 7）
      let validDaysOptions = [];
      if (firstProduct.valid_days_options && firstProduct.valid_days_options.length > 0) {
        validDaysOptions = firstProduct.valid_days_options
          .filter((opt) => opt.days > 7)
          .map((opt) => ({ value: opt.days, label: opt.label }));
      }

      that.$refs.purchaseDialog.openAdd(firstProduct, validDaysOptions);
    },
    // 编辑
    editBtn({ item }) {
      that.editDialog.cardId = item._id;
      that.editDialog.remark = item.remark || "";
      
      // 初始化字段顺序列表（从当前表格配置复制）
      const currentColumns = that.table1.columns || [];
      that.editDialog.originalColumns = vk.pubfn.copyObject(currentColumns);
      
      // 尝试从localStorage加载保存的字段顺序
      const savedOrder = uni.getStorageSync('card_columns_order');
      if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
        const orderedColumns = [];
        const columnMap = {};
        currentColumns.forEach(col => { columnMap[col.key] = col; });
        savedOrder.forEach(key => { if (columnMap[key]) orderedColumns.push(columnMap[key]); });
        currentColumns.forEach(col => { if (!savedOrder.includes(col.key)) orderedColumns.push(col); });
        that.editDialog.columns = orderedColumns;
      } else {
        that.editDialog.columns = vk.pubfn.copyObject(currentColumns);
      }
      
      that.editDialog.visible = true;
    },
    // 续费
    async renewBtn({ item }) {
      const product = that.productList.find((p) => 
        p.product_id === item.product_id && 
        (!item.product_name || p.product_name === item.product_name)
      );

      // 刷新积分
      await that.loadUserPoints();

      // 准备续费天数选项
      let renewOptions = [];
      if (product && product.valid_days_options && product.valid_days_options.length > 0) {
        renewOptions = product.valid_days_options
          .filter((opt) => opt.days > 7)
          .map((opt) => ({ value: opt.days, label: opt.label }));
      }

      that.$refs.purchaseDialog.openRenew(item, product, renewOptions);
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
    // 购买/续费成功回调
    onPurchaseSuccess(formType) {
      vk.toast(formType === 'renew' ? '续费成功' : '操作成功');
      that.refresh();
    },
    // 编辑保存回调
    onEditSave({ cardId, remark, columns }) {
      if (cardId) {
        vk.callFunction({
          url: 'admin/card/kh/updateRemark',
          data: { _id: cardId, remark },
          success: () => {
            const columnOrder = columns.map(col => col.key);
            uni.setStorageSync('card_columns_order', columnOrder);
            that.table1.columns = JSON.parse(JSON.stringify(columns));
            vk.toast('保存成功');
            that.editDialog.visible = false;
            that.refresh();
          }
        });
      } else {
        const columnOrder = columns.map(col => col.key);
        uni.setStorageSync('card_columns_order', columnOrder);
        that.table1.columns = JSON.parse(JSON.stringify(columns));
        vk.toast('字段顺序已保存');
        that.editDialog.visible = false;
      }
    },
    // 更新查询组件的产品选项
    onUpdateQueryOptions(queryOptions) {
      const queryCol = that.queryForm1.columns.find((c) => c.key === "product_name");
      if (queryCol) {
        that.$set(queryCol, 'data', queryOptions);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-body {
	padding: 20px;
}

/* 卡密单元格 */
.card-code-cell {
	display: flex;
	align-items: center;
	gap: 8px;

	.code-text {
		font-family: 'Courier New', monospace;
		font-weight: 500;
		color: #409EFF;
		cursor: pointer;
		user-select: all;
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.3s;

		&:hover {
			background: #ecf5ff;
			color: #66b1ff;
		}

		&:active {
			background: #d9ecff;
		}
	}

	.copy-icon {
		color: #909399;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.3s;
		padding: 4px;
		border-radius: 4px;

		&:hover {
			color: #409EFF;
			background: #ecf5ff;
			transform: scale(1.1);
		}

		&:active {
			transform: scale(0.95);
		}
	}
}

/* 批量设置前缀后缀弹窗样式 */
.batch-set-dialog-content {
	.batch-set-tip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background: #ecf5ff;
		border: 1px solid #b3d8ff;
		border-radius: 4px;
		margin-bottom: 20px;
		color: #409EFF;
		font-size: 14px;

		i {
			font-size: 16px;
		}
	}

	.form-tip {
		color: #909399;
		font-size: 12px;
		margin-top: 6px;
		line-height: 1.5;
	}

	.preview-box {
		padding: 12px 16px;
		background: #f5f7fa;
		border-radius: 4px;
		border: 1px solid #e4e7ed;

		.preview-label {
			color: #606266;
			font-size: 13px;
			margin-bottom: 8px;
		}

		.preview-code {
			display: flex;
			align-items: center;
			font-family: 'Courier New', monospace;
			font-size: 14px;
			word-break: break-all;

			.preview-prefix {
				color: #FF3333;
				font-weight: bold;
			}

			.preview-original {
				color: #409EFF;
				font-weight: 500;
			}

			.preview-suffix {
				color: #FF6600;
				font-weight: bold;
			}
		}
	}
}

// ==================== 全局样式 (非 scoped) ====================

/* 日期选择器样式优化 */
.el-picker-panel.el-date-range-picker {
	transform: scale(0.85);
	transform-origin: top right;

	.el-picker-panel__body {
		min-width: auto;
	}

	.el-date-table td {
		padding: 2px 0;
		font-size: 12px;

		.cell {
			height: 26px;
			line-height: 26px;
		}
	}

	.el-picker-panel__sidebar {
		width: 80px;

		.el-picker-panel__shortcut {
			font-size: 12px;
			line-height: 26px;
			padding: 3px 6px;
		}
	}

	.el-date-range-picker__header {
		font-size: 13px;

		button {
			font-size: 12px;
		}
	}

	.el-time-panel {
		font-size: 12px;
	}
}

</style>
