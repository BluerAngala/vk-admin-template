<template>
  <view class="admin-ticket-page">
    <view class="page-top">
      <view class="page-top-row">
        <view class="page-top-left">
          <text class="page-top-title">工单管理</text>
          <text class="page-top-sub">管理和处理用户工单</text>
        </view>
      </view>
      <view class="stat-row">
        <view class="stat-card" :class="'stat-' + key" v-for="(val, key) in stats" :key="key">
          <text class="stat-num">{{ val }}</text>
          <text class="stat-label">{{ { pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' }[key] }}</text>
        </view>
      </view>
    </view>

    <view class="filter-row">
      <el-input
        v-model="filter.keyword"
        placeholder="搜索标题或用户名"
        size="small"
        clearable
        prefix-icon="el-icon-search"
        style="width: 220px"
        @keyup.enter.native="loadData"
      ></el-input>
      <el-select v-model="filter.status" placeholder="状态" size="small" clearable @change="loadData">
        <el-option label="待处理" value="pending"></el-option>
        <el-option label="处理中" value="processing"></el-option>
        <el-option label="已解决" value="resolved"></el-option>
        <el-option label="已关闭" value="closed"></el-option>
      </el-select>
      <el-select v-model="filter.type" placeholder="类型" size="small" clearable @change="loadData">
        <el-option label="问题反馈" value="bug"></el-option>
        <el-option label="功能建议" value="feature"></el-option>
        <el-option label="使用咨询" value="question"></el-option>
        <el-option label="投诉建议" value="complaint"></el-option>
        <el-option label="其他" value="other"></el-option>
      </el-select>
      <el-select v-model="filter.priority" placeholder="优先级" size="small" clearable @change="loadData">
        <el-option label="紧急" value="urgent"></el-option>
        <el-option label="高" value="high"></el-option>
        <el-option label="普通" value="normal"></el-option>
        <el-option label="低" value="low"></el-option>
      </el-select>
      <el-button size="small" icon="el-icon-refresh" @click="loadData">刷新</el-button>
    </view>

    <view class="table-wrap">
      <el-table
        :data="ticketList"
        v-loading="loading"
        stripe
        style="width: 100%"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column prop="_add_time" label="创建时间" width="150">
          <template slot-scope="scope">
            <span class="cell-time">{{ formatTime(scope.row._add_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="工单" min-width="260" show-overflow-tooltip>
          <template slot-scope="scope">
            <view class="cell-title">
              <el-tag :type="getTypeType(scope.row.type)" size="mini" effect="plain">{{ getTypeText(scope.row.type) }}</el-tag>
              <span class="cell-title-text">{{ scope.row.title }}</span>
              <text v-if="scope.row.priority === 'urgent'" class="cell-priority urgent">紧急</text>
              <text v-else-if="scope.row.priority === 'high'" class="cell-priority high">高优</text>
            </view>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="提交用户" width="130">
          <template slot-scope="scope">
            <view class="cell-user">
              <view class="cell-avatar">{{ getAvatarText(scope.row.user_name) }}</view>
              <span>{{ scope.row.user_name }}</span>
            </view>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="130" align="center">
          <template slot-scope="scope">
            <el-dropdown size="small" @command="(cmd) => handleStatusChange(scope.row, cmd)" trigger="click" :class="'status-col-dropdown'" @click.stop.native>
              <el-tag :type="getStatusType(scope.row.status)" size="small" effect="dark" round class="status-tag-clickable" @click.stop>
                {{ getStatusText(scope.row.status) }} <i class="el-icon-arrow-down"></i>
              </el-tag>
              <el-dropdown-menu slot="dropdown" class="status-dropdown-menu">
                <el-dropdown-item command="processing">
                  <i class="el-icon-loading" style="color:#3370ff"></i> 处理中
                </el-dropdown-item>
                <el-dropdown-item command="resolved">
                  <i class="el-icon-circle-check" style="color:#34c724"></i> 已回复
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column prop="reply_count" label="对话" width="70" align="center">
          <template slot-scope="scope">
            <text v-if="scope.row.reply_count > 0" class="cell-reply-count">{{ scope.row.reply_count }}</text>
            <text v-else class="cell-reply-zero">-</text>
          </template>
        </el-table-column>
        <el-table-column prop="assignee_name" label="处理人" width="110">
          <template slot-scope="scope">
            <span v-if="scope.row.assignee_name" class="cell-assignee">{{ scope.row.assignee_name }}</span>
            <span v-else class="cell-unassigned">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="last_reply_time" label="最新回复" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.last_reply_time" class="cell-time">{{ formatTime(scope.row.last_reply_time) }}</span>
            <span v-else class="cell-time-empty">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center" class-name="cell-ops">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click.stop="handleDetail(scope.row)">回复</el-button>
            <el-button size="mini" type="danger" plain @click.stop="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </view>

    <view class="pagination-area">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :current-page="pageIndex"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      ></el-pagination>
    </view>

    <el-dialog
      :visible.sync="detailVisible"
      width="780px"
      :title="'处理工单'"
      :close-on-click-modal="false"
      custom-class="ticket-detail-dialog"
      top="6vh"
    >
      <view class="dialog-ticket-head" v-loading="detailLoading">
        <view class="dth-row">
          <text class="dth-title">{{ currentTicket.title }}</text>
        </view>
        <view class="dth-meta">
          <el-tag :type="getTypeType(currentTicket.type)" size="mini">{{ getTypeText(currentTicket.type) }}</el-tag>
          <el-tag :type="getStatusType(currentTicket.status)" size="mini" effect="dark">{{ getStatusText(currentTicket.status) }}</el-tag>
          <text v-if="currentTicket.priority === 'urgent'" class="cell-priority urgent">紧急</text>
          <text v-else-if="currentTicket.priority === 'high'" class="cell-priority high">高优</text>
          <span class="dth-sep">|</span>
          <span class="dth-info"><i class="el-icon-user"></i> {{ currentTicket.user_name }}</span>
          <span class="dth-info"><i class="el-icon-time"></i> {{ formatTime(currentTicket._add_time) }}</span>
          <span v-if="currentTicket.assignee_name" class="dth-info"><i class="el-icon-s-custom"></i> {{ currentTicket.assignee_name }}</span>
        </view>
      </view>

      <view class="dialog-chat" v-loading="detailLoading">
        <view class="dialog-time-divider">
          <text>工单创建于 {{ formatTime(currentTicket._add_time) }}</text>
        </view>

        <view v-for="(reply, idx) in replies" :key="reply._id || idx" class="dmsg-row" :class="reply.is_admin ? 'is-admin' : 'is-user'">
          <view class="dmsg-avatar" :class="reply.is_admin ? 'davatar-admin' : 'davatar-user'">
            {{ getAvatarText(reply.user_name, reply.is_admin) }}
          </view>
          <view class="dmsg-body">
            <view class="dmsg-sender">
              <text class="dmsg-name" :class="reply.is_admin ? 'dname-admin' : ''">{{ reply.is_admin ? (reply.user_name || '管理员') : reply.user_name }}</text>
              <text v-if="reply.is_admin" class="dmsg-badge">客服</text>
              <text class="dmsg-time">{{ formatTime(reply._add_time) }}</text>
            </view>
            <view class="dmsg-bubble" :class="reply.is_admin ? 'dbubble-admin' : 'dbubble-user'">
              <text v-if="reply.content">{{ reply.content }}</text>
              <view v-if="reply.attachments && reply.attachments.length" class="dmsg-attachments">
                <view v-for="(att, ai) in reply.attachments" :key="ai">
                  <img v-if="att.type === 'image'" :src="att.url" class="datt-img" @click="previewImage(att.url)" />
                  <video v-else-if="att.type === 'video'" :src="att.url" controls class="datt-video"></video>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="dialog-reply" v-if="currentTicket.status !== 'closed'">
        <view v-if="pendingAttachments.length" class="dialog-pending-bar">
          <view v-for="(att, i) in pendingAttachments" :key="i" class="dpending-item">
            <image v-if="att.type === 'image'" :src="att.url" mode="aspectFill" class="dpending-thumb"></image>
            <view v-else class="dpending-thumb dpending-video-icon"><i class="el-icon-video-camera"></i></view>
            <view class="dpending-remove" @click="removePending(i)"><i class="el-icon-close"></i></view>
          </view>
        </view>
        <view class="dialog-reply-main">
          <view class="dialog-reply-toolbar">
            <el-button size="small" icon="el-icon-picture-outline" @click="chooseImage">图片</el-button>
            <el-button size="small" icon="el-icon-video-camera" @click="chooseVideo">视频</el-button>
          </view>
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="请输入回复内容… (可粘贴图片)"
            maxlength="2000"
            show-word-limit
            resize="none"
            @paste.native="handlePaste"
          ></el-input>
        </view>
        <view class="dialog-reply-actions">
          <el-button size="small" @click="detailVisible = false">关闭</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="replying"
            :disabled="!replyContent.trim() && pendingAttachments.length === 0"
            @click="submitReply"
          >发送回复</el-button>
        </view>
      </view>
      <view v-else class="dialog-closed">
        <i class="el-icon-lock"></i>
        <text>该工单已关闭</text>
      </view>
    </el-dialog>
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
      filter: { keyword: '', status: '', type: '', priority: '' },
      stats: { pending: 0, processing: 0, resolved: 0, closed: 0 },
      detailVisible: false,
      detailLoading: false,
      replying: false,
      currentTicket: {},
      replies: [],
      replyContent: '',
      pendingAttachments: []
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      let data = { pageIndex: this.pageIndex, pageSize: this.pageSize };
      if (this.filter.status) data.status = this.filter.status;
      if (this.filter.type) data.type = this.filter.type;
      if (this.filter.priority) data.priority = this.filter.priority;
      if (this.filter.keyword) {
        data.title = this.filter.keyword;
        data.user_name = this.filter.keyword;
      }
      vk.callFunction({
        url: 'admin/ticket/sys/getList',
        title: '加载中',
        data,
        success: (res) => {
          this.ticketList = res.rows || [];
          this.total = res.total || 0;
          this.calcStats();
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    calcStats() {
      let pending = 0, processing = 0, resolved = 0, closed = 0;
      this.ticketList.forEach(item => {
        if (item.status === 'pending') pending++;
        else if (item.status === 'processing') processing++;
        else if (item.status === 'resolved') resolved++;
        else if (item.status === 'closed') closed++;
      });
      this.stats = { pending, processing, resolved, closed };
    },
    handlePageChange(page) {
      this.pageIndex = page;
      this.loadData();
    },
    handleRowClick(row) {
      this.handleDetail(row);
    },
    handleDetail(row) {
      this.currentTicket = { ...row };
      this.replyContent = '';
      this.pendingAttachments = [];
      this.detailVisible = true;
      this.loadDetail(row._id);
    },
    loadDetail(ticketId) {
      this.detailLoading = true;
      vk.callFunction({
        url: 'admin/ticket/sys/getDetail',
        data: { ticketId },
        success: (res) => {
          let data = res.data || res;
          if (data && data.replies) {
            this.currentTicket = data.ticket || this.currentTicket;
            this.replies = data.replies;
          }
        },
        complete: () => {
          this.detailLoading = false;
        }
      });
    },
    submitReply() {
      let content = this.replyContent.trim();
      if (!content && this.pendingAttachments.length === 0) {
        vk.toast('请输入回复内容或添加附件');
        return;
      }
      this.replying = true;
      let attachments = this.pendingAttachments.map(a => ({ type: a.type, url: a.url, name: a.name || '' }));
      let optimisticReply = {
        _id: 'temp_' + Date.now(),
        content: content,
        attachments: attachments,
        user_name: '管理员',
        is_admin: true,
        _add_time: Date.now()
      };
      this.replies.push(optimisticReply);
      this.replyContent = '';
      this.pendingAttachments = [];

      vk.callFunction({
        url: 'admin/ticket/sys/reply',
        title: '发送中',
        data: { ticketId: this.currentTicket._id, content, attachments },
        success: (res) => {
          this.loadDetail(this.currentTicket._id);
          this.loadData();
        },
        fail: () => {
          let idx = this.replies.findIndex(r => r._id === optimisticReply._id);
          if (idx > -1) this.replies.splice(idx, 1);
        },
        complete: () => {
          this.replying = false;
        }
      });
    },
    chooseImage() {
      if (this.pendingAttachments.length >= 9) {
        vk.toast('最多添加9个附件');
        return;
      }
      uni.chooseImage({
        count: Math.min(9 - this.pendingAttachments.length, 9),
        success: (res) => {
          res.tempFilePaths.forEach(path => {
            vk.uploadFile({
              title: '上传中...',
              filePath: path,
              fileType: 'image',
              success: (uploadRes) => {
                this.pendingAttachments.push({ type: 'image', url: uploadRes.url, name: uploadRes.cloudPath || '' });
              },
              fail: (err) => {
                vk.toast(err.msg || '图片上传失败');
              }
            });
          });
        }
      });
    },
    chooseVideo() {
      if (this.pendingAttachments.length >= 9) {
        vk.toast('最多添加9个附件');
        return;
      }
      uni.chooseVideo({
        count: 1,
        success: (res) => {
          vk.uploadFile({
            title: '上传视频中...',
            filePath: res.tempFilePath,
            fileType: 'video',
            success: (uploadRes) => {
              this.pendingAttachments.push({ type: 'video', url: uploadRes.url, name: uploadRes.cloudPath || '' });
            },
            fail: (err) => {
              vk.toast(err.msg || '视频上传失败');
            }
          });
        }
      });
    },
    handlePaste(e) {
      let items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          if (this.pendingAttachments.length >= 9) {
            vk.toast('最多添加9个附件');
            return;
          }
          let file = item.getAsFile();
          let blobUrl = URL.createObjectURL(file);
          vk.uploadFile({
            title: '上传中...',
            file: file,
            filePath: blobUrl,
            fileType: 'image',
            success: (uploadRes) => {
              this.pendingAttachments.push({ type: 'image', url: uploadRes.url, name: uploadRes.cloudPath || '' });
            },
            fail: (err) => {
              vk.toast(err.msg || '粘贴图片上传失败');
            }
          });
          break;
        }
      }
    },
    removePending(index) {
      this.pendingAttachments.splice(index, 1);
    },
    previewImage(url) {
      uni.previewImage({ current: url, urls: [url] });
    },
    handleStatusChange(row, status) {
      let statusText = this.getStatusText(status);
      vk.callFunction({
        url: 'admin/ticket/sys/updateStatus',
        title: '更新中',
        data: { ticketId: row._id, status },
        success: (res) => {
          vk.toast('已设为' + statusText);
          this.loadData();
          if (this.detailVisible && this.currentTicket._id === row._id) {
            this.currentTicket.status = status;
          }
        }
      });
    },
    handleDelete(row) {
      this.$confirm('确认删除该工单？删除后将无法恢复！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        vk.callFunction({
          url: 'admin/ticket/sys/delete',
          title: '删除中',
          data: { ticketId: row._id },
          success: (res) => {
            vk.toast('删除成功');
            this.loadData();
            if (this.detailVisible && this.currentTicket._id === row._id) {
              this.detailVisible = false;
            }
          }
        });
      }).catch(() => {});
    },
    getRowClassName({ row }) {
      if (row.status === 'pending') return 'row-pending';
      if (row.status === 'processing') return 'row-processing';
      if (row.status === 'resolved') return 'row-resolved';
      if (row.status === 'closed') return 'row-closed';
      return '';
    },
    getStatusText(status) {
      const map = { pending: '待处理', processing: '处理中', resolved: '已回复', closed: '已关闭' };
      return map[status] || status;
    },
    getStatusType(status) {
      const map = { pending: 'warning', processing: '', resolved: 'success', closed: 'info' };
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
    getAvatarText(name, isAdmin) {
      if (!name) return isAdmin ? '客' : '?';
      return name.charAt(0);
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      let date = new Date(timestamp);
      let now = new Date();
      let isToday = date.toDateString() === now.toDateString();
      if (isToday) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-ticket-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}

.page-top {
  margin-bottom: 20px;
}
.page-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-top-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2329;
  display: block;
}
.page-top-sub {
  font-size: 13px;
  color: #8f959e;
  margin-top: 2px;
  display: block;
}

.stat-row {
  display: flex;
  gap: 12px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8eaed;
  border-top: 3px solid #e8eaed;
  transition: border-color 0.2s;
}
.stat-pending { border-top-color: #f7ba1e; }
.stat-processing { border-top-color: #3370ff; }
.stat-resolved { border-top-color: #34c724; }
.stat-closed { border-top-color: #8f959e; }
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #1f2329;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: #8f959e;
  margin-top: 4px;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

.table-wrap {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  overflow: hidden;
}

:deep(.el-table .row-pending) { background-color: #fffdf0 !important; }
:deep(.el-table .row-pending:hover > td) { background-color: #fdf6dc !important; }
:deep(.el-table .row-processing) { background-color: #f0f5ff !important; }
:deep(.el-table .row-processing:hover > td) { background-color: #dce8ff !important; }
:deep(.el-table .row-resolved) { background-color: #f0fff0 !important; }
:deep(.el-table .row-resolved:hover > td) { background-color: #dcf5dc !important; }
:deep(.el-table .row-closed) { background-color: #f5f5f5 !important; }
:deep(.el-table .row-closed:hover > td) { background-color: #ebebeb !important; }
:deep(.el-table th) {
  background-color: #f8f9fa !important;
  font-weight: 600;
  color: #646a73;
  font-size: 13px;
}
:deep(.el-table td) {
  padding: 12px 0 !important;
}

.cell-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cell-title-text {
  font-weight: 600;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.cell-priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
}
.cell-priority.urgent { background: #fef0f0; color: #f54a45; }
.cell-priority.high { background: #fdf6ec; color: #f7ba1e; }

.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cell-avatar {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #3370ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.cell-reply-count {
  font-weight: 600;
  color: #3370ff;
}
.cell-reply-zero {
  color: #c0c4cc;
}
.cell-assignee {
  color: #3370ff;
  font-weight: 500;
}
.cell-unassigned {
  color: #c0c4cc;
  font-size: 12px;
}
.cell-time {
  color: #646a73;
  font-size: 13px;
}
.cell-time-empty {
  color: #c0c4cc;
  font-size: 13px;
}

.pagination-area {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* ======= 弹窗 ======= */
.dialog-ticket-head {
  margin-bottom: 12px;
}
.dth-row {
  margin-bottom: 8px;
}
.dth-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2329;
}
.dth-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #646a73;
  font-size: 13px;
}
.dth-sep {
  color: #dee0e3;
}
.dth-info {
  color: #8f959e;
}
.dth-info i {
  margin-right: 2px;
}

.dialog-chat {
  max-height: 380px;
  overflow-y: auto;
  padding: 12px 0;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.dialog-time-divider {
  text-align: center;
  margin: 8px 0 16px;
}
.dialog-time-divider text {
  font-size: 12px;
  color: #8f959e;
  background: #e8eaed;
  padding: 2px 12px;
  border-radius: 10px;
}

.dmsg-row {
  display: flex;
  align-items: flex-start;
  padding: 0 16px;
  margin-bottom: 18px;
}
.dmsg-row.is-admin {
  flex-direction: row-reverse;
}
.dmsg-row.is-user {
  flex-direction: row;
}
.dmsg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.davatar-user {
  background: #3370ff;
  margin-right: 10px;
}
.davatar-admin {
  background: #f54a45;
  margin-left: 10px;
}
.dmsg-body {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.dmsg-row.is-admin .dmsg-body {
  align-items: flex-end;
}
.dmsg-sender {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dmsg-row.is-admin .dmsg-sender {
  justify-content: flex-end;
  align-self: flex-end;
}
.dmsg-name {
  font-size: 12px;
  font-weight: 500;
  color: #8f959e;
}
.dname-admin {
  color: #f54a45;
}
.dmsg-badge {
  font-size: 10px;
  background: #fef0f0;
  color: #f54a45;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}
.dmsg-time {
  font-size: 11px;
  color: #c0c4cc;
}
.dmsg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}
.dbubble-user {
  background: #3370ff;
  color: #fff;
  border-top-right-radius: 4px;
}
.dbubble-admin {
  background: #fff;
  color: #1f2329;
  border: 1px solid #dee0e3;
  border-top-left-radius: 4px;
}

.dmsg-attachments {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.dmsg-attachments > view {
  max-width: 200px;
}
.datt-img {
  max-width: 200px;
  max-height: 300px;
  border-radius: 6px;
  display: block;
  cursor: pointer;
  object-fit: contain;
}
.datt-video {
  max-width: 280px;
  max-height: 200px;
  border-radius: 6px;
  display: block;
}

.dialog-reply {
  padding-top: 12px;
  border-top: 1px solid #e8eaed;
}
.dialog-reply-main {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.dialog-reply .el-textarea {
  flex: 1;
}
.dialog-pending-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.dpending-item {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dee0e3;
}
.dpending-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dpending-video-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  font-size: 22px;
  color: #8f959e;
}
.dpending-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f54a45;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  z-index: 1;
}
.dialog-reply-toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.dialog-reply-toolbar .el-button {
  width: 68px;
  margin-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.dialog-closed {
  text-align: center;
  padding: 12px;
  color: #8f959e;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-top: 1px solid #e8eaed;
}
.cell-ops .cell {
  white-space: nowrap !important;
}
</style>

<style>
.status-dropdown-menu {
  z-index: 9999 !important;
  min-width: 150px !important;
}
.status-dropdown-menu .el-dropdown-menu__item {
  font-size: 14px !important;
  padding: 8px 16px !important;
  line-height: 1.6 !important;
}
.status-tag-clickable {
  cursor: pointer;
}
.status-tag-clickable i {
  margin-left: 4px;
  font-size: 10px;
}
</style>
