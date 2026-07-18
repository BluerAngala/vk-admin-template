<template>
  <view class="page-body">
    <!-- 公告管理 -->
    <el-card class="announcement-card">
      <div slot="header" class="card-header">
        <span>📢 公告管理</span>
        <el-button type="primary" size="small" @click="saveAnnouncement" :loading="loading">
          保存公告
        </el-button>
      </div>

      <el-form label-width="100px">
        <el-form-item label="公告标题">
          <el-input v-model="form.title" placeholder="🎉 重大更新！新功能上线"></el-input>
        </el-form-item>
        <el-form-item label="公告副标题">
          <el-input v-model="form.subtitle" placeholder="简短描述本次更新亮点"></el-input>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用"></el-switch>
        </el-form-item>
      </el-form>

      <el-divider>更新日志（右下角弹窗展示）</el-divider>

      <div class="changelog-editor">
        <div v-for="(log, index) in form.changelog" :key="index" class="changelog-item">
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="8">
              <el-input v-model="log.product_name" placeholder="产品/功能名称（如：JD直播助手PLUS）"></el-input>
            </el-col>
            <el-col :span="5">
              <el-input v-model="log.version" placeholder="版本号（可选）"></el-input>
            </el-col>
            <el-col :span="6">
              <el-date-picker v-model="log.date" type="date" placeholder="日期" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
            </el-col>
            <el-col :span="5">
              <el-button type="danger" icon="el-icon-delete" size="small" @click="removeLog(index)">删除</el-button>
            </el-col>
          </el-row>
          <el-input v-model="log.items" type="textarea" :rows="4" placeholder="更新内容，每行一条，如：&#10;✨ 全新上线xxx功能&#10;🎯 支持xxx操作&#10;📊 新增xxx分析&#10;🚀 优化xxx性能"></el-input>
        </div>

        <el-button type="primary" icon="el-icon-plus" @click="addLog" style="margin-top: 15px">
          添加更新日志
        </el-button>
      </div>

      <!-- 预览区域 -->
      <el-divider>预览效果</el-divider>
      <div class="preview-section">
        <div class="preview-popup">
          <div class="preview-header">🎉 系统公告</div>
          <div class="preview-body">
            <p class="preview-title">{{ form.title || '公告标题' }}</p>
            <p class="preview-subtitle">{{ form.subtitle || '公告副标题' }}</p>
            <div v-for="(log, index) in form.changelog" :key="index" class="preview-log-item">
              <div class="preview-log-header">
                <span class="preview-product">{{ log.product_name || '产品名称' }}</span>
                <span class="preview-version" v-if="log.version">v{{ log.version }}</span>
                <span class="preview-date">{{ log.date }}</span>
              </div>
              <ul class="preview-log-content">
                <li v-for="(item, i) in (log.items || '').split('\n').filter(x => x.trim())" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      form: {
        enabled: true,
        title: '',
        subtitle: '',
        changelog: []
      }
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadAnnouncement();
  },
  methods: {
    // 加载公告数据
    loadAnnouncement() {
      vk.callFunction({
        url: 'client/pub/getAnnouncement',
        title: '加载中',
        success: (res) => {
          if (res.data) {
            this.form = res.data;
            if (!Array.isArray(this.form.changelog)) {
              this.form.changelog = [];
            }
          }
        }
      });
    },
    // 保存公告
    saveAnnouncement() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/system_uni/global-data/sys/set',
        data: {
          key: 'announcement',
          value: this.form
        },
        success: () => {
          vk.toast('保存成功');
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    // 添加更新日志
    addLog() {
      this.form.changelog.unshift({
        product_name: '',
        version: '',
        date: new Date().toISOString().split('T')[0],
        items: ''
      });
    },
    // 删除更新日志
    removeLog(index) {
      this.form.changelog.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}
.announcement-card {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.changelog-item {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 3px solid #409eff;
}

/* 预览区域样式 */
.preview-section {
  display: flex;
  justify-content: flex-end;
}
.preview-popup {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.preview-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}
.preview-body {
  padding: 16px 18px;
  max-height: 300px;
  overflow-y: auto;
}
.preview-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.preview-subtitle {
  font-size: 13px;
  color: #8492a6;
  margin: 0 0 16px 0;
}
.preview-log-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #409eff;
  &:last-child {
    margin-bottom: 0;
  }
}
.preview-log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.preview-product {
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
}
.preview-version {
  font-size: 12px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}
.preview-date {
  font-size: 12px;
  color: #909399;
}
.preview-log-content {
  margin: 0;
  padding-left: 16px;
  list-style: none;
  li {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 4px;
    position: relative;
    &::before {
      content: '•';
      position: absolute;
      left: -12px;
      color: #409eff;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
