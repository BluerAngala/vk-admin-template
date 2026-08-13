<template>
	<vk-data-table
		ref="table"
		:action="action"
		:columns="columns"
		:row-no="true"
		:pagination="true"
	>
		<!-- 类型列 -->
		<template v-slot:type="{ row }">
			<el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
				{{ row.type === 'income' ? '收入' : '支出' }}
			</el-tag>
		</template>

		<!-- 积分数量列 -->
		<template v-slot:amount="{ row }">
			<span :style="{ color: row.amount > 0 ? '#67C23A' : '#F56C6C' }">
				{{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
			</span>
		</template>

		<!-- 来源列 -->
		<template v-slot:source="{ row }">
			<el-tag size="small" :type="sourceTypeMap[row.source] || ''">
				{{ sourceTextMap[row.source] || row.source }}
			</el-tag>
		</template>
	</vk-data-table>
</template>

<script>
import { pointsTableColumns, sourceTypeMap, sourceTextMap } from '../user-center-config.js';

export default {
	data() {
		return {
			action: "admin/points/kh/getLog",
			columns: pointsTableColumns,
			sourceTypeMap,
			sourceTextMap
		};
	},
	methods: {
		refresh() {
			this.$refs.table && this.$refs.table.refresh();
		}
	}
};
</script>
