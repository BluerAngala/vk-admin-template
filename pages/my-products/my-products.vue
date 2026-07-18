<template>
  <view class="page-body">
    <!-- 页面标题 -->
    <view class="page-header">
      <h2>产品列表</h2>
      <p class="page-desc">发现更多优质产品，提升您的工作效率</p>
    </view>

    <!-- 标签页切换 -->
    <view class="tabs-wrapper">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane name="unpurchased">
          <span slot="label" class="tab-label">
            <i class="el-icon-star-on"></i>
            精选产品
            <el-badge :value="unpurchasedProducts.length" :max="99" class="tab-badge" />
          </span>
        </el-tab-pane>
        <el-tab-pane name="purchased">
          <span slot="label" class="tab-label">
            <i class="el-icon-shopping-bag-2"></i>
            我的产品
            <el-badge :value="purchasedProducts.length" :max="99" class="tab-badge" type="success" />
          </span>
        </el-tab-pane>
      </el-tabs>
    </view>

    <!-- 表格搜索组件 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
    </vk-data-table-query>

    <!-- 未购买产品列表 - 重点展示 -->
    <view v-if="activeTab === 'unpurchased' && unpurchasedProducts.length > 0" class="product-section">
      <view class="product-list">
        <el-card
          v-for="product in displayUnpurchasedProducts"
          :key="product._id"
          class="product-card unpurchased-card"
          shadow="hover"
        >
          <!-- 热门标签 -->
          <div class="hot-badge" v-if="product.buy_price > 0">
            <i class="el-icon-trophy"></i>
            热门
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
            
            <!-- 产品类型标签 -->
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

            <!-- 购买按钮 - 重点突出 -->
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
                @click="contactCustomer(product)"
              >
                联系客服
              </el-button>
              <el-button
                v-else
                type="danger"
                size="medium"
                icon="el-icon-shopping-cart-full"
                class="buy-btn"
                @click="buyProduct(product)"
              >
                立即购买
              </el-button>
            </div>
            
            <!-- 公开产品未设置购买价格时显示提示 -->
            <div v-else class="no-buy-section">
              <i class="el-icon-info"></i>
              <span>该产品暂不支持购买</span>
            </div>

            <!-- 操作按钮 -->
            <div class="product-actions">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-document"
                plain
                :disabled="!product.version_logs || product.version_logs.length === 0"
                @click="showVersionLogs(product)"
                class="version-log-btn"
              >
                {{ product.version_logs && product.version_logs.length > 0 ? '版本日志' : '暂无版本日志' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </view>

      <!-- 未购买产品分页 -->
      <view v-if="unpurchasedProducts.length > pageSize" class="pagination-wrapper">
        <el-pagination
          :current-page="unpurchasedCurrentPage"
          :page-size="pageSize"
          :total="unpurchasedProducts.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handleUnpurchasedPageChange"
        >
        </el-pagination>
      </view>
    </view>

    <!-- 未购买产品空状态 -->
    <view v-if="activeTab === 'unpurchased' && unpurchasedProducts.length === 0" class="empty-state">
      <i class="el-icon-star-off"></i>
      <p>暂无可购买的产品</p>
      <p class="empty-tip">所有公开产品都已购买或暂无公开产品</p>
    </view>

    <!-- 已购买产品列表 -->
    <view v-if="activeTab === 'purchased' && purchasedProducts.length > 0" class="product-section purchased-section">
      <view class="product-list">
        <el-card
          v-for="product in displayPurchasedProducts"
          :key="product._id"
          class="product-card purchased-card"
          shadow="hover"
        >
          <!-- 已购买标签 -->
          <div class="purchased-badge">
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
            
            <!-- 产品类型标签 -->
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

            <!-- 操作按钮 -->
            <div class="product-actions">
              <el-button
                v-if="product.download_url"
                type="success"
                size="small"
                icon="el-icon-download"
                @click="downloadProduct(product)"
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
                @click="showVersionLogs(product)"
                class="version-log-btn"
              >
                版本日志
              </el-button>
            </div>
          </div>
        </el-card>
      </view>

      <!-- 已购买产品分页 -->
      <view v-if="purchasedProducts.length > pageSize" class="pagination-wrapper">
        <el-pagination
          :current-page="purchasedCurrentPage"
          :page-size="pageSize"
          :total="purchasedProducts.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePurchasedPageChange"
        >
        </el-pagination>
      </view>
    </view>

    <!-- 已购买产品空状态 -->
    <view v-if="activeTab === 'purchased' && purchasedProducts.length === 0" class="empty-state">
      <i class="el-icon-shopping-bag-1"></i>
      <p>暂无已购买的产品</p>
      <p class="empty-tip">去精选产品看看吧</p>
    </view>

    <!-- 版本日志弹窗 -->
    <el-dialog
      :visible.sync="versionDialog.show"
      :title="versionDialog.title"
      width="700px"
    >
      <div class="version-logs">
        <div
          v-for="(log, index) in versionDialog.logs"
          :key="index"
          class="version-log-item"
        >
          <div class="version-header">
            <el-tag type="primary" size="small">版本 {{ log.version }}</el-tag>
            <span class="version-date">{{ formatDate(log.date) }}</span>
          </div>
          <div class="version-content">
            <pre>{{ log.log }}</pre>
          </div>
          <div v-if="log.download_url" class="version-download">
            <el-link
              :href="log.download_url"
              target="_blank"
              type="primary"
              icon="el-icon-download"
            >
              下载此版本
            </el-link>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 客服二维码弹窗 -->
    <el-dialog
      :visible.sync="serviceDialog.show"
      title="联系客服"
      width="400px"
      :close-on-click-modal="true"
    >
      <view class="service-dialog-content">
        <div class="qrcode-container">
          <img src="static/service-qrcode.png" class="qrcode-img" />
        </div>
        <p class="service-tips">
          <i class="el-icon-info"></i>
          请使用QQ扫描二维码添加客服
        </p>
        <p class="service-time">工作时间：9:00 - 18:00</p>
      </view>
    </el-dialog>
  </view>
</template>

<script>
let that;
let vk = uni.vk;

export default {
  data() {
    return {
      activeTab: 'unpurchased', // 当前激活的标签页
      productList: [], // 所有产品列表
      allProducts: [], // 原始完整产品列表（用于搜索）
      unpurchasedCurrentPage: 1, // 未购买产品当前页码
      purchasedCurrentPage: 1, // 已购买产品当前页码
      pageSize: 9, // 每页显示数量
      loading: false,
      queryForm1: {
        formData: {},
        columns: [
          {
            key: "product_name",
            type: "text",
            title: "产品名称",
            placeholder: "请输入产品名称",
            mode: "%%",
            col: { span: 6 },
          },
          {
            key: "product_type",
            type: "select",
            title: "产品类型",
            placeholder: "选择类型",
            data: [
              { value: "software", label: "软件" },
              { value: "plugin", label: "浏览器插件" },
              { value: "normal", label: "通用" },
            ],
            col: { span: 5 },
          },
        ],
      },
      versionDialog: {
        show: false,
        title: "",
        logs: [],
      },
      serviceDialog: {
        show: false,
      },
    };
  },
  computed: {
    // 未购买的产品列表
    unpurchasedProducts() {
      const products = this.productList.filter(product => {
        // 公开产品且未购买
        if (product.is_public && !product.is_purchased) {
          return true;
        }
        return false;
      });
      
      // 排序：通用类型排在前面
      return products.sort((a, b) => {
        if (a.product_type === 'normal' && b.product_type !== 'normal') {
          return -1;
        }
        if (a.product_type !== 'normal' && b.product_type === 'normal') {
          return 1;
        }
        return 0;
      });
    },
    // 已购买的产品列表（包括定制产品和已购买的公开产品）
    purchasedProducts() {
      const products = this.productList.filter(product => {
        // 定制产品
        if (product.is_custom) {
          return true;
        }
        // 公开产品且已购买
        if (product.is_public && product.is_purchased) {
          return true;
        }
        return false;
      });
      
      // 排序：通用类型排在前面
      return products.sort((a, b) => {
        if (a.product_type === 'normal' && b.product_type !== 'normal') {
          return -1;
        }
        if (a.product_type !== 'normal' && b.product_type === 'normal') {
          return 1;
        }
        return 0;
      });
    },
    // 显示的未购买产品列表（分页后）
    displayUnpurchasedProducts() {
      const start = (this.unpurchasedCurrentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.unpurchasedProducts.slice(start, end);
    },
    // 显示的已购买产品列表（分页后）
    displayPurchasedProducts() {
      const start = (this.purchasedCurrentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.purchasedProducts.slice(start, end);
    },
  },
  onLoad(options = {}) {
    that = this;
    vk = that.vk;
    that.loadProducts();
  },
  methods: {
    // 加载产品列表
    loadProducts() {
      that.loading = true;
      vk.callFunction({
        url: "admin/product/kh/getList",
        data: {},
        success: (data) => {
          that.allProducts = data.data || [];
          that.productList = [...that.allProducts];
          that.loading = false;
        },
        fail: (err) => {
          vk.toast(err.msg || "加载失败");
          that.loading = false;
        },
      });
    },
    // 搜索
    search(obj) {
      let filteredList = [...that.allProducts];
      
      // 按产品名称搜索
      if (obj.product_name) {
        filteredList = filteredList.filter(item => 
          item.product_name.indexOf(obj.product_name) !== -1
        );
      }
      
      // 按产品类型搜索
      if (obj.product_type) {
        filteredList = filteredList.filter(item => 
          item.product_type === obj.product_type
        );
      }
      
      // 重置页码
      that.unpurchasedCurrentPage = 1;
      that.purchasedCurrentPage = 1;
      that.productList = filteredList;
    },
    // 刷新
    refresh() {
      that.loadProducts();
    },
    // 标签页切换
    handleTabChange(tab) {
      // 切换标签页时滚动到顶部
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
    },
    // 获取图片URL
    getImageUrl(imageData) {
      if (!imageData) return "";
      if (typeof imageData === "string") return imageData;
      if (typeof imageData === "object") {
        if (imageData.url) return imageData.url;
        if (imageData[0] && typeof imageData[0] === "string") return imageData[0];
        if (imageData[0] && imageData[0].url) return imageData[0].url;
      }
      return "";
    },
    // 获取产品类型名称
    getProductTypeName(type) {
      const typeMap = {
        software: "软件",
        plugin: "浏览器插件",
        normal: "通用",
      };
      return typeMap[type] || type;
    },
    // 获取产品类型颜色
    getProductTypeColor(type) {
      const colorMap = {
        software: "primary",
        plugin: "success",
        normal: "info",
      };
      return colorMap[type] || "info";
    },
    // 判断是否显示下载链接
    shouldShowDownloadLink(product) {
      // 定制产品(is_custom=true)直接显示下载链接
      if (product.is_custom) {
        return true;
      }
      // 公开产品且已购买,显示下载链接
      if (product.is_public && product.is_purchased) {
        return true;
      }
      // 其他情况不显示下载链接
      return false;
    },
    // 购买产品
    buyProduct(product) {
      vk.confirm(
        `确认购买【${product.product_name}】吗？\n需要支付 ${product.buy_price} 积分`,
        "购买确认",
        "确定",
        "取消",
        (res) => {
          if (res.confirm) {
            vk.callFunction({
              url: "admin/product/kh/buyProduct",
              data: {
                product_id: product.product_id,
                product_name: product.product_name,
              },
              title: "购买中...",
              success: (data) => {
                vk.toast("购买成功！");
                // 刷新产品列表
                that.loadProducts();
              },
              fail: (err) => {
                vk.toast(err.msg || "购买失败");
              },
            });
          }
        }
      );
    },
    // 联系客服
    contactCustomer(product) {
      that.serviceDialog.show = true;
    },
    // 下载产品
    downloadProduct(product) {
      if (product.download_url) {
        // #ifdef H5
        window.open(product.download_url, '_blank');
        // #endif
        // #ifndef H5
        uni.setClipboardData({
          data: product.download_url,
          success: () => {
            vk.toast('下载地址已复制到剪贴板');
          }
        });
        // #endif
      }
    },
    // 显示版本日志
    showVersionLogs(product) {
      that.versionDialog.title = product.product_name + " - 版本更新日志";
      that.versionDialog.logs = product.version_logs || [];
      that.versionDialog.show = true;
    },
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    // 未购买产品分页切换
    handleUnpurchasedPageChange(page) {
      that.unpurchasedCurrentPage = page;
      // 滚动到顶部
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
    },
    // 已购买产品分页切换
    handlePurchasedPageChange(page) {
      that.purchasedCurrentPage = page;
      // 滚动到已购买区域
      uni.pageScrollTo({
        scrollTop: 400,
        duration: 300,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #4facfe 55%, #e1e8f2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(79, 172, 254, 0.3);

  h2 {
    margin: 0 0 10px 0;
    font-size: 28px;
    color: #ffffff;
    font-weight: 600;
  }

  .page-desc {
    margin: 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
  }
}

// 标签页样式
.tabs-wrapper {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 0px 20px 0 20px;

  ::v-deep .el-tabs__header {
    margin-bottom: 0;
  }

  ::v-deep .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e4e7ed;
  }

  ::v-deep .el-tabs__item {
    font-size: 16px;
    font-weight: 500;
    padding: 0 30px;
    height: 50px;
    line-height: 50px;

    &.is-active {
      color: #4facfe;
      font-weight: 600;
    }

    &:hover {
      color: #4facfe;
    }
  }

  ::v-deep .el-tabs__active-bar {
    background-color: #4facfe;
    height: 3px;
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 18px;
    }

    .tab-badge {
      ::v-deep .el-badge__content {
        font-size: 11px;
        height: 18px;
        line-height: 18px;
        padding: 0 6px;
        border: none;
      }
    }
  }
}

// 产品区域
.product-section {
  margin-bottom: 40px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

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

    .base-price {
      margin-bottom: 15px;
      font-size: 12px;
      color: #909399;
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

      // 高亮版本 - 用于未购买产品
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  i {
    font-size: 80px;
    color: #c0c4cc;
    margin-bottom: 20px;
  }

  p {
    margin: 10px 0;
    font-size: 16px;
    color: #606266;
  }

  .empty-tip {
    font-size: 14px;
    color: #909399;
  }
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

// 版本日志样式
.version-logs {
  .version-log-item {
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;
    border-left: 3px solid #409eff;

    &:last-child {
      margin-bottom: 0;
    }

    .version-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;

      .version-date {
        font-size: 13px;
        color: #909399;
      }
    }

    .version-content {
      pre {
        margin: 0;
        font-family: inherit;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }

    .version-download {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e4e7ed;
    }
  }
}

// 客服二维码弹窗样式
.service-dialog-content {
  text-align: center;
  padding: 20px 0;

  .qrcode-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    .qrcode-img {
      width: 200px;
      height: 200px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
  }

  .service-tips {
    font-size: 14px;
    color: #606266;
    margin: 15px 0 10px;

    i {
      color: #409eff;
      margin-right: 5px;
    }
  }

  .service-time {
    font-size: 13px;
    color: #909399;
    margin: 5px 0;
  }
}
</style>

