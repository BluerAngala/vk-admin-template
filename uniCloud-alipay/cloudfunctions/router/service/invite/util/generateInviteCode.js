'use strict';
/**
 * 邀请码生成工具函数
 * 生成 6 位唯一邀请码（大写字母和数字组合）
 */
module.exports = {
  /**
   * 生成邀请码
   * @param {Object} util - 工具对象
   * @param {Number} maxRetries - 最大重试次数，默认 3
   * @returns {Promise<String>} 生成的邀请码
   */
  generate: async (util, maxRetries = 3) => {
    const { vk, db } = util;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符 I, O, 0, 1
    
    for (let retry = 0; retry < maxRetries; retry++) {
      // 生成 6 位随机邀请码
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 检查邀请码是否已存在
      const existUser = await vk.baseDao.findByWhereJson({
        dbName: 'uni-id-users',
        fieldJson: { _id: true },
        whereJson: { my_invite_code: code }
      });
      
      if (!existUser) {
        return code;
      }
    }
    
    // 重试次数用尽，抛出错误
    throw new Error('邀请码生成失败，请稍后重试');
  },
  
  /**
   * 验证邀请码格式
   * @param {String} code - 邀请码
   * @returns {Boolean} 是否有效
   */
  validate: (code) => {
    if (!code || typeof code !== 'string') {
      return false;
    }
    // 6 位大写字母和数字组合
    const regex = /^[A-Z0-9]{6}$/;
    return regex.test(code);
  }
};
