# 组件化开发指南

> **重要**：本项目是 uni-app 项目，不是 Vue Web 项目。开发时必须使用 uni-app 组件，不能使用原生 HTML 标签。
> 
> 详见 [AGENTS.md - uni-app 开发规范](../AGENTS.md#⚠️-uni-app-开发规范必须遵守)

## 为什么组件化

### 问题：单页面代码膨胀
- 500+ 行的单文件难以维护
- 修改一处可能影响其他功能
- 代码复用困难
- 新人理解成本高

### 解决：组件化拆分
- 每个组件职责单一，100-200行
- 修改不影响其他组件
- 组件可在多处复用
- 代码结构清晰易懂

## 实战案例：登录页面

### 拆分前（❌ 反模式）
```
pages/login/index.vue  (900+ 行)
├── 登录表单模板 (100行)
├── 注册表单模板 (80行)
├── 忘记密码表单模板 (60行)
├── 登录验证逻辑 (50行)
├── 注册验证逻辑 (60行)
├── 忘记密码逻辑 (40行)
├── 样式 (200行)
└── 其他 (...)
```

### 拆分后（✅ 正确）
```
pages/login/
├── index.vue                    (200行) 主页面：布局+编排
└── components/
    ├── login-form.vue           (150行) 登录：表单+验证+提交
    ├── register-form.vue        (180行) 注册：表单+验证+提交
    └── forgot-form.vue          (160行) 忘记密码：表单+验证+提交
```

### 代码示例

**主页面 index.vue**
```vue
<template>
  <view class="login-page">
    <view class="login-card">
      <view class="card-header">
        <image class="logo" :src="logoImage"></image>
        <view class="header-text">
          <text class="title">AI自动化商务定制化</text>
          <text class="subtitle">智能管理，高效运营</text>
        </view>
      </view>

      <view class="tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', activeTab === tab.key ? 'active' : '']"
          @click="activeTab = tab.key"
        >
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>

      <scroll-view class="form-area" scroll-y>
        <login-form 
          v-if="activeTab === 'login'"
          @success="onLoginSuccess"
          @open-agreement="openAgreement"
        />

        <register-form 
          v-if="activeTab === 'register'"
          :invite-code="inviteCode"
          :inviter-info="inviterInfo"
          @success="onRegisterSuccess"
          @open-agreement="openAgreement"
        />

        <forgot-form 
          v-if="activeTab === 'forgot'"
          @success="onForgotSuccess"
        />
      </scroll-view>

      <view class="footer">
        <!-- 底部链接 -->
      </view>
    </view>
  </view>
</template>

<script>
import LoginForm from './components/login-form.vue'
import RegisterForm from './components/register-form.vue'
import ForgotForm from './components/forgot-form.vue'

export default {
  components: { LoginForm, RegisterForm, ForgotForm },
  data() {
    return {
      activeTab: 'login',
      tabs: [
        { key: 'register', label: '注册' },
        { key: 'login', label: '登录' },
        { key: 'forgot', label: '忘记密码' }
      ],
      inviteCode: '',
      inviterInfo: null
    }
  },
  methods: {
    onLoginSuccess(data) {
      // 登录成功后跳转
      vk.navigateToHome();
    },
    onRegisterSuccess({ username }) {
      this.activeTab = 'login';
    },
    onForgotSuccess() {
      this.activeTab = 'login';
    },
    openAgreement() {
      // 打开用户协议
    }
  }
}
</script>
```

**子组件 login-form.vue**
```vue
<template>
  <view class="form-content">
    <view class="field">
      <text class="label">用户名 <text class="req">*</text></text>
      <input class="input" v-model="form.username" placeholder="请输入用户名" />
    </view>

    <view class="field">
      <text class="label">密码 <text class="req">*</text></text>
      <input class="input" v-model="form.password" type="password" placeholder="请输入密码" />
    </view>

    <view class="field">
      <text class="label">验证码 <text class="req">*</text></text>
      <uni-captcha scene="login" v-model="form.captcha"></uni-captcha>
    </view>

    <view class="checkbox-row">
      <checkbox-group @change="onCheckboxChange">
        <checkbox value="remember" :checked="checked" color="#0891B2" />
      </checkbox-group>
      <text class="checkbox-text">记住密码</text>
    </view>

    <view class="btn-primary" @click="handleSubmit">
      <text class="btn-text">登 录</text>
    </view>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        captcha: '',
        agreement: true
      },
      checked: false
    }
  },
  created() {
    // 读取记住的账号密码
    let { login } = vk.getVuex("$user");
    if (login) {
      if (login.username) this.form.username = login.username;
      if (login.password) {
        this.form.password = login.password;
        this.checked = true;
      }
    }
  },
  methods: {
    onCheckboxChange(e) {
      let value = e.detail.value || [];
      this.checked = value.length > 0;
    },
    handleSubmit() {
      // 验证
      if (!this.form.username) {
        vk.toast('请输入用户名', 'none');
        return;
      }
      if (!this.form.password) {
        vk.toast('请输入密码', 'none');
        return;
      }
      if (!this.form.captcha) {
        vk.toast('请输入验证码', 'none');
        return;
      }

      // 提交
      vk.userCenter.login({
        data: this.form,
        success: data => {
          // 保存记住的密码
          if (this.checked) {
            vk.setVuex("$user.login.username", this.form.username);
            vk.setVuex("$user.login.password", this.form.password);
          }
          // 通知父组件
          this.$emit('success', data);
        }
      });
    }
  }
}
</script>
```

## 组件设计原则

### 1. 单一职责
一个组件只做一件事。如果一个组件同时处理登录、注册、忘记密码，那就太大了。

### 2. 高内聚低耦合
- **高内聚**：相关的逻辑放在同一个组件
- **低耦合**：组件之间通过 props 和 events 通信，不直接访问对方数据

### 3. 可复用性
设计组件时考虑：
- 能否在其他页面使用？
- 能否通过 props 配置不同行为？
- 样式是否可定制？

### 4. 可测试性
组件应该：
- 输入明确（props）
- 输出明确（events）
- 副作用少（不直接修改全局状态）

## 常见场景

### 场景1：表单页面
```
pages/
└── user-edit/
    ├── index.vue           # 页面布局
    └── components/
        ├── basic-form.vue  # 基本信息表单
        ├── avatar.vue      # 头像上传
        └── role-select.vue # 角色选择
```

### 场景2：列表页面
```
pages/
└── order-list/
    ├── index.vue           # 页面布局
    └── components/
        ├── search-bar.vue  # 搜索条件
        ├── order-table.vue # 订单表格
        └── order-detail.vue # 订单详情弹窗
```

### 场景3：复杂业务页面
```
pages/
└── dashboard/
    ├── index.vue           # 页面布局
    └── components/
        ├── stats-cards.vue # 统计卡片
        ├── chart-sales.vue # 销售图表
        ├── recent-orders.vue # 最近订单
        └── quick-actions.vue # 快捷操作
```

## 组件通信最佳实践

### Props 向下
```vue
<!-- 父组件 -->
<user-form 
  :user-id="currentId"
  :mode="formMode"
  :roles="roleList"
/>

<!-- 子组件 -->
export default {
  props: {
    userId: { type: String, default: '' },
    mode: { type: String, default: 'add' },
    roles: { type: Array, default: () => [] }
  }
}
```

### Events 向上
```vue
<!-- 子组件 -->
this.$emit('save', { id: '123', name: '张三' });
this.$emit('cancel');
this.$emit('error', '保存失败');

<!-- 父组件 -->
<user-form 
  @save="handleSave"
  @cancel="hideForm"
  @error="showError"
/>
```

### 避免的模式
```vue
<!-- ❌ 错误：子组件直接修改父组件数据 -->
this.$parent.formData.name = '张三';

<!-- ❌ 错误：子组件访问 Vuex -->
this.$store.state.user.info;

<!-- ✅ 正确：通过 events 通知父组件 -->
this.$emit('update', { name: '张三' });
```

## 样式规范

### Scoped 样式
每个组件使用 scoped 样式，避免样式污染：
```vue
<style lang="scss" scoped>
.component-name {
  /* 样式 */
}
</style>
```

### 样式继承
如果需要覆盖子组件样式，使用深度选择器：
```vue
<style lang="scss" scoped>
.parent ::v-deep .child-component {
  /* 覆盖样式 */
}
</style>
```

### 响应式设计
组件内部处理响应式：
```vue
<style lang="scss" scoped>
.component {
  padding: 20px;
}

@media screen and (max-width: 480px) {
  .component {
    padding: 12px;
  }
}
</style>
```

## 总结

**好的组件化设计：**
- ✅ 每个组件职责单一
- ✅ 组件可独立使用和测试
- ✅ 代码结构清晰易懂
- ✅ 修改不影响其他功能
- ✅ 样式隔离不污染

**避免的设计：**
- ❌ 单文件超过300行
- ❌ 组件间直接访问数据
- ❌ 样式相互污染
- ❌ 业务逻辑混在页面中
