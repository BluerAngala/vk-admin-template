/**
 * 支付 Service
 * 封装支付全流程：配置加载、订单创建、状态查询、入账、持久化
 */

const PENDING_ORDER_KEY = 'vk_pending_pay_order';
const PENDING_ORDER_TTL = 15 * 60 * 1000; // 15分钟过期

let vk = null;
function getVk() {
  if (!vk) vk = uni.vk;
  return vk;
}

// ==================== 支付配置 ====================

/**
 * 加载支付接口配置
 * @returns {Promise<Object>} payConfig
 */
export async function loadPayConfig() {
  const vk = getVk();
  return new Promise((resolve) => {
    vk.callFunction({
      url: 'admin/points/kh/getPayConfig',
      success: (data) => {
        const cfg = data.data || {};
        const store = cfg.store || {};
        resolve({
          packages: Array.isArray(cfg.packages) ? cfg.packages : [],
          payConfig: {
            base_url: store.base_url || 'https://yunxiangit.com.cn',
            channel_id: store.channel_id || 3,
            query_password: store.query_password || '',
            store_name: store.store_name || '',
            pay_order_path: store.pay_order_path || '/shopApi/Pay/order',
            pay_query_path: store.pay_query_path || '/shopApi/Pay/query',
          },
        });
      },
      fail: () => {
        resolve({
          packages: [],
          payConfig: {
            base_url: 'https://yunxiangit.com.cn',
            channel_id: 3,
            query_password: '',
            store_name: '',
            pay_order_path: '/shopApi/Pay/order',
            pay_query_path: '/shopApi/Pay/query',
          },
        });
      },
    });
  });
}

// ==================== 订单创建 ====================

/**
 * 创建支付订单
 * @param {Object} payConfig - 支付配置
 * @param {Object} pkg - 套餐信息 { goods_key, name, points, price, id }
 * @returns {Promise<{trade_no: string, payurl: string}>}
 */
export async function createOrder(payConfig, pkg) {
  const res = await fetch(`${payConfig.base_url}${payConfig.pay_order_path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goods_key: pkg.goods_key,
      quantity: 1,
      coupon_code: '',
      channel_id: payConfig.channel_id,
      contact: '13' + randomStr(9, '0123456789'),
      query_password: payConfig.query_password,
      select_cards_ids: [],
      extend: { juuid: randomStr(16) },
    }),
  });
  const data = await res.json();
  if (data.code !== 1) {
    throw new Error(data.msg || '创建订单失败');
  }
  return { trade_no: data.data.trade_no, payurl: data.data.payurl };
}

// ==================== 支付查询 ====================

/**
 * 查询支付网关状态
 * @param {Object} payConfig
 * @param {string} tradeNo
 * @returns {Promise<boolean>} 是否已支付
 */
export async function queryPayment(payConfig, tradeNo) {
  const res = await fetch(`${payConfig.base_url}${payConfig.pay_query_path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trade_no: tradeNo }),
  });
  const data = await res.json();
  return data && data.code === 1 && data.msg === 'success';
}

// ==================== 入账 ====================

/**
 * 调云函数入账（带重试）
 * @param {string} tradeNo
 * @param {number} packageId
 * @param {number} maxRetries
 * @returns {Promise<Object>} addPoints 响应
 */
export async function creditPoints(tradeNo, packageId, maxRetries = 3) {
  const vk = getVk();
  let result = null;
  for (let i = 0; i < maxRetries; i++) {
    result = await new Promise((resolve) => {
      vk.callFunction({
        url: 'admin/points/kh/addPoints',
        data: { trade_no: tradeNo, package_id: packageId },
        success: (d) => resolve(d),
        fail: (e) => resolve({ code: -1, msg: e.msg || '充值失败' }),
      });
    });
    if (result.code === 0 || result.code === 1) break;
    if (result.msg && !result.msg.includes('支付验证失败')) break;
    if (i < maxRetries - 1) await sleep(2000);
  }
  return result;
}

// ==================== 自助修复 ====================

/**
 * 自助修复：支付成功但积分未到账
 * @param {string} tradeNo
 * @returns {Promise<Object>} { status, order, msg }
 */
export async function submitRepair(tradeNo) {
  const vk = getVk();
  return new Promise((resolve) => {
    vk.callFunction({
      url: 'admin/points/kh/selfRepair',
      data: { trade_no: tradeNo.trim() },
      success: (d) => resolve(d),
      fail: (e) => resolve({ code: -1, msg: e.msg || '请求失败' }),
    });
  });
}

// ==================== localStorage 持久化 ====================

export function savePendingOrder(tradeNo, payurl, pkg) {
  try {
    uni.setStorageSync(PENDING_ORDER_KEY, JSON.stringify({
      trade_no: tradeNo,
      payurl,
      package_id: pkg.id,
      package_name: pkg.name,
      points: pkg.points,
      price: pkg.price,
      saveTime: Date.now(),
    }));
  } catch (e) {}
}

export function restorePendingOrder() {
  try {
    const raw = uni.getStorageSync(PENDING_ORDER_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !d.trade_no || Date.now() - d.saveTime > PENDING_ORDER_TTL) {
      clearPendingOrder();
      return null;
    }
    return d;
  } catch (e) {
    clearPendingOrder();
    return null;
  }
}

export function clearPendingOrder() {
  try {
    uni.removeStorageSync(PENDING_ORDER_KEY);
  } catch (e) {}
}

// ==================== 工具函数 ====================

function randomStr(len, chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') {
  let r = '';
  for (let i = 0; i < len; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
  return r;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
