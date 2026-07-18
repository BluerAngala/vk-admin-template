'use strict';
module.exports = {
  /**
   * 获取返利配置（管理端）
   * @url admin/rebate/sys/getConfig 前端调用的url参数地址
   * @description 获取返利阶梯配置
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {Object} data 返回数据
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { vk, db, _ } = util;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    
    // 获取返利配置
    const calculateRebateTier = vk.require('service/invite/util/calculateRebateTier');
    const config = await calculateRebateTier.getConfig(util);
    
    res.data = {
      enabled: config.enabled !== false,
      tiers: config.tiers || calculateRebateTier.getDefaultTiers()
    };
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
