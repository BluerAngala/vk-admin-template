# 环境变量

- `当前项目绝对路径`：`/Users/bluer/Documents/HBuilderProjects/law-products`
- `uniCloud目录`：`${当前项目绝对路径}/uniCloud-alipay`
- `router主函数名`：`router`
- `文档根目录`: `vk-unicloud-docs/docs`

**注意**：

- `uniCloud目录` 为后端代码所在目录，且后端默认使用 `router主函数`，位于 `${uniCloud目录}/cloudfunctions/${router主函数名}` 目录下，当需要编写云函数、云对象等后端代码时，默认均写在此目录下
- 在所有的 `skills` 中，当有写 `${uniCloud目录}/cloudfunctions/${router主函数名}` 这样的方式时，最终文件地址需要替换为绝对路径拼接
