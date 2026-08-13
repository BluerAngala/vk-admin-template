<template>
  <view class="page-body">
    <!-- 表格搜索组件 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
    </vk-data-table-query>

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

    <!-- 未购买产品列表 -->
    <view v-if="activeTab === 'unpurchased' && unpurchasedProducts.length > 0" class="product-section">
      <view class="product-list">
        <product-card
          v-for="product in displayUnpurchasedProducts"
          :key="product._id"
          :product="product"
          mode="unpurchased"
          @buy="buyProduct"
          @contact="contactCustomer"
          @show-version-logs="showVersionLogs"
        />
      </view>
      <view v-if="unpurchasedProducts.length > pageSize" class="pagination-wrapper">
        <el-pagination
          :current-page="unpurchasedCurrentPage"
          :page-size="pageSize"
          :total="unpurchasedProducts.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handleUnpurchasedPageChange"
        />
      </view>
    </view>

    <!-- 未购买产品空状态 -->
    <view v-if="activeTab === 'unpurchased' && unpurchasedProducts.length === 0" class="empty-state">
      <i class="el-icon-star-off"></i>
      <p>暂无可购买的产品</p>
      <p class="empty-tip">所有公开产品都已购买或暂无公开产品</p>
    </view>

    <!-- 已购买产品列表 -->
    <view v-if="activeTab === 'purchased' && purchasedProducts.length > 0" class="product-section">
      <view class="product-list">
        <product-card
          v-for="product in displayPurchasedProducts"
          :key="product._id"
          :product="product"
          mode="purchased"
          @download="downloadProduct"
          @show-version-logs="showVersionLogs"
        />
      </view>
      <view v-if="purchasedProducts.length > pageSize" class="pagination-wrapper">
        <el-pagination
          :current-page="purchasedCurrentPage"
          :page-size="pageSize"
          :total="purchasedProducts.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePurchasedPageChange"
        />
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
    <service-qrcode :show.sync="serviceDialog.show" />
  </view>
</template>

<script>
let that;
let vk = uni.vk;

import ProductCard from './components/ProductCard.vue';
import ServiceQrcode from '@/components/service-qrcode/index.vue';

export default {
  components: { ProductCard, ServiceQrcode },
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
    async loadProducts() {
      that.loading = true;
      try {
        await that.$store.dispatch('$user/loadProductList');
        that.allProducts = that.$store.state.$user.productList || [];
        that.productList = [...that.allProducts];
      } catch (err) {
        vk.toast(err.msg || "加载失败");
      } finally {
        that.loading = false;
      }
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

  ::v-deep .el-tabs__nav {
    float: none;
  }

  ::v-deep .el-tabs__header .el-tabs__nav-wrap {
    display: flex;
    justify-content: center;
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

</style>

