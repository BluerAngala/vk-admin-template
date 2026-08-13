<template>
	<scroll-view class="sidebar" :class="classCom" scroll-y="true" v-loading="!vk.getVuex('$app.inited')" :style="styleCom">
		<template v-if="vk.getVuex('$app.inited')">
			<template v-for="(group, idx) in menuGroups">
				<!-- 分割线 -->
				<view v-if="group.divider" :key="'d-' + idx" class="menu-divider">
					<view class="menu-divider__line"></view>
					<text class="menu-divider__label">{{ group.label }}</text>
					<view class="menu-divider__line"></view>
				</view>
				<!-- 菜单组 -->
				<vk-data-menu-nav
					v-else-if="group.items.length > 0"
					:key="'m-' + idx"
					:data="group.items"
					:unique-opened="true"
					:collapse="vk.getVuex('$app.leftCollapse')"
					:collapse-transition="false"
					:theme="theme"
					default-menu-icon="el-icon-folder-opened"
					default-sub-menu-icon="el-icon-tickets"
					@select="select"
				></vk-data-menu-nav>
			</template>
		</template>
	</scroll-view>
</template>

<script>
	import config from "@/app.config.js";
	export default {
		data() {
			return {
				theme: config.theme
			}
		},
		methods: {
			select(e){

			},
		},
		// 监听属性
		watch: {
			$route: {
				immediate: true,
				handler(newRoute, oldRoute) {
					let that = this;
					let { vk } = that;
					let { path , query } = newRoute;
					let url = path + vk.pubfn.queryParams(query);
					let route = { path, query, url };
					vk.setVuex('$app.route', route);
				}
			}
		},
		// 计算属性
		computed: {
			menuGroups() {
				let navMenu = vk.getVuex('$app.navMenu') || [];
				let groups = [];
				let current = [];

				for (let i = 0; i < navMenu.length; i++) {
					let item = navMenu[i];
					if (item.type === 'divider') {
						if (current.length > 0) {
							groups.push({ items: current });
							current = [];
						}
						groups.push({ divider: true, label: item.name || '' });
					} else {
						current.push(item);
					}
				}
				if (current.length > 0) {
					groups.push({ items: current });
				}
				return groups;
			},
			styleCom(){
				let theme = this.theme;
				if (theme && theme.use) {
					return theme[theme.use].leftMenu;
				} else {
					return {};
				}
			},
			classCom(){
				let obj = {
					pc: vk.getVuex('$app.isPC'),
					mobile: !vk.getVuex('$app.isPC'),
					collapse: vk.getVuex('$app.leftCollapse'),
				};
				return obj;
			}
		}
	}
</script>

<style lang="scss">
	$sidebar-width: 250px;
	$sidebar-collapse-width: 64px;

	.sidebar {
		position: fixed;
		top: var(--window-top);
		width: $sidebar-width;
		--sidebar-width: #{$sidebar-width};
		--sidebar-collapse-width: #{$sidebar-collapse-width};
		height: calc(100vh - (var(--window-top)) + 50px);
		box-sizing: border-box;
		box-shadow: var(--boxShadow, 2px 0 0px rgba(0,21,4,0.2));
		border-top: var(--borderTop);
		background-color: $left-window-bg-color;
		padding-bottom: 10px;
		top: 50px;
		z-index: 998;
	}
	.sidebar.collapse{
		width: $sidebar-collapse-width;
	}
	.title {
		margin-left: 5px;
	}
	.center{
		text-align: center;
		margin-top: 100px;
	}

	/* 菜单分割线 */
	.menu-divider {
		display: flex;
		align-items: center;
		padding: 8px 20px;
		gap: 8px;
	}

	.menu-divider__line {
		flex: 1;
		height: 1px;
		background-color: rgba(255, 255, 255, 0.12);
	}

	.menu-divider__label {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.4);
		white-space: nowrap;
		letter-spacing: 1px;
	}

	/* 折叠状态隐藏文字 */
	.sidebar.collapse .menu-divider__label {
		display: none;
	}
	.sidebar.collapse .menu-divider {
		padding: 8px 10px;
	}
</style>
