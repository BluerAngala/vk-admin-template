<template>
  <view class="invite-center">
    <!-- 邀请信息卡片 -->
    <el-card class="invite-card">
      <div class="invite-header">
        <div class="invite-title">
          <i class="el-icon-share"></i>
          <span>我的邀请</span>
        </div>
        <el-button type="text" icon="el-icon-refresh" @click="loadInviteInfo">刷新</el-button>
      </div>
      
      <!-- 邀请链接 -->
      <div class="invite-link-section">
        <div class="section-label">邀请链接</div>
        <div class="invite-link-box">
          <el-input v-model="fullInviteLink" readonly size="small">
            <template slot="prepend">
              <i class="el-icon-link"></i>
            </template>
            <el-button slot="append" icon="el-icon-copy-document" @click="copyInviteLink">
              复制
            </el-button>
          </el-input>
        </div>
        <div class="invite-code-tip">
          邀请码：<span class="code">{{ inviteInfo.inviteCode || '-' }}</span>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-value primary">{{ inviteInfo.inviteeCount || 0 }}</div>
          <div class="stat-label">已邀请人数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value success">{{ inviteInfo.totalConsumePoints || 0 }}</div>
          <div class="stat-label">好友累计消费积分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value warning">{{ currentTierRate }}%</div>
          <div class="stat-label">当前返利比例</div>
        </div>
      </div>
      
      <!-- 阶梯进度 -->
      <div class="tier-progress-section" v-if="inviteInfo.nextTier && !inviteInfo.currentTier">
        <!-- 未达到最低门槛 -->
        <div class="progress-header unlock-tip">
          <span><i class="el-icon-lock"></i> 好友累计消费达到 <strong>{{ inviteInfo.nextTier.threshold }}</strong> 积分即可解锁 <strong>{{ inviteInfo.nextTier.rate }}%</strong> 返利</span>
        </div>
        <el-progress 
          :percentage="tierProgress" 
          :stroke-width="12"
          :show-text="false"
          color="#E6A23C"
        ></el-progress>
        <div class="progress-tip">还需 {{ inviteInfo.nextTier.remaining }} 积分</div>
      </div>
      <div class="tier-progress-section" v-else-if="inviteInfo.nextTier">
        <!-- 已达到某个阶梯，显示下一阶梯进度 -->
        <div class="progress-header">
          <span>距离下一阶梯还需好友消费 <strong>{{ inviteInfo.nextTier.remaining }}</strong> 积分</span>
          <span class="next-rate">下一阶梯返利比例：{{ inviteInfo.nextTier.rate }}%</span>
        </div>
        <el-progress 
          :percentage="tierProgress" 
          :stroke-width="12"
          :show-text="false"
          color="#409EFF"
        ></el-progress>
      </div>
      <div class="tier-max-tip" v-else-if="inviteInfo.currentTier">
        <i class="el-icon-trophy"></i>
        恭喜！您已达到最高返利阶梯
      </div>
    </el-card>
    
    <!-- 返利阶梯说明 - 始终展示 -->
    <el-card class="tier-card highlight-card">
      <div class="card-header">
        <div class="header-left">
          <i class="el-icon-medal"></i>
          <span>邀请好友，享受高额返利！</span>
        </div>
        <el-tag type="warning" size="small" effect="dark">
          <i class="el-icon-star-on"></i> 邀请越多，返利越高
        </el-tag>
      </div>
      <div class="tier-description">
        <p>邀请好友注册并消费，您可获得好友消费积分的返利。好友消费越多，您的返利比例越高！</p>
      </div>
      <el-table :data="displayTierList" style="width: 100%" size="small" :row-class-name="tableRowClassName">
        <el-table-column prop="level" label="阶梯等级" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="isCurrentTier(row) ? 'success' : 'info'" size="small" :effect="isCurrentTier(row) ? 'dark' : 'light'">
              {{ isCurrentTier(row) ? '★ ' : '' }}Tier {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="好友累计消费要求" align="center">
          <template slot-scope="{ row }">
            <span :class="{ 'highlight-text': isCurrentTier(row) }">
              {{ formatThreshold(row.threshold) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="返利比例" align="center">
          <template slot-scope="{ row }">
            <span class="rate-value" :class="{ 'current-rate': isCurrentTier(row) }">
              {{ row.rate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="isCurrentTier(row)" type="success" size="mini" effect="dark">当前</el-tag>
            <el-tag v-else-if="canReachTier(row)" type="warning" size="mini">待解锁</el-tag>
            <el-tag v-else type="info" size="mini">已达成</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 最近返利记录 -->
    <el-card class="recent-card">
      <div class="card-header">
        <div>
          <i class="el-icon-document"></i>
          <span>最近返利记录</span>
        </div>
        <el-button type="text" size="small" @click="goToHistory">
          查看全部 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
      <div v-if="recentRebates.length === 0" class="empty-state">
        <i class="el-icon-document-delete"></i>
        <p>暂无返利记录</p>
      </div>
      <div v-else class="rebate-list">
        <div v-for="item in recentRebates" :key="item._id" class="rebate-item">
          <div class="rebate-info">
            <div class="invitee-name">{{ item.invitee_nickname || '用户' }}</div>
            <div class="rebate-time">{{ formatTime(item._add_time) }}</div>
          </div>
          <div class="rebate-detail">
            <div class="pay-amount">消费 {{ item.pay_amount }} 积分</div>
            <div class="rebate-points">+{{ item.rebate_points }} 积分</div>
          </div>
        </div>
      </div>
    </el-card>
  </view>
</template>

<script>
import * as rebateService from '@/common/services/rebate.js';

let that;
let vk;

export default {
  data() {
    return {
      inviteInfo: {
        inviteCode: '',
        inviteLink: '',
        inviteeCount: 0,
        currentTier: null,
        nextTier: null
      },
      statistics: {
        totalRebatePoints: 0
      },
      tierList: [],
      recentRebates: [],
      // 默认阶梯配置（按累计消费积分）
      defaultTiers: [
        { level: 1, threshold: 1000, rate: 10 },      // 1000积分起，10%
        { level: 2, threshold: 3000, rate: 20 },      // 3000积分起，20%
        { level: 3, threshold: 5000, rate: 30 },      // 5000积分起，30%
        { level: 4, threshold: 8000, rate: 50 }       // 8000积分起，50%
      ]
    };
  },
  computed: {
    // 完整邀请链接
    fullInviteLink() {
      if (!this.inviteInfo.inviteLink) return '';
      
      // #ifdef H5
      // H5环境下，始终生成完整的URL（包含协议和域名）
      // 这样无论在哪里复制链接，都能正确访问
      const { origin, pathname } = window.location;
      
      // 提取基础路径（到 /admin/ 之前的部分）
      let basePath;
      if (pathname.includes('/admin/')) {
        // 如果当前路径包含 /admin/，提取基础路径并拼接 /admin/index.html
        const adminIndex = pathname.indexOf('/admin/');
        const baseDir = pathname.substring(0, adminIndex);
        basePath = origin + baseDir + '/admin/index.html';
      } else {
        // 否则直接使用 /admin/index.html
        basePath = origin + '/admin/index.html';
      }
      
      // 后端返回的 inviteLink 形如：#/pages/login/index?inviteCode=XXXX&tab=register
      // 拼接完整URL并返回
      return basePath + this.inviteInfo.inviteLink;
      // #endif
      
      // #ifndef H5
      // 非H5环境，返回相对路径
      return '/admin/index.html' + this.inviteInfo.inviteLink;
      // #endif
    },
    // 当前阶梯返利比例
    currentTierRate() {
      return this.inviteInfo.currentTier ? this.inviteInfo.currentTier.rate : 0;
    },
    // 阶梯进度百分比（按累计消费金额）
    tierProgress() {
      if (!this.inviteInfo.nextTier || !this.inviteInfo.currentTier) return 100;
      const current = this.inviteInfo.totalConsumePoints || 0;
      const currentThreshold = this.inviteInfo.currentTier.threshold;
      const nextThreshold = this.inviteInfo.nextTier.threshold;
      const progress = ((current - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
      return Math.min(100, Math.max(0, progress));
    },
    // 展示用的阶梯列表，确保始终有内容
    displayTierList() {
      return this.tierList.length > 0 ? this.tierList : this.defaultTiers;
    }
  },
  onLoad() {
    that = this;
    vk = that.vk;
    that.init();
  },
  methods: {
    init() {
      that.loadInviteInfo();
      that.loadStatistics();
      that.loadTierConfig();
    },
    // 加载邀请信息
    async loadInviteInfo() {
      that.inviteInfo = await rebateService.loadInviteInfo();
    },
    // 加载统计信息
    async loadStatistics() {
      const { statistics, recentRebates } = await rebateService.loadInviteStatistics();
      that.statistics = statistics;
      that.recentRebates = recentRebates;
    },
    // 加载阶梯配置
    async loadTierConfig() {
      that.tierList = await rebateService.loadTierConfig();
    },
    // 复制邀请链接
    copyInviteLink() {
      if (!that.fullInviteLink) {
        vk.toast('邀请链接为空');
        return;
      }
      uni.setClipboardData({
        data: that.fullInviteLink,
        success: () => vk.toast('复制成功')
      });
    },
    // 判断是否是当前阶梯
    isCurrentTier(tier) {
      return that.inviteInfo.currentTier && 
             that.inviteInfo.currentTier.level === tier.level;
    },
    // 判断是否可以达到该阶梯（待解锁）
    canReachTier(tier) {
      const totalConsume = that.inviteInfo.totalConsumePoints || 0;
      return totalConsume < tier.threshold;
    },
    // 格式化阶梯门槛
    formatThreshold(threshold) {
      return '累计消费 ' + threshold + ' 积分及以上';
    },
    // 表格行样式
    tableRowClassName({ row }) {
      if (that.isCurrentTier(row)) {
        return 'current-tier-row';
      }
      return '';
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '-';
      return vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm');
    },
    // 跳转到返利历史页面
    goToHistory() {
      uni.navigateTo({
        url: '/pages/invite-center/rebate-history'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.invite-center {
  padding: 20px;
  
  .el-card {
    margin-bottom: 20px;
  }
}

.invite-card {
  .invite-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .invite-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: bold;
      color: #303133;
      
      i {
        color: #409EFF;
        font-size: 22px;
      }
    }
  }
  
  .invite-link-section {
    margin-bottom: 24px;
    
    .section-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }
    
    .invite-link-box {
      margin-bottom: 8px;
    }
    
    .invite-code-tip {
      font-size: 13px;
      color: #909399;
      
      .code {
        color: #409EFF;
        font-weight: bold;
        font-family: monospace;
      }
    }
  }
  
  .stats-section {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
        
        &.primary { color: #409EFF; }
        &.success { color: #67C23A; }
        &.warning { color: #E6A23C; }
      }
      
      .stat-label {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .tier-progress-section {
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 13px;
      color: #606266;
      
      strong {
        color: #409EFF;
      }
      
      .next-rate {
        color: #67C23A;
      }
      
      &.unlock-tip {
        justify-content: center;
        color: #E6A23C;
        font-size: 14px;
        
        i {
          margin-right: 5px;
        }
        
        strong {
          color: #E6A23C;
        }
      }
    }
    
    .progress-tip {
      text-align: center;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .tier-max-tip {
    text-align: center;
    padding: 15px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
    border-radius: 8px;
    color: #67C23A;
    font-weight: bold;
    
    i {
      margin-right: 8px;
      font-size: 18px;
    }
  }
}

.tier-card, .recent-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    
    i {
      margin-right: 8px;
      color: #409EFF;
    }
    
    .header-left {
      display: flex;
      align-items: center;
    }
  }
  
  .current-rate {
    color: #67C23A;
    font-weight: bold;
  }
}

/* 高亮卡片样式 */
.highlight-card {
  border: 2px solid #E6A23C;
  background: linear-gradient(135deg, #fffbf0 0%, #fff9e6 100%);
  
  .tier-description {
    padding: 12px 16px;
    background: rgba(230, 162, 60, 0.1);
    border-radius: 6px;
    margin-bottom: 16px;
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
      line-height: 1.6;
    }
  }
  
  .highlight-text {
    color: #67C23A;
    font-weight: 500;
  }
  
  .rate-value {
    font-size: 16px;
    font-weight: bold;
    color: #E6A23C;
  }
  
  ::v-deep .current-tier-row {
    background-color: rgba(103, 194, 58, 0.1) !important;
  }
}

.recent-card {
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #909399;
    
    i {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    p {
      margin: 0;
    }
  }
  
  .rebate-list {
    .rebate-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #EBEEF5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .rebate-info {
        .invitee-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .rebate-time {
          font-size: 12px;
          color: #909399;
        }
      }
      
      .rebate-detail {
        text-align: right;
        
        .pay-amount {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
        }
        
        .rebate-points {
          font-size: 16px;
          font-weight: bold;
          color: #67C23A;
        }
      }
    }
  }
}
</style>
