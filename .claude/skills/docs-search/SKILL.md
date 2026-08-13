# 文档搜索 Skill

## 定位

**这是一个"查字典"工具，不是"开发流程"工具。**

开发流程由 AI 的推理能力主导，本 skill 只在需要查文档时提供帮助。

## 触发时机

### ✅ 应该使用

| 场景 | 示例 |
|---|---|
| 不确定 API 用法 | `vk.baseDao` 怎么用？参数是什么？ |
| 不确定组件用法 | `vk-data-table` 的 columns 怎么配置？ |
| 不确定配置项 | `app.config.js` 有哪些配置？ |
| 遇到报错，需要查文档 | 这个错误是什么意思？ |
| 需要参考模板 | 列表页的模板是什么样的？ |

### ❌ 不应该使用

| 场景 | 原因 |
|---|---|
| 需求分析阶段 | 这是推理任务，不需要查文档 |
| 方案设计阶段 | 先想清楚要做什么，再查怎么做 |
| 代码已经在上下文中 | 已有代码不需要再查文档 |
| 简单的 CRUD | 项目中有很多示例，直接参考 |

## 开发流程（正确顺序）

```
1. 理解需求
   ↓ 用户要"积分充值功能"
   
2. 分析方案
   ↓ 前端：页面、组件、交互
   ↓ 后端：数据表、接口、逻辑
   ↓ 边界：异常处理、权限、安全
   
3. 查文档（此时才用 skill）
   ↓ 不确定的 API → 搜索
   ↓ 需要模板 → 读取
   ↓ 确保符合项目规范
   
4. 动手开发
   ↓ 按方案写代码
   
5. 验证
```

## 知识库

### 项目知识库（knowledge/project/）

**内容**：针对本项目的开发规范，已适配 vk-unicloud-admin

| 文档 | 内容 |
|---|---|
| `architecture.md` | 架构、数据流、启动流程、配置详解 |
| `page-dev.md` | 页面开发规范、模板 |
| `admin-crud.md` | 管理后台 CRUD 开发 |
| `cloud-function.md` | 云函数、后端开发 |
| `style-guide.md` | 样式、CSS 规范 |
| `api-reference.md` | API 参考 |
| `component-guide.md` | 组件化开发指南 |
| `uni-app-rules.md` | uni-app 开发规范 |
| `code-standards.md` | 代码规范、命名、模板 |

### 框架知识库（knowledge/framework/）

**内容**：vk-unicloud 框架官方文档（198 个文件）

**使用场景**：项目知识库没有的 API 细节，才来这里查

## 命令

```bash
# 列出所有文档
bash .claude/skills/docs-search/scripts/search.sh --list

# 搜索项目知识库
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb project

# 搜索框架知识库
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb framework

# 按主题查找
bash .claude/skills/docs-search/scripts/search.sh --topic "页面开发"

# 读取指定文档
bash .claude/skills/docs-search/scripts/search.sh --read "knowledge/project/page-dev.md"
```

## 使用示例

### 场景：开发积分充值功能

**正确的开发流程：**

1. **需求分析**（不查文档）
   - 用户要充值积分
   - 需要：充值页面、支付接口、积分记录

2. **方案设计**（不查文档）
   - 前端：充值页面 + 积分记录页面
   - 后端：充值接口 + 积分变动记录
   - 数据表：积分余额、积分流水

3. **查文档**（此时使用 skill）
   ```bash
   # 查页面开发模板
   bash .claude/skills/docs-search/scripts/search.sh --read "knowledge/project/page-dev.md"
   
   # 查云函数开发规范
   bash .claude/skills/docs-search/scripts/search.sh --read "knowledge/project/cloud-function.md"
   
   # 查 vk.baseDao 用法
   bash .claude/skills/docs-search/scripts/search.sh --search "vk.baseDao" --kb framework
   ```

4. **动手开发**（不查文档，按方案写代码）

### 场景：遇到报错

```bash
# 搜索错误信息
bash .claude/skills/docs-search/scripts/search.sh --search "错误关键词"

# 如果项目知识库没有，查框架知识库
bash .claude/skills/docs-search/scripts/search.sh --search "错误关键词" --kb framework
```

## 注意事项

1. **先想后查** — 先分析需求、设计方案，再查文档
2. **按需查** — 只查不确定的部分，不要全量读取
3. **项目优先** — 先查项目知识库，再查框架知识库
4. **不要依赖** — 查文档是辅助，不是必须步骤
