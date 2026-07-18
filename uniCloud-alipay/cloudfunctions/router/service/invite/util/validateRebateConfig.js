'use strict';
/**
 * 返利配置验证工具函数
 * 验证阶梯配置的有效性（按累计消费积分）
 */
module.exports = {
  /**
   * 验证单个阶梯配置
   * @param {Object} tier - 阶梯配置
   * @returns {Object} { valid: Boolean, error: String }
   */
  validateTier: (tier) => {
    if (!tier || typeof tier !== 'object') {
      return { valid: false, error: '阶梯配置无效' };
    }
    
    const { level, threshold, rate } = tier;
    
    // 验证 level
    if (!Number.isInteger(level) || level < 1) {
      return { valid: false, error: '阶梯等级必须是正整数' };
    }
    
    // 验证 threshold（累计消费积分门槛，必须大于0）
    if (!Number.isInteger(threshold) || threshold < 1) {
      return { valid: false, error: '累计消费门槛必须是正整数' };
    }
    
    // 验证 rate（返利比例）
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return { valid: false, error: '返利比例必须在 0 到 100 之间' };
    }
    
    return { valid: true, error: null };
  },
  
  /**
   * 验证完整的阶梯配置数组
   * @param {Array} tiers - 阶梯配置数组
   * @returns {Object} { valid: Boolean, error: String }
   */
  validateTiers: (tiers) => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return { valid: false, error: '阶梯配置必须是非空数组' };
    }
    
    // 验证每个阶梯
    for (let i = 0; i < tiers.length; i++) {
      const result = module.exports.validateTier(tiers[i]);
      if (!result.valid) {
        return { valid: false, error: `阶梯 ${i + 1}: ${result.error}` };
      }
    }
    
    // 按 threshold 升序排列
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    
    // 检查 threshold 不重复
    const thresholds = new Set();
    for (const tier of sortedTiers) {
      if (thresholds.has(tier.threshold)) {
        return { valid: false, error: `累计消费门槛 ${tier.threshold} 积分重复` };
      }
      thresholds.add(tier.threshold);
    }
    
    // 检查 rate 随 threshold 递增（或相等）
    for (let i = 1; i < sortedTiers.length; i++) {
      if (sortedTiers[i].rate < sortedTiers[i - 1].rate) {
        return { 
          valid: false, 
          error: `返利比例必须随消费门槛递增：${sortedTiers[i].threshold} 积分的比例不能低于 ${sortedTiers[i - 1].threshold} 积分` 
        };
      }
    }
    
    return { valid: true, error: null };
  },
  
  /**
   * 验证完整的返利配置
   * @param {Object} config - 返利配置
   * @returns {Object} { valid: Boolean, error: String }
   */
  validateConfig: (config) => {
    if (!config || typeof config !== 'object') {
      return { valid: false, error: '配置无效' };
    }
    
    // enabled 字段可选，默认为 true
    if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
      return { valid: false, error: 'enabled 必须是布尔值' };
    }
    
    // 验证 tiers
    return module.exports.validateTiers(config.tiers);
  }
};
