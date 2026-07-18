<template>
  <view class="ticket-list-page">
    <view class="list-header">
      <view class="list-header-row">
        <view class="list-header-left">
          <text class="list-title">我的工单</text>
          <text class="list-subtitle">遇到问题？提交工单获取帮助</text>
        </view>
        <el-button type="primary" size="small" icon="el-icon-plus" round @click="goToCreate">提交工单</el-button>
      </view>
    </view>

    <view class="status-filter">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: filter.status === tab.value }"
        @click="changeStatus(tab.value)"
      >
        <text class="filter-label">{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="filter-badge" :class="'badge-' + tab.badgeType">{{ tab.count }}</view>
      </view>
    </view>

    <view class="ticket-cards" v-loading="loading">
      <view v-if="ticketList.length === 0 && !loading" class="empty-state">
        <view class="empty-visual">
          <i class="el-icon-s-order"></i>
        </view>
        <text class="empty-title">暂无工单</text>
        <text class="empty-desc">遇到问题？提交工单获取帮助</text>
        <el-button type="primary" size="small" round @click="goToCreate">提交工单</el-button>
      </view>

      <view
        v-for="item in ticketList"
        :key="item._id"
        class="ticket-card"
        @click="goToDetail(item._id)"
      >
        <view class="card-top">
          <view class="card-tags">
            <el-tag :type="getTypeType(item.type)" size="mini" effect="plain">{{ getTypeText(item.type) }}</el-tag>
            <text v-if="item.priority === 'urgent'" class="priority-mark urgent">紧急</text>
            <text v-else-if="item.priority === 'high'" class="priority-mark high">高优</text>
          </view>
          <el-tag :type="getStatusType(item.status)" size="small" effect="dark" round>{{ getStatusText(item.status) }}</el-tag>
        </view>

        <text class="card-title">{{ item.title }}</text>
        <text class="card-preview">{{ item.content }}</text>

        <view class="card-bottom">
          <view class="card-meta">
            <text class="meta-item"><i class="el-icon-time"></i> {{ formatTime(item._add_time) }}</text>
            <text v-if="item.reply_count > 0" class="meta-item reply-meta">
              <i class="el-icon-chat-dot-round"></i> {{ item.reply_count }} 条回复
            </text>
          </view>
          <text v-if="item.last_reply_time" class="last-reply-label">最新回复 {{ formatTime(item.last_reply_time) }}</text>
        </view>
      </view>
    </view>

    <view class="pagination-area" v-if="total > pageSize">
      <el-pagination
        background
        small
        layout="prev, pager, next"
        :current-page="pageIndex"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      ></el-pagination>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      ticketList: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      filter: {
        status: ''
      },
      statusTabs: [
        { label: '全部', value: '', count: 0, badgeType: '' },
        { label: '待处理', value: 'pending', count: 0, badgeType: 'warning' },
        { label: '处理中', value: 'processing', count: 0, badgeType: 'primary' },
        { label: '已回复', value: 'resolved', count: 0, badgeType: 'success' }
      ]
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadData();
  },
  onShow() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      let data = { pageIndex: this.pageIndex, pageSize: this.pageSize };
      if (this.filter.status) data.status = this.filter.status;
      vk.callFunction({
        url: 'admin/ticket/kh/getList',
        title: '加载中',
        data,
        success: (res) => {
          this.ticketList = res.rows || [];
          this.total = res.total || 0;
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    changeStatus(status) {
      this.filter.status = status;
      this.pageIndex = 1;
      this.loadData();
    },
    handlePageChange(page) {
      this.pageIndex = page;
      this.loadData();
    },
    goToCreate() {
      vk.navigateTo('/pages/ticket/create');
    },
    goToDetail(id) {
      vk.navigateTo('/pages/ticket/detail?id=' + id);
    },
    getStatusText(status) {
      const map = { pending: '待处理', processing: '处理中', resolved: '已回复', closed: '已关闭' };
      return map[status] || status;
    },
    getStatusType(status) {
      const map = { pending: 'warning', processing: 'primary', resolved: 'success', closed: 'info' };
      return map[status] || '';
    },
    getTypeText(type) {
      const map = { bug: '问题反馈', feature: '功能建议', question: '使用咨询', complaint: '投诉建议', other: '其他' };
      return map[type] || type;
    },
    getTypeType(type) {
      const map = { bug: 'danger', feature: 'success', question: 'primary', complaint: 'warning', other: 'info' };
      return map[type] || '';
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      let date = new Date(timestamp);
      let now = new Date();
      let diff = now - date;
      let minutes = Math.floor(diff / 60000);
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return minutes + '分钟前';
      let hours = Math.floor(diff / 3600000);
      if (hours < 24) return hours + '小时前';
      let days = Math.floor(diff / 86400000);
      if (days < 7) return days + '天前';
      return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
.ticket-list-page {
  background: #f0f2f5;
  min-height: 100vh;
}

.list-header {
  background: #fff;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e8eaed;
}
.list-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.list-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2329;
  display: block;
}
.list-subtitle {
  font-size: 13px;
  color: #8f959e;
  margin-top: 2px;
  display: block;
}

.status-filter {
  display: flex;
  gap: 4px;
  background: #fff;
  padding: 0 20px 0;
  border-bottom: 1px solid #e8eaed;
}
.filter-tab {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.filter-tab:hover {
  background: #f5f7fa;
}
.filter-tab.active {
  border-bottom-color: #3370ff;
}
.filter-label {
  font-size: 14px;
  color: #646a73;
}
.filter-tab.active .filter-label {
  color: #3370ff;
  font-weight: 600;
}
.filter-badge {
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  padding: 0 5px;
  color: #fff;
  font-weight: 600;
}
.filter-badge.badge-warning { background: #f7ba1e; }
.filter-badge.badge-primary { background: #3370ff; }
.filter-badge.badge-success { background: #34c724; }

.ticket-cards {
  padding: 16px 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-visual {
  font-size: 56px;
  color: #d0d3d6;
  margin-bottom: 12px;
}
.empty-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #646a73;
  margin-bottom: 6px;
}
.empty-desc {
  display: block;
  font-size: 13px;
  color: #8f959e;
  margin-bottom: 20px;
}

.ticket-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e8eaed;
  cursor: pointer;
  transition: all 0.2s;
}
.ticket-card:hover {
  border-color: #3370ff;
  box-shadow: 0 4px 12px rgba(51, 112, 255, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.card-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}
.priority-mark {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.priority-mark.urgent {
  background: #fef0f0;
  color: #f54a45;
}
.priority-mark.high {
  background: #fdf6ec;
  color: #f7ba1e;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
  display: block;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-preview {
  font-size: 13px;
  color: #646a73;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f2f3f5;
}
.card-meta {
  display: flex;
  gap: 14px;
}
.meta-item {
  font-size: 12px;
  color: #8f959e;
}
.meta-item i {
  margin-right: 2px;
}
.reply-meta {
  color: #3370ff;
}
.last-reply-label {
  font-size: 11px;
  color: #c0c4cc;
}

.pagination-area {
  padding: 16px 20px;
  display: flex;
  justify-content: center;
}
</style>
