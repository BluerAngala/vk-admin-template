<template>
  <view class="stats-cards">
    <el-card v-for="item in items" :key="item.key" class="stats-card">
      <div class="stats-item">
        <div class="stats-label">{{ item.label }}</div>
        <div class="stats-value" :style="{ color: item.color }">
          {{ stats[item.key] }}
        </div>
      </div>
    </el-card>
  </view>
</template>

<script>
export default {
  name: 'StatsCards',
  props: {
    items: {
      type: Array,
      required: true,
    },
    stats: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .stats-card {
    flex: 1;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stats-item {
      text-align: center;

      .stats-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stats-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}
</style>
