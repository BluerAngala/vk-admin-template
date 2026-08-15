<template>
  <div
    class="product-card-wrapper"
    :class="{
      'is-flipped': isFlipped,
      'mode-purchased': mode === 'purchased',
      'mode-unpurchased': mode === 'unpurchased'
    }"
    @click="mode === 'purchased' && toggleFlip()"
  >
    <!-- ==================== 正面 ==================== -->
    <div class="card-face card-front">
      <!-- 图片区域 -->
      <div class="card-visual">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          class="product-image"
          @error="$event.target.style.display = 'none'"
        >
        <div v-else class="image-placeholder">
          <i class="el-icon-picture-outline"></i>
          <span>{{ product.product_name }}</span>
        </div>

        <!-- 浮动标签 -->
        <div class="floating-badges">
          <span class="type-badge" :class="product.product_type">
            {{ typeLabel }}
          </span>
          <span v-if="isCustom" class="custom-badge">
            <i class="el-icon-star-on"></i> 定制
          </span>
          <span
            v-if="mode === 'unpurchased' && product.buy_price > 0"
            class="hot-badge"
          >
            <i class="el-icon-trophy"></i>
          </span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="card-body">
        <h3 class="product-name">{{ product.product_name }}</h3>
        <p v-if="product.description" class="product-desc">{{ product.description }}</p>

        <!-- 定价栏 -->
        <div class="pricing-bar">
          <div class="pricing-item">
            <span class="pricing-value">{{ product.price_points }}</span>
            <span class="pricing-label">积分</span>
          </div>
          <span class="pricing-sep">×</span>
          <div class="pricing-item">
            <span class="pricing-value">{{ product.price_months }}</span>
            <span class="pricing-label">月</span>
          </div>
          <span class="pricing-sep">×</span>
          <div class="pricing-item">
            <span class="pricing-value">{{ product.price_machines }}</span>
            <span class="pricing-label">机器</span>
          </div>
        </div>

        <!-- 未购买：购买操作区 -->
        <div v-if="mode === 'unpurchased'" class="card-action">
          <div v-if="product.is_purchased" class="purchased-block" @click.stop="$emit('go-purchased', product)">
            <i class="el-icon-circle-check"></i>
            <span>已购买</span>
            <i class="el-icon-arrow-right"></i>
          </div>
          <div v-else-if="product.buy_price > 0" class="purchase-block">
            <div class="price-tag">
              <span class="price-amount">{{ product.buy_price }}</span>
              <span class="price-unit">积分</span>
            </div>
            <el-button
              type="primary"
              class="action-btn primary-btn"
              @click.stop="$emit('buy', product)"
            >
              <i class="el-icon-shopping-cart-full"></i>
              立即购买
            </el-button>
          </div>
          <div v-else class="unavailable-block">
            <i class="el-icon-lock"></i>
            <span>暂不支持购买</span>
          </div>
        </div>

        <!-- 已购买：翻转提示 -->
        <div v-if="mode === 'purchased'" class="card-footer">
          <div class="flip-hint">
            <i class="el-icon-refresh-left"></i>
            点击卡片查看更多
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 背面（仅 purchased 模式） ==================== -->
    <div v-if="mode === 'purchased'" class="card-face card-back">
      <div class="back-header">
        <h3>{{ product.product_name }}</h3>
        <div class="flip-hint-back" @click.stop="toggleFlip()">
          <i class="el-icon-refresh-right"></i>
          点击返回
        </div>
      </div>

      <div class="back-body">
        <!-- 版本更新日志 -->
        <div v-if="hasVersionLogs" class="back-section">
          <div class="section-title">
            <i class="el-icon-document"></i>
            版本更新日志
          </div>
          <div class="version-list">
            <div
              v-for="(log, index) in product.version_logs.slice(0, 3)"
              :key="index"
              class="version-item"
            >
              <div class="version-head">
                <el-tag size="mini" :type="index === 0 ? 'success' : ''">{{ log.version }}</el-tag>
                <span class="version-date">{{ formatDate(log.date) }}</span>
              </div>
              <div class="version-log" v-html="formatLogPreview(log.log)"></div>
            </div>
            <el-button
              v-if="product.version_logs.length > 3"
              type="text"
              size="small"
              @click.stop="$emit('show-version-logs', product)"
              style="margin-top: 10px;"
            >查看全部 {{ product.version_logs.length }} 个版本 →</el-button>
          </div>
        </div>

        <!-- 下载地址 -->
        <div v-if="product.download_url" class="back-section">
          <div class="section-title">
            <i class="el-icon-download"></i>
            下载地址
          </div>
          <div class="download-area">
            <el-input
              :value="product.download_url"
              readonly
              size="small"
              @click.native.stop
            >
              <el-button
                slot="append"
                icon="el-icon-copy-document"
                @click.stop="$emit('copy', product.download_url)"
              >复制</el-button>
            </el-input>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click.stop="$emit('download', product.download_url)"
              style="margin-top: 10px; width: 100%;"
            >立即下载</el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!hasVersionLogs && !product.download_url" class="back-empty">
          <i class="el-icon-info"></i>
          <p>暂无更新日志和下载地址</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatLogPreview } from '@/pages/user-center/user-center-config.js';

const TYPE_LABELS = {
  software: '软件',
  plugin: '浏览器插件',
  normal: '通用',
};

export default {
  name: 'ProductCard',

  props: {
    product: { type: Object, required: true },
    mode: { type: String, default: 'purchased' }, // 'purchased' | 'unpurchased'
    userInfo: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      isFlipped: false,
    };
  },

  computed: {
    imageUrl() {
      const img = this.product.product_image;
      if (!img) return '';
      if (typeof img === 'string') return img;
      if (typeof img === 'object') {
        if (img.url) return img.url;
        if (img[0] && typeof img[0] === 'string') return img[0];
        if (img[0] && img[0].url) return img[0].url;
      }
      return '';
    },

    typeLabel() {
      return TYPE_LABELS[this.product.product_type] || this.product.product_type;
    },

    isCustom() {
      const ids = this.product.custom_user_ids;
      if (!ids || !Array.isArray(ids)) return false;
      if (ids.includes('all')) return false;
      return ids.includes(this.userInfo._id);
    },

    hasVersionLogs() {
      return this.product.version_logs && this.product.version_logs.length > 0;
    },
  },

  methods: {
    formatDate,
    formatLogPreview,

    toggleFlip() {
      this.isFlipped = !this.isFlipped;
    },
  },
};
</script>

<style lang="scss" scoped>
/* ========== 容器 ========== */
.product-card-wrapper {
  position: relative;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;

  &.mode-unpurchased {
    height: auto;
    cursor: default;
  }
}

/* ========== 正反面基础 ========== */
.card-face {
  position: absolute;
  inset: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.card-front {
  transform: rotateY(0deg);
  z-index: 2;
}

.card-back {
  transform: rotateY(180deg);
  z-index: 1;
}

.is-flipped {
  .card-front {
    transform: rotateY(-180deg);
    z-index: 1;
  }
  .card-back {
    transform: rotateY(0deg);
    z-index: 2;
  }
}

/* unpurchased 模式：正面不绝对定位 */
.mode-unpurchased .card-front {
  position: relative;
}

/* hover 整体上浮 */
.product-card-wrapper:hover {
  .card-front:not(.is-flipped *) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }
}

/* ========== 正面 — 图片 ========== */
.card-visual {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;

    i {
      font-size: 40px;
      opacity: 0.7;
      margin-bottom: 8px;
    }

    span {
      font-size: 14px;
      opacity: 0.85;
    }
  }
}

.floating-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 2;

  .type-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);

    &.software { background: #2563eb; }
    &.plugin   { background: #059669; }
    &.normal   { background: #6b7280; }
  }

  .custom-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    background: #f59e0b;
    color: #fff;
  }

  .hot-badge {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #ea580c;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
}

/* ========== 正面 — 内容 ========== */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.product-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 定价栏 */
.pricing-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;

  .pricing-item {
    text-align: center;

    .pricing-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }

    .pricing-label {
      font-size: 11px;
      color: #9ca3af;
    }
  }

  .pricing-sep {
    font-size: 14px;
    color: #d1d5db;
  }
}

/* ========== 正面 — 未购买操作区 ========== */
.card-action {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;

  .purchase-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .price-tag {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .price-amount {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
      }

      .price-unit {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  .purchased-block {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    background: #f0f9eb;
    border-radius: 8px;
    color: #67c23a;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e1f3d8;
    }

    i {
      font-size: 16px;
    }

    .el-icon-arrow-right {
      margin-left: auto;
      font-size: 14px;
      color: #95d475;
    }
  }

  .unavailable-block {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    color: #9ca3af;
    font-size: 13px;
  }
}

.action-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;

  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
}

.primary-btn {
  background: #111827 !important;
  border-color: #111827 !important;
  color: #fff !important;

  &:hover {
    background: #1f2937 !important;
    border-color: #1f2937 !important;
  }
}

/* ========== 正面 — 已购买底部 ========== */
.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.flip-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 13px;

  i { font-size: 16px; }
}

/* ========== 背面 ========== */
.card-back {
  display: flex;
  flex-direction: column;
}

.back-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }
}

.flip-hint-back {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  opacity: 0.9;

  i { font-size: 16px; }
}

.back-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.back-section {
  margin-bottom: 20px;

  &:last-child { margin-bottom: 0; }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409EFF;

  i {
    color: #409EFF;
    font-size: 16px;
  }
}

/* 版本日志 */
.version-list {
  .version-item {
    padding: 12px;
    margin-bottom: 10px;
    background: #f5f7fa;
    border-radius: 6px;
    border-left: 3px solid #409EFF;

    &:last-child { margin-bottom: 0; }
  }

  .version-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .version-date {
      font-size: 12px;
      color: #909399;
    }
  }

  .version-log {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }
}

/* 下载区域 */
.download-area {
  padding-left: 4px;
}

/* 背面空状态 */
.back-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
