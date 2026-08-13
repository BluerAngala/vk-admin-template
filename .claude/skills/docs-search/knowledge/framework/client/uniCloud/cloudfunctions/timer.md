---
sidebarDepth: 0
---

# 定时器（定时任务）

## vk-unicloud 版本 ≥ 2.21.0@new

自 vk-unicloud 2.21.0 版本起，router 函数支持定时任务方式运行：云函数按 Cron 周期触发后，会调用 `service/crontab` 下的云对象入口，再根据 `taskConfig.js` 的配置在当次执行中派发多个子任务（如每 60 秒、每 1 小时、每天 12:30 等）。无需为每个子任务单独建云函数。

### 目录结构

从最新版示例项目中复制目录 `service/crontab/` 到你的项目中（2.21.0 版本起已内置此目录），结构如下：

| 路径                             | 说明                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `service/crontab/pub.js`         | 云对象入口，内含 `_before`（校验触发来源）和 `timing`（定时任务主入口，会调用 `vk.createTimingTask` 并按配置派发子任务） |
| `service/crontab/taskConfig.js`  | 定时任务配置：`main` 为云函数触发间隔（秒），`tasks` 为子任务名与执行周期配置                                            |
| `service/crontab/tasks/index.js` | 自动扫描并加载 `tasks` 目录下除 `index.js` 外的 `.js` 文件，**请勿修改**                                                 |
| `service/crontab/tasks/xxx.js`   | 单个定时任务实现，文件名（如 `timer1.js`）即任务名，需与 `taskConfig.js` 中 `tasks` 的 key（如 `timer1`）一致            |

### 配置步骤

1. **配置云函数触发器**  
   修改 `package.json`，在 `cloudfunction-config` 中新增 `triggers`（以下为参考，需合并到现有配置）：

```json
{
  "cloudfunction-config": {
    "concurrency": 1,
    "memorySize": 512,
    "path": "",
    "timeout": 7200,
    "triggers": [
      {
        "config": "0 * * * * * *",
        "name": "timer",
        "type": "timer"
      }
    ],
    "runtime": "Nodejs18",
    "keepRunningAfterReturn": false
  }
}
```

**核心参数说明**

| 参数               | 说明                                                        |
| ------------------ | ----------------------------------------------------------- |
| timeout            | 超时时间（秒）：腾讯云最大 900，阿里云 7200，支付宝云 10800 |
| triggers           | 定时触发器配置，**仅支持配置 1 个**，数组内只能有一个元素   |
| triggers[0].config | Cron 表达式，见下方 **main 与触发器 config 的对应关系**     |
| triggers[0].name   | 固定为 `timer`                                              |
| triggers[0].type   | 固定为 `timer`                                              |

**main 与触发器 config 的对应关系**

| main（秒） | 触发器 config（Cron） | 说明                        |
| ---------- | --------------------- | --------------------------- |
| 1          | `* * * * * * *`       | 每 1 秒（阿里云不支持）     |
| 5          | `*/5 * * * * * *`     | 每 5 秒（阿里云不支持）     |
| 60         | `0 * * * * * *`       | 每 1 分钟（阿里云最小粒度） |

阿里云不支持秒级触发器，`main` 最小为 60；支付宝云、腾讯云可为 1

**推荐：支付宝云和腾讯云设置为 5，阿里云设置为 60**

**推荐设置**

阿里云设置为 60

支付宝云和腾讯云如果你用不到秒级定时任务，则设置为 60，如果需要用到秒级定时任务，则设为 5（不建议设置为 1）

2. **配置 taskConfig.js**  
   修改 `service/crontab/taskConfig.js`：

- **main**：主函数触发间隔（秒），必须与上面 `triggers[0].config` 的周期一致。
- **tasks**：子任务名到执行周期的映射。子任务会在每次主函数被触发时，根据当前时间判断是否执行（如「每 60 秒」「每 1 小时」「每天 12:30」等）。支持以下写法：

> **版本要求**：每周（`weekly`）、每月（`monthly`）和 cron 表达式（包括对象写法及 cron 字符串直写）自 vk-unicloud 核心库 2.25.1 起支持。

| 写法             | 示例                                                   | 说明                                                                                          |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 数字（秒）       | `timer1: 60`                                           | 每 60 秒执行                                                                                  |
| 字符串间隔       | `timer1: ['50s', '1m', '1h']`                          | 每 50 秒 / 每 1 分钟 / 每 1 小时（`s`/`m`/`h` 或 `秒`/`分钟`/`小时`）                         |
| 字符串每日       | `timer1: '12:30:00'`                                   | 每天 12:30:00（HH:MM:SS）                                                                     |
| 数组（多时间点） | `timer1: ['1h', '12:30:00']`                           | 每小时 + 每天 12:30 各执行一次                                                                |
| 对象             | `timer1: { minutes: 1 }`                               | 每 1 分钟 执行                                                                                |
| 对象每日         | `timer1: { daily: '00:00:00' }`                        | 每天 0 点                                                                                     |
| 对象每周         | `timer1: { weekly: [1, 3, 5], time: '09:00:00' }`      | 每周一、三、五 9 点（`weekly` 可为数字或数组，0=周日，1-6=周一至周六，`time` 省略默认 0 点）  |
| 对象每月         | `timer1: { monthly: [1, 15], time: '02:00:00' }`       | 每月 1 号、15 号凌晨 2 点（`monthly` 可为数字或数组，取值 1-31，`time` 省略默认 0 点）        |
| cron 表达式      | `timer1: { cron: '0 */30 9-17 * * 1-5' }`              | 工作日 9:00–17:30 每半小时（见下方 [子任务 cron 表达式](#task-cron)）                         |
| cron 字符串直写  | `timer1: '0 0 12 * * 3'`                               | 每周三 12 点（含空格且为 5-7 个字段的字符串会被识别为 cron 表达式）                           |
| 对象多时间       | `timer1: { times: ['10s', '1m'], desc: '多时间任务' }` | 多个时间点，可选 `desc`                                                                       |
| 禁用             | `timer1: { hours: 1, enabled: false }`                 | 该任务不执行                                                                                  |

- **timezone**：`taskConfig.js` 支持可选配置 `timezone`（默认 `8`，即 UTC+8），每日/每周/每月/cron 类任务按该时区匹配时间，不受服务器容器时区影响。

**校验规则**：间隔类任务（秒/分钟/小时）的总秒数必须是 `main` 的整数倍，否则配置验证不通过，当次不会执行任何任务。时间格式为 `HH:MM:SS`，且需在合法范围（时 0–23，分秒 0–59）；`weekly` 取值 0–7（0 和 7 均为周日，也支持 `SUN`-`SAT`），`monthly` 取值 1–31；cron 表达式解析失败或字段越界同样导致校验不通过。当 cron 秒字段的触发粒度细于 `main` 时（如 `main: 60` 而秒字段为 `*/5`），任务仍会执行，但同一窗口内的多个触发点会合并为一次，控制台会输出提示。

### 子任务 cron 表达式@task-cron

> 本节所述 cron 表达式自 vk-unicloud 核心库 2.25.1 起支持。

`tasks` 中的 cron 表达式由**框架在代码层匹配**，与 `package.json` 中云函数触发器的 cron 是两个层面的东西，因此**不受云厂商触发器的限制**（如支付宝云触发器不支持星期字段，但此处的 `weekly` 与 cron 周字段可正常使用）。

- 字段格式：`秒 分 时 日 月 周`（6 字段）；也支持 5 字段（`分 时 日 月 周`，秒补 0）和 7 字段（末位为年）
- 通配符：`*` 任意值、`,` 列表、`-` 范围、`/` 步长，与 [Cron 表达式](#cron) 章节一致
- 周字段：0-7（0 和 7 均为周日）或 `SUN`-`SAT` 英文缩写
- 「日」和「周」同时指定（均非 `*`）时，为**或**关系
- 触发精度受 `main` 限制：实际执行时刻按 `main` 粒度对齐（框架每 `main` 秒判断一次「本轮时间窗口内是否存在触发点」，因此不会因云函数触发延迟而漏触发）

```js
tasks: {
  timerA: { weekly: [1, 3, 5], time: '09:00:00' },  // 每周一、三、五 9 点
  timerB: { monthly: 1, time: '02:00:00' },          // 每月 1 号凌晨 2 点
  timerC: { cron: '0 */30 9-17 * * 1-5', desc: '工作日半小时任务' }, // 工作日 9:00-17:30 每半小时
  timerD: '0 0 12 * * 3',                            // 每周三 12 点（字符串直写）
}
```

示例：

```js
module.exports = {
  // 主函数间隔：5秒（需与云函数触发器配置匹配）
  // 1秒对应的触发器配置是：* * * * * * *（注意：阿里云不支持秒级触发器）
  // 5秒对应的触发器配置是：*/5 * * * * * *（注意：阿里云不支持秒级触发器）
  // 1分钟对应的触发器配置是：0 * * * * * *
  main: 60, // 阿里云此处最小为60，支付宝云和腾讯云此处最小值为1
  // 任务并发执行数：1 代表按顺序执行，大于 1 代表并发执行数，建议在 5 以内
  concurrency: 1,
  // 时区（可选，默认 8，即 UTC+8），daily/weekly/monthly/cron 类任务按此时区匹配时间，不受服务器容器时区影响
  // timezone: 8,
  // 任务列表
  tasks: {
    timer1: '60s', // 每60秒执行（此处写60s和1m表现一致）
    timer2: ['1h', '12:30:00'], // 每小时和每天12点30执行
    // 更多示例：
    // timer3: '2h',                                       // 每2小时
    // timer4: '00:00:00',                                 // 每天0点
    // timer5: { minutes: 5, desc: '每5分钟的任务' },        // 每5分钟带描述
    // timer6: { daily: '12:00:00', desc: '每天中午' },     // 每天12点
    // timer7: { times: ['10s', '1m', '1h'], desc: '多时间任务' },  // 多个时间点（每10秒、1分钟、1小时）
    // timer8: [30, 60, 120],                              // 每30秒、1分钟、2分钟执行
    // timer9: { hours: 1, enabled: false },               // 已禁用
    // timer10: { weekly: [1, 3, 5], time: '09:00:00' },   // 每周一、三、五 9 点（0=周日，1-6=周一至周六）
    // timer11: { weekly: 1 },                             // 每周一 0 点（time 省略默认 00:00:00）
    // timer12: { monthly: [1, 15], time: '02:00:00' },    // 每月 1 号、15 号凌晨 2 点
    // timer13: { cron: '0 */30 9-17 * * 1-5', desc: '工作日9点到17点半每半小时' }, // cron 表达式（秒 分 时 日 月 周）
    // timer14: '0 0 12 * * 3',                            // cron 字符串直写：每周三 12 点
  },
};
```

提示：当 `concurrency` 设置为 1 时，定时任务会按 `tasks` 内的顺序执行，当大于 1 时，会并发执行，此时云函数的日志打印是**无序**的。

3. **编写具体任务**  
   在 `service/crontab/tasks/xxx.js` 中实现业务逻辑。文件名为任务名（如 `timer1.js`），需在 `taskConfig.js` 的 `tasks` 中有同名 key。导出为一个 `async function`，可使用全局 `vk` 和 云对象的 `this` 等。示例：

   注意：这里的 `this` 指向云对象 `crontab/pub`

```js
// tasks/timer1.js
const vk = uniCloud.vk;
const db = uniCloud.database();
const _ = db.command;
const $ = _.aggregate;

module.exports = async function () {
  let res = { code: 0, msg: '' };
  // 业务逻辑
  console.log('我是1号定时任务');
  return res;
};
```

4. 上传并部署 router 云函数后，定时任务会按 Cron 与 `taskConfig.js` 的配置自动执行。

## vk-unicloud 版本 < 2.21.0@old

### 单次执行时长小于 180 秒的定时任务@old-1

以实现「每 1 小时自动请求一次指定云函数」为例：

1. 编写 `client/timedTask/pub/autoCancelOrder` 云函数，实现定时任务业务逻辑（没有则新建）
2. 右键 `cloudfunctions` 目录 → 新建云函数，命名为 `z_timer1`（名称可自定义）
3. 将下方定时器模板代码复制到 `z_timer1/index.js`

```js
'use strict';
exports.main = async (event, context) => {
  /**
   * 定时器1号 - xxxxx
   */
  let res = { code: 0, msg: '' };
  res.callFunctionResult = await uniCloud.callFunction({
    name: 'router',
    data: {
      // 需要执行的云函数路径
      $url: 'client/timedTask/pub/autoCancelOrder',
      // 请求参数，这里加个key可以有效防止云函数被直接访问，云函数中加判断条件，如果key不是666666，则不运行。
      data: {
        key: '666666',
      },
    },
  });
  return res;
};
```

4. 编写 `z_timer1/package.json`（见下方完整示例，**不要复制带注释的说明代码**，仅使用合法 JSON）

```json
{
  "name": "z_timer1",
  "main": "index.js",
  "version": "1.0.0",
  "description": "",
  "cloudfunction-config": {
    "concurrency": 1,
    "memorySize": 512,
    "path": "",
    "timeout": 600,
    "triggers": [
      {
        "config": "0 0 * * * * *",
        "name": "z_timer1",
        "type": "timer"
      }
    ],
    "runtime": "Nodejs12"
  }
}
```

**cloudfunction-config 参数说明**（超时上限：阿里云 7200 秒、腾讯云 900 秒、支付宝云 10800 秒）

| 参数        | 说明                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| concurrency | 阿里云专属，固定为 1                                                                                                        |
| memorySize  | 最大可用内存（MB），可选：128 / 256 / 512 / 1024 / 2048，默认 512                                                           |
| path        | Url 化 path（定时器可不填）                                                                                                 |
| timeout     | 超时时间（秒）                                                                                                              |
| triggers    | 触发器数组，**仅支持 1 个元素**；config 为 Cron 表达式，见 [uniCloud 触发器](https://uniapp.dcloud.net.cn/uniCloud/trigger) |

5. 右键 `z_timer1` → 上传部署
6. 完成

### 单次执行时长大于 180 秒的定时任务@old-2

通过 `uniCloud.callFunction` 调用其他云函数时，单次最长执行 180 秒。若任务需超过 180 秒，不能走 callFunction，须将逻辑全部写在当前定时任务云函数内。

操作步骤：

1. 右键 `cloudfunctions` 目录 → 新建云函数，命名为 `z_timer1`（可自定义）
2. 将下方模板代码复制到 `z_timer1/index.js`

```js
'use strict';
// 引入 vk-unicloud
const vkCloud = require('vk-unicloud');
// 通过 vkCloud.createInstance 创建 vk 实例
const vk = vkCloud.createInstance({
  baseDir: __dirname,
  requireFn: require,
});
exports.main = async (event, context) => {
  /**
   * 定时器1号 - xxxxxx
   */
  let res = { code: 0, msg: '' };

  // 这里直接写你的定时任务逻辑

  // 可以直接调用baseDao的API了
  let userList = await vk.baseDao.select({
    dbName: 'uni-id-users',
    getMain: true,
    pageIndex: 1,
    pageSize: 1000,
    whereJson: {},
    fieldJson: {},
    sortArr: [{ name: '_id', type: 'desc' }],
  });

  return res;
};
```

3. 编写 `z_timer1/package.json`（需增加 vk-unicloud 等依赖，`timeout` 可按需设大，如 7200）。参数含义见上一小节「cloudfunction-config 参数说明」。

```json
{
  "name": "z_timer1",
  "main": "index.js",
  "version": "1.0.0",
  "description": "",
  "dependencies": {
    "uni-config-center": "file:../../../uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center",
    "uni-id": "file:../../../uni_modules/uni-id/uniCloud/cloudfunctions/common/uni-id",
    "vk-unicloud": "file:../../../uni_modules/vk-unicloud/uniCloud/cloudfunctions/common/vk-unicloud"
  },
  "cloudfunction-config": {
    "concurrency": 1,
    "memorySize": 512,
    "path": "",
    "timeout": 7200,
    "triggers": [
      {
        "config": "0 0 * * * * *",
        "name": "z_timer1",
        "type": "timer"
      }
    ],
    "runtime": "Nodejs12"
  }
}
```

4. 右键 `z_timer1` → 上传部署
5. 完成

## Cron 表达式@cron

Cron 表达式有七个字段（阿里云为 6 位，第七位仍需写 `*`），按空格分隔。

| 位数 | 说明 | 取值                                                            |
| ---- | ---- | --------------------------------------------------------------- |
| 1    | 秒   | 0-59                                                            |
| 2    | 分钟 | 0-59                                                            |
| 3    | 小时 | 0-23                                                            |
| 4    | 日   | 1-31（需考虑当月天数）                                          |
| 5    | 月   | 1-12                                                            |
| 6    | 星期 | 0-6 或 SUN,MON,TUE,WED,THU,FRI,SAT（0=周日，1=周一，…，6=周六） |
| 7    | 年   | 1970~2099（阿里云无此位，但第七位需填 `*`）                     |

### 通配符@cron-symbol

| 通配符     | 说明                                                               |
| ---------- | ------------------------------------------------------------------ |
| `,` 逗号   | 取并集，如小时字段 `1,2,3` 表示 1 点、2 点、3 点                   |
| `-` 破折号 | 范围，如日字段 `1-15` 表示每月 1 号到 15 号                        |
| `*` 星号   | 任意值，如小时字段 `*` 表示每小时                                  |
| `/` 斜杠   | 步长，如分钟字段 `1/10` 表示从第 1 分钟起每 10 分钟（11、21、31…） |

### 注意事项@cron-tips

- 「日」和「星期」同时指定时，为**或**关系，两个条件分别生效。
- 触发器时区为 **UTC+8**。
- 阿里云不支持秒级触发，最小粒度为 1 分钟。
- 支付宝云不支持星期参数。

### 示例@cron-demo

| 示例                   | 说明                                  | 云厂商兼容性     |
| ---------------------- | ------------------------------------- | ---------------- |
| `* * * * * * *`        | 每 1 秒触发（阿里云不支持）           | 腾讯云、支付宝云 |
| `*/5 * * * * * *`      | 每 5 秒触发（阿里云不支持）           | 腾讯云、支付宝云 |
| `0 * * * * * *`        | 每分钟 0 秒触发                       | 全部             |
| `10 * * * * * *`       | 每分钟第 10 秒触发                    | 全部             |
| `0 */10 * * * * *`     | 每 10 分钟触发                        | 全部             |
| `0 1/10 * * * * *`     | 每 10 分钟（如 08:11、08:21、08:31…） | 全部             |
| `0 0 * * * * *`        | 每小时整点触发                        | 全部             |
| `0 10 * * * * *`       | 每小时 10 分触发（如 08:10、09:10）   | 全部             |
| `0 0 */2 * * * *`      | 每 2 小时整点触发                     | 全部             |
| `0 0 18 * * * *`       | 每天 18:00 触发                       | 全部             |
| `0 0 10,14,16 * * * *` | 每天 10:00、14:00、16:00 触发         | 全部             |
| `0 */30 9-17 * * * *`  | 每天 9:00–17:00 每半小时触发          | 全部             |
| `0 0 2 1 * * *`        | 每月 1 日 02:00 触发                  | 全部             |
| `0 15 10 * * 1-5 *`    | 周一至周五 10:15 触发                 | 腾讯云、阿里云   |
| `0 0 12 * * 3 *`       | 每周三 12:00 触发                     | 腾讯云、阿里云   |
