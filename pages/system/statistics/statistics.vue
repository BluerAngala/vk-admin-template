<template>
  <view class="page-body">
    <!-- 统计卡片 -->
    <StatsCards :items="statsCardItems" :stats="summaryStats" />

    <!-- 购买记录搜索区域 -->
    <el-card class="tools-card">
      <div class="tools-header">
        <span class="tools-title">购买记录查询</span>
        <!-- 管理员工具按钮 -->
        <template v-if="isAdmin">
          <el-button
            type="primary"
            size="small"
            style="margin-left: 20px;"
            @click="$refs.checkOrderDialog.open()"
          >
            查询订单状态
          </el-button>
          <el-button
            type="danger"
            size="small"
            style="margin-left: 10px;"
            @click="$refs.blacklistDialog.open()"
          >
            黑名单管理
          </el-button>
          <el-dropdown
            split-button
            type="warning"
            size="small"
            style="margin-left: 10px;"
            @click="scanDuplicateRecharge"
            @command="handleDataFixCommand"
          >
            <span>数据修复</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="scanDuplicate">扫描重复充值</el-dropdown-item>
              <el-dropdown-item command="checkNegative">检查欠费用户</el-dropdown-item>
              <el-dropdown-item command="removeDuplicateCards" divided>清理重复卡密</el-dropdown-item>
              <el-dropdown-item command="viewCardStats">查看卡密统计</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
      <el-form :inline="true" :model="searchForm" class="purchase-query-form">
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.user_id"
            placeholder="请输入用户ID"
            clearable
            style="width: 200px;"
            @keyup.enter.native="searchPurchaseRecords"
          ></el-input>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input
            v-model="searchForm.product_id"
            placeholder="请输入产品ID"
            clearable
            style="width: 200px;"
            @keyup.enter.native="searchPurchaseRecords"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchPurchaseRecords">查询</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户积分汇总表格 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :row-no="true"
      :pagination="true"
      :page-size="10"
      :custom-right-btns="table1.customRightBtns"
      @success="onTableSuccess"
    >
      <!-- 用户名列 -->
      <template v-slot:user_info="{ row }">
        <div>
          <div style="font-weight: 500;">{{ row.user_display_name }}</div>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            ID: {{ row.user_id }}
          </div>
        </div>
      </template>
      <!-- 绑定机器数列 -->
      <template v-slot:total_machines="{ row }">
        <span style="color: #F56C6C; font-weight: 500;">{{ row.total_machines || 0 }} 台</span>
      </template>
    </vk-data-table>

    <!-- 弹窗组件 -->
    <UserDetailDialog ref="userDetailDialog" />
    <RechargeDialog ref="rechargeDialog" @refresh="handleRefresh" />
    <CheckOrderDialog ref="checkOrderDialog" @refresh="handleRefresh" />
    <RemoveDuplicateDialog ref="removeDuplicateDialog" />
    <PurchaseRecordsDialog ref="purchaseRecordsDialog" />
    <BlacklistDialog ref="blacklistDialog" />
  </view>
</template>

<script>
import StatsCards from '@/components/stats-cards/index.vue';
import UserDetailDialog from './components/UserDetailDialog.vue';
import RechargeDialog from './components/RechargeDialog.vue';
import CheckOrderDialog from './components/CheckOrderDialog.vue';
import RemoveDuplicateDialog from './components/RemoveDuplicateDialog.vue';
import PurchaseRecordsDialog from './components/PurchaseRecordsDialog.vue';
import BlacklistDialog from './components/BlacklistDialog.vue';
import { formatDateTime } from './utils/format.js';

let that;
let vk = uni.vk;

export default {
  components: {
    StatsCards,
    UserDetailDialog,
    RechargeDialog,
    CheckOrderDialog,
    RemoveDuplicateDialog,
    PurchaseRecordsDialog,
    BlacklistDialog,
  },
  data() {
    return {
      isAdmin: false,
      fixLoading: false,
      // 搜索栏表单
      searchForm: {
        user_id: '',
        product_id: '',
      },
      // 统计卡片配置
      statsCardItems: [
        { key: 'totalUsers', label: '总用户数', color: '' },
        { key: 'totalPoints', label: '总购买积分', color: '#67C23A', suffix: ' 积分' },
        { key: 'totalConsumed', label: '总消耗积分', color: '#E6A23C', suffix: ' 积分' },
        { key: 'totalAvailable', label: '总剩余积分', color: '#409EFF', suffix: ' 积分' },
        { key: 'totalMachines', label: '用户绑定的机器数量', color: '#F56C6C', suffix: ' 台' },
      ],
      summaryStats: {
        totalUsers: 0,
        totalPoints: 0,
        totalConsumed: 0,
        totalAvailable: 0,
        totalMachines: 0,
      },
      table1: {
        action: 'admin/statistics/sys/getUserPointsSummary',
        columns: [
          { key: 'user_info', title: '用户信息', type: 'text', width: 200, slot: true },
          { key: 'total_points', title: '购买积分数', type: 'text', width: 120, align: 'right' },
          { key: 'consumed_points', title: '使用积分数', type: 'text', width: 120, align: 'right' },
          { key: 'available_points', title: '剩余积分数', type: 'text', width: 120, align: 'right' },
          { key: 'frozen_points', title: '冻结积分', type: 'text', width: 100, align: 'right' },
          { key: 'total_machines', title: '绑定机器数', type: 'text', width: 120, align: 'right', slot: true },
          { key: '_update_time_str', title: '更新时间', type: 'text', width: 180 },
        ],
        customRightBtns: [
          {
            title: '充值',
            icon: 'el-icon-plus',
            type: 'success',
            onClick: (item) => that.$refs.rechargeDialog.open(item),
          },
          {
            title: '查看详情',
            icon: 'el-icon-view',
            type: 'primary',
            onClick: (item) => that.$refs.userDetailDialog.open(item),
          },
        ],
      },
    };
  },
  onLoad() {
    that = this;
    vk = that.vk;
    that.init();
    that.checkAdmin();
  },
  methods: {
    // ==================== 初始化 ====================
    async init() {
      // 统计数据由表格 @success 事件自动获取，无需单独请求
    },
    async checkAdmin() {
      try {
        const userInfo = vk.getVuex('$user.userInfo') || {};
        that.isAdmin = userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes('admin');
      } catch (e) {
        that.isAdmin = false;
      }
    },

    // ==================== 统计数据（表格加载成功时自动获取） ====================
    onTableSuccess({ data }) {
      if (data && data.summary) {
        Object.assign(that.summaryStats, data.summary);
      }
    },

    // ==================== 刷新回调 ====================
    handleRefresh() {
      // refresh 会触发 @success 事件，自动更新统计
      that.$refs.table1.refresh();
    },

    // ==================== 搜索栏 ====================
    searchPurchaseRecords() {
      const user_id = (that.searchForm.user_id || '').trim();
      const product_id = (that.searchForm.product_id || '').trim();
      if (!user_id && !product_id) {
        vk.toast('请输入用户ID或产品ID');
        return;
      }
      that.$refs.purchaseRecordsDialog.open({ user_id, product_id });
    },
    resetSearchForm() {
      that.searchForm = { user_id: '', product_id: '' };
    },

    // ==================== 数据修复命令 ====================
    handleDataFixCommand(command) {
      if (command === 'scanDuplicate') {
        that.scanDuplicateRecharge();
      } else if (command === 'checkNegative') {
        that.checkNegativePoints();
      } else if (command === 'removeDuplicateCards') {
        that.$refs.removeDuplicateDialog.open();
      } else if (command === 'viewCardStats') {
        that.viewCardStats();
      }
    },
    async scanDuplicateRecharge() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/fixDuplicateRecharge',
          data: { action: 'scan' },
        });
        if (res.code === 0 && res.data && res.data.users && res.data.users.length > 0) {
          const users = res.data.users;
          let message = `发现 ${users.length} 个用户有重复充值问题：\n\n`;
          users.forEach((u, i) => {
            message += `${i + 1}. ${u.user_name}：${u.extra_records}条重复记录，多充${u.extra_points}积分\n`;
          });
          message += '\n是否立即修复？（将删除重复记录并扣除多充的积分）';
          try {
            await that.$confirm(message, '扫描结果', {
              confirmButtonText: '立即修复',
              cancelButtonText: '取消',
              type: 'warning',
            });
            await that.fixDuplicateRecharge();
          } catch (e) {
            // 用户取消
          }
        } else {
          vk.toast(res.msg || '没有发现重复充值问题');
        }
      } catch (err) {
        vk.toast('扫描失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    async fixDuplicateRecharge() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/fixDuplicateRecharge',
          data: { action: 'fix' },
        });
        if (res.code === 0) {
          vk.toast(res.msg, 'success');
          that.handleRefresh();
        } else {
          vk.toast(res.msg || '修复失败');
        }
      } catch (err) {
        vk.toast('修复失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    async checkNegativePoints() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/checkNegativePoints',
        });
        if (res.code === 0 && res.data) {
          const users = res.data.users || [];
          if (users.length === 0) {
            vk.toast('所有用户积分正常');
            return;
          }
          let message = `<div style="max-height: 400px; overflow-y: auto;">`;
          message += `<p style="margin-bottom: 10px;">发现 <b>${users.length}</b> 个用户积分有问题：</p>`;
          message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`;
          message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">用户</th><th style="padding: 8px; border: 1px solid #eee;">当前</th><th style="padding: 8px; border: 1px solid #eee;">应为</th><th style="padding: 8px; border: 1px solid #eee;">需补</th></tr>`;
          users.slice(0, 50).forEach(u => {
            message += `<tr>`;
            message += `<td style="padding: 6px; border: 1px solid #eee;">${u.user_name}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right;">${u.current_points}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right; color: #F56C6C;">${u.calculated_points}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right; color: #E6A23C; font-weight: bold;">${u.should_pay}</td>`;
            message += `</tr>`;
          });
          message += `</table>`;
          message += `<p style="margin-top: 15px; font-weight: bold; color: #F56C6C;">总计需补：${res.data.total_should_pay} 积分</p>`;
          message += `</div>`;
          that.$alert(message, '欠费用户检查结果', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
          });
        } else {
          vk.toast(res.msg || '检查失败');
        }
      } catch (err) {
        vk.toast('检查失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    async viewCardStats() {
      try {
        const res = await vk.callFunction({
          url: 'admin/card/sys/getCardStats',
          data: {},
        });
        if (res.code === 0 && res.data) {
          const data = res.data;
          let message = `<div style="max-height: 500px; overflow-y: auto;">`;
          message += `<h4 style="margin: 15px 0 10px;">总记录数：${data.total}</h4>`;
          if (data.type_distribution && data.type_distribution.length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">卡密类型分布：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">类型</th><th style="padding: 8px; border: 1px solid #eee;">数量</th></tr>`;
            data.type_distribution.forEach(item => {
              message += `<tr><td style="padding: 6px; border: 1px solid #eee;">${item._id || '未分类'}</td><td style="padding: 6px; border: 1px solid #eee; text-align: right;">${item.count}</td></tr>`;
            });
            message += `</table>`;
          }
          if (data.length_distribution && Object.keys(data.length_distribution).length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">卡密长度分布：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">长度</th><th style="padding: 8px; border: 1px solid #eee;">数量</th></tr>`;
            Object.entries(data.length_distribution).sort((a, b) => a[0] - b[0]).forEach(([len, count]) => {
              message += `<tr><td style="padding: 6px; border: 1px solid #eee;">${len} 位</td><td style="padding: 6px; border: 1px solid #eee; text-align: right;">${count}</td></tr>`;
            });
            message += `</table>`;
          }
          if (data.recent_cards && data.recent_cards.length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">最近的卡密示例：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 12px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 6px; border: 1px solid #eee;">卡密编码</th><th style="padding: 6px; border: 1px solid #eee;">类型</th><th style="padding: 6px; border: 1px solid #eee;">时间</th></tr>`;
            data.recent_cards.forEach(card => {
              const timeStr = formatDateTime(card._add_time);
              message += `<tr><td style="padding: 4px; border: 1px solid #eee; font-family: monospace;">${card.card_code}</td><td style="padding: 4px; border: 1px solid #eee;">${card.card_type || '-'}</td><td style="padding: 4px; border: 1px solid #eee; color: #909399;">${timeStr}</td></tr>`;
            });
            message += `</table>`;
          }
          message += `</div>`;
          that.$alert(message, '卡密统计信息', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            customClass: 'card-stats-dialog',
          });
        } else {
          vk.toast(res.msg || '获取统计失败');
        }
      } catch (err) {
        console.error('获取卡密统计失败：', err);
        vk.toast('获取统计失败：' + (err.message || '未知错误'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

.tools-card {
  ::v-deep .el-card__body {
    padding: 15px 20px;
  }
}

.tools-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.tools-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.purchase-query-form {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
