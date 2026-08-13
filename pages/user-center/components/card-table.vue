<template>
	<vk-data-table
		ref="table"
		:action="action"
		:columns="columns"
		:row-no="true"
		:pagination="true"
	>
		<!-- 卡密列 -->
		<template v-slot:card_code="{ row }">
			<div class="card-code-cell">
				<span class="code-text">{{ row.card_code }}</span>
				<el-button
					type="text"
					icon="el-icon-copy-document"
					size="mini"
					@click="$emit('copy', row.card_code)"
					style="margin-left: 8px;"
				>复制</el-button>
			</div>
		</template>

		<!-- 状态列 -->
		<template v-slot:status="{ row }">
			<el-tag :type="statusTypeMap[row.status] || 'info'" size="small">
				{{ statusTextMap[row.status] || '未知' }}
			</el-tag>
		</template>

		<!-- 产品类型列 -->
		<template v-slot:product_type="{ row }">
			<el-tag :type="row.product_type === 'software' ? 'primary' : 'success'" size="small">
				{{ productTypeMap[row.product_type] || row.product_type }}
			</el-tag>
		</template>

		<!-- 下载地址列 -->
		<template v-slot:download_url="{ row }">
			<div class="download-url-cell">
				<div v-if="row.download_url" style="display: flex; gap: 5px;">
					<el-button type="text" icon="el-icon-download" size="mini" @click="$emit('download', row.download_url)">下载</el-button>
					<el-button type="text" icon="el-icon-copy-document" size="mini" @click="$emit('copy', row.download_url)">复制链接</el-button>
				</div>
				<span v-else style="color: #909399;">-</span>
				<div v-if="row.latest_version" style="margin-top: 5px;">
					<el-tag size="mini" type="success">{{ row.latest_version }}</el-tag>
					<el-button
						v-if="row.version_logs && row.version_logs.length > 0"
						type="text"
						size="mini"
						@click="$emit('show-version-logs', row)"
						style="padding: 0 5px;"
					>查看更新</el-button>
				</div>
			</div>
		</template>
	</vk-data-table>
</template>

<script>
import { cardsTableColumns, statusTypeMap, statusTextMap, productTypeMap } from '../user-center-config.js';

export default {
	data() {
		return {
			action: "admin/card/kh/getMyCards",
			columns: cardsTableColumns,
			statusTypeMap,
			statusTextMap,
			productTypeMap
		};
	},
	methods: {
		refresh() {
			this.$refs.table && this.$refs.table.refresh();
		}
	}
};
</script>

<style lang="scss" scoped>
.download-url-cell {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.card-code-cell {
	display: flex;
	align-items: center;

	.code-text {
		font-family: 'Courier New', monospace;
		color: #303133;
	}
}
</style>
