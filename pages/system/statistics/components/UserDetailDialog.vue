<template>
  <el-dialog
    title="用户积分详情"
    :visible.sync="visible"
    width="70%"
    :close-on-click-modal="false"
    class="detail-dialog"
    top="10vh"
  >
    <div class="detail-dialog-body" style="height: 65vh; overflow-y: auto; display: flex; flex-direction: column;">
      <div v-if="loading" class="detail-loading">
        <i class="el-icon-loading"></i> 加载中...
      </div>
      <div v-else-if="detailList && detailList.length > 0">
        <!-- 重复订单号告警 -->
        <el-alert
          v-if="duplicateCount > 0"
          :title="`发现 ${duplicateCount} 条重复订单记录`"
          type="warning"
          show-icon
          style="margin-bottom: 15px;"
        >
          <div style="margin-top: 5px;">
            重复订单号：{{ duplicateOrders.map(d => `${d.order_id}(${d.count}条)`).join('、') }}
          </div>
        </el-alert>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">用户：</span>
            <span class="summary-value">{{ userName }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">用户ID：</span>
            <span class="summary-value">{{ userId }}</span>
          </div>
        </div>
        <el-table :data="detailList" border stripe size="small" style="margin-top: 20px; flex: 1;">
          <el-table-column prop="_add_time_str" label="时间" width="180"></el-table-column>
          <el-table-column prop="type_text" label="类型" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" size="mini">
                {{ scope.row.type_text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="积分数量" width="100" align="right">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.amount > 0 ? '#67C23A' : '#F56C6C', fontWeight: '500' }">
                {{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="操作后余额" width="120" align="right"></el-table-column>
          <el-table-column prop="source_text" label="来源" width="120"></el-table-column>
          <el-table-column prop="order_id" label="订单号" width="180">
            <template slot-scope="scope">
              <span v-if="scope.row.order_id" style="color: #409EFF; font-family: monospace;">{{ scope.row.order_id }}</span>
              <span v-else style="color: #C0C4CC;">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
        </el-table>
      </div>
      <div v-else class="detail-empty">
        暂无收支记录
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
let vk = uni.vk;

export default {
  name: 'UserDetailDialog',
  data() {
    return {
      visible: false,
      loading: false,
      userId: '',
      userName: '',
      detailList: [],
      duplicateOrders: [],
      duplicateCount: 0,
    };
  },
  methods: {
    open(row) {
      this.visible = true;
      this.userId = row.user_id;
      this.userName = row.user_display_name;
      this.detailList = [];
      this.duplicateOrders = [];
      this.duplicateCount = 0;
      this.loadDetail();
    },
    async loadDetail() {
      if (!this.userId) return;
      this.loading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/statistics/sys/getUserPointsDetail',
          data: {
            user_id: this.userId,
            pageSize: 200,
          },
        });
        if (res.code === 0) {
          this.detailList = res.rows || [];
          this.checkDuplicateOrders();
        } else {
          vk.toast(res.msg || '加载失败');
          this.detailList = [];
          this.duplicateOrders = [];
          this.duplicateCount = 0;
        }
      } catch (err) {
        console.error('加载用户详情失败：', err);
        vk.toast('加载失败');
        this.detailList = [];
        this.duplicateOrders = [];
        this.duplicateCount = 0;
      } finally {
        this.loading = false;
      }
    },
    refresh() {
      if (this.userId) {
        this.loadDetail();
      }
    },
    checkDuplicateOrders() {
      const orderCount = {};
      this.detailList.forEach(item => {
        if (item.order_id) {
          orderCount[item.order_id] = (orderCount[item.order_id] || 0) + 1;
        }
      });
      const duplicates = [];
      let totalDuplicateCount = 0;
      for (const [orderId, count] of Object.entries(orderCount)) {
        if (count > 1) {
          duplicates.push({ order_id: orderId, count });
          totalDuplicateCount += count;
        }
      }
      this.duplicateOrders = duplicates;
      this.duplicateCount = totalDuplicateCount;
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

.detail-summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
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
</style>
