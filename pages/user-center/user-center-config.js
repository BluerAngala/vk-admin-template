/**
 * 个人中心页面配置常量
 */

// 状态类型映射
export const statusTypeMap = {
	0: "success",  // 未使用
	1: "info",     // 已使用
	2: "danger",   // 已过期
	3: "warning"   // 已禁用
};

// 状态文本映射
export const statusTextMap = {
	0: "未使用",
	1: "已使用",
	2: "已过期",
	3: "已禁用"
};

// 来源类型映射
export const sourceTypeMap = {
	'recharge': 'success',
	'card_buy': 'warning',
	'card_renew': 'warning',
	'buy_product': 'success',
	'reward': 'success',
	'refund': 'info'
};

// 来源文本映射
export const sourceTextMap = {
	'recharge': '充值',
	'card_buy': '购买卡密',
	'card_renew': '续费卡密',
	'buy_product': '购买产品',
	'reward': '奖励',
	'refund': '退款'
};

// 产品类型映射
export const productTypeMap = {
	'software': '软件',
	'plugin': '浏览器插件',
	'normal': '通用'
};

// 格式化日期
export function formatDate(timestamp) {
	if (!timestamp) return '-';
	const d = new Date(timestamp);
	const pad = n => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 格式化更新日志（完整版）
export function formatLog(log) {
	if (!log) return '';

	const lines = log.split('\n').map(line => {
		line = line.trim();
		if (!line) return '';

		if (/^[•\-\*]\s*/.test(line)) {
			line = line.replace(/^[•\-\*]\s*/, '');
			if (/^(新增|添加|增加)/.test(line)) return `<li class="feature">✨ ${line}</li>`;
			if (/^(修复|修正|解决)/.test(line)) return `<li class="bugfix">🐛 ${line}</li>`;
			if (/^(优化|改进|提升)/.test(line)) return `<li class="optimization">⚡ ${line}</li>`;
			if (/^(删除|移除|废弃)/.test(line)) return `<li class="deprecated">🗑️ ${line}</li>`;
			return `<li>${line}</li>`;
		}

		return `<p>${line}</p>`;
	}).filter(Boolean);

	return `<ul class="update-list">${lines.join('')}</ul>`;
}

// 格式化更新日志预览（卡片背面，前3行）
export function formatLogPreview(log) {
	if (!log) return '';

	return log.split('\n').filter(l => l.trim()).slice(0, 3).map(line => {
		line = line.trim().replace(/^[•\-\*]\s*/, '');
		if (/^(新增|添加|增加)/.test(line)) return `<div class="log-item">✨ ${line}</div>`;
		if (/^(修复|修正|解决)/.test(line)) return `<div class="log-item">🐛 ${line}</div>`;
		if (/^(优化|改进|提升)/.test(line)) return `<div class="log-item">⚡ ${line}</div>`;
		return `<div class="log-item">${line}</div>`;
	}).join('');
}

// 积分流水表格列配置
export const pointsTableColumns = [
	{ key: "type", title: "类型", type: "text", width: 100, slot: true },
	{ key: "amount", title: "积分数量", type: "text", width: 120, slot: true },
	{ key: "balance", title: "余额", type: "text", width: 120 },
	{ key: "source", title: "来源", type: "text", width: 120, slot: true },
	{ key: "remark", title: "说明", type: "text", minWidth: 200 },
	{ key: "_add_time", title: "时间", type: "time", width: 180 }
];

// 卡密表格列配置
export const cardsTableColumns = [
	{ key: "card_code", title: "卡密", type: "text", width: 250, slot: true },
	{ key: "product_name", title: "产品名称", type: "text", width: 150 },
	{ key: "product_type", title: "产品类型", type: "text", width: 120, slot: true },
	{ key: "download_url", title: "下载地址", type: "text", width: 200, slot: true },
	{ key: "status", title: "状态", type: "text", width: 100, slot: true },
	{ key: "_add_time", title: "购买时间", type: "time", width: 180 },
	{ key: "used_time", title: "开始使用时间", type: "time", width: 180, defaultValue: "-" },
	{ key: "expire_time", title: "卡密过期时间", type: "time", width: 180, defaultValue: "-" }
];
