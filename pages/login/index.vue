<template>
	<view class="app login">
		<!-- 页面内容开始 -->
		<view class="content">
			<!-- 头部logo -->
			<view class="header">
				<image class="logo" :src="logoImage"></image>
				<view class="site-title">
					<view class="title-main">AI自动化商务定制化</view>
					<view class="title-sub">智能管理，高效运营</view>
				</view>
			</view>
			<!-- 主体 -->
			<form @submit="submitForm">
				<view class="form-view">
					<view class="form-item form-border">
						<text class="form-label">用户名<text class="required-star">*</text></text>
						<input class="form-input" name="username" v-model="form1.username" type="text" placeholder="请输入用户名" placeholder-style="'color':'#8e8e8e'" required />
					</view>

					<view class="form-item form-border">
						<text class="form-label">密码<text class="required-star">*</text></text>
						<input class="form-input" name="password" v-model="form1.password" type="password" placeholder="请输入密码" placeholder-style="'color':'#8e8e8e'" required />
					</view>

					<view class="captcha-container">
						<!-- 图形验证码 -->
						<uni-captcha scene="login" v-model="form1.captcha"></uni-captcha>
					</view>

					<view class="remember-box">
						<label class="remember-label">
							<checkbox-group @change="checkboxChange">
								<checkbox class="remember-checkbox" value="true" :checked="checked" active-color="#737373" shape="circle"></checkbox>
								<text>记住密码</text>
							</checkbox-group>
						</label>
						<view class="agreement-label">
							<label>
								<checkbox-group @change="agreementChange">
									<checkbox class="agreement-checkbox" value="true" :checked="form1.agreement" active-color="#737373" shape="circle"></checkbox>
									<text>同意</text>
								</checkbox-group>
							</label>
							<text class="agreement-link" @click="openAgreement">《用户协议》</text>
						</view>
					</view>

				</view>
				<view class="login-btn">
					<button class="btn success circle" hover-class="hover" shape="circle" form-type="submit" :plain="false" :hair-line="false" type="success">登 录</button>
				</view>
			</form>
			<!-- 底部信息 -->
			<view class="footer">
				<text @click="register">没有账号？</text>
				<text class="link-text" @click="register">立即注册</text>
			</view>
		</view>

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
let vk = uni.vk;
export default {
	data() {
		return {
			// 表单请求数据
			form1: {
				username: "",
				password: "",
				captcha: "",
				agreement: true,
				needPermission: true
			},
			checked: false, // 是否记住密码
			scrollTop: 0,
			logoImage: "/static/logo.png",
		};
	},
	onPageScroll(e) {
		this.scrollTop = e.scrollTop;
	},
	// 监听 - 页面每次【加载时】执行(如：前进)
	onLoad(options = {}) {
		vk = this.vk;
		this.options = options;
		this.init(options);
	},
	// 监听 - 页面【首次渲染完成时】执行
	onReady() {

	},
	// 监听 - 页面每次【显示时】执行(如：前进和返回)
	onShow() {

	},
	// 监听 - 页面每次【隐藏时】执行(如：返回)
	onHide() {

	},
	// 监听 - 页面下拉刷新
	onPullDownRefresh() {
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	// 函数
	methods: {
		// 页面数据初始化函数
		init(options = {}) {
			let that = this;
			console.log("init: ", options);
			let { login } = vk.getVuex("$user");
			if (login) {
				if (login.username) that.form1.username = login.username;
				if (login.password) {
					that.form1.password = login.password;
					that.checked = true;
				}
			}
			if (!getApp().isAllowLoginBackground()) {
				return false;
			}
			// 如果本地token有效，则再从云端查询一次token是否有效，如果都有效，则直接视为登录成功
			if (vk.checkToken()) {
				vk.userCenter.checkToken({
					loading: true,
					success: data => {
						that.loginSuccess(data);
					}
				});
			}
		},
		// 记住密码 checkbox 改变事件
		checkboxChange(e) {
			let that = this;
			let value = e.detail.value || [];
			if (value.length > 0 && value[0]) {
				that.checked = true;
			} else {
				that.checked = false;
			}
		},
		// 用户协议 checkbox 改变事件
		agreementChange(e) {
			let that = this;
			let value = e.detail.value || [];
			if (value.length > 0 && value[0]) {
				that.form1.agreement = true;
			} else {
				that.form1.agreement = false;
			}
		},
		// 表单提交
		submitForm(e) {
			let that = this;
			// 阻止默认表单提交行为
			if (e) e.preventDefault();
			
			// 验证必填项
			if (!that.form1.agreement) {
				vk.toast('请阅读并同意用户协议', 'none');
				return;
			}
			
			if (!that.form1.username || that.form1.username.trim() === '') {
				vk.toast('请输入用户名', 'none');
				return;
			}
			
			if (!that.form1.password || that.form1.password.trim() === '') {
				vk.toast('请输入密码', 'none');
				return;
			}
			
			if (!that.form1.captcha || that.form1.captcha.trim() === '') {
				vk.toast('请输入验证码', 'none');
				return;
			}
			
			vk.userCenter.login({
				data: that.form1,
				success: data => {
					if (!getApp().isAllowLoginBackground(data.userInfo)) {
						vk.alert("您的账户无登陆权限");
						return false;
					}
					if (that.checked) {
						// 账号密码保存本地缓存
						vk.setVuex("$user.login.username", that.form1.username);
						vk.setVuex("$user.login.password", that.form1.password);
					} else {
						// 删除本地缓存
						vk.setVuex("$user.login.username", "");
						vk.setVuex("$user.login.password", "");
					}
					that.loginSuccess(data);
				}
			});
		},
		//登陆成功
		loginSuccess(data = {}) {
			let { userInfo = {} } = data;
			// 先清空下菜单缓存
			vk.setVuex("$app.inited", false);
			vk.setVuex("$app.navMenu", []);
			// 再执行init函数
			getApp().init();
			// 检查是否有指定跳转的页面
			if (this.options.uniIdRedirectUrl) {
				let uniIdRedirectUrl = decodeURIComponent(this.options.uniIdRedirectUrl);
				if (uniIdRedirectUrl) {
					vk.redirectTo(uniIdRedirectUrl);
					return;
				}
			}
			// 最后跳转到首页或页面返回
			let pages = getCurrentPages();
			if (
				pages.length >= 2 &&
				pages[pages.length - 2] &&
				pages[pages.length - 2].route &&
				pages[pages.length - 2].route.indexOf("login/") == -1
			) {
				// 如果上一个页面不是login目录下的，则调上一个页面
				vk.reLaunch("/" + pages[pages.length - 2].route);
			} else {
				// 否则进入首页
				vk.navigateToHome();
			}
		},
		// 跳转到注册页面
		register() {
			console.log('跳转到注册页面');
			uni.navigateTo({
				url: '/pages/register/register'
			});
		},
		// 打开用户协议
		openAgreement() {
			const url = 'https://bluerangala.feishu.cn/docx/IXoedH1Oso18iDxxjWsck9SBnfb?from=from_copylink';
			// #ifdef H5
			window.open(url, '_blank');
			// #endif
			// #ifndef H5
			uni.navigateTo({
				url: '/pages/webview/webview?url=' + encodeURIComponent(url)
			});
			// #endif
		}
	}
};
</script>

<style lang="scss" scoped>
@import url("@/common/css/main.css");

.login {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	
	.content {
		width: 100%;
		max-width: 30%;
		margin: 0 auto;
	}
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
	.login .content {
		max-width: 100%;
		padding: 0 20rpx;
	}
}

/* 验证码容器样式 */
.captcha-container {
	padding: 0 70rpx;
	margin: 26rpx 0;
	
	/* 调整验证码大小 */
	::v-deep .captcha-img-box,
	::v-deep .captcha-img,
	::v-deep .loding {
		height: 60px !important;
		width: 150px !important;
	}
	
	::v-deep .captcha {
		height: 60px !important;
		line-height: 60px !important;
		font-size: 16px !important;
	}
}

/* 表单标签样式 */
.form-label {
	font-size: 28rpx;
	color: #333333;
	margin-right: 20rpx;
	white-space: nowrap;
}

/* 必填星号样式 */
.required-star {
	color: #ff0000;
	margin-left: 4rpx;
}

/* 记住密码和协议样式 */
.remember-box {
	padding: 0 70rpx;
	margin: 20rpx 0;
	font-size: 28rpx;
	color: rgba(0, 0, 0, 0.7);
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	
	.remember-label,
	.agreement-label {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.agreement-label {
		flex-shrink: 0;
	}
	
	.remember-checkbox,
	.agreement-checkbox {
		transform: scale(0.7);
	}
	
	.agreement-link {
		color: #007AFF;
		text-decoration: none;
		margin-left: 5rpx;
	}
}

/* 头部样式 */
.header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 20px;
	margin-bottom: 40rpx;
	
	.logo {
		width: 80px;
		height: 80px;
		flex-shrink: 0;
	}
	
	.site-title {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
		
		.title-main {
			font-size: 24px;
			font-weight: 600;
			color: #2c3e50;
			line-height: 1.2;
			white-space: nowrap;
		}
		
		.title-sub {
			font-size: 14px;
			color: #8492a6;
			line-height: 1.2;
			white-space: nowrap;
		}
	}
}

/* 移动端头部适配 */
@media screen and (max-width: 768px) {
	.header {
		gap: 15px;
		
		.logo {
			width: 60px;
			height: 60px;
		}
		
		.site-title {
			.title-main {
				font-size: 20px;
			}
			
			.title-sub {
				font-size: 12px;
			}
		}
	}
}

/* 底部链接样式 */
.footer {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	font-size: 28rpx;
	margin-top: 80rpx;
	color: rgba(0, 0, 0, 0.7);
	text-align: center;
	height: 40rpx;
	line-height: 40rpx;
	
	.link-text {
		color: #007AFF;
		margin-left: 10rpx;
		cursor: pointer;
	}
	
	text {
		cursor: pointer;
	}
}
</style>