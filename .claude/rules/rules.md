# 项目规则模板

## 通用规则

### 强制规则

- AI 必须用中文回答问题
- 如果本次改动较大，在执行你的操作前，你必须先说明你的方案，不要马上执行，等待用户确认后再执行操作（如果用户已明示让你直接操作，则无视此条规则）

## 代码规范

### 变量命名规范

- 普通变量命名使用驼峰命名法（如：userInfo）
- 数据库表的字段名使用全小写蛇形（下划线命名法）（如：user_id）
- 数据库表名使用 kebab-case（中划线命名法）（如：uni-id-users）

## 数据库 Schema 管理

### uni_modules 优先原则

- `uniCloud-alipay/database/` 只放**项目自定义**的表（如 vk-global-data、vk-error-log 等）
- uni_modules 自带的 schema（如 uni-captcha 的 `opendb-verify-codes`）**不要**复制到 database 目录，HBuilderX 会自动从 uni_modules 链接
- 判断依据：如果 `uni_modules/*/uniCloud/database/` 下已有同名文件，就不要在 `uniCloud-alipay/database/` 里重复放

### 常见归属

| 表名 | 来源 | database 目录是否需要 |
|---|---|---|
| opendb-verify-codes | uni-captcha | ❌ 不需要 |
| uni-id-users / uni-id-roles / uni-id-permissions | uni-id（但 init_data 由项目提供） | ✅ 需要 schema + init_data |
| opendb-admin-menus | vk-unicloud-admin | ✅ 需要 |
| vk-* 系列表 | vk-unicloud-admin | ✅ 需要 |

## 代码质量要求

### 安全性

- 表单验证（前端）
- 接口接收参数验证（后端）
