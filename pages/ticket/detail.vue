<template>
  <view class="ticket-chat-page">
    <view class="chat-header">
      <view class="chat-header-left">
        <el-button size="mini" icon="el-icon-arrow-left" circle @click="goBack"></el-button>
        <view class="chat-header-info">
          <text class="chat-header-title">{{ ticket.title || '工单详情' }}</text>
          <view class="chat-header-meta">
            <el-tag :type="getStatusType(ticket.status)" size="mini" effect="dark">{{ getStatusText(ticket.status) }}</el-tag>
            <el-tag :type="getTypeType(ticket.type)" size="mini">{{ getTypeText(ticket.type) }}</el-tag>
            <text v-if="ticket.priority === 'urgent'" class="priority-dot urgent"></text>
            <text v-else-if="ticket.priority === 'high'" class="priority-dot high"></text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view
      class="chat-messages"
      scroll-y
      :scroll-top="scrollTop"
      :style="{ height: chatHeight + 'px' }"
    >
      <view class="chat-messages-inner">
        <view class="time-divider">
          <text>{{ formatTime(ticket._add_time) }}</text>
        </view>

        <view v-for="(reply, idx) in replies" :key="reply._id || idx" class="msg-row" :class="reply.is_admin ? 'is-other' : 'is-self'">
          <view class="msg-avatar" :class="reply.is_admin ? 'avatar-admin' : 'avatar-user'">
            {{ getAvatarText(reply.user_name, reply.is_admin) }}
          </view>
          <view class="msg-body">
            <view class="msg-sender">
              <text class="sender-name" :class="reply.is_admin ? 'name-admin' : 'name-user'">
                {{ reply.is_admin ? (reply.user_name || '客服') : (reply.user_name || '我') }}
              </text>
              <text v-if="reply.is_admin" class="sender-badge">客服</text>
            </view>
            <view class="msg-bubble" :class="reply.is_admin ? 'bubble-admin' : 'bubble-user'">
              <text v-if="reply.content" class="msg-text">{{ reply.content }}</text>
              <view v-if="reply.attachments && reply.attachments.length" class="msg-attachments">
                <view v-for="(att, ai) in reply.attachments" :key="ai">
                  <img v-if="att.type === 'image'" :src="att.url" class="att-img" @click="previewImage(att.url)" />
                  <video v-else-if="att.type === 'video'" :src="att.url" controls class="att-video"></video>
                </view>
              </view>
            </view>
            <text class="msg-time">{{ formatTime(reply._add_time) }}</text>
          </view>
        </view>

        <view style="height: 16px;"></view>
      </view>
    </scroll-view>

    <view v-if="ticket.status !== 'closed'" class="chat-input">
      <view v-if="pendingAttachments.length" class="chat-pending-bar">
        <view v-for="(att, i) in pendingAttachments" :key="i" class="pending-item">
          <image v-if="att.type === 'image'" :src="att.url" mode="aspectFill" class="pending-thumb"></image>
          <view v-else class="pending-thumb pending-video-icon"><i class="el-icon-video-camera"></i></view>
          <view class="pending-remove" @click="removePending(i)"><i class="el-icon-close"></i></view>
        </view>
      </view>
      <view class="chat-input-row">
        <view class="chat-toolbar">
          <el-button size="small" icon="el-icon-picture-outline" @click="chooseImage">图片</el-button>
          <el-button size="small" icon="el-icon-video-camera" @click="chooseVideo">视频</el-button>
        </view>
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="3"
          placeholder="输入回复内容… (可粘贴图片)"
          maxlength="2000"
          show-word-limit
          resize="none"
          @keyup.enter.native="handleEnter"
          @paste.native="handlePaste"
        ></el-input>
        <el-button
          type="primary"
          size="small"
          :loading="replying"
          :disabled="!replyContent.trim() && pendingAttachments.length === 0"
          @click="submitReply"
        >
          发送
        </el-button>
      </view>
    </view>

    <view v-else class="chat-closed-bar">
      <i class="el-icon-lock"></i>
      <text>该工单已关闭，无法继续回复</text>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      replying: false,
      ticketId: '',
      ticket: {},
      replies: [],
      replyContent: '',
      pendingAttachments: [],
      scrollTop: 99999,
      chatHeight: 400
    };
  },
  onLoad(options) {
    vk = this.vk;
    this.ticketId = options.id;
    this.calcChatHeight();
    if (this.ticketId) {
      this.loadDetail();
    }
  },
  onShow() {
    if (this.ticketId) {
      this.loadDetail();
    }
  },
  methods: {
    loadDetail() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/ticket/kh/getDetail',
        data: { ticketId: this.ticketId },
        success: (res) => {
          let data = res.data || res;
          if (data && data.replies) {
            this.ticket = data.ticket || this.ticket;
            this.replies = data.replies;
            this.scrollToBottom();
          }
        },
        complete: () => {
          this.loading = false;
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
        user_name: this.ticket.user_name || '我',
        is_admin: false,
        _add_time: Date.now()
      };
      this.replies.push(optimisticReply);
      this.replyContent = '';
      this.pendingAttachments = [];
      this.scrollToBottom();

      vk.callFunction({
        url: 'admin/ticket/kh/reply',
        title: '发送中',
        data: { ticketId: this.ticketId, content, attachments },
        success: (res) => {
          this.loadDetail();
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
      let urls = [url];
      uni.previewImage({ current: url, urls });
    },
    handleEnter(e) {
      if (!e.shiftKey) {
        e.preventDefault();
        this.submitReply();
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        this.scrollTop = this.scrollTop + 1;
      }, 100);
    },
    goBack() {
      vk.navigateBack();
    },
    calcChatHeight() {
      const isH5 = typeof window !== 'undefined';
      const topWindowH = isH5 ? 100 : 0;
      const vh = window.innerHeight || document.documentElement.clientHeight || 667;
      const headerH = 56;
      const inputH = 130;
      this.chatHeight = Math.floor((vh - topWindowH - headerH - inputH) * 0.8);
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
    getAvatarText(name, isAdmin) {
      if (!name) return isAdmin ? '客' : '我';
      return name.charAt(0);
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
.ticket-chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  background: #f0f2f5;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  padding: 12px 16px;
}
.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-header-info {
  flex: 1;
  min-width: 0;
}
.chat-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}
.chat-header-meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.priority-dot.urgent {
  background: #f54a45;
  box-shadow: 0 0 0 2px rgba(245, 74, 69, 0.2);
}
.priority-dot.high {
  background: #f7ba1e;
  box-shadow: 0 0 0 2px rgba(247, 186, 30, 0.2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
}
.chat-messages-inner {
  padding: 16px;
}

.time-divider {
  text-align: center;
  margin: 12px 0 20px;
}
.time-divider text {
  font-size: 12px;
  color: #8f959e;
  background: #e8eaed;
  padding: 2px 12px;
  border-radius: 10px;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}
.msg-row.is-self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.avatar-user {
  background: #3370ff;
  margin-left: 12px;
}
.avatar-admin {
  background: #f54a45;
  margin-right: 12px;
}

.msg-body {
  max-width: 75%;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.msg-row.is-self .msg-body {
  align-items: flex-end;
}
.msg-sender {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.msg-row.is-self .msg-sender {
  justify-content: flex-end;
  align-self: flex-end;
}
.sender-name {
  font-size: 12px;
  font-weight: 500;
  color: #8f959e;
}
.name-admin {
  color: #f54a45;
}
.name-user {
  color: #3370ff;
}
.sender-badge {
  font-size: 10px;
  background: #fef0f0;
  color: #f54a45;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  display: inline-block;
  text-align: left;
  line-height: 1.6;
}
.bubble-user {
  background: #3370ff;
  color: #fff;
  border-top-right-radius: 4px;
}
.bubble-admin {
  background: #fff;
  color: #1f2329;
  border: 1px solid #dee0e3;
  border-top-left-radius: 4px;
}
.msg-text {
  font-size: 14px;
  word-break: break-word;
  white-space: pre-wrap;
}
.msg-time {
  margin-top: 4px;
  font-size: 11px;
  color: #c0c4cc;
}

.msg-attachments {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.msg-attachments > view {
  max-width: 200px;
}
.att-img {
  max-width: 200px;
  max-height: 300px;
  border-radius: 6px;
  display: block;
  cursor: pointer;
  object-fit: contain;
}
.att-video {
  max-width: 280px;
  max-height: 200px;
  border-radius: 6px;
  display: block;
}

.chat-pending-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.pending-item {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dee0e3;
}
.pending-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pending-video-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  font-size: 22px;
  color: #8f959e;
}
.pending-remove {
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

.chat-input {
  flex-shrink: 0;
  background: #fff;
  border-top: 1px solid #e8eaed;
  padding: 12px 16px;
}
.chat-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.chat-input-row .el-textarea {
  flex: 1;
  min-width: 0;
}
.chat-input-row .el-button {
  margin-bottom: 4px;
}
.chat-toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.chat-toolbar .el-button {
  width: 68px;
  margin-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-closed-bar {
  flex-shrink: 0;
  background: #fafafa;
  border-top: 1px solid #e8eaed;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #8f959e;
  font-size: 13px;
}
</style>
