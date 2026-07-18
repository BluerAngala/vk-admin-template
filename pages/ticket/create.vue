<template>
  <view class="create-page">
    <view class="create-header">
      <text class="create-title">提交工单</text>
      <text class="create-subtitle">详细描述您的问题，我们会尽快处理</text>
    </view>

    <view class="create-form-card">
      <el-form label-position="top" :model="form" ref="form">
        <el-form-item label="工单标题" required>
          <el-input
            v-model="form.title"
            placeholder="请简要描述您的问题"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>

        <view class="form-row">
          <el-form-item label="工单类型" required class="form-row-item">
            <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
              <el-option label="问题反馈" value="bug"></el-option>
              <el-option label="功能建议" value="feature"></el-option>
              <el-option label="使用咨询" value="question"></el-option>
              <el-option label="投诉建议" value="complaint"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="优先级" class="form-row-item">
            <el-select v-model="form.priority" style="width: 100%">
              <el-option label="低" value="low"></el-option>
              <el-option label="普通" value="normal"></el-option>
              <el-option label="高" value="high"></el-option>
              <el-option label="紧急" value="urgent"></el-option>
            </el-select>
          </el-form-item>
        </view>

        <el-form-item label="问题描述" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请详细描述您遇到的问题或建议…&#10;&#10;1. 问题现象是什么？&#10;2. 如何复现？&#10;3. 期望的结果是什么？"
            maxlength="5000"
            show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button type="primary" :loading="submitting" @click="submit" icon="el-icon-check">提交工单</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      submitting: false,
      form: {
        title: '',
        content: '',
        type: 'question',
        priority: 'normal'
      }
    };
  },
  onLoad() {
    vk = this.vk;
  },
  methods: {
    submit() {
      if (!this.form.title || !this.form.title.trim()) {
        vk.toast('请输入工单标题');
        return;
      }
      if (!this.form.content || !this.form.content.trim()) {
        vk.toast('请输入问题描述');
        return;
      }
      this.submitting = true;
      vk.callFunction({
        url: 'admin/ticket/kh/create',
        title: '提交中',
        data: {
          title: this.form.title.trim(),
          content: this.form.content.trim(),
          type: this.form.type,
          priority: this.form.priority
        },
        success: (res) => {
          vk.toast('提交成功');
          setTimeout(() => {
            vk.redirectTo('/pages/ticket/list');
          }, 800);
        },
        complete: () => {
          this.submitting = false;
        }
      });
    },
    goBack() {
      vk.navigateBack();
    }
  }
};
</script>

<style scoped>
.create-page {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 20px;
  max-width: 760px;
  margin: 0 auto;
}

.create-header {
  margin-bottom: 20px;
}
.create-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2329;
  display: block;
}
.create-subtitle {
  font-size: 13px;
  color: #8f959e;
  margin-top: 4px;
  display: block;
}

.create-form-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
}
.form-row-item {
  flex: 1;
}

.form-actions {
  margin-bottom: 0;
  padding-top: 8px;
  border-top: 1px solid #f2f3f5;
  margin-top: 8px;
}
</style>
