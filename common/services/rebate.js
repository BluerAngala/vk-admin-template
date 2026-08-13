/**
 * 返利/邀请 Service
 * 封装邀请信息、阶梯配置、返利记录查询
 */

let vk = null;
function getVk() {
  if (!vk) vk = uni.vk;
  return vk;
}

/**
 * 加载邀请信息（邀请码、链接、人数、当前阶梯）
 * @returns {Promise<Object>}
 */
export async function loadInviteInfo() {
  const vk = getVk();
  return new Promise((resolve) => {
    vk.callFunction({
      url: 'user/pub/getInviteLink',
      needLogin: true,
      success: (data) => resolve(data.data || {}),
      fail: () => resolve({}),
    });
  });
}

/**
 * 加载邀请统计 + 最近返利记录
 * @returns {Promise<{statistics: Object, recentRebates: Array}>}
 */
export async function loadInviteStatistics() {
  const vk = getVk();
  return new Promise((resolve) => {
    vk.callFunction({
      url: 'user/pub/getInviteStatistics',
      needLogin: true,
      success: (data) => {
        const d = data.data || {};
        resolve({
          statistics: d,
          recentRebates: d.recentRebates || [],
        });
      },
      fail: () => resolve({ statistics: {}, recentRebates: [] }),
    });
  });
}

/**
 * 加载阶梯配置
 * @returns {Promise<Array>} tiers
 */
export async function loadTierConfig() {
  const vk = getVk();
  return new Promise((resolve) => {
    vk.callFunction({
      url: 'invite/pub/getConfig',
      success: (data) => resolve((data.data && data.data.tiers) || []),
      fail: () => resolve([]),
    });
  });
}

/**
 * 计算阶梯进度百分比（纯计算）
 * @param {Object} currentTier - 当前阶梯 { threshold }
 * @param {Object} nextTier - 下一阶梯 { threshold }
 * @param {number} totalConsumePoints - 累计消费积分
 * @returns {number} 0-100
 */
export function calcTierProgress(currentTier, nextTier, totalConsumePoints) {
  if (!nextTier || !currentTier) return 100;
  const current = totalConsumePoints || 0;
  const currentThreshold = currentTier.threshold;
  const nextThreshold = nextTier.threshold;
  if (nextThreshold <= currentThreshold) return 100;
  const progress = ((current - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}
