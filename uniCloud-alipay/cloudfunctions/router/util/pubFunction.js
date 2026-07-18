/**
 * 自定义公共函数包
 * 整合各模块导出
 */
const points = require("./points");
const card = require("./card");

let pubFun = {};

/**
 * 公共函数写法示例
 */
pubFun.test = function () {
  let vk = uniCloud.vk;
  let timeStr = vk.pubfn.timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
  return {
    timeStr,
    msg: "这是公共函数test的返回",
  };
};

// ==================== 合并积分模块 ====================
Object.assign(pubFun, points);

// ==================== 合并卡密模块 ====================
Object.assign(pubFun, card);

module.exports = pubFun;
