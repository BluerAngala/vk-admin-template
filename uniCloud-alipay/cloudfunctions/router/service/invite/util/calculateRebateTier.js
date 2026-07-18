'use strict';
/**
 * 返利阶梯计算工具函数
 * 根据被邀请人累计消费积分确定返利阶梯和比例
 */

// 默认返利阶梯配置（按累计消费积分）
// threshold: 累计消费积分门槛
// rate: 返利比例（百分比）
const DEFAULT_TIERS = [
  { level: 1, threshold: 1000, rate: 10 },    // 1000积分起，10%
  { level: 2, threshold: 3000, rate: 20 },    // 3000积分起，20%
  { level: 3, threshold: 5000, rate: 30 },    // 5000积分起，30%
  { level: 4, threshold: 8000, rate: 50 }     // 8000积分起，50%
];

module.exports = {
  /**
   * 获取返利配置
   * @param {Object} util - 工具对象
   * @returns {Promise<Object>} 返利配置
   */
  getConfig: async (util) => {
    const { vk } = util;
    
    const config = await vk.baseDao.findByWhereJson({
      dbName: 'vk-global-data',
      whereJson: { key: 'invite_rebate_config' }
    });
    
    if (config && config.value) {
      return config.value;
    }
    
    // 返回默认配置
    return {
      enabled: true,
      tiers: DEFAULT_TIERS
    };
  },
  
  /**
   * 根据累计消费积分确定返利阶梯
   * @param {Number} totalConsumePoints - 累计消费积分
   * @param {Array} tiers - 阶梯配置数组
   * @returns {Object|null} 当前阶梯信息，不满足最低门槛返回 null
   */
  getTier: (totalConsumePoints, tiers = DEFAULT_TIERS) => {
    const points = totalConsumePoints || 0;
    
    // 按 threshold 降序排列，找到第一个满足条件的阶梯
    const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);
    
    for (const tier of sortedTiers) {
      if (points >= tier.threshold) {
        return {
          level: tier.level,
          threshold: tier.threshold,
          rate: tier.rate
        };
      }
    }
    
    // 不满足任何阶梯门槛，返回 null（无返利）
    return null;
  },
  
  /**
   * 获取下一阶梯信息
   * @param {Number} totalConsumePoints - 当前累计消费积分
   * @param {Array} tiers - 阶梯配置数组
   * @returns {Object|null} 下一阶梯信息，如果已是最高阶梯返回 null
   */
  getNextTier: (totalConsumePoints, tiers = DEFAULT_TIERS) => {
    const points = totalConsumePoints || 0;
    
    // 按 threshold 升序排列
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    
    for (const tier of sortedTiers) {
      if (points < tier.threshold) {
        return {
          level: tier.level,
          threshold: tier.threshold,
          rate: tier.rate,
          remaining: tier.threshold - points
        };
      }
    }
    
    return null;
  },
  
  /**
   * 计算返利积分
   * @param {Number} consumePoints - 消费积分数量
   * @param {Number} rebateRate - 返利比例（百分比）
   * @returns {Number} 返利积分
   */
  calculateRebatePoints: (consumePoints, rebateRate) => {
    if (!consumePoints || consumePoints <= 0 || !rebateRate || rebateRate <= 0) {
      return 0;
    }
    // 返利积分 = 消费积分 * 返利比例 / 100，向下取整
    return Math.floor(consumePoints * rebateRate / 100);
  },
  
  /**
   * 获取默认阶梯配置
   * @returns {Array} 默认阶梯配置
   */
  getDefaultTiers: () => {
    return [...DEFAULT_TIERS];
  }
};
