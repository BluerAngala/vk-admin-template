<template>
  <view class="page-body">
    <div class="page-header">
      <span class="page-title">展示配置</span>
      <el-button size="small" icon="el-icon-download" @click="loadPresets" :loading="presetLoading">加载预设</el-button>
    </div>

    <el-card v-for="config in configList" :key="config._id" class="config-card">
      <div slot="header" class="card-header">
        <div class="card-header__left">
          <span>{{ config.config_name }}</span>
          <el-tag size="small" type="info" style="margin-left: 8px;">{{ config.config_key }}</el-tag>
        </div>
        <el-switch
          v-model="config.enable"
          active-text="启用"
          inactive-text="禁用"
          @change="handleToggle(config)"
        />
      </div>

      <!-- 落地页核心功能卡片配置 -->
      <div v-if="config.config_key === 'landing-features'">
        <div class="item-list">
          <div class="item-card" v-for="(item, index) in config.config_value.items" :key="index">
            <div class="item-card__header">
              <span class="item-card__icon">{{ item.icon }}</span>
              <el-input v-model="item.title" size="small" placeholder="标题" style="width: 120px; margin: 0 8px;" />
              <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="removeItem(config, index)" />
            </div>
            <el-input v-model="item.desc" type="textarea" :rows="2" placeholder="描述" size="small" />
          </div>
        </div>
        <el-button size="small" icon="el-icon-plus" @click="addFeatureItem(config)">添加功能卡片</el-button>
      </div>

      <!-- 落地页优势板块配置 -->
      <div v-if="config.config_key === 'landing-advantages'">
        <div class="item-list">
          <div class="item-card" v-for="(item, index) in config.config_value.items" :key="index">
            <div class="item-card__header">
              <span class="item-card__num">{{ String(index + 1).padStart(2, '0') }}</span>
              <el-input v-model="item.title" size="small" placeholder="标题" style="width: 200px; margin: 0 8px;" />
              <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="removeItem(config, index)" />
            </div>
            <el-input v-model="item.desc" type="textarea" :rows="2" placeholder="描述" size="small" />
          </div>
        </div>
        <el-button size="small" icon="el-icon-plus" @click="addAdvantageItem(config)">添加优势项</el-button>
      </div>

      <div class="config-actions">
        <el-button type="primary" size="small" icon="el-icon-check" @click="saveConfig(config)" :loading="config._saving">
          保存配置
        </el-button>
      </div>
    </el-card>

    <el-empty v-if="!loading && configList.length === 0" description="暂无展示配置" />
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      presetLoading: false,
      configList: []
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadConfigs();
  },
  methods: {
    // 加载配置列表
    loadConfigs() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/display-config/sys/getList',
        data: {},
        success: (res) => {
          if (res.data && res.data.rows) {
            this.configList = res.data.rows.map(item => ({
              ...item,
              _saving: false
            }));
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

    // 加载预设配置
    loadPresets() {
      this.presetLoading = true;
      uniCloud.callFunction({
        name: 'migration',
        data: { action: 'display' },
        success: (res) => {
          if (res.result && res.result.code === 0) {
            const logs = res.result.data.display || [];
            vk.toast(logs.join('\n'), 'none');
            this.loadConfigs();
          } else {
            vk.toast(res.result.msg || '加载失败', 'none');
          }
        },
        fail: (err) => {
          vk.toast(err.message || '加载失败', 'none');
        },
        complete: () => {
          this.presetLoading = false;
        }
      });
    },

    // 添加功能卡片项
    addFeatureItem(config) {
      if (!config.config_value.items) {
        this.$set(config.config_value, 'items', []);
      }
      config.config_value.items.push({
        icon: '📦',
        title: '',
        desc: ''
      });
    },

    // 添加优势项
    addAdvantageItem(config) {
      if (!config.config_value.items) {
        this.$set(config.config_value, 'items', []);
      }
      config.config_value.items.push({
        title: '',
        desc: ''
      });
    },

    // 删除项
    removeItem(config, index) {
      config.config_value.items.splice(index, 1);
    },

    // 切换启用状态
    handleToggle(config) {
      this.saveConfig(config);
    },

    // 保存配置
    saveConfig(config) {
      config._saving = true;
      vk.callFunction({
        url: 'admin/display-config/sys/update',
        data: {
          _id: config._id,
          config_value: config.config_value,
          enable: config.enable
        },
        success: (res) => {
          vk.toast('保存成功');
        },
        fail: (err) => {
          vk.toast(err.msg || '保存失败', 'none');
        },
        complete: () => {
          config._saving = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 16px;
    font-weight: 600;
  }
}

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;

  &__left {
    display: flex;
    align-items: center;
  }
}

.item-list {
  margin-bottom: 16px;
}

.item-card {
  padding: 12px;
  margin-bottom: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409EFF;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  &__icon {
    font-size: 24px;
    line-height: 1;
  }

  &__num {
    font-size: 14px;
    font-weight: 600;
    color: #409EFF;
    min-width: 24px;
  }
}

.config-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
