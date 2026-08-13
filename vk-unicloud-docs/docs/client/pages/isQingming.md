---
sidebarDepth: 0
---

# 清明节灰色页面实现方案

页面灰色有多种实现方案，这里只讲一种比较简单的方案。

`page.vue` 页面代码如下

```vue
<template>
  <view class="app" :class="classCom">
    <!-- 页面内容开始 -->

    这里是页面内容。。。

    <!-- 页面内容结束 -->
  </view>
</template>

<script>
  export default {
    data() {
      // 页面数据变量
      return {};
    },
    // 计算属性
    computed: {
      classCom() {
        let classStr = '';
        if (this.vk.pubfn.timeUtil.isQingming()) {
          classStr = 'gray-view';
        }
        return classStr;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .gray-view {
    filter: grayscale(100%);
  }
</style>
```

此方案优点：简单

此方案缺点：每个页面都要加上 `:class="classCom"` ，但一般就首页和个别页面需要灰色，故此方案还是可行的。

如你有更好的方案，欢迎来群内讨论。Q 群：22466457
