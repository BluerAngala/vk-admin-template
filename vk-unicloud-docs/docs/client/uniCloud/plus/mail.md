---
sidebarDepth: 0
---

# 邮件发送

`vk-mail` 支持发送纯文本、HTML 邮件、附件、嵌入图片等功能。

## 配置@config

### 添加 vk-mail 公共模块依赖

插件地址：[点击前往](https://ext.dcloud.net.cn/plugin?id=7688)

成功导入后，还需要在你需要使用 `邮件发送功能` 的云函数上，如 `router` 上 `右键` `管理公共模块依赖或扩展库`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/cfbfd5fb-44e6-40e3-b1f0-a6b4e6d1c53c.png)

然后打勾 `vk-mail` 模块。

最后还需要重新上传公共模块 `vk-mail` 和云函数 `router`（本地运行则需要重启项目）

### 配置 163 邮箱教程

- 1、登录 163 邮箱
- 2、`邮箱首页` | `设置` - `POP3/SMTP服务` - 开启 `POP3/SMTP服务`
- 3、复制授权码
- 4、粘贴到 `uniCloud/cloudfunctions/common/uni-config-center/vk-unicloud/index.js` 配置文件中

```js
"vk":{
  "service": {
    "email": {
      "codeExpiresIn": 180, // 邮件验证码有效期（单位秒）
      "163": {
        "host": "smtp.163.com",
        "port": 465,
        "secure": true,
        "auth": {
          "user": "你的邮箱@163.com",
          "pass": "邮箱授权码"
        }
      }
    }
  }
}
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

### 配置 QQ 邮箱教程

- 1、登录 QQ 邮箱
- 2、`邮箱首页` | `设置` - `换肤` 的设置
- 3、点击`常规` `帐户` `换肤` 中的 `帐户`
- 4、POP3/SMTP 服务 点击开启
- 5、复制授权码
- 6、粘贴到 `uniCloud/cloudfunctions/common/uni-config-center/vk-unicloud/index.js` 配置文件中

```js
"vk":{
  "service": {
    "email": {
      "codeExpiresIn": 180, // 邮件验证码有效期（单位秒）
      "qq": {
        "host": "smtp.qq.com",
        "port": 465,
        "secure": true,
        "auth": {
          "user": "你的邮箱@qq.com",
          "pass": "邮箱授权码"
        }
      }
    }
  }
}
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 发送邮箱验证码示例

### vk 框架下 router 函数内

```js
let vkmail;
try {
  vkmail = require('vk-mail');
} catch (err) {
  console.error('请先添加公共模块：vk-mail（右键对应的云函数，点击管理公共模块或扩展库依赖，勾选vk-mail依赖）');
}
module.exports = {
  /**
   * 发送邮箱验证码
   * @url user/pub/sendEmailCode 前端调用的url参数地址
   * @description 发送邮箱验证码
   * data 请求参数 说明
   * @param {String} email 邮箱
   * @param {String} type  验证码类型
   * @param {String} serviceType 邮件服务类型，默认为qq
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {String} email 邮箱
   * @param {String} verifyCode 验证码
   */
  main: async (event) => {
    let { data = {}, util } = event;
    let { uniID, config } = util;
    let { email, type, serviceType = 'qq' } = data;
    let res = { code: 0, msg: 'ok' };
    // 业务逻辑开始-----------------------------------------------------------
    if (!vkmail) {
      return {
        code: -1,
        msg: '请先添加公共模块：vk-mail（右键对应的云函数，点击管理公共模块或扩展库依赖，勾选vk-mail依赖）',
      };
    }
    let code = vk.pubfn.random(6, '0123456789');
    let param = {
      code,
      type,
      email,
    };
    // 发送验证码开始
    let emailConfig = config.vk.service.email;
    // 如果配置设置了过期时间，则使用配置的过期时间，否则默认180秒
    param.expiresIn = emailConfig.codeExpiresIn || 180;
    let emailService = vkmail.createTransport({
      host: emailConfig[serviceType].host,
      port: emailConfig[serviceType].port,
      secure: emailConfig[serviceType].secure, // use SSL
      auth: emailConfig[serviceType].auth,
    });
    try {
      // 发送邮件
      await emailService.sendMail({
        from: emailConfig[serviceType].auth.user,
        to: data.email,
        cc: emailConfig[serviceType].auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
        subject: data.subject, // 邮件的标题
        text: `您的验证码是${code},打死也不要告诉别人哦!`, // 邮件的内容
      });
      // 发送验证码成功后，设置验证码
      await uniID.setVerifyCode(param);
    } catch (err) {
      console.error(err);
      return { code: -1, msg: '邮件发送失败', err };
    }
    // 发送验证码结束

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

### vk 框架下非 router 函数内

```js
'use strict';
// 通过 require 引入 vk 实例
const vk = require('vk-unicloud');
// 通过 vk.init 初始化 vk实例（只有初始化后才能使用）
vk.init({
  baseDir: __dirname,
  requireFn: require,
});

let vkmail;
try {
  vkmail = require('vk-mail');
} catch (err) {
  console.error('请先添加公共模块：vk-mail（右键对应的云函数，点击管理公共模块或扩展库依赖，勾选vk-mail依赖）');
}

exports.main = async (event, context) => {
  let res = { code: 0, msg: '' };
  let { config = {} } = vk.getUnicloud();

  let emailConfig = config.vk.service.email;

  let serviceType = 'qq';
  let email = '发送给谁，他的邮箱';
  let subject = '标题';
  let text = `验证码 123456`;

  // 创建邮箱服务实例
  let emailService = vkmail.createTransport({
    host: emailConfig[serviceType].host,
    port: emailConfig[serviceType].port,
    secure: emailConfig[serviceType].secure, // use SSL
    auth: emailConfig[serviceType].auth,
  });

  try {
    // 发送邮件
    res.sendMailRes = await emailService.sendMail({
      from: emailConfig[serviceType].auth.user, // 邮件的发送者
      to: email, // 邮件的接收者
      cc: emailConfig[serviceType].auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
      subject: subject, // 邮件的标题
      text: text, // 邮件的内容
    });
    res.code = 0;
    res.msg = 'ok';
  } catch (err) {
    res.code = -1;
    res.msg = '邮件发送失败';
    res.err = err;
  }

  return res;
};
```

### uniCloud 通用版本

也是 node.js 通用版本

```js
'use strict';

let vkmail;
try {
  vkmail = require('vk-mail');
} catch (err) {
  console.error('请先添加公共模块：vk-mail（右键对应的云函数，点击管理公共模块或扩展库依赖，勾选vk-mail依赖）');
}

exports.main = async (event, context) => {
  let res = { code: 0, msg: '' };

  let {
    email, // 前端接收邮箱
    type = 'bind', // 前端接收验证码类型（如: login register bind unbind）
  } = event;

  // 支持QQ 163 等主流邮箱

  let emailConfig = {
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: 'xxxx@163.com', // 发件人邮箱账号
      pass: 'xxxxxxxxxxxx', // 账号授权码
    },
  };

  if (!email) return { code: -1, msg: 'email不能为空' };
  if (!type) return { code: -1, msg: 'type不能为空' };

  let code = Math.floor(Math.random() * 100000) + 100000;
  let subject = `验证码 ${code}`;
  let text = `验证码 ${code}，打死也不要告诉别人！`;

  // 创建邮箱服务实例
  let emailService = vkmail.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure, // use SSL
    auth: emailConfig.auth,
  });

  try {
    // 发送邮件
    res.sendMailRes = await emailService.sendMail({
      from: emailConfig.auth.user, // 邮件的发送者
      to: email, // 邮件的接收者
      cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
      subject: subject, // 邮件的标题
      text: text, // 邮件的内容
    });
    // 标记发送成功
    res.code = 0;
    res.msg = 'ok';
    // 发送验证码成功后，通常需要设置验证码（写入数据库）
    // await uniID.setVerifyCode({ code, email, type });
  } catch (err) {
    res.code = -1;
    res.msg = '邮件发送失败';
    res.err = err;
  }
  return res;
};
```

## sendMail 参数说明@params

`sendMail` 方法支持以下参数：

| 参数名      | 类型         | 必填 | 说明                                 |
| ----------- | ------------ | ---- | ------------------------------------ |
| subject     | String       | 是   | 邮件标题                             |
| from        | String       | 是   | 发件人邮箱地址                       |
| to          | String/Array | 是   | 收件人邮箱，多个用逗号分隔或使用数组 |
| cc          | String/Array | 否   | 抄送人邮箱                           |
| bcc         | String/Array | 否   | 密送人邮箱                           |
| text        | String       | 否   | 纯文本内容                           |
| html        | String       | 否   | HTML 内容                            |
| attachments | Array        | 否   | 附件列表                             |
| replyTo     | String       | 否   | 回复地址                             |
| priority    | String       | 否   | 优先级：high、normal、low            |
| headers     | Object       | 否   | 自定义邮件头                         |

## 发送 HTML 邮件@html

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '欢迎注册',
  html: `
    <div style="padding: 20px; background: #f5f5f5;">
      <h1 style="color: #333;">欢迎加入我们</h1>
      <p>您的账号已创建成功。</p>
      <a href="https://example.com" style="
        display: inline-block;
        padding: 10px 20px;
        background: #007bff;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
      ">立即访问</a>
    </div>
  `,
});
```

## 发送附件@attachments

### attachments 参数说明

| 参数名      | 类型          | 说明                          |
| ----------- | ------------- | ----------------------------- |
| filename    | String        | 附件显示的文件名              |
| content     | String/Buffer | 附件内容（字符串或 Buffer）   |
| path        | String        | 文件路径（与 content 二选一） |
| href        | String        | URL 地址，从网络获取附件      |
| contentType | String        | MIME 类型，如 application/pdf |
| encoding    | String        | 编码方式，如 base64           |

### 发送文本附件

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '附件测试',
  text: '请查收附件',
  attachments: [
    {
      filename: 'hello.txt',
      content: 'Hello World!',
    },
  ],
});
```

### 发送 Base64 附件

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '图片附件',
  text: '请查收图片',
  attachments: [
    {
      filename: 'image.png',
      content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      encoding: 'base64',
    },
  ],
});
```

### 从 URL 获取附件

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '网络附件',
  text: '请查收附件',
  attachments: [
    {
      filename: 'report.pdf',
      href: 'https://example.com/files/report.pdf',
    },
  ],
});
```

### 发送多个附件

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '多附件测试',
  text: '请查收以下附件',
  attachments: [
    {
      filename: 'readme.txt',
      content: '这是说明文档',
    },
    {
      filename: 'data.json',
      content: JSON.stringify({ name: 'test', value: 123 }),
      contentType: 'application/json',
    },
  ],
});
```

## 嵌入图片到 HTML@embedded-images

通过 `cid` 可以在 HTML 中嵌入图片，图片会直接显示在邮件正文中，而不是作为附件。

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'receiver@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '嵌入图片示例',
  html: `
    <div>
      <h1>产品展示</h1>
      <img src="cid:logo" style="width: 200px;" />
      <p>这是我们的 Logo</p>
    </div>
  `,
  attachments: [
    {
      filename: 'logo.png',
      content: 'base64编码的图片内容...',
      encoding: 'base64',
      cid: 'logo', // 在 HTML 中通过 cid:logo 引用
    },
  ],
});
```

## 多收件人@multiple-recipients

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  // 多个收件人，用逗号分隔
  to: 'user1@example.com, user2@example.com',
  // 抄送
  cc: 'manager@example.com',
  // 密送（收件人看不到其他密送人）
  bcc: 'admin@example.com',
  subject: '团队通知',
  text: '这是一封群发邮件',
});
```

## 自定义发件人名称@sender-name

```js
await emailService.sendMail({
  // 格式："显示名称" <邮箱地址>
  from: '"客服中心" <service@example.com>',
  to: 'user@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '您的订单已发货',
  text: '订单详情...',
});
```

## 设置邮件优先级@priority

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'user@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  subject: '紧急通知',
  text: '请立即处理',
  priority: 'high', // high、normal、low
});
```

## 设置回复地址@reply-to

```js
await emailService.sendMail({
  from: emailConfig.auth.user,
  to: 'user@example.com',
  cc: emailConfig.auth.user, // 由于邮件可能会被当成垃圾邮件，但只要把邮件抄送给自己一份，就不会被当成垃圾邮件。
  replyTo: 'support@example.com', // 用户回复时发送到此地址
  subject: '系统通知',
  text: '如有问题请直接回复此邮件',
});
```

## 完整示例@full-example

以下是一个包含多种功能的完整示例：

```js
'use strict';

let vkmail;
try {
  vkmail = require('vk-mail');
} catch (err) {
  console.error('请先添加公共模块：vk-mail');
}

exports.main = async (event, context) => {
  let res = { code: 0, msg: '' };

  let emailConfig = {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: 'your@qq.com',
      pass: '授权码',
    },
  };

  let emailService = vkmail.createTransport(emailConfig);

  try {
    await emailService.sendMail({
      from: '"系统通知" <your@qq.com>',
      to: 'receiver@example.com',
      cc: 'copy@example.com',
      subject: '订单确认',
      html: `
        <div style="padding: 20px;">
          <img src="cid:logo" style="width: 100px;" />
          <h2>订单已确认</h2>
          <p>详情请查看附件</p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          content: 'base64内容...',
          encoding: 'base64',
          cid: 'logo',
        },
        {
          filename: 'order.pdf',
          href: 'https://example.com/order.pdf',
        },
      ],
      priority: 'high',
    });
    res.msg = '发送成功';
  } catch (err) {
    res.code = -1;
    res.msg = '发送失败';
    res.err = err;
  }

  return res;
};
```
