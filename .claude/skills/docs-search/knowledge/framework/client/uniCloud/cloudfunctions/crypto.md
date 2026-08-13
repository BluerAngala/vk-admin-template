---
sidebarDepth: 0
---

# 使用 crypto 进行加密解密

## 介绍

crypto 是 Nodejs 的内置模块，提供了加密功能，包括对 OpenSSL 的哈希、HMAC、加密、解密、签名、以及验证功能的一整套封装。

## Hash（哈希函数）

又称为不可逆加密函数，主要用于生成数据的一个固定长度的“指纹”，无法通过加密内容解密成原始内容。

安全性排序：SHA3 ＞ SHA256 ＞ SHA1 ＞ MD5

性能排序：MD5 ＞ SHA1 ＞ SHA256 ＞ SHA3

### MD5 算法

MD5 生成一个 128 位的哈希值，通常表示为 32 个十六进制数，在其早期广泛用于各种验证和安全性较低的场合，如检查文件完整性。

```js
const crypto = require('crypto');
let text = 'Hello, world!';
let hash = crypto.createHash('md5').update(text).digest('hex');
console.log('md5 Hash: ', hash);
```

### SHA1 算法

SHA-1 比 MD5 安全的哈希算法，生成一个 160 位的哈希值，通常表示为 40 个十六进制数。

```js
const crypto = require('crypto');
let text = 'Hello, world!';
let hash = crypto.createHash('sha1').update(text).digest('hex');
console.log('sha1 Hash: ', hash);
```

### SHA256 算法

比 SHA1 更安全的哈希算法，SHA-256 生成的哈希值长度为 256 位，通常以 64 个十六进制数字表示。这种哈希算法被广泛认为是安全的，适用于多种需要数据完整性和安全性的场合。

```js
const crypto = require('crypto');
// 待哈希的数据
let text = 'Hello, world!';
let hash = crypto.createHash('sha256').update(text).digest('hex');
console.log('SHA-256 Hash: ', hash);
```

### SHA3 算法

SHA-3（Secure Hash Algorithm 3）是 NIST（美国国家标准与技术研究院）在 2015 年公布的一种加密哈希函数。它是继 SHA-1 和 SHA-2 之后，作为新的安全哈希标准而设计的。SHA-3 的设计目的是为了提高安全性，尤其是在面对量子计算威胁的背景下。

```js
const crypto = require('crypto');
// 待哈希的数据
let text = 'Hello, world!';
let hash = crypto.createHash('sha3-512').update(text).digest('hex');
console.log('sha3-512 Hash: ', hash);
```

## Hmac（加密哈希函数）

Hmac 算法也是一种哈希算法，它也可以指定 MD5、SHA1、SHA256、SHA3 等哈希算法，但需要配置密钥，它主要用于消息认证，即验证一条消息是否未被篡改，并且确实是由持有共享密钥的发送者发送的。

```js
const crypto = require('crypto');
let text = 'Hello, world!';
let hmac = crypto.createHmac('sha256', 'secret-key').update(text).digest('hex');
console.log('SHA-256 Hmac: ', hmac);
```

## AES 加解密（对称加密）

AES 属于对称加密方法，高级加密标准(Advanced Encryption Standard，AES)

即加密和解密都用同一个密钥

### aes-256-ecb 算法

```js
const crypto = require('crypto');

// 密钥
const key = '5d44a032652974c3e53644945a95b126'; // AES-256位密钥

// 待加密的文本
const text = '我是待加密的信息';
console.log('加密前的原文:', text);

// 加密
const cipher = crypto.createCipheriv('aes-256-ecb', key, '');
let encrypted = cipher.update(text, 'utf8', 'base64');
encrypted += cipher.final('base64');
console.log('加密后的密文:', encrypted);

// 解密
const decipher = crypto.createDecipheriv('aes-256-ecb', key, '');
let decrypted = decipher.update(encrypted, 'base64', 'utf8');
decrypted += decipher.final('utf8');
console.log('解密后的明文:', decrypted);
```

### aes-256-cbc 算法（带偏移量）

```js
const crypto = require('crypto');

// 密钥和偏移量（IV）
const key = '5d44a032652974c3e53644945a95b126'; // AES-256位密钥，必须32位
const iv = '652974c3e5364494'; // 初始化向量（IV）必须16位

// 待加密的文本
const text = '我是待加密的信息';
console.log('加密前的原文:', text);

// 加密
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(text, 'utf8', 'base64');
encrypted += cipher.final('base64');
console.log('加密后的密文:', encrypted);

// 解密
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted, 'base64', 'utf8');
decrypted += decipher.final('utf8');
console.log('解密后的明文:', decrypted);
```

## RSA 算法（非对称加密）

### RSA 加解密

RSA 是 1977 年由罗纳德·李维斯特（Ron Rivest）、阿迪·萨莫尔（Adi Shamir）和伦纳德·阿德曼（Leonard Adleman）一起提出的。当时他们三人都在麻省理工学院工作。RSA 就是他们三人姓氏开头字母拼在一起组成的

RSA 算法是一种非对称加密算法，与对称加密算法不同的是，RSA 算法有两个不同的密钥，一个是公钥，一个是私钥。其中公钥用来加密，私钥用来解密

```js
const crypto = require('crypto');

// 生成PKCS#8格式的RSA密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048, // 密钥长度
  publicKeyEncoding: {
    type: 'spki', // 公钥格式
    format: 'pem', // PEM格式
  },
  privateKeyEncoding: {
    type: 'pkcs8', // 私钥格式
    format: 'pem', // PEM格式
  },
});

console.log('Public Key (PKCS8):', publicKey);
console.log('Private Key (PKCS8):', privateKey);

// 使用公钥加密
const text = '我是待加密的信息';
console.log('加密前的原文:', text);

const encryptBuffer = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // 填充方式
  },
  Buffer.from(text)
);

console.log('加密后的密文:', encryptBuffer.toString('hex'));

// 使用私钥解密
const decryptBuffer = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  },
  encryptBuffer
);

console.log('解密后的明文:', decryptBuffer.toString());
```

### RSA 签名

一般用于对传输的 http 文本内容进行签名，防止伪造。

**与 AES 加密的区别是，签名是固定长度的字符串，无法通过签名解密原始文本，只能通过原始文本和密钥验证签名是否正确。**

`RSA` 属于非对称加密，即 `公钥签名` 需要用 `私钥验签`，而 `私钥签名` 需要用 `公钥验签`

```js
// 引入crypto模块
const crypto = require('crypto');

// 要加密的文本
let text = 'aaa';

// 公钥内容
let publicKeyContent = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi8dG4enrkY+bJJFk4wRVbCv4Mu32INrpWDtX59RA/OEBrxiRBeW+CHCk9mHQsyR76hoTDzOfhDP6QbX2a43ict2XvKlaru87aeSR0zO7JydAWMq1kJJ036aikyflsLPnoIAT3VMDJDrIbJ8C5llbb3zHOHUVtvzKxUZyLBZJhGDzlDA5TAyibrSTXw2bp3pNQ66zEJpKp5qBX8TRueWssQB/LZ/hQ/yCgcqW+paYDXsBdzYt1jNhrKnjIpiLjdXIJT69ZWZ/79Y2bhSLb4lPmV7xAGsiJbpk3OwNHtZFr5Yxut6iY0yul1roZsqX9OQCEIAN6woEup7r4eGeEdlB1QIDAQAB`;
// 私钥内容
let privateKeyContent = `MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCLx0bh6euRj5skkWTjBFVsK/gy7fYg2ulYO1fn1ED84QGvGJEF5b4IcKT2YdCzJHvqGhMPM5+EM/pBtfZrjeJy3Ze8qVqu7ztp5JHTM7snJ0BYyrWQknTfpqKTJ+Wws+eggBPdUwMkOshsnwLmWVtvfMc4dRW2/MrFRnIsFkmEYPOUMDlMDKJutJNfDZunek1DrrMQmkqnmoFfxNG55ayxAH8tn+FD/IKBypb6lpgNewF3Ni3WM2GsqeMimIuN1cglPr1lZn/v1jZuFItviU+ZXvEAayIlumTc7A0e1kWvljG63qJjTK6XWuhmypf05AIQgA3rCgS6nuvh4Z4R2UHVAgMBAAECggEAaULLXUt0C6zyb0pSiCb2UTyXb3sF894HBVvDKiEMQ6MKSpqcc618OwzhHW2x5YYfDr9OBQ+iG8OsvRlTldFGa6v2HawHT193BZqMOllloemMKpGUw2eXPelV2q2b6kLAtnxc+ToPTpQ55Jqma2N1WPLFb/20OZYK+R7A0fSCrn3VUidNGKFFr27Yizj9EM7I/wrSIpo2OLeJ1AOGy6pf4edAKsXP1sQhbzhumAKiUHtai6wzqbxIK3VstqndRnquh1LHlubaXtiBaU6hW8CMNkQD5MAEtJ0UIl5OqxUkMT2OMKmjHy/lFgugiQubzTa2piIFjExlkoDRISRkVzdtAQKBgQDog7y/g0Y/NDJLp/4v8s9NC8T3k5xJSVdtY3yQz8izow08KYNZZmlWRZ2hes4byoLWJ9ff7iH2mj2J49Fq6ZvQ/icWr1aCTl2jWgNpeXpczA/87WBiUqAnK80gnImTnRKz2k7ISG/atC9XW5B9l9QsFfupHwVt53NVvU7pu5z4QQKBgQCZ5Zt/jX6fRWDcEP85nAz4lXgI8gG1uYvVwgYaa31OJIDOvc4pGASydId5p4KXqiCeQv5DVeKG9D8lq1IPR0dT0hLpH6Di6deki12FGxb5HZ0/O1dYXTyWEqrh8Nfj/Gr1puHMmpBzetfVQupHd2o6MyLkoG+e8syfYZ9uXqvElQKBgH3Wlnebx4/7YuEZWXN/2Pvcy8wmImZzgBKezlLdccTvEQGnggQHbikX4jj76sKVtnvK8oWqLs11KqsPFk7jgcX5VxRq7sn1Oa5n0ALskPHaKyj7G7f6+dxZU1o7/iVa1D1sgEjbE1ZtQFXqI2glnNoDR8F/HYQeyIf1vdi4BjtBAoGAfJ52LXKZf0WB6pIE6lSYGE+ItM2rXslSF5UWthwmirl6aG9AWvxtCUjdT0C6ui90XFNpa4NHfPqZi9pQB7kzZAevcoE/GaA8E60a3KcUEkPNyp812oMdhXS2VWFeoOoMfsFVBQaARFLMJZAbACYNqfUwoyvbVz3LPqChppEYzIUCgYAeJ3Y99yLUmSHNyXnUzMM8W/8AVQemCkicUefKFQhlDRkZK4wMtaORJNogok3U1Ym+QsyMN/UxA9w/O4qlDOqsTAR6/2rpS/IJnyXgjRvzGnlcuyIGOxtOFB6IGGh5scsr+pFTJYP212eBhfteS5q9VpE8hx6YL8LKj9QPDbjeGw==`;

// 拼接密钥的函数
const formatKey = function (key, type) {
  return `-----BEGIN ${type}-----\n${key}\n-----END ${type}-----`;
};

// 拼接完整的私钥
let privateKey = formatKey(privateKeyContent, 'PRIVATE KEY');
// 拼接完整的公钥
let publicKey = formatKey(publicKeyContent, 'PUBLIC KEY');

// 生成签名
let sign = crypto.createSign('RSA-SHA256').update(text).sign(privateKey, 'base64');
console.log('sign: ', sign);

// 验证签名是否正确
let verify = crypto.createVerify('RSA-SHA256').update(text).verify(publicKey, sign, 'base64');
console.log('verify: ', verify);
```

**如何生成密钥对?**

公钥和私钥的生成可以使用 openssl 命令生成，也可以使用 nodejs 的 crypto 模块生成

以下是使用 nodejs 的 crypto 模块生成密钥对的代码

```js
// 引入crypto模块
const crypto = require('crypto');

// 使用nodejs的crypto模块生成密钥对
const keyPair = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'der',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'der',
  },
});
let publicKeyContent = keyPair.publicKey.toString('base64');
let privateKeyContent = keyPair.privateKey.toString('base64');

// 拼接密钥的函数
const formatKey = function (key, type) {
  return `-----BEGIN ${type}-----\n${key}\n-----END ${type}-----`;
};

// 拼接完整的私钥
let privateKey = formatKey(privateKeyContent, 'PRIVATE KEY');
// 拼接完整的公钥
let publicKey = formatKey(publicKeyContent, 'PUBLIC KEY');

console.log('privateKey: ', privateKey);
console.log('publicKey: ', publicKey);
```

## AES 加解密（VK 简易版）

注意：需要配置 `vk.crypto.aes` 用于返回给前端加密数据时的加密密钥

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/a4ca3d72-358e-4437-8766-d0b14e269697.png)

### 在云函数内加解密

```js
// 加密数据
let encryptedKey = vk.crypto.aes.encrypt({
  mode: 'aes-256-ecb',
  data: {
    sessionKey: 'XXXXX',
  },
});
console.log('encryptedKey: ', encryptedKey);

// 解密 sessionKey 示例
let decryptedRes = vk.crypto.aes.decrypt({
  mode: 'aes-256-ecb',
  data: encryptedKey, // 待解密的原文
});
console.log('decryptedRes: ', decryptedRes);
let sessionKey = decryptedRes.sessionKey;
console.log('sessionKey: ', sessionKey);
```

### 跨云函数双向安全加密通信

**A 云函数加密请求 B 云函数**

```js
// 加密
let encrypted = vk.crypto.aes.encrypt({
  mode: 'aes-256-ecb',
  data: {
    a: 1,
    b: '2',
  },
});
// 请求云函数B
let callFunctionRes = await vk.callFunction({
  url: '云函数B的请求地址',
  data: {
    encrypted, // 只传加密后的数据给云函数B
  },
});
// 解密云函数B返回的数据
let res = vk.crypto.aes.decrypt({
  mode: 'aes-256-ecb',
  data: callFunctionRes.encrypted,
});
console.log('云函数B返回值: ', res);
return res;
```

**B 云函数解密并执行逻辑**

```js
let res = { code: 0, msg: '' };
let {
  encrypted, // 接受A云函数传过来的加密的数据
} = data;
// 解密
let decrypted;
try {
  decrypted = vk.crypto.aes.decrypt({
    mode: 'aes-256-ecb',
    data: encrypted,
  });
} catch (err) {
  return {
    code: -1,
    msg: '参数未正确加密',
  };
}
// 解密后的数据
console.log('云函数B收到的请求参数: ', decrypted);
let { a, b } = decrypted;
// 你的业务逻辑开始-----------------------------------------------------------

res.msg = '调用了B函数';

// 你的业务逻辑结束-----------------------------------------------------------

return {
  // 只返回密文
  encrypted: vk.crypto.aes.encrypt({
    mode: 'aes-256-ecb',
    data: res,
  }),
};
```

### 在云函数加密，java 或 php 等其他后端语言解密

> 以下 API 需要 vk-unicloud 核心库版本 >= 2.14.1

#### 用云函数加密

```js
// 加密数据
let key = '12345678901234561234567890123456'; // 必须是固定的32位（只支持数字、英文）
let text = { a: 1, b: '2' }; // 待加密的内容

let encrypted = vk.crypto.aes.encrypt({
  mode: 'aes-256-ecb',
  data: text,
  key: key,
});
console.log('encrypted: ', encrypted);
```

#### 用 java 解密

```java
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class CryptoUtil {
    // 调用示例
    public static void main(String[] args) {
        try {
            String encrypted = "es2aF7DWr169X4fvMnlKNg=="; // 待解密的密文
            String key = "12345678901234561234567890123456"; // 必须是固定的32位（只支持数字、英文）
            // 解密
            String decrypted = decrypt(encrypted, key);
            System.out.println("decrypted: " + decrypted);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 解密函数
    private static String decrypt(String encryptedData, String key) throws Exception {
        if (key.length() > 32) {
            key = key.substring(0, 32);
        }
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
    // 加密函数
    private static String encrypt(String data, String key) throws Exception {
        if (key.length() > 32) {
            key = key.substring(0, 32);
        }
        byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);

        byte[] encryptedBytes = cipher.doFinal(dataBytes);
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

}
```

#### 用 php 解密

```php
<?php
    $key = '12345678901234561234567890123456'; // 必须是固定的32位（只支持数字、英文）
    $encrypt = "es2aF7DWr169X4fvMnlKNg=="; // 待解密的内容
    // 解密
    $decrypt = openssl_decrypt(base64_decode($encrypt), 'aes-256-ecb', substr($key, 0, 32), OPENSSL_RAW_DATA);
    echo $decrypt;
?>
```

### 在 java 或 php 等其他后端语言加密，用云函数解密

#### 用云函数解密

```js
// 加密数据
let key = '12345678901234561234567890123456'; // 必须是固定的32位（只支持数字、英文）
let encrypted = 'es2aF7DWr169X4fvMnlKNg=='; // 待解密的内容
// 解密
let decrypted = vk.crypto.aes.decrypt({
  mode: 'aes-256-ecb',
  data: encrypted, // 待解密的内容
  key: key,
});
console.log('decrypted: ', decrypted);
```

#### 用 java 加密

```java
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class CryptoUtil {
    // 调用示例
    public static void main(String[] args) {
        try {
            String key = "12345678901234561234567890123456"; // 必须是固定的32位（只支持数字、英文）
            String text = "{\"a\":1,\"b\":\"2\"}"; // 待加密的内容
            // 加密
            String encrypted = encrypt(text, key);
            System.out.println("encrypted: " + encrypted);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 解密函数
    private static String decrypt(String encryptedData, String key) throws Exception {
        if (key.length() > 32) {
            key = key.substring(0, 32);
        }
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
    // 加密函数
    private static String encrypt(String data, String key) throws Exception {
        if (key.length() > 32) {
            key = key.substring(0, 32);
        }
        byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);

        byte[] encryptedBytes = cipher.doFinal(dataBytes);
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

}
```

#### 用 php 加密

```php
<?php
    $key = '12345678901234561234567890123456'; // 必须是固定的32位（只支持数字、英文）
    $text = '{"a":1,"b":"2"}'; // 待加密的内容
    // 解密
    $encrypted = base64_encode(openssl_encrypt($text, 'aes-256-ecb', substr($key, 0, 32), OPENSSL_RAW_DATA));
    echo $encrypted;
?>
```
