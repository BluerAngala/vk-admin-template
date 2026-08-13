---
sidebarDepth: 0
---

# AI 编程

## 推荐的 AI Coding 工具

- Claude Code
- Visual Studio Code 内的 Claude Code、Copilot
- Cursor
- HBuilderX 内的 uni-agent

## 初始化环境变量@init-env

1. 通过 git 导入仓库文档项目 [https://gitee.com/vk-uni/vk-unicloud-docs.git](https://gitee.com/vk-uni/vk-unicloud-docs.git)
2. 安装最新版 [VK 框架快速开发辅助工具](https://ext.dcloud.net.cn/plugin?id=6663)
3. 右键 `.claude` 目录（没有则新建，在项目根目录下新建这个目录）点击菜单【vk】-【初始化环境变量】

**效果**

- 自动识别 router 函数的位置、文档仓库项目位置，添加到 `.claude/rules/env.md`，内容示例如下
- 能正确识别项目绑定关系，如 B 项目绑定 A 项目，则在 B 项目执行初始化环境变量，uniCloud 目录也会自动识别到 A 项目

```md
# 环境变量

- `uniCloud目录`：`D:\hbxwork\vk-unicloud-client-dev\uniCloud-alipay`
- `router主函数名`：`router`
- `文档根目录`: `D:\hbxwork\vk-unicloud-docs\docs`

**注意**：

- `uniCloud目录` 为后端代码所在目录，且后端默认使用 `router主函数`，位于 `${uniCloud目录}/cloudfunctions/${router主函数名}` 目录下，当需要编写云函数、云对象等后端代码时，默认均写在此目录下
- 当需要查看文档时，优先在 `文档根目录` 下查看
- 在所有的 `skills` 中，当有写 `${uniCloud目录}/cloudfunctions/${router主函数名}` 这样的方式时，最终文件地址需要替换为绝对路径拼接
```

## 自定义全局规则@rules

当你需要补充自己的全局规则时，可新建 `.claude/rules/rules.md` 文件，然后在此文件上编写你的规则，示例

```md
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

## 代码质量要求

### 安全性

- 表单验证（前端）
- 接口接收参数验证（后端）
```

## uni-agent 注意事项@uni-agent-tips

因 uni-agent 不会自动读取 `.claude/rules/` 目录，故 uni-agent 的全局提示词需要写到 `AGENTS.md`

**操作步骤**

1. 在项目根目录创建一个 `AGENTS.md` 文件，这是 uni-agent 提供的全局自定义规则

文件内容如下：

```md
# 项目规则

每次会话必须先阅读完文件 `/.claude/rules/env.md` 和 `/.claude/rules/rules.md` 文件后才能开始
```

## Cursor 注意事项@cursor-tips

因 Cursor 不会自动读取 `.claude/rules/` 目录，故 Cursor 的全局提示词需要写到 `.cursor/rules/rules.mdc`

**操作步骤**

1. 创建 `.cursor/rules/rules.mdc` 文件

文件内容如下：

```md
---
description: 项目通用规则与代码规范（vk-unicloud）
alwaysApply: true
---

# 项目规则

每次会话必须先阅读完文件 `/.claude/rules/env.md` 和 `/.claude/rules/rules.md` 文件后才能开始
```

## 框架 AI 后续发展计划

当前 VK 未提供框架级别的 skills（已在计划中），敬请期待。
