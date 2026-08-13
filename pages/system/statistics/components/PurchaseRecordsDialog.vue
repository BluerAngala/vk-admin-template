<template>
  <el-dialog
    title="购买记录查询"
    :visible.sync="visible"
    width="1400px"
    :close-on-click-modal="false"
  >
    <!-- 查询表单 -->
    <el-form :inline="true" :model="queryForm" class="purchase-query-form">
      <el-form-item label="用户ID">
        <el-input
          v-model="queryForm.user_id"
          placeholder="请输入用户ID"
          clearable
          style="width: 200px;"
        ></el-input>
      </el-form-item>
      <el-form-item label="产品ID">
        <el-input
          v-model="queryForm.product_id"
          placeholder="请输入产品ID"
          clearable
          style="width: 200px;"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadPurchaseRecords" :loading="loading">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 筛选选项 -->
    <div v-if="allData && allData.length > 0" style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <el-checkbox v-model="filterRemarkMismatch" @change="filterRecords">
            仅显示产品表名称与积分流水备注名称不一致的记录
          </el-checkbox>
          <span v-if="filterRemarkMismatch" style="margin-left: 10px; color: #E6A23C; font-size: 12px; font-weight: 500;">
            已筛选出 {{ data.length }} 条不一致记录（共 {{ allData.length }} 条）
          </span>
        </div>
        <el-button
          v-if="filterRemarkMismatch && data.length > 0"
          type="primary"
          size="small"
          :loading="fixing"
          @click="fixProductNames"
        >
          <i class="el-icon-edit"></i> 修正名称
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="detail-loading">
      <i class="el-icon-loading"></i> 查询中...
    </div>
    <div v-else-if="data && data.length > 0">
      <div class="check-summary" style="margin-bottom: 15px;">
        <div class="summary-item">
          <span class="summary-label">共找到：</span>
          <span class="summary-value">{{ total }} 条记录</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">有问题：</span>
          <span class="summary-value" style="color: #E6A23C;">
            {{ data.filter(r => r.has_issue).length }} 条
          </span>
        </div>
      </div>
      <el-table
        :data="data"
        border
        stripe
        size="small"
        max-height="500"
      >
        <el-table-column prop="card_add_time_str" label="购买时间" width="180" fixed="left"></el-table-column>
        <el-table-column prop="user_name" label="用户" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.user_name }}</div>
            <div style="font-size: 12px; color: #909399;">{{ scope.row.user_username }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="card_code" label="卡密" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column label="卡密记录" width="180">
          <template slot-scope="scope">
            <div style="font-size: 12px; color: #909399;">产品ID:</div>
            <div>{{ scope.row.card_product_id || '-' }}</div>
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">产品名称:</div>
            <div :style="{ color: scope.row.has_issue && scope.row.card_product_name !== scope.row.correct_product_name ? '#F56C6C' : '' }">
              {{ scope.row.card_product_name || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="积分流水记录" width="180">
          <template slot-scope="scope">
            <div style="font-size: 12px; color: #909399;">产品ID:</div>
            <div :style="{ color: scope.row.has_issue && scope.row.card_product_id !== scope.row.points_log_product_id ? '#F56C6C' : '' }">
              {{ scope.row.points_log_product_id || '-' }}
            </div>
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">产品名称:</div>
            <div :style="{ color: scope.row.has_issue && scope.row.points_log_product_name && scope.row.points_log_product_name !== scope.row.points_log_product_name_from_table ? '#F56C6C' : '' }">
              {{ scope.row.points_log_product_name || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="correct_product_name" label="产品表中的正确名称" width="200">
          <template slot-scope="scope">
            <span style="color: #67C23A; font-weight: 500;">{{ scope.row.correct_product_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="points_log_product_name_from_remark" label="积分流水备注中的名称" width="200">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.has_issue && scope.row.points_log_product_name_from_remark && scope.row.points_log_product_name_from_remark !== scope.row.points_log_product_name ? '#F56C6C' : '' }">
              {{ scope.row.points_log_product_name_from_remark || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="points_log_remark" label="积分流水备注" min-width="250" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div v-else-if="!loading && searched" class="detail-empty">
      没有找到购买记录
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
let vk = uni.vk;

export default {
  name: 'PurchaseRecordsDialog',
  data() {
    return {
      visible: false,
      loading: false,
      fixing: false,
      searched: false,
      data: [],
      allData: [],
      total: 0,
      filterRemarkMismatch: false,
      queryForm: {
        user_id: '',
        product_id: '',
      },
    };
  },
  methods: {
    open(queryParams) {
      // 从外部搜索栏传入初始查询参数
      if (queryParams) {
        this.queryForm.user_id = queryParams.user_id || '';
        this.queryForm.product_id = queryParams.product_id || '';
      }
      this.visible = true;
      this.searched = false;
      if (queryParams && (queryParams.user_id || queryParams.product_id)) {
        this.loadPurchaseRecords();
      }
    },
    async loadPurchaseRecords() {
      const user_id = (this.queryForm.user_id || '').trim();
      const product_id = (this.queryForm.product_id || '').trim();
      if (!user_id && !product_id) {
        vk.toast('请输入用户ID或产品ID');
        return;
      }
      this.loading = true;
      this.searched = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/getPurchaseRecords',
          data: {
            user_id: user_id || '',
            product_id: product_id || '',
            pageIndex: 1,
            pageSize: 100,
          },
        });
        if (res.code === 0) {
          this.allData = res.rows || [];
          this.total = res.total || 0;
          this.filterRecords();
          vk.toast(res.msg || '查询完成');
        } else {
          vk.toast(res.msg || '查询失败');
        }
      } catch (err) {
        console.error('查询购买记录失败：', err);
        vk.toast('查询失败');
      } finally {
        this.loading = false;
      }
    },
    filterRecords() {
      if (!this.filterRemarkMismatch) {
        this.data = this.allData;
      } else {
        this.data = this.allData.filter(record => {
          const correctName = record.points_log_product_name_from_table || record.correct_product_name || '';
          const remarkName = record.points_log_product_name_from_remark || '';
          return correctName && remarkName && correctName !== remarkName;
        });
      }
    },
    resetQuery() {
      this.queryForm = { user_id: '', product_id: '' };
      this.data = [];
      this.allData = [];
      this.total = 0;
      this.filterRemarkMismatch = false;
      this.searched = false;
    },
    async fixProductNames() {
      const recordsToFix = this.data.filter(record => {
        const correctName = record.points_log_product_name_from_table || record.correct_product_name || '';
        const remarkName = record.points_log_product_name_from_remark || '';
        return correctName && remarkName && correctName !== remarkName;
      });
      if (recordsToFix.length === 0) {
        vk.toast('没有需要修正的记录');
        return;
      }
      try {
        await this.$confirm(
          `确定要修正 ${recordsToFix.length} 条记录吗？\n将修改积分流水的备注和卡密记录的名称，使其与产品表中的名称一致。`,
          '确认修正',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      } catch {
        return;
      }
      this.fixing = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/fixProductNames',
          data: {
            records: recordsToFix.map(record => ({
              card_id: record.card_id,
              points_log_id: record.points_log_id,
              correct_product_id: record.points_log_product_id || record.correct_product_id,
              correct_product_name: record.points_log_product_name_from_table || record.correct_product_name,
            })),
          },
        });
        if (res.code === 0) {
          vk.toast(res.msg || '修正成功', 'success');
          await this.loadPurchaseRecords();
        } else {
          vk.toast(res.msg || '修正失败');
        }
      } catch (err) {
        console.error('修正名称失败：', err);
        vk.toast('修正失败：' + (err.message || '未知错误'));
      } finally {
        this.fixing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.detail-empty {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.check-summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  color: #909399;
  margin-right: 8px;
}

.summary-value {
  font-weight: 500;
  color: #303133;
}

.purchase-query-form {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
