<template>
	<view class="form-content">
		<view class="field">
			<text class="label">用户名 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.username" 
				type="text" 
				placeholder="中文/英文/数字/下划线，3-32位" 
			/>
		</view>

		<view class="field">
			<text class="label">QQ邮箱 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.email" 
				type="text" 
				placeholder="用于找回密码" 
			/>
		</view>

		<view class="field">
			<text class="label">密码 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.password" 
				type="password" 
				placeholder="字母开头，6-18位" 
			/>
		</view>

		<view class="field">
			<text class="label">确认密码 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.password2" 
				type="password" 
				placeholder="再次输入密码" 
			/>
		</view>

		<view class="field">
			<text class="label">验证码 <text class="req">*</text></text>
			<view class="captcha-wrapper">
				<uni-captcha scene="register" v-model="form.captcha"></uni-captcha>
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
			<checkbox-group @change="onAgreementChange">
				<checkbox value="agree" :checked="form.agreement" color="#0891B2" />
			</checkbox-group>
			<text class="checkbox-text">同意</text>
			<text class="link" @click="$emit('open-agreement')">《用户协议》</text>
		</view>

		<view class="btn-primary" @click="handleSubmit">
			<text class="btn-text">{{ loading ? '注册中...' : '注 册' }}</text>
		</view>
	</view>
</template>

<script>
let vk = uni.vk;

export default {
	props: {
		inviteCode: {
			type: String,
			default: ''
		},
		inviterInfo: {
			type: Object,
			default: null
		}
	},
	data() {
		return {
			form: {
				username: "",
				email: "",
				password: "",
				password2: "",
				captcha: "",
				agreement: true
			},
			loading: false
		}
	},
	methods: {
		onAgreementChange(e) {
			let value = e.detail.value || [];
			this.form.agreement = value.length > 0;
		},
		handleSubmit() {
			if (this.loading) return;

			const { agreement, username, email, password, password2, captcha } = this.form;
			
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

			this.loading = true;

			vk.userCenter.register({
				data: {
					username,
					email,
					password,
					captcha,
					inviteCode: this.inviteCode || undefined,
				},
				success: (data) => {
					this.loading = false;
					vk.toast("注册成功，正在自动登录...", "success");
					// 注册成功后自动登录
					vk.userCenter.login({
						data: {
							username: this.form.username,
							password: this.form.password
						},
						success: (loginData) => {
							this.$emit('login-success', loginData);
						},
						fail: (err) => {
							// 自动登录失败，回退到手动登录
							this.$emit('success', { username: this.form.username });
						}
					});
				},
				fail: (err) => {
					this.loading = false;
					vk.toast(err.msg || err.message || "注册失败", "none");
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.form-content {
	padding: 20px 24px;
}

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

.captcha-wrapper {
	flex: 1;
}

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

@media screen and (max-width: 480px) {
	.form-content {
		padding: 16px 20px;
	}
	
	.field {
		flex-direction: column;
		align-items: flex-start;
	}
	
	.label {
		width: auto;
		text-align: left;
		margin-right: 0;
		margin-bottom: 6px;
	}
}
</style>
