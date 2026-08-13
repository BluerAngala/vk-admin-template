<template>
	<el-dialog
		:visible.sync="dialogVisible"
		:title="title"
		width="600px"
		class="version-log-dialog"
		@close="dialogVisible = false"
	>
		<div class="version-timeline">
			<div
				v-for="(log, index) in logs"
				:key="index"
				class="version-item"
				:class="{ 'is-latest': index === 0 }"
			>
				<div class="version-header">
					<div class="version-info">
						<span class="version-number">{{ log.version }}</span>
						<el-tag v-if="index === 0" type="success" size="mini" effect="dark">最新版本</el-tag>
					</div>
					<div class="version-date">{{ formatDate(log.date) }}</div>
				</div>
				<div class="version-content">
					<div class="update-log" v-html="formatLog(log.log)"></div>
				</div>
				<div v-if="log.download_url" class="version-download">
					<el-button
						type="primary"
						size="small"
						icon="el-icon-download"
						@click="$emit('download', log.download_url)"
					>下载 {{ log.version }}</el-button>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<script>
import { formatDate, formatLog } from '../user-center-config.js';

export default {
	props: {
		show: { type: Boolean, default: false },
		title: { type: String, default: '' },
		logs: { type: Array, default: () => [] }
	},
	computed: {
		dialogVisible: {
			get() { return this.show; },
			set(val) { this.$emit('update:show', val); }
		}
	},
	methods: {
		formatDate,
		formatLog
	}
};
</script>

<style lang="scss" scoped>
::v-deep .version-log-dialog {
	.el-dialog__body {
		padding: 0 20px 20px;
		max-height: 60vh;
		overflow-y: auto;
	}
}

.version-timeline {
	.version-item {
		position: relative;
		padding: 20px;
		margin-bottom: 20px;
		background: #f5f7fa;
		border-radius: 8px;
		border-left: 4px solid #DCDFE6;

		&.is-latest {
			background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
			border-left-color: #67C23A;
		}

		.version-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
			padding-bottom: 10px;
			border-bottom: 1px solid #E4E7ED;

			.version-info {
				display: flex;
				align-items: center;
				gap: 10px;

				.version-number {
					font-size: 18px;
					font-weight: bold;
					color: #303133;
				}
			}

			.version-date {
				font-size: 13px;
				color: #909399;
			}
		}

		.version-content {
			margin-bottom: 15px;

			::v-deep .update-log {
				.update-list {
					list-style: none;
					padding: 0;
					margin: 0;

					li {
						padding: 8px 0;
						line-height: 1.6;
						color: #606266;
						font-size: 14px;

						&.feature {
							color: #409EFF;
						}

						&.bugfix {
							color: #F56C6C;
						}

						&.optimization {
							color: #E6A23C;
						}

						&.deprecated {
							color: #909399;
							text-decoration: line-through;
						}
					}

					p {
						margin: 8px 0;
						line-height: 1.6;
						color: #606266;
					}
				}
			}
		}

		.version-download {
			text-align: right;
		}
	}
}
</style>
