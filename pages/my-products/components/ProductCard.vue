<template>
  <el-card
    class="product-card"
    :class="mode === 'unpurchased' ? 'unpurchased-card' : 'purchased-card'"
    shadow="hover"
  >
    <!-- 热门标签 -->
    <div class="hot-badge" v-if="mode === 'unpurchased' && product.buy_price > 0">
      <i class="el-icon-trophy"></i>
      热门
    </div>

    <!-- 已购买标签 -->
    <div class="purchased-badge" v-if="mode === 'purchased'">
      <i class="el-icon-circle-check"></i>
      已购买
    </div>

    <!-- 产品图片 -->
    <div class="product-image">
      <el-image
        v-if="getImageUrl(product.product_image)"
        :src="getImageUrl(product.product_image)"
        :preview-src-list="[getImageUrl(product.product_image)]"
        fit="cover"
      >
        <div slot="error" class="image-placeholder">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div v-else class="image-placeholder">
        <i class="el-icon-picture-outline"></i>
      </div>
      <el-tag
        :type="getProductTypeColor(product.product_type)"
        size="small"
        class="product-type-tag"
      >
        {{ getProductTypeName(product.product_type) }}
      </el-tag>
    </div>

    <!-- 产品信息 -->
    <div class="product-info">
      <h3 class="product-name">{{ product.product_name }}</h3>
      <pre class="product-desc">{{ product.description || '暂无描述' }}</pre>

      <!-- 收费标准 -->
      <div class="price-info">
        <span class="price-label">收费标准：</span>
        <span class="price-value">
          {{ product.price_points }}积分 / {{ product.price_months }}月 / {{ product.price_machines }}机器
        </span>
      </div>

      <!-- 精选产品：购买区域 -->
      <template v-if="mode === 'unpurchased'">
        <div v-if="product.buy_price > 0" class="buy-section highlight">
          <div class="buy-info">
            <span class="buy-label">{{ product.product_type === 'normal' ? '定制价格' : '购买价格' }}</span>
            <span class="buy-price">
              <span class="price-number">{{ product.buy_price }}</span>
              <span class="price-unit">{{ product.product_type === 'normal' ? '积分起' : '积分' }}</span>
            </span>
          </div>
          <el-button
            v-if="product.product_type === 'normal'"
            type="primary"
            size="medium"
            icon="el-icon-service"
            class="buy-btn contact-btn"
            @click="$emit('contact', product)"
          >
            联系客服
          </el-button>
          <el-button
            v-else
            type="danger"
            size="medium"
            icon="el-icon-shopping-cart-full"
            class="buy-btn"
            @click="$emit('buy', product)"
          >
            立即购买
          </el-button>
        </div>
        <div v-else class="no-buy-section">
          <i class="el-icon-info"></i>
          <span>该产品暂不支持购买</span>
        </div>
      </template>

      <!-- 操作按钮 -->
      <div class="product-actions">
        <el-button
          v-if="mode === 'purchased' && product.download_url"
          type="success"
          size="small"
          icon="el-icon-download"
          @click="$emit('download', product)"
          class="download-btn"
        >
          下载产品
        </el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-document"
          plain
          :disabled="!product.version_logs || product.version_logs.length === 0"
          @click="$emit('show-version-logs', product)"
          class="version-log-btn"
        >
          {{ product.version_logs && product.version_logs.length > 0
            ? (mode === 'unpurchased' ? '版本日志' : '版本日志')
            : '暂无版本日志' }}
        </el-button>
      </div>
    </div>
  </el-card>
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
    getProductTypeColor(type) {
      const map = { software: 'primary', plugin: 'success', normal: 'info' };
      return map[type] || 'info';
    },
  },
};
</script>

<style lang="scss" scoped>
.product-card {
  overflow: hidden;
  transition: all 0.3s;
  border-radius: 8px;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  // 热门标签
  .hot-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }
  }

  // 已购买标签
  .purchased-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.4);
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }
  }

  // 未购买产品卡片强调
  &.unpurchased-card {
    border: 2px solid transparent;
    background-image: linear-gradient(white, white),
                      linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-origin: border-box;
    background-clip: padding-box, border-box;

    &:hover {
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.25);
    }
  }

  // 已购买产品卡片
  &.purchased-card {
    opacity: 0.95;
  }

  .product-image {
    position: relative;
    width: 100%;
    height: 200px;
    background: #f5f7fa;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: #c0c4cc;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    }

    .product-type-tag {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }

  .product-info {
    padding: 20px;

    .product-name {
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: bold;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-desc {
      margin: 0 0 15px 0;
      font-family: inherit;
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #f9fafb;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #e4e7ed;
    }

    .price-info {
      margin-bottom: 5px;
      font-size: 14px;

      .price-label {
        color: #909399;
      }

      .price-value {
        color: #e6a23c;
        font-weight: bold;
      }
    }

    .buy-section {
      margin-bottom: 15px;
      padding: 15px;
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      border-radius: 8px;
      border-left: 3px solid #ff9800;

      .buy-info {
        margin-bottom: 12px;
        display: flex;
        align-items: baseline;
        justify-content: space-between;

        .buy-label {
          color: #606266;
          font-size: 14px;
        }

        .buy-price {
          display: flex;
          align-items: baseline;
          gap: 4px;

          .price-number {
            color: #ff6b00;
            font-size: 24px;
            font-weight: bold;
          }

          .price-unit {
            color: #ff9800;
            font-size: 14px;
          }
        }
      }

      .buy-btn {
        width: 100%;
        font-size: 15px;
        font-weight: 600;
        height: 40px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);

        &:hover {
          box-shadow: 0 6px 16px rgba(255, 107, 0, 0.4);
        }
      }

      .contact-btn {
        background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

        &:hover {
          box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      // 高亮版本
      &.highlight {
        background: linear-gradient(135deg, #ffe9e9 0%, #ffd5d5 100%);
        border-left: 4px solid #ff4757;
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.15);

        .buy-info {
          .buy-price {
            .price-number {
              color: #ff4757;
              font-size: 28px;
            }

            .price-unit {
              color: #ff6b6b;
            }
          }
        }

        .buy-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          border: none;
          box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);

          &:hover {
            box-shadow: 0 8px 20px rgba(255, 71, 87, 0.5);
            transform: translateY(-2px);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }

    .no-buy-section {
      margin-bottom: 15px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #909399;
      text-align: center;
      color: #909399;
      font-size: 14px;

      i {
        margin-right: 5px;
        font-size: 16px;
      }
    }

    .product-actions {
      display: flex;
      gap: 10px;
      flex-wrap: nowrap;

      .download-btn {
        flex: 1;
      }

      .version-log-btn {
        flex: 1;
      }
    }
  }
}
</style>
