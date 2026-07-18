<template>
	<view class="page-container">
		<iframe 
			:src="docUrl" 
			class="doc-iframe"
			frameborder="0"
		></iframe>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				docUrl: 'https://bluerangala.feishu.cn/share/base/view/shrcnDB8gaWfCVIhUaCcJ7Edb0c'
			}
		},
		onLoad() {
			// 页面加载时自动加载文档
		},
		methods: {
			
		}
	}
</script>

<style scoped>
.page-container {
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.doc-iframe {
	width: 100%;
	height: 100%;
	border: none;
}
</style>
