<template>
  <div
    class="product-card"
    :class="mode === 'unpurchased' ? 'unpurchased-card' : 'purchased-card'"
  >
    <!-- 产品图片区域 -->
    <div class="card-visual">
      <el-image
        v-if="getImageUrl(product.product_image)"
        :src="getImageUrl(product.product_image)"
        :preview-src-list="[getImageUrl(product.product_image)]"
        fit="cover"
        class="product-image"
      >
        <div slot="error" class="image-placeholder">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div v-else class="image-placeholder">
        <i class="el-icon-picture-outline"></i>
      </div>

      <!-- 浮动标签 -->
      <div class="floating-badges">
        <span class="product-type-badge" :class="product.product_type">
          {{ getProductTypeName(product.product_type) }}
        </span>
        <span v-if="mode === 'unpurchased' && product.buy_price > 0" class="hot-indicator">
          <i class="el-icon-trophy"></i>
        </span>
      </div>
    </div>

    <!-- 卡片内容区域 -->
    <div class="card-content">
      <!-- 产品名称 - 必须显示 -->
      <h3 class="product-name" style="color: #111827 !important; font-size: 16px !important; font-weight: 600 !important; margin: 0 0 8px 0 !important; display: block !important;">
        {{ product.product_name }}
      </h3>

      <!-- 产品描述 -->
      <p class="product-desc">{{ product.description || '暂无描述' }}</p>

      <!-- 收费标准 - 水平布局 -->
      <div class="pricing-bar">
        <div class="pricing-item">
          <span class="pricing-value">{{ product.price_points }}</span>
          <span class="pricing-label">积分</span>
        </div>
        <div class="pricing-separator">×</div>
        <div class="pricing-item">
          <span class="pricing-value">{{ product.price_months }}</span>
          <span class="pricing-label">月</span>
        </div>
        <div class="pricing-separator">×</div>
        <div class="pricing-item">
          <span class="pricing-value">{{ product.price_machines }}</span>
          <span class="pricing-label">机器</span>
        </div>
      </div>

      <!-- 购买/操作区域 -->
      <div class="card-action">
        <!-- 精选产品：购买区域 -->
        <template v-if="mode === 'unpurchased'">
          <div v-if="product.buy_price > 0" class="purchase-block">
            <div class="price-tag">
              <span class="price-amount">{{ product.buy_price }}</span>
              <span class="price-unit">{{ product.product_type === 'normal' ? '积分起' : '积分' }}</span>
            </div>
            <el-button
              v-if="product.product_type === 'normal'"
              type="primary"
              class="action-btn contact-btn"
              @click="$emit('contact', product)"
            >
              <i class="el-icon-service"></i>
              联系客服
            </el-button>
            <el-button
              v-else
              type="primary"
              class="action-btn buy-btn"
              @click="$emit('buy', product)"
            >
              <i class="el-icon-shopping-cart-full"></i>
              立即购买
            </el-button>
          </div>
          <div v-else class="unavailable-block">
            <i class="el-icon-lock"></i>
            <span>暂不支持购买</span>
          </div>
        </template>

        <!-- 已购买产品 -->
        <div v-if="mode === 'purchased'" class="purchased-block">
          <el-button
            v-if="product.download_url"
            type="primary"
            class="action-btn download-btn"
            @click="$emit('download', product)"
          >
            <i class="el-icon-download"></i>
            下载
          </el-button>
          <el-button
            type="default"
            class="action-btn version-btn"
            :disabled="!product.version_logs || product.version_logs.length === 0"
            @click="$emit('show-version-logs', product)"
          >
            <i class="el-icon-document"></i>
            版本日志
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'unpurchased', // 'unpurchased' | 'purchased'
    },
  },
  methods: {
    getImageUrl(imageData) {
      if (!imageData) return '';
      if (typeof imageData === 'string') return imageData;
      if (typeof imageData === 'object') {
        if (imageData.url) return imageData.url;
        if (imageData[0] && typeof imageData[0] === 'string') return imageData[0];
        if (imageData[0] && imageData[0].url) return imageData[0].url;
      }
      return '';
    },
    getProductTypeName(type) {
      const map = { software: '软件', plugin: '浏览器插件', normal: '通用' };
      return map[type] || type;
    },
  },
};
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  // 图片区域
  .card-visual {
    position: relative;
    height: 160px;
    overflow: hidden;
    background: #f3f4f6;

    .product-image {
      width: 100%;
      height: 100%;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;

      i {
        font-size: 40px;
        color: #d1d5db;
      }
    }

    // 浮动标签 - 简洁设计
    .floating-badges {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
      z-index: 2;

      .product-type-badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.6);
        color: white;

        &.software {
          background: #2563eb;
        }

        &.plugin {
          background: #059669;
        }

        &.normal {
          background: #6b7280;
        }
      }

      .hot-indicator {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background: #ea580c;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
      }
    }
  }

    // 内容区域
  .card-content {
    padding: 16px;

    .product-name {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      line-height: 1.4;
    }

    .product-desc {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    // 定价栏
    .pricing-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 12px;

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

      .pricing-separator {
        font-size: 14px;
        color: #d1d5db;
      }
    }
  }

  // 底部操作区域
  .card-action {
    padding: 0 16px 16px;

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

      .action-btn {
        flex-shrink: 0;
        height: 40px;
        padding: 0 20px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.15s ease;

        &:hover {
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .buy-btn,
      .contact-btn {
        background: #111827;
        border: none;
        color: white;

        &:hover {
          background: #1f2937;
        }
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

      i {
        font-size: 14px;
      }
    }

    .purchased-block {
      display: flex;
      gap: 8px;

      .action-btn {
        flex: 1;
        height: 40px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.15s ease;

        &:hover {
          transform: translateY(-1px);
        }
      }

      .download-btn {
        background: #111827;
        border: none;
        color: white;

        &:hover {
          background: #1f2937;
        }
      }

      .version-btn {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        color: #374151;

        &:hover {
          background: #e5e7eb;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      }
    }
  }

  // 未购买卡片
  &.unpurchased-card {
    .card-visual {
      background: #f3f4f6;
    }
  }

  // 已购买卡片
  &.purchased-card {
    .card-visual {
      background: #f3f4f6;
    }
  }
}
</style>
