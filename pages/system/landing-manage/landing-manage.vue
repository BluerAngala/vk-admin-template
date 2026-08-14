<template>
  <view class="page-body">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <view class="top-bar__left">
        <text class="top-bar__title">落地页管理</text>
        <text class="top-bar__desc">拖拽排序 · 开关控制 · 实时生效</text>
      </view>
      <view class="top-bar__right">
        <el-button size="small" icon="el-icon-view" @click="previewPage">预览落地页</el-button>
        <el-button size="small" icon="el-icon-download" @click="loadPresets" :loading="presetLoading">加载预设</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="saveConfig" :loading="saving">保存配置</el-button>
      </view>
    </view>

    <!-- 区块列表 -->
    <view class="section-list" v-loading="loading">
      <view
        class="section-card"
        :class="{ 'section-card--disabled': !section.enable }"
        v-for="(section, index) in sections"
        :key="index"
      >
        <!-- 卡片头部 -->
        <view class="section-card__header" @click="toggleExpand(index)">
          <view class="section-card__left">
            <view class="section-card__icon" :style="{ background: sectionColors[section.type] }">
              {{ sectionIcons[section.type] }}
            </view>
            <view class="section-card__info">
              <text class="section-card__name">{{ sectionTypeMap[section.type] || section.type }}</text>
              <text class="section-card__tag">{{ section.type }}</text>
            </view>
          </view>
          <view class="section-card__right" @click.stop>
            <el-switch v-model="section.enable" size="small" />
            <view class="section-card__sort">
              <el-button class="sort-btn" size="mini" icon="el-icon-top" :disabled="index === 0" @click="moveUp(index)" circle />
              <el-button class="sort-btn" size="mini" icon="el-icon-bottom" :disabled="index === sections.length - 1" @click="moveDown(index)" circle />
            </view>
            <i class="expand-icon" :class="expandedIndex === index ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </view>
        </view>

        <!-- 卡片内容（可折叠） -->
        <view class="section-card__body" v-show="expandedIndex === index && section.enable">
          <!-- Hero -->
          <div v-if="section.type === 'hero'" class="editor-grid">
            <div class="editor-field editor-field--full">
              <label>标题</label>
              <el-input v-model="section.data.title" type="textarea" :rows="2" placeholder="支持 \n 换行" />
            </div>
            <div class="editor-field editor-field--full">
              <label>副标题</label>
              <el-input v-model="section.data.subtitle" type="textarea" :rows="2" placeholder="支持 \n 换行" />
            </div>
            <div class="editor-field">
              <label>背景色</label>
              <div class="color-input">
                <el-color-picker v-model="section.data.bg_color" size="small" />
                <el-input v-model="section.data.bg_color" size="small" placeholder="#0a1628" />
              </div>
            </div>
            <div class="editor-field">
              <label>主按钮</label>
              <el-input v-model="section.data.btn_primary.text" size="small" placeholder="按钮文字" />
            </div>
            <div class="editor-field">
              <label>副按钮</label>
              <el-input v-model="section.data.btn_ghost.text" size="small" placeholder="按钮文字" />
            </div>
          </div>

          <!-- 统计 -->
          <div v-if="section.type === 'stats'" class="editor-grid">
            <div class="editor-field editor-field--full">
              <label>统计项 <el-button size="mini" icon="el-icon-plus" @click="section.data.items.push({ num: '', label: '' })">添加</el-button></label>
              <div class="stat-items">
                <div class="stat-item" v-for="(item, i) in section.data.items" :key="i">
                  <el-input v-model="item.num" size="small" placeholder="数字" style="width: 100px;" />
                  <el-input v-model="item.label" size="small" placeholder="标签" style="width: 140px;" />
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="section.data.items.splice(i, 1)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 -->
          <div v-if="section.type === 'features'" class="editor-grid">
            <div class="editor-field">
              <label>标题</label>
              <el-input v-model="section.data.title" size="small" />
            </div>
            <div class="editor-field">
              <label>副标题</label>
              <el-input v-model="section.data.subtitle" size="small" />
            </div>
            <div class="editor-field">
              <label>列数</label>
              <el-radio-group v-model="section.data.columns" size="small">
                <el-radio-button :label="2">2</el-radio-button>
                <el-radio-button :label="3">3</el-radio-button>
                <el-radio-button :label="4">4</el-radio-button>
              </el-radio-group>
            </div>
            <div class="editor-field editor-field--full">
              <label>卡片列表 <el-button size="mini" icon="el-icon-plus" @click="section.data.items.push({ icon: '', title: '', desc: '' })">添加</el-button></label>
              <div class="feature-items">
                <div class="feature-item" v-for="(item, i) in section.data.items" :key="i">
                  <el-input v-model="item.icon" size="small" placeholder="图标" style="width: 56px;" />
                  <el-input v-model="item.title" size="small" placeholder="标题" style="width: 120px;" />
                  <el-input v-model="item.desc" size="small" placeholder="描述" style="flex: 1;" />
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="section.data.items.splice(i, 1)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 优势 -->
          <div v-if="section.type === 'advantages'" class="editor-grid">
            <div class="editor-field">
              <label>标题</label>
              <el-input v-model="section.data.title" size="small" />
            </div>
            <div class="editor-field">
              <label>副标题</label>
              <el-input v-model="section.data.subtitle" size="small" />
            </div>
            <div class="editor-field editor-field--full">
              <label>优势列表 <el-button size="mini" icon="el-icon-plus" @click="section.data.items.push({ title: '', desc: '' })">添加</el-button></label>
              <div class="advantage-items">
                <div class="advantage-item" v-for="(item, i) in section.data.items" :key="i">
                  <span class="advantage-num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <el-input v-model="item.title" size="small" placeholder="标题" style="width: 200px;" />
                  <el-input v-model="item.desc" size="small" placeholder="描述" style="flex: 1;" />
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="section.data.items.splice(i, 1)" />
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div v-if="section.type === 'cta'" class="editor-grid">
            <div class="editor-field editor-field--full">
              <label>标题</label>
              <el-input v-model="section.data.title" size="small" />
            </div>
            <div class="editor-field editor-field--full">
              <label>副标题</label>
              <el-input v-model="section.data.subtitle" size="small" />
            </div>
            <div class="editor-field">
              <label>按钮文字</label>
              <el-input v-model="section.data.btn_text" size="small" />
            </div>
          </div>
        </view>

        <!-- 禁用遮罩 -->
        <view class="section-card__mask" v-if="!section.enable">
          <text class="section-card__mask-text">已禁用</text>
        </view>
      </view>

      <el-empty v-if="!loading && sections.length === 0" description="暂无区块配置">
        <el-button type="primary" icon="el-icon-download" @click="loadPresets">加载预设</el-button>
      </el-empty>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      saving: false,
      presetLoading: false,
      configId: '',
      sections: [],
      expandedIndex: 0,
      sectionTypeMap: {
        hero: '首屏',
        stats: '数据统计',
        features: '功能卡片',
        advantages: '优势',
        cta: '行动号召'
      },
      sectionIcons: {
        hero: '🎯',
        stats: '📊',
        features: '✨',
        advantages: '💎',
        cta: '🚀'
      },
      sectionColors: {
        hero: '#1e293b',
        stats: '#0ea5e9',
        features: '#8b5cf6',
        advantages: '#f59e0b',
        cta: '#10b981'
      }
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadConfig();
  },
  methods: {
    // 加载配置
    loadConfig() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/landing-page/sys/get',
        data: {},
        success: (res) => {
          if (res.data) {
            this.configId = res.data._id || '';
            this.sections = res.data.sections || [];
          }
        },
        fail: (err) => {
          vk.toast(err.msg || '加载失败', 'none');
        },
        complete: () => {
          this.loading = false;
        }
      });
    },

    // 保存配置
    saveConfig() {
      this.saving = true;
      vk.callFunction({
        url: 'admin/landing-page/sys/save',
        data: {
          _id: this.configId,
          sections: this.sections
        },
        success: (res) => {
          if (res.code === 0) {
            vk.toast('保存成功');
            if (res.data && res.data._id) {
              this.configId = res.data._id;
            }
          } else {
            vk.toast(res.msg || '保存失败', 'none');
          }
        },
        fail: (err) => {
          vk.toast(err.msg || '保存失败', 'none');
        },
        complete: () => {
          this.saving = false;
        }
      });
    },

    // 加载预设
    loadPresets() {
      this.$confirm('加载预设将覆盖当前配置，确定继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.presetLoading = true;
        vk.callFunction({
          url: 'admin/landing-page/sys/initPresets',
          data: {},
          success: (res) => {
            if (res.code === 0) {
              vk.toast(res.msg || '加载成功');
              this.loadConfig();
            } else {
              vk.toast(res.msg || '加载失败', 'none');
            }
          },
          fail: (err) => {
            vk.toast(err.msg || '加载失败', 'none');
          },
          complete: () => {
            this.presetLoading = false;
          }
        });
      }).catch(() => {});
    },

    // 展开/折叠
    toggleExpand(index) {
      this.expandedIndex = this.expandedIndex === index ? -1 : index;
    },

    // 上移
    moveUp(index) {
      if (index <= 0) return;
      const temp = this.sections[index];
      this.$set(this.sections, index, this.sections[index - 1]);
      this.$set(this.sections, index - 1, temp);
      if (this.expandedIndex === index) this.expandedIndex = index - 1;
    },

    // 下移
    moveDown(index) {
      if (index >= this.sections.length - 1) return;
      const temp = this.sections[index];
      this.$set(this.sections, index, this.sections[index + 1]);
      this.$set(this.sections, index + 1, temp);
      if (this.expandedIndex === index) this.expandedIndex = index + 1;
    },

    // 预览落地页
    previewPage() {
      uni.navigateTo({ url: '/pages/landing/index' });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

// 顶部操作栏
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  &__title {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }

  &__desc {
    display: block;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 4px;
  }

  &__right {
    display: flex;
    gap: 8px;
  }
}

// 区块卡片
.section-list {
  min-height: 200px;
}

.section-card {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border-color: #d1d5db;
  }

  &--disabled {
    opacity: 0.6;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: #fafbfc;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }

  &__tag {
    font-size: 12px;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: monospace;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__sort {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__body {
    padding: 20px;
    border-top: 1px solid #f1f5f9;
    background: #fafbfc;
  }

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    border-radius: 12px;
  }

  &__mask-text {
    font-size: 13px;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 4px;
  }
}

.sort-btn {
  padding: 4px !important;
  font-size: 12px !important;
}

.expand-icon {
  font-size: 14px;
  color: #94a3b8;
  margin-left: 4px;
}

// 编辑器网格
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.editor-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.color-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 统计项
.stat-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

// 功能卡片项
.feature-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

// 优势项
.advantage-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.advantage-num {
  font-size: 14px;
  font-weight: 700;
  color: #3b82f6;
  min-width: 28px;
}
</style>
