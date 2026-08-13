<template>
	<el-card class="user-info-card">
		<div class="user-header">
			<el-avatar :size="80" :src="userInfo.avatar">
				{{ avatarChar }}
			</el-avatar>
			<div class="user-details">
				<div class="user-name">{{ userInfo.nickname || userInfo.username || '未设置昵称' }}</div>
				<div class="user-id">
					ID: {{ userInfo._id }}
					<el-button type="text" icon="el-icon-copy-document" size="mini" @click="$emit('copy', userInfo._id)" style="margin-left: 5px;"></el-button>
				</div>
			</div>
			<div class="user-points-inline">
				<div class="points-stats-inline">
					<div class="points-item-inline">
						<div class="points-label-inline">绑定机器</div>
						<div class="points-value-inline warning">{{ machineStats.total_machines || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">可用积分</div>
						<div class="points-value-inline primary">{{ pointsInfo.available_points || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">累计获得</div>
						<div class="points-value-inline">{{ pointsInfo.total_points || 0 }}</div>
					</div>
					<div class="points-item-inline">
						<div class="points-label-inline">已消耗</div>
						<div class="points-value-inline">{{ pointsInfo.consumed_points || 0 }}</div>
					</div>
				</div>
				<el-button type="text" icon="el-icon-refresh" @click="$emit('refresh')" size="small">刷新</el-button>
			</div>
		</div>
	</el-card>
</template>

<script>
export default {
	props: {
		userInfo: { type: Object, default: () => ({}) },
		pointsInfo: { type: Object, default: () => ({ available_points: 0, total_points: 0, consumed_points: 0 }) },
		machineStats: { type: Object, default: () => ({ total_machines: 0 }) }
	},
	computed: {
		avatarChar() {
			const name = this.userInfo.nickname || this.userInfo.username;
			return name ? name.charAt(0).toUpperCase() : 'U';
		}
	}
};
</script>

<style lang="scss" scoped>
.user-info-card {
	margin-bottom: 20px;
	flex-shrink: 0;

	.user-header {
		display: flex;
		align-items: center;
		gap: 20px;

		.user-details {
			.user-name {
				font-size: 24px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 8px;
			}

			.user-id {
				font-size: 14px;
				color: #909399;
			}
		}

		.user-points-inline {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 15px;
			margin-left: 60px;
			padding-right: 20px;

			.points-stats-inline {
				display: flex;
				gap: 50px;
				padding: 10px 30px;
				background: #f5f7fa;
				border-radius: 8px;

				.points-item-inline {
					text-align: center;
					min-width: 100px;

					.points-label-inline {
						font-size: 12px;
						color: #909399;
						margin-bottom: 5px;
					}

					.points-value-inline {
						font-size: 24px;
						font-weight: bold;
						color: #303133;

						&.primary {
							color: #409EFF;
						}

						&.warning {
							color: #E6A23C;
						}
					}
				}
			}
		}
	}
}
</style>
