---
sidebarDepth: 0
---

# 关于 schema 的说明

**先说结论：vk 框架不依赖 `schema`，`schema` 对 vk 框架不生效。（如果你用 JQL 去操作数据库，`schema` 是生效的）**

如果你想知道原因，那么继续往下看。

云开发的数据库为 `mogondb`，它与我们之前用的 `mysql` 不同，`mogondb` 其实没有所谓的字段这个概念。

在 `mogondb` 中，表的数据=list，行记录=json，字段=json 的属性。

因此字段可以任意拓展，你通过 update 一个不存在的字段，就等于添加这个字段并设置这个字段的值。（这也是 mogondb 的优势）

同时 `mogondb` 允许 1 个表内所有的行记录内的字段可以不统一，即第一条记录有 a 字段，第二条记录可以没有 a 字段。

即在 `mogondb` 中，没有所谓的 `schema（表结构）`

`schema` 是 `uniCloud` 官方为了配合 `clientDB（前端操作数据库）` 而生（后面又出了 JQL，JQL 也对 `schema` 生效，同时 JQL 可以写在云函数端）

`schema` 功能如下：

1. 因为前端操作数据库不安全，因此需要 schema 来控制读写权限。（这也是 schema 诞生的原因，前端操作数据库必须要有这个 schema 来控制权限）
2. 描述现有的数据含义。可以一目了然的阅读每个表、每个字段的用途。
3. 对每个字段进行一些规则约束，如必填，若默认值等等。
4. 直接映射表的连表关系，通过 JQL 可以很方便的进行连表。
5. 根据 schema 自动生成前端界面（schema2code），包括列表、详情、新建和编辑页面，自动处理校验规则。
6. 更多功能可查看[官方 schema 文档](https://uniapp.dcloud.net.cn/uniCloud/schema.html)

而 `vk框架` 的数据库操作全部在后端（云端）操作，因此可不依赖 `schema`（同时 `vk框架` 封装了一套 [vk.baseDao](https://vkdoc.fsq.pub/client/uniCloud/db/api.html) 数据库 API）

当然如果你想在云函数中使用 JQL 语法，则需依赖 `schema`
