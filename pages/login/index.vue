<template>
	<view class="login-page">
		<view class="login-card">
			<!-- 头部 -->
			<view class="card-header">
				<image class="logo" :src="logoImage"></image>
				<view class="header-text">
					<text class="title">AI自动化商务定制化</text>
					<text class="subtitle">智能管理，高效运营</text>
				</view>
			</view>

			<!-- 标签栏 -->
			<view class="tabs">
				<view 
					v-for="tab in tabs" 
					:key="tab.key"
					:class="['tab-btn', activeTab === tab.key ? 'active' : '']"
					@click="switchTab(tab.key)"
				>
					<text class="tab-text">{{ tab.label }}</text>
				</view>
			</view>

			<!-- 表单区域 -->
			<scroll-view class="form-area" scroll-y>
				<!-- 注册表单 -->
				<view v-if="activeTab === 'register'" class="form-content">
					<view class="field">
						<text class="label">用户名 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form3.username" 
							type="text" 
							placeholder="中文/英文/数字/下划线，3-32位" 
						/>
					</view>

					<view class="field">
						<text class="label">QQ邮箱 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form3.email" 
							type="text" 
							placeholder="用于找回密码" 
						/>
					</view>

					<view class="field">
						<text class="label">密码 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form3.password" 
							type="password" 
							placeholder="字母开头，6-18位" 
						/>
					</view>

					<view class="field">
						<text class="label">确认密码 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form3.password2" 
							type="password" 
							placeholder="再次输入密码" 
						/>
					</view>

					<view class="field">
						<text class="label">验证码 <text class="req">*</text></text>
						<view class="captcha-wrapper">
							<uni-captcha scene="register" v-model="form3.captcha"></uni-captcha>
						</view>
					</view>

					<view class="field" v-if="inviteCode || inviterInfo">
						<text class="label">邀请人</text>
						<view v-if="inviterInfo" class="inviter">
							<text>{{ inviterInfo.nickname || inviterInfo.username || '用户' }}</text>
							<text class="badge">已绑定</text>
						</view>
						<text v-else class="inviter-code">{{ inviteCode }}</text>
					</view>

					<view class="checkbox-field">
						<checkbox-group @change="registerAgreementChange">
							<checkbox value="agree" :checked="form3.agreement" color="#0891B2" />
						</checkbox-group>
						<text class="checkbox-text">同意</text>
						<text class="link" @click="openAgreement">《用户协议》</text>
					</view>

					<view class="btn-primary" @click="submitRegisterForm">
						<text class="btn-text">{{ registerLoading ? '注册中...' : '注 册' }}</text>
					</view>
				</view>

				<!-- 登录表单 -->
				<view v-if="activeTab === 'login'" class="form-content">
					<view class="field">
						<text class="label">用户名 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form1.username" 
							type="text" 
							placeholder="请输入用户名" 
						/>
					</view>

					<view class="field">
						<text class="label">密码 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form1.password" 
							type="password" 
							placeholder="请输入密码" 
						/>
					</view>

					<view class="field">
						<text class="label">验证码 <text class="req">*</text></text>
						<view class="captcha-wrapper">
							<uni-captcha scene="login" v-model="form1.captcha"></uni-captcha>
						</view>
					</view>

					<view class="checkbox-row">
						<view class="checkbox-item">
							<checkbox-group @change="checkboxChange">
								<checkbox value="remember" :checked="checked" color="#0891B2" />
							</checkbox-group>
							<text class="checkbox-text">记住密码</text>
						</view>
						<view class="checkbox-item">
							<checkbox-group @change="agreementChange">
								<checkbox value="agree" :checked="form1.agreement" color="#0891B2" />
							</checkbox-group>
							<text class="checkbox-text">同意</text>
							<text class="link" @click="openAgreement">《用户协议》</text>
						</view>
					</view>

					<view class="btn-primary" @click="submitLoginForm">
						<text class="btn-text">登 录</text>
					</view>
				</view>

				<!-- 忘记密码表单 -->
				<view v-if="activeTab === 'forgot'" class="form-content">
					<view class="field">
						<text class="label">QQ邮箱 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form2.email" 
							type="text" 
							placeholder="请输入注册时的QQ邮箱" 
						/>
					</view>

					<view class="field">
						<text class="label">验证码 <text class="req">*</text></text>
						<view class="code-row">
							<input 
								class="input code-input" 
								v-model="form2.code" 
								type="number" 
								placeholder="邮箱验证码" 
								maxlength="6" 
							/>
							<view 
								:class="['btn-code', codeBtnDisabled ? 'disabled' : '']" 
								@click="sendEmailCode"
							>
								<text class="btn-code-text">{{ codeBtnText }}</text>
							</view>
						</view>
					</view>

					<view class="field">
						<text class="label">新密码 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form2.password" 
							type="password" 
							placeholder="请输入新密码" 
						/>
					</view>

					<view class="field">
						<text class="label">确认密码 <text class="req">*</text></text>
						<input 
							class="input" 
							v-model="form2.password2" 
							type="password" 
							placeholder="再次输入新密码" 
						/>
					</view>

					<view class="btn-primary" @click="resetPassword">
						<text class="btn-text">重置密码</text>
					</view>
				</view>
			</scroll-view>

			<!-- 底部链接 -->
			<view class="footer">
				<text v-if="activeTab === 'login'" class="footer-text">没有账号？</text>
				<text v-if="activeTab === 'login'" class="footer-link" @click="switchTab('register')">立即注册</text>
				<text v-if="activeTab === 'register'" class="footer-text">已有账号？</text>
				<text v-if="activeTab === 'register'" class="footer-link" @click="switchTab('login')">立即登录</text>
				<text v-if="activeTab === 'forgot'" class="footer-text">想起密码了？</text>
				<text v-if="activeTab === 'forgot'" class="footer-link" @click="switchTab('login')">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script>
let vk = uni.vk;
export default {
	data() {
		return {
			activeTab: 'login',
			tabs: [
				{ key: 'register', label: '注册' },
				{ key: 'login', label: '登录' },
				{ key: 'forgot', label: '忘记密码' }
			],
			form1: {
				username: "",
				password: "",
				captcha: "",
				agreement: true,
				needPermission: true
			},
			checked: false,
			form2: {
				email: "",
				code: "",
				password: "",
				password2: ""
			},
			form3: {
				username: "",
				email: "",
				password: "",
				password2: "",
				captcha: "",
				agreement: true
			},
			codeBtnText: "获取验证码",
			codeBtnDisabled: false,
			codeCountdown: 0,
			logoImage: "/static/logo.png",
			registerLoading: false,
			inviteCode: "",
			inviterInfo: null,
		};
	},
	onLoad(options = {}) {
		vk = this.vk;
		this.options = options;
		this.init(options);
	},
	onShow() {
		if (!this.inviteCode) {
			const inviteCode = this.parseInviteCode({});
			if (inviteCode) {
				this.setInviteCode(inviteCode);
			}
		}
	},
	onPullDownRefresh() {
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	methods: {
		switchTab(tab) {
			this.activeTab = tab;
		},
		parseInviteCode(options = {}) {
			if (options.inviteCode) {
				return options.inviteCode;
			}
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
		setInviteCode(code) {
			if (code && code !== this.inviteCode) {
				this.inviteCode = code;
				this.loadInviterInfo(code);
			}
		},
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
		init(options = {}) {
			let that = this;
			let { login } = vk.getVuex("$user");
			if (login) {
				if (login.username) that.form1.username = login.username;
				if (login.password) {
					that.form1.password = login.password;
					that.checked = true;
				}
			}
			const inviteCode = options.inviteCode || this.parseInviteCode(options);
			if (inviteCode) {
				this.setInviteCode(inviteCode);
			}
			if (options.tab === 'register') {
				this.activeTab = 'register';
			}
			if (!getApp().isAllowLoginBackground()) {
				return false;
			}
			if (vk.checkToken()) {
				vk.userCenter.checkToken({
					loading: true,
					success: data => {
						that.loginSuccess(data);
					}
				});
			}
		},
		checkboxChange(e) {
			let value = e.detail.value || [];
			this.checked = value.length > 0;
		},
		agreementChange(e) {
			let value = e.detail.value || [];
			this.form1.agreement = value.length > 0;
		},
		registerAgreementChange(e) {
			let value = e.detail.value || [];
			this.form3.agreement = value.length > 0;
		},
		submitLoginForm() {
			let that = this;
			
			if (!that.form1.agreement) {
				vk.toast('请同意用户协议', 'none');
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
						vk.setVuex("$user.login.username", that.form1.username);
						vk.setVuex("$user.login.password", that.form1.password);
					} else {
						vk.setVuex("$user.login.username", "");
						vk.setVuex("$user.login.password", "");
					}
					that.loginSuccess(data);
				}
			});
		},
		loginSuccess(data = {}) {
			let { userInfo = {} } = data;
			vk.setVuex("$app.inited", false);
			vk.setVuex("$app.navMenu", []);
			getApp().init();
			if (this.options.uniIdRedirectUrl) {
				let uniIdRedirectUrl = decodeURIComponent(this.options.uniIdRedirectUrl);
				if (uniIdRedirectUrl) {
					vk.redirectTo(uniIdRedirectUrl);
					return;
				}
			}
			let pages = getCurrentPages();
			if (
				pages.length >= 2 &&
				pages[pages.length - 2] &&
				pages[pages.length - 2].route &&
				pages[pages.length - 2].route.indexOf("login/") == -1
			) {
				vk.reLaunch("/" + pages[pages.length - 2].route);
			} else {
				vk.navigateToHome();
			}
		},
		submitRegisterForm() {
			let that = this;

			if (that.registerLoading) {
				return false;
			}
			const { agreement, username, email, password, password2, captcha } = that.form3;
			if (!agreement) {
				vk.toast("请同意用户协议", "none");
				return;
			}
			if (!username || username.trim() === "") {
				vk.toast("请输入用户名", "none");
				return;
			}
			const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{3,32}$/;
			if (!usernameRegex.test(username)) {
				vk.toast("用户名格式不正确", "none");
				return;
			}
			if (!email || email.trim() === "") {
				vk.toast("请输入QQ邮箱", "none");
				return;
			}
			const emailRegex = /^[1-9]\d{4,10}@qq\.com$/;
			if (!emailRegex.test(email)) {
				vk.toast("请输入正确的QQ邮箱", "none");
				return;
			}
			if (!vk.pubfn.test(password, "pwd")) {
				vk.toast("密码以字母开头，6-18位", "none");
				return;
			}
			if (!vk.pubfn.test(password2, "pwd")) {
				vk.toast("密码以字母开头，6-18位", "none");
				return;
			}
			if (password != password2) {
				vk.toast("两次密码不一致", "none");
				return;
			}
			if (!captcha || captcha.trim() === "") {
				vk.toast("请输入验证码", "none");
				return;
			}
			that.registerLoading = true;

			vk.userCenter.register({
				data: {
					username: username,
					email: email,
					password: password,
					captcha: captcha,
					inviteCode: that.inviteCode || undefined,
				},
				success: (data) => {
					that.registerLoading = false;
					vk.toast("注册成功", "success");
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
		sendEmailCode() {
			let that = this;
			let { email } = that.form2;
			if (!email || email.trim() === '') {
				vk.toast('请输入QQ邮箱', 'none');
				return;
			}
			const emailRegex = /^[1-9]\d{4,10}@qq\.com$/;
			if (!emailRegex.test(email)) {
				vk.toast('请输入正确的QQ邮箱', 'none');
				return;
			}
			vk.callFunction({
				url: 'user/pub/sendEmailCode',
				data: {
					email: email,
					type: 'reset-pwd',
					serviceType: 'qq',
					checkUserExist: 'exists'
				},
				loading: true,
				success: (res) => {
					vk.toast('验证码已发送', 'success');
					that.startCountdown();
				}
			});
		},
		startCountdown() {
			let that = this;
			that.codeBtnDisabled = true;
			that.codeCountdown = 60;
			that.codeBtnText = that.codeCountdown + 's';
			let timer = setInterval(() => {
				that.codeCountdown--;
				if (that.codeCountdown <= 0) {
					clearInterval(timer);
					that.codeBtnDisabled = false;
					that.codeBtnText = '获取验证码';
				} else {
					that.codeBtnText = that.codeCountdown + 's';
				}
			}, 1000);
		},
		resetPassword() {
			let that = this;
			let { email, code, password, password2 } = that.form2;
			if (!email || email.trim() === '') {
				vk.toast('请输入QQ邮箱', 'none');
				return;
			}
			const emailRegex = /^[1-9]\d{4,10}@qq\.com$/;
			if (!emailRegex.test(email)) {
				vk.toast('请输入正确的QQ邮箱', 'none');
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
				vk.toast('两次密码不一致', 'none');
				return;
			}
			vk.callFunction({
				url: 'user/pub/resetPasswordByEmail',
				data: {
					email: email,
					code: code,
					password: password
				},
				loading: true,
				success: (res) => {
					vk.toast('密码重置成功', 'success');
					that.form2 = {
						email: "",
						code: "",
						password: "",
						password2: ""
					};
					that.activeTab = 'login';
				}
			});
		},
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
.login-page {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: #F1F5F9;
	padding: 20px;
	box-sizing: border-box;
}

.login-card {
	width: 100%;
	max-width: 560px;
	background-color: #FFFFFF;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	max-height: 100%;
}

/* Header */
.card-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 24px;
	border-bottom-width: 1px;
	border-bottom-color: #E2E8F0;
	border-bottom-style: solid;
}

.logo {
	width: 48px;
	height: 48px;
	border-radius: 8px;
	margin-right: 16px;
}

.header-text {
	display: flex;
	flex-direction: column;
}

.title {
	font-size: 18px;
	font-weight: 600;
	color: #0F172A;
	line-height: 24px;
}

.subtitle {
	font-size: 13px;
	color: #64748B;
	margin-top: 2px;
}

/* Tabs */
.tabs {
	display: flex;
	flex-direction: row;
	background-color: #F8FAFC;
	padding: 12px 24px 0;
}

.tab-btn {
	flex: 1;
	padding: 10px 16px;
	text-align: center;
	background-color: transparent;
	border-radius: 8px 8px 0 0;
}

.tab-btn.active {
	background-color: #FFFFFF;
	position: relative;
}

.tab-btn.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 20%;
	right: 20%;
	height: 2px;
	background-color: #0891B2;
}

.tab-text {
	font-size: 14px;
	color: #64748B;
}

.tab-btn.active .tab-text {
	color: #0891B2;
	font-weight: 600;
}

/* Form Area */
.form-area {
	height: calc(100vh - 240px);
	min-height: 300px;
	max-height: 420px;
	overflow: hidden;
}

.form-content {
	padding: 20px 24px;
}

/* Fields */
.field {
	margin-bottom: 16px;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.label {
	font-size: 14px;
	font-weight: 500;
	color: #334155;
	width: 70px;
	text-align: right;
	margin-right: 12px;
	flex-shrink: 0;
}

.req {
	color: #EF4444;
}

.input {
	flex: 1;
	height: 40px;
	padding-left: 12px;
	padding-right: 12px;
	font-size: 14px;
	color: #0F172A;
	background-color: #F8FAFC;
	border-width: 1px;
	border-color: #E2E8F0;
	border-style: solid;
	border-radius: 8px;
}

.input:focus {
	border-color: #0891B2;
	background-color: #FFFFFF;
}

/* Captcha */
.captcha-wrapper {
	flex: 1;
}

/* Code Row */
.code-row {
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.code-input {
	flex: 1;
	margin-right: 8px;
}

.btn-code {
	width: 110px;
	height: 40px;
	background-color: #0891B2;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-code.disabled {
	background-color: #CBD5E1;
}

.btn-code-text {
	font-size: 13px;
	color: #FFFFFF;
}

/* Checkbox */
.checkbox-field {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
	margin-bottom: 16px;
	padding: 0 20px;
	box-sizing: border-box;
}

.checkbox-row {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-bottom: 16px;
	padding: 0 20px;
	box-sizing: border-box;
}

.checkbox-item {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.checkbox-text {
	font-size: 13px;
	color: #64748B;
	margin-left: 4px;
}

.link {
	font-size: 13px;
	color: #0891B2;
	font-weight: 500;
}

/* Inviter */
.inviter {
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.badge {
	font-size: 11px;
	color: #059669;
	background-color: #ECFDF5;
	padding: 2px 8px;
	border-radius: 4px;
	margin-left: 8px;
}

.inviter-code {
	flex: 1;
	font-size: 14px;
	color: #64748B;
}

/* Button */
.btn-primary {
	width: 100%;
	height: 44px;
	background-color: #0891B2;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-text {
	font-size: 15px;
	font-weight: 600;
	color: #FFFFFF;
}

/* Footer */
.footer {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 16px 24px;
	background-color: #F8FAFC;
	border-top-width: 1px;
	border-top-color: #E2E8F0;
	border-top-style: solid;
}

.footer-text {
	font-size: 13px;
	color: #64748B;
}

.footer-link {
	font-size: 13px;
	font-weight: 500;
	color: #0891B2;
	margin-left: 4px;
}

/* Responsive */
@media screen and (max-width: 480px) {
	.login-page {
		padding: 12px;
	}
	
	.card-header {
		padding: 20px;
	}
	
	.tabs {
		padding: 10px 20px 0;
	}
	
	.form-content {
		padding: 16px 20px;
	}
	
	.footer {
		padding: 14px 20px;
	}
}
</style>
