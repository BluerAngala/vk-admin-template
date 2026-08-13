---
sidebarDepth: 0
---

# client 端框架升级指南

## 方式一：升级整个框架@all

![输入图片说明](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/88cbde8c-30ac-4dbc-adbc-03fb675a34a7.png '插件更新方法.png')

- 注意事项：使用方式一更新框架是最方便的，但是如果你改动了框架内置的部分代码，你改动过的代码可能会被还原，因此如果你改动过框架内置代码，合并的时候，可以先看下改动的文件。

```js
如：
1、app.config.js
2、App.vue
3、main.js
4、pages.json
5、manifest.json
6、static_menu目录
7、store目录
等等
升级前一定要进行文件对比！
```

**记得重新上传公共模块和云函数**

## 方式二：只升级模块@module

右键项目根目录下的 `uni_modules` 目录，再点击从插件市场更新

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/c72fa719-9444-4874-93a5-7b09d440feee.jpg)

在弹出的窗口中，按下图所示操作

![](https://cdn.fsq.pub/vkdoc/vk-client/2b326b97-e3f4-45ec-8551-27a0063c8029.png)

## 注意事项

- 更新 `vk-unicloud` 后，需要在 `common/vk-unicloud` 右键上传公共模块才会生效

- 若是本地调试模式，如果不生效，尝试重启项目。

- 注意事项：使用方式二更新框架不会造成你修改过的框架文件被覆盖，但是如果本次更新需要改动框架内一些文件，则需要你手动更改。
