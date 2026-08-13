<template>
	<div>
		<div v-if="productList.length === 0" class="empty-state">
			<i class="el-icon-box" style="font-size: 64px; color: #DCDFE6;"></i>
			<p style="color: #909399; margin-top: 16px;">暂无可用产品</p>
		</div>
		<div v-else class="product-grid">
			<div
				v-for="product in productList"
				:key="product._id"
				class="product-card-wrapper"
				:class="{ 'is-flipped': flippedCards[product._id] }"
				@click="toggleCardFlip(product._id)"
			>
				<!-- 卡片正面 -->
				<el-card class="product-card product-card-front" shadow="hover">
					<div class="product-image">
						<img
							v-if="hasProductImage(product)"
							:src="getProductImageUrl(product)"
							@error="onImageError"
						>
						<div v-else class="default-image-placeholder">
							<i class="el-icon-picture-outline"></i>
							<span>{{ product.product_name }}</span>
						</div>
					</div>
					<div class="product-header">
						<div class="product-title">
							<i class="el-icon-goods"></i>
							<span>{{ product.product_name }}</span>
						</div>
						<div class="product-tags">
							<el-tag v-if="isCustomProduct(product)" type="warning" size="mini" style="margin-right: 5px;">
								<i class="el-icon-star-on"></i> 定制 3折
							</el-tag>
							<el-tag v-if="product.status === 1" type="success" size="small">已上架</el-tag>
							<el-tag v-else type="info" size="small">已下架</el-tag>
						</div>
					</div>

					<div class="product-info">
						<div class="info-item">
							<span class="label">产品ID：</span>
							<span class="value">{{ product.product_id }}</span>
						</div>
						<div class="info-item">
							<span class="label">产品类型：</span>
							<span class="value">{{ productTypeMap[product.product_type] || product.product_type }}</span>
						</div>
						<div class="info-item">
							<span class="label">收费标准：</span>
							<span class="value price">
								{{ product.price_points }}积分 / {{ product.price_months }}月 / {{ product.price_machines }}机器
							</span>
						</div>
						<div v-if="product.description" class="info-item description">
							<span class="label">描述：</span>
							<span class="value">{{ product.description }}</span>
						</div>
						<div v-if="product.remark" class="info-item description">
							<span class="label">备注：</span>
							<span class="value">{{ product.remark }}</span>
						</div>
					</div>

					<div class="product-footer">
						<div class="click-tip">
							<i class="el-icon-refresh-left"></i>
							点击卡片查看更多
						</div>
					</div>
				</el-card>

				<!-- 卡片背面 -->
				<el-card class="product-card product-card-back" shadow="hover">
					<div class="back-header">
						<h3>{{ product.product_name }}</h3>
						<div class="click-tip-back">
							<i class="el-icon-refresh-right"></i>
							点击返回
						</div>
					</div>

					<div class="back-content">
						<!-- 版本更新日志 -->
						<div v-if="product.version_logs && product.version_logs.length > 0" class="info-section">
							<div class="section-title">
								<i class="el-icon-document"></i>
								版本更新日志
							</div>
							<div class="version-list">
								<div
									v-for="(log, index) in product.version_logs.slice(0, 3)"
									:key="index"
									class="version-item-mini"
								>
									<div class="version-header-mini">
										<el-tag size="mini" :type="index === 0 ? 'success' : ''">{{ log.version }}</el-tag>
										<span class="version-date-mini">{{ formatDate(log.date) }}</span>
									</div>
									<div class="version-log-mini" v-html="formatLogPreview(log.log)"></div>
								</div>
								<el-button
									v-if="product.version_logs.length > 3"
									type="text"
									size="small"
									@click.stop="$emit('show-version-logs', product)"
									style="margin-top: 10px;"
								>查看全部 {{ product.version_logs.length }} 个版本 →</el-button>
							</div>
						</div>

						<!-- 下载地址 -->
						<div v-if="product.download_url" class="info-section">
							<div class="section-title">
								<i class="el-icon-download"></i>
								下载地址
							</div>
							<div class="section-content">
								<el-input
									:value="product.download_url"
									readonly
									size="small"
									@click.native.stop
								>
									<el-button
										slot="append"
										icon="el-icon-copy-document"
										@click.stop="$emit('copy', product.download_url)"
									>复制</el-button>
								</el-input>
								<el-button
									type="primary"
									size="small"
									icon="el-icon-download"
									@click.stop="$emit('download', product.download_url)"
									style="margin-top: 10px; width: 100%;"
								>立即下载</el-button>
							</div>
						</div>

						<!-- 空状态提示 -->
						<div v-if="(!product.version_logs || product.version_logs.length === 0) && !product.download_url" class="empty-tips">
							<i class="el-icon-info"></i>
							<p>暂无更新日志和下载地址</p>
						</div>
					</div>
				</el-card>
			</div>
		</div>
	</div>
</template>

<script>
import { productTypeMap, formatDate, formatLogPreview } from '../user-center-config.js';

export default {
	props: {
		productList: { type: Array, default: () => [] },
		userInfo: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			flippedCards: {},
			productTypeMap
		};
	},
	methods: {
		formatDate,
		formatLogPreview,

		toggleCardFlip(productId) {
			this.$set(this.flippedCards, productId, !this.flippedCards[productId]);
		},

		isCustomProduct(product) {
			if (!product.custom_user_ids || !Array.isArray(product.custom_user_ids)) return false;
			if (product.custom_user_ids.includes('all')) return false;
			return product.custom_user_ids.includes(this.userInfo._id);
		},

		hasProductImage(product) {
			if (!product.product_image) return false;
			if (typeof product.product_image === 'string' && product.product_image.trim()) return true;
			if (typeof product.product_image === 'object') {
				if (product.product_image.url) return true;
				if (product.product_image[0]) return true;
			}
			return false;
		},

		getProductImageUrl(product) {
			if (!product.product_image) return '';
			if (typeof product.product_image === 'string') return product.product_image;
			if (typeof product.product_image === 'object') {
				if (product.product_image.url) return product.product_image.url;
				if (product.product_image[0] && typeof product.product_image[0] === 'string') return product.product_image[0];
				if (product.product_image[0] && product.product_image[0].url) return product.product_image[0].url;
			}
			return '';
		},

		onImageError(e) {
			e.target.style.display = 'none';
		}
	}
};
</script>

<style lang="scss" scoped>
.product-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 20px;
	padding: 10px;
}

.product-card-wrapper {
	perspective: 1000px;
	height: 520px;
	position: relative;
	cursor: pointer;

	.product-card {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
		transform-style: preserve-3d;
	}

	.product-card-front {
		transform: rotateY(0deg);
		z-index: 2;
	}

	.product-card-back {
		transform: rotateY(180deg);
		z-index: 1;
	}

	&.is-flipped {
		.product-card-front {
			transform: rotateY(-180deg);
			z-index: 1;
		}

		.product-card-back {
			transform: rotateY(0deg);
			z-index: 2;
		}
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
}

.product-card {
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-4px);
	}

	.product-image {
		width: 100%;
		height: 180px;
		overflow: hidden;
		margin-bottom: 16px;
		border-radius: 4px;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.default-image-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #fff;
			text-align: center;
			padding: 20px;

			i {
				font-size: 48px;
				margin-bottom: 12px;
				opacity: 0.8;
			}

			span {
				font-size: 16px;
				font-weight: 500;
				opacity: 0.9;
			}
		}
	}

	.product-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #EBEEF5;

		.product-title {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 16px;
			font-weight: bold;
			color: #303133;

			i {
				font-size: 20px;
				color: #409EFF;
			}
		}

		.product-tags {
			display: flex;
			align-items: center;
			gap: 5px;
		}
	}

	.product-info {
		margin-bottom: 16px;

		.info-item {
			display: flex;
			margin-bottom: 8px;
			font-size: 14px;

			.label {
				color: #909399;
				min-width: 80px;
				flex-shrink: 0;
			}

			.value {
				color: #606266;
				flex: 1;

				&.price {
					color: #E6A23C;
					font-weight: bold;
				}
			}

			&.description {
				flex-direction: column;

				.value {
					margin-top: 4px;
					line-height: 1.6;
				}
			}
		}
	}

	.product-footer {
		display: flex;
		justify-content: center;
		padding-top: 12px;
		border-top: 1px solid #EBEEF5;

		.click-tip {
			display: flex;
			align-items: center;
			gap: 5px;
			color: #909399;
			font-size: 13px;

			i {
				font-size: 16px;
			}
		}
	}
}

/* 卡片背面样式 */
.product-card-back {
	display: flex;
	flex-direction: column;
	overflow: hidden;

	::v-deep .el-card__body {
		padding: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.back-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		color: #fff;

		h3 {
			margin: 0;
			font-size: 18px;
			font-weight: bold;
		}

		.click-tip-back {
			display: flex;
			align-items: center;
			gap: 5px;
			font-size: 13px;
			opacity: 0.9;

			i {
				font-size: 16px;
			}
		}
	}

	.back-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;

		.info-section {
			margin-bottom: 20px;

			&:last-child {
				margin-bottom: 0;
			}

			.section-title {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 14px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 12px;
				padding-bottom: 8px;
				border-bottom: 2px solid #409EFF;

				i {
					color: #409EFF;
					font-size: 16px;
				}
			}

			.section-content {
				padding-left: 4px;
			}
		}

		.version-list {
			.version-item-mini {
				padding: 12px;
				margin-bottom: 10px;
				background: #f5f7fa;
				border-radius: 6px;
				border-left: 3px solid #409EFF;

				&:last-child {
					margin-bottom: 0;
				}

				.version-header-mini {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 8px;

					.version-date-mini {
						font-size: 12px;
						color: #909399;
					}
				}

				.version-log-mini {
					font-size: 13px;
					color: #606266;
					line-height: 1.6;

					::v-deep .log-item {
						margin-bottom: 4px;

						&:last-child {
							margin-bottom: 0;
						}
					}
				}
			}
		}

		.empty-tips {
			text-align: center;
			padding: 40px 20px;
			color: #909399;

			i {
				font-size: 48px;
				margin-bottom: 12px;
				display: block;
			}

			p {
				margin: 0;
				font-size: 14px;
			}
		}

		.detail-item {
			display: flex;
			margin-bottom: 10px;
			font-size: 13px;

			&.full {
				flex-direction: column;
			}

			.detail-label {
				color: #909399;
				min-width: 80px;
				flex-shrink: 0;
			}

			.detail-value {
				color: #606266;
				flex: 1;

				&.price {
					color: #E6A23C;
					font-weight: bold;
				}
			}
		}
	}
}
</style>
