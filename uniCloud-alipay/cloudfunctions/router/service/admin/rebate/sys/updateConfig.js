'use strict';
module.exports = {
  /**
   * 更新返利配置
   * @url admin/rebate/sys/updateConfig 前端调用的url参数地址
   * @description 更新返利阶梯配置
   * data 请求参数 说明
   * @param {Boolean} enabled 是否启用
   * @param {Array} tiers 阶梯配置数组
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { vk, db, _ } = util;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    
    let { enabled, tiers } = data;
    
    // 验证配置
    const validateRebateConfig = vk.require('service/invite/util/validateRebateConfig');
    const validateResult = validateRebateConfig.validateConfig({ enabled, tiers });
    
    if (!validateResult.valid) {
      return { code: -1, msg: validateResult.error };
    }
    
    // 按 threshold 升序排列并重新编号 level
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    sortedTiers.forEach((tier, index) => {
      tier.level = index + 1;
    });
    
    const configData = {
      enabled: enabled !== false,
      tiers: sortedTiers
    };
    
    // 查找现有配置
    const existConfig = await vk.baseDao.findByWhereJson({
      dbName: 'vk-global-data',
      whereJson: { key: 'invite_rebate_config' }
    });
    
    if (existConfig) {
      // 更新配置
      await vk.baseDao.updateById({
        dbName: 'vk-global-data',
        id: existConfig._id,
        dataJson: { value: configData }
      });
    } else {
      // 创建配置
      await vk.baseDao.add({
        dbName: 'vk-global-data',
        dataJson: {
          key: 'invite_rebate_config',
          value: configData,
          _add_time: Date.now()
        }
      });
    }
    
    res.msg = '配置更新成功';
    
    // 业务逻辑结束-----------------------------------------------------------
    return res;
  }
};
