<template>
  <view class="features" id="features">
    <view class="features__inner">
      <text class="section__title">{{ data.title || '核心功能' }}</text>
      <text class="section__subtitle">{{ data.subtitle || '' }}</text>
      <view class="features__grid" :class="'features__grid--' + (data.columns || 3)">
        <view class="feature-card" v-for="(item, i) in data.items" :key="i">
          <text class="feature-card__icon">{{ item.icon }}</text>
          <text class="feature-card__title">{{ item.title }}</text>
          <text class="feature-card__desc">{{ item.desc }}</text>
        </view>
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
.features {
  padding: 80px 24px;

  &__inner {
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
  }

  &__grid {
    display: grid;
    gap: 24px;
    margin-top: 48px;

    &--2 { grid-template-columns: repeat(2, 1fr); }
    &--3 { grid-template-columns: repeat(3, 1fr); }
    &--4 { grid-template-columns: repeat(4, 1fr); }
  }
}

.section {
  &__title {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
  }

  &__subtitle {
    display: block;
    font-size: 16px;
    color: #64748b;
  }
}

.feature-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: left;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  }

  &__icon {
    display: block;
    font-size: 36px;
    margin-bottom: 16px;
  }

  &__title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
  }

  &__desc {
    display: block;
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
  }
}
</style>
