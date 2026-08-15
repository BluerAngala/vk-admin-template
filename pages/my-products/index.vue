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
            全部产品
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
          :user-info="userInfo"
          mode="unpurchased"
          @buy="buyProduct"
          @contact="contactCustomer"
          @show-version-logs="showVersionLogs"
          @go-purchased="goToPurchasedProduct"
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
          :user-info="userInfo"
          :data-product-id="product._id"
          mode="purchased"
          @copy="copyCode"
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

import ProductCard from '@/components/product-card/index.vue';
import ServiceQrcode from '@/components/service-qrcode/index.vue';

export default {
  components: { ProductCard, ServiceQrcode },
  data() {
    return {
      activeTab: 'unpurchased', // 当前激活的标签页
      productList: [], // 过滤后的产品列表
      // allProducts -> computed（从 store 响应式读取）
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
            data: [], // 从数据库动态加载
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
      userInfo: {},
    };
  },
  computed: {
    allProducts() { return this.$store.state.$user.productList || []; },
    // 未购买的产品列表（现在显示所有公开产品，包括已购买的）
    unpurchasedProducts() {
      const products = this.productList.filter(product => {
        // 公开产品都显示
        if (product.is_public) {
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
    that.loadUserInfo();
    that.loadProductCategories();
    that.loadProducts();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      vk.callFunction({
        url: "user/kh/getMyUserInfo",
        success: (data) => {
          that.userInfo = data.userInfo || {};
        }
      });
    },
    // 加载产品分类数据
    loadProductCategories() {
      vk.callFunction({
        url: 'admin/product-category/sys/getAll',
        data: {},
        success: (res) => {
          if (res.data && Array.isArray(res.data)) {
            // 更新 queryForm1 中的 product_type data
            const categoryColumn = that.queryForm1.columns.find(col => col.key === 'product_type');
            if (categoryColumn) {
              categoryColumn.data = res.data.map(item => ({
                value: item.value,
                label: item.label
              }));
            }
          }
        },
        fail: (err) => {
          console.error('加载产品分类失败：', err);
        }
      });
    },
    // 加载产品列表
    async loadProducts() {
      that.loading = true;
      try {
        await that.$store.dispatch('$user/loadProductList', { force: true });
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
    // 跳转到已购买产品
    goToPurchasedProduct(product) {
      // 切换到我的产品标签页
      that.activeTab = 'purchased';

      // 计算产品在已购买列表中的页码
      const index = that.purchasedProducts.findIndex(p => p._id === product._id);
      if (index !== -1) {
        const page = Math.ceil((index + 1) / that.pageSize);
        that.purchasedCurrentPage = page;

        // 延迟滚动到产品位置
        that.$nextTick(() => {
          const productEl = document.querySelector(`[data-product-id="${product._id}"]`);
          if (productEl) {
            productEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 添加高亮效果
            productEl.classList.add('highlight');
            setTimeout(() => productEl.classList.remove('highlight'), 2000);
          }
        });
      }
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
    // 复制文本
    copyCode(text) {
      uni.setClipboardData({
        data: text,
        success: () => vk.toast("复制成功")
      });
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
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
}

// 搜索区域样式
.search-section {
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

// 标签页样式
.tabs-wrapper {
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 0 20px;

  ::v-deep .el-tabs__header {
    margin-bottom: 0;
  }

  ::v-deep .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e5e7eb;
  }

  ::v-deep .el-tabs__nav {
    float: none;
  }

  ::v-deep .el-tabs__header .el-tabs__nav-wrap {
    display: flex;
    justify-content: center;
  }

  ::v-deep .el-tabs__item {
    font-size: 14px;
    font-weight: 500;
    padding: 0 24px;
    height: 48px;
    line-height: 48px;
    color: #6b7280;
    transition: color 0.15s ease;

    &.is-active {
      color: #111827;
      font-weight: 600;
    }

    &:hover {
      color: #111827;
    }
  }

  ::v-deep .el-tabs__active-bar {
    background-color: #111827;
    height: 2px;
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 15px;
    }

    .tab-badge {
      ::v-deep .el-badge__content {
        font-size: 11px;
        height: 18px;
        line-height: 18px;
        padding: 0 5px;
        border: none;
      }
    }
  }
}

// 产品区域
.product-section {
  margin-bottom: 24px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;

  // 高亮效果
  .highlight {
    animation: highlight-pulse 2s ease;
  }
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  i {
    font-size: 48px;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  p {
    margin: 6px 0;
    font-size: 15px;
    color: #374151;
  }

  .empty-tip {
    font-size: 13px;
    color: #9ca3af;
    margin-top: 4px;
  }
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

// 版本日志样式
.version-logs {
  .version-log-item {
    margin-bottom: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 3px solid #111827;

    &:last-child {
      margin-bottom: 0;
    }

    .version-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;

      .version-date {
        font-size: 12px;
        color: #9ca3af;
      }
    }

    .version-content {
      pre {
        margin: 0;
        font-family: inherit;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }

    .version-download {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }
  }
}

</style>

