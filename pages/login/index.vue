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

			<!-- 标签切换 -->
			<view class="tab-bar">
				<view class="tab-item" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">登 录</view>
				<view class="tab-item" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">注 册</view>
				<view class="tab-item" :class="{ active: activeTab === 'forgot' }" @click="switchTab('forgot')">忘记密码</view>
			</view>

			<!-- 登录表单 -->
			<form v-show="activeTab === 'login'" @submit="submitLoginForm">
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

			<!-- 注册表单 -->
			<form v-show="activeTab === 'register'" @submit="submitRegisterForm">
				<view class="form-view">
					<view class="form-item form-border">
						<text class="form-label">用户名<text class="required-star">*</text></text>
						<input class="form-input" v-model="form3.username" type="text" placeholder="支持中文/英文/数字/下划线，3-32位" placeholder-style="'color':'#8e8e8e'" />
					</view>

					<view class="form-item form-border">
						<text class="form-label">密码<text class="required-star">*</text></text>
						<input class="form-input" v-model="form3.password" type="password" placeholder="请输入密码" placeholder-style="'color':'#8e8e8e'" />
					</view>

					<view class="form-item form-border">
						<text class="form-label">确认密码<text class="required-star">*</text></text>
						<input class="form-input" v-model="form3.password2" type="password" placeholder="请再次输入密码" placeholder-style="'color':'#8e8e8e'" />
					</view>

					<view class="captcha-container">
						<!-- 图形验证码 -->
						<uni-captcha scene="register" v-model="form3.captcha"></uni-captcha>
					</view>

					<!-- 邀请码 -->
					<view class="form-item form-border" v-if="inviteCode || inviterInfo">
						<text class="form-label">邀请人</text>
						<view class="inviter-info" v-if="inviterInfo">
							<text class="inviter-name">{{ inviterInfo.nickname || inviterInfo.username || '用户' }}</text>
							<el-tag size="mini" type="success">已绑定</el-tag>
						</view>
						<text class="invite-code-text" v-else>{{ inviteCode }}</text>
					</view>

					<view class="remember-box">
						<view class="agreement-label">
							<label>
								<checkbox-group @change="registerAgreementChange">
									<checkbox class="agreement-checkbox" value="true" :checked="form3.agreement" active-color="#737373" shape="circle"></checkbox>
									<text>同意</text>
								</checkbox-group>
							</label>
							<text class="agreement-link" @click="openAgreement">《用户协议》</text>
						</view>
					</view>
				</view>
				<view class="login-btn">
					<button class="btn success circle" hover-class="hover" shape="circle" form-type="submit" :plain="false" :hair-line="false" type="success" :loading="registerLoading">注 册</button>
				</view>
			</form>

			<!-- 忘记密码表单 -->
			<view v-show="activeTab === 'forgot'" class="form-view">
				<view class="form-item form-border">
					<text class="form-label">手机号<text class="required-star">*</text></text>
					<input class="form-input" v-model="form2.mobile" type="number" placeholder="请输入注册手机号" placeholder-style="'color':'#8e8e8e'" maxlength="11" />
				</view>

				<view class="form-item form-border code-row">
					<text class="form-label">验证码<text class="required-star">*</text></text>
					<view class="code-input-wrap">
						<input class="form-input code-input" v-model="form2.code" type="number" placeholder="请输入验证码" placeholder-style="'color':'#8e8e8e'" maxlength="6" />
						<button class="code-btn" :disabled="codeBtnDisabled" @click="sendCode">{{ codeBtnText }}</button>
					</view>
				</view>

				<view class="form-item form-border">
					<text class="form-label">新密码<text class="required-star">*</text></text>
					<input class="form-input" v-model="form2.password" type="password" placeholder="请输入新密码" placeholder-style="'color':'#8e8e8e'" />
				</view>

				<view class="form-item form-border">
					<text class="form-label">确认密码<text class="required-star">*</text></text>
					<input class="form-input" v-model="form2.password2" type="password" placeholder="请再次输入新密码" placeholder-style="'color':'#8e8e8e'" />
				</view>

				<view class="login-btn">
					<button class="btn success circle" hover-class="hover" shape="circle" @click="resetPassword" :plain="false" :hair-line="false" type="success">重置密码</button>
				</view>
			</view>

			<!-- 底部信息 -->
			<view class="footer">
				<text v-if="activeTab === 'login'" @click="switchTab('register')">没有账号？</text>
				<text v-if="activeTab === 'login'" class="link-text" @click="switchTab('register')">立即注册</text>
				<text v-if="activeTab === 'register'" @click="switchTab('login')">已有账号？</text>
				<text v-if="activeTab === 'register'" class="link-text" @click="switchTab('login')">立即登录</text>
				<text v-if="activeTab === 'forgot'" @click="switchTab('login')">想起密码了？</text>
				<text v-if="activeTab === 'forgot'" class="link-text" @click="switchTab('login')">返回登录</text>
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
			activeTab: 'login', // 当前激活的标签：login | register | forgot
			// 登录表单
			form1: {
				username: "",
				password: "",
				captcha: "",
				agreement: true,
				needPermission: true
			},
			checked: false, // 是否记住密码
			// 忘记密码表单
			form2: {
				mobile: "",
				code: "",
				password: "",
				password2: ""
			},
			// 注册表单
			form3: {
				username: "",
				password: "",
				password2: "",
				captcha: "",
				agreement: true
			},
			// 验证码按钮
			codeBtnText: "获取验证码",
			codeBtnDisabled: false,
			codeCountdown: 0,
			scrollTop: 0,
			logoImage: "/static/logo.png",
			// 注册相关
			registerLoading: false,
			inviteCode: "",
			inviterInfo: null,
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
		// 如果还没有邀请码，再次尝试解析
		if (!this.inviteCode) {
			const inviteCode = this.parseInviteCode({});
			if (inviteCode) {
				this.setInviteCode(inviteCode);
			}
		}
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
		// 切换标签
		switchTab(tab) {
			this.activeTab = tab;
		},
		// 统一解析邀请码的方法
		parseInviteCode(options = {}) {
			// 优先从options中获取
			if (options.inviteCode) {
				return options.inviteCode;
			}
			// H5环境下，从URL hash中解析邀请码
			// #ifdef H5
			if (window.location && window.location.hash) {
				const hash = window.location.hash;
				const hashMatch = hash.match(/[?&]inviteCode=([^&#]+)/);
				if (hashMatch && hashMatch[1]) {
					return decodeURIComponent(hashMatch[1]);
				}
			}
			// #endif
			return null;
		},
		// 设置邀请码并加载邀请人信息
		setInviteCode(code) {
			if (code && code !== this.inviteCode) {
				this.inviteCode = code;
				this.loadInviterInfo(code);
			}
		},
		// 加载邀请人信息
		loadInviterInfo(code) {
			let that = this;
			vk.callFunction({
				url: 'user/pub/getUserInfoByInviteCode',
				data: { code: code },
				success: (data) => {
					if (data.userInfo) {
						that.inviterInfo = data.userInfo;
					}
				},
				fail: (err) => {
					console.warn('获取邀请人信息失败：', err);
				}
			});
		},
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
			// 处理邀请码
			const inviteCode = options.inviteCode || this.parseInviteCode(options);
			if (inviteCode) {
				this.setInviteCode(inviteCode);
			}
			// 处理 tab 参数，支持从邀请链接直接跳转到注册标签
			if (options.tab === 'register') {
				this.activeTab = 'register';
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
		// 用户协议 checkbox 改变事件（登录）
		agreementChange(e) {
			let that = this;
			let value = e.detail.value || [];
			if (value.length > 0 && value[0]) {
				that.form1.agreement = true;
			} else {
				that.form1.agreement = false;
			}
		},
		// 用户协议 checkbox 改变事件（注册）
		registerAgreementChange(e) {
			let that = this;
			let value = e.detail.value || [];
			if (value.length > 0 && value[0]) {
				that.form3.agreement = true;
			} else {
				that.form3.agreement = false;
			}
		},
		// 登录表单提交
		submitLoginForm(e) {
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
		// 登陆成功
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
		// 注册表单提交
		submitRegisterForm(e) {
			let that = this;
			if (e) e.preventDefault();

			if (that.registerLoading) {
				return false;
			}
			const { agreement, username, password, password2, captcha } = that.form3;
			if (!agreement) {
				vk.toast("请阅读并同意用户协议", "none");
				return;
			}
			if (!username || username.trim() === "") {
				vk.toast("请输入用户名", "none");
				return;
			}
			// 验证用户名：支持中文、英文、数字和下划线，长度3-32
			const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{3,32}$/;
			if (!usernameRegex.test(username)) {
				vk.toast("用户名长度在3~32之间，可以包含中文、英文、数字和下划线", "none");
				return;
			}
			if (!vk.pubfn.test(password, "pwd")) {
				vk.toast("密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线", "none");
				return;
			}
			if (!vk.pubfn.test(password2, "pwd")) {
				vk.toast("密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线", "none");
				return;
			}
			if (password != password2) {
				vk.toast("两次密码必须相同!", "none");
				return;
			}
			if (!captcha || captcha.trim() === "") {
				vk.toast("请输入图形验证码", "none");
				return;
			}
			that.registerLoading = true;

			// 调用注册接口
			vk.userCenter.register({
				data: {
					username: username,
					password: password,
					captcha: captcha,
					inviteCode: that.inviteCode || undefined,
				},
				success: (data) => {
					that.registerLoading = false;
					vk.toast("注册成功", "success");
					// 注册成功后自动填入用户名到登录表单
					that.form1.username = username;
					that.form1.password = "";
					that.form1.captcha = "";
					that.activeTab = 'login';
				},
				fail: (err) => {
					that.registerLoading = false;
				}
			});
		},
		// 发送短信验证码
		sendCode() {
			let that = this;
			let { mobile } = that.form2;
			if (!mobile || mobile.trim() === '') {
				vk.toast('请输入手机号', 'none');
				return;
			}
			if (!/^1\d{10}$/.test(mobile)) {
				vk.toast('手机号格式不正确', 'none');
				return;
			}
			// 发送验证码
			vk.callFunction({
				url: 'user/pub/sendSmsCode',
				data: {
					mobile: mobile,
					type: 'reset-pwd',
					checkUserExist: 'exists' // 必须已注册的手机号
				},
				loading: true,
				success: (res) => {
					vk.toast('验证码已发送', 'success');
					that.startCountdown();
				}
			});
		},
		// 开始倒计时
		startCountdown() {
			let that = this;
			that.codeBtnDisabled = true;
			that.codeCountdown = 60;
			that.codeBtnText = `${that.codeCountdown}s后重新获取`;
			let timer = setInterval(() => {
				that.codeCountdown--;
				if (that.codeCountdown <= 0) {
					clearInterval(timer);
					that.codeBtnDisabled = false;
					that.codeBtnText = '获取验证码';
				} else {
					that.codeBtnText = `${that.codeCountdown}s后重新获取`;
				}
			}, 1000);
		},
		// 重置密码
		resetPassword() {
			let that = this;
			let { mobile, code, password, password2 } = that.form2;
			// 表单验证
			if (!mobile || mobile.trim() === '') {
				vk.toast('请输入手机号', 'none');
				return;
			}
			if (!/^1\d{10}$/.test(mobile)) {
				vk.toast('手机号格式不正确', 'none');
				return;
			}
			if (!code || code.trim() === '') {
				vk.toast('请输入验证码', 'none');
				return;
			}
			if (!password || password.trim() === '') {
				vk.toast('请输入新密码', 'none');
				return;
			}
			if (password.length < 6) {
				vk.toast('密码长度不能少于6位', 'none');
				return;
			}
			if (password !== password2) {
				vk.toast('两次输入的密码不一致', 'none');
				return;
			}
			// 调用重置密码接口
			vk.callFunction({
				url: 'user/pub/resetPasswordByMobile',
				data: {
					mobile: mobile,
					code: code,
					password: password
				},
				loading: true,
				success: (res) => {
					vk.toast('密码重置成功，请登录', 'success');
					// 清空表单并切换到登录标签
					that.form2 = {
						mobile: "",
						code: "",
						password: "",
						password2: ""
					};
					that.activeTab = 'login';
				}
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

/* 标签栏样式 */
.tab-bar {
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin: 30rpx 0 40rpx;
	border-bottom: 2rpx solid #e5e5e5;
	
	.tab-item {
		padding: 20rpx 30rpx;
		font-size: 30rpx;
		color: #666;
		cursor: pointer;
		position: relative;
		
		&.active {
			color: #007AFF;
			font-weight: 600;
			
			&::after {
				content: '';
				position: absolute;
				bottom: -2rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 60%;
				height: 4rpx;
				background-color: #007AFF;
				border-radius: 2rpx;
			}
		}
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

/* 验证码行样式 */
.code-row {
	.code-input-wrap {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		gap: 10rpx;
		
		.code-input {
			flex: 1;
		}
		
		.code-btn {
			flex-shrink: 0;
			font-size: 24rpx;
			padding: 10rpx 20rpx;
			background-color: #007AFF;
			color: #fff;
			border-radius: 8rpx;
			white-space: nowrap;
			
			&[disabled] {
				background-color: #ccc;
			}
		}
	}
}

/* 邀请人信息样式 */
.inviter-info {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10rpx;
	
	.inviter-name {
		font-size: 28rpx;
		color: #333;
	}
}

.invite-code-text {
	font-size: 28rpx;
	color: #666;
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
