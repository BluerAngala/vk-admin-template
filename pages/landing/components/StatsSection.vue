<template>
  <view class="stats">
    <view class="stats__inner">
      <view class="stats__item" v-for="(item, i) in data.items" :key="i">
        <text class="stats__num">{{ item.num }}</text>
        <text class="stats__label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Object, default: () => ({}) }
  }
};
</script>

<style lang="scss" scoped>
.stats {
  padding: 60px 24px;
  background: #f8fafc;

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 32px;
  }

  &__item {
    text-align: center;
    min-width: 120px;
  }

  &__num {
    display: block;
    font-size: 36px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 8px;
  }

  &__label {
    display: block;
    font-size: 14px;
    color: #64748b;
  }
}
</style>
