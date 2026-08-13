<template>
	<view class="form-content">
		<view class="field">
			<text class="label">用户名 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.username" 
				type="text" 
				placeholder="请输入用户名" 
			/>
		</view>

		<view class="field">
			<text class="label">密码 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.password" 
				type="password" 
				placeholder="请输入密码" 
			/>
		</view>

		<view class="field">
			<text class="label">验证码 <text class="req">*</text></text>
			<view class="captcha-wrapper">
				<uni-captcha scene="login" v-model="form.captcha"></uni-captcha>
			</view>
		</view>

		<view class="checkbox-row">
			<view class="checkbox-item">
				<checkbox-group @change="onCheckboxChange">
					<checkbox value="remember" :checked="checked" color="#0891B2" />
				</checkbox-group>
				<text class="checkbox-text">记住密码</text>
			</view>
			<view class="checkbox-item">
				<checkbox-group @change="onAgreementChange">
					<checkbox value="agree" :checked="form.agreement" color="#0891B2" />
				</checkbox-group>
				<text class="checkbox-text">同意</text>
				<text class="link" @click="$emit('open-agreement')">《用户协议》</text>
			</view>
		</view>

		<view class="btn-primary" @click="handleSubmit">
			<text class="btn-text">登 录</text>
		</view>
	</view>
</template>

<script>
let vk = uni.vk;

export default {
	props: {
		needPermission: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			form: {
				username: "",
				password: "",
				captcha: "",
				agreement: true,
				needPermission: true
			},
			checked: false
		}
	},
	created() {
		// 读取记住的账号密码
		let { login } = vk.getVuex("$user");
		if (login) {
			if (login.username) this.form.username = login.username;
			if (login.password) {
				this.form.password = login.password;
				this.checked = true;
			}
		}
	},
	methods: {
		onCheckboxChange(e) {
			let value = e.detail.value || [];
			this.checked = value.length > 0;
		},
		onAgreementChange(e) {
			let value = e.detail.value || [];
			this.form.agreement = value.length > 0;
		},
		handleSubmit() {
			if (!this.form.agreement) {
				vk.toast('请同意用户协议', 'none');
				return;
			}
			if (!this.form.username || this.form.username.trim() === '') {
				vk.toast('请输入用户名', 'none');
				return;
			}
			if (!this.form.password || this.form.password.trim() === '') {
				vk.toast('请输入密码', 'none');
				return;
			}
			if (!this.form.captcha || this.form.captcha.trim() === '') {
				vk.toast('请输入验证码', 'none');
				return;
			}

			vk.userCenter.login({
				data: this.form,
				success: data => {
					// 保存记住的账号密码
					if (this.checked) {
						vk.setVuex("$user.login.username", this.form.username);
						vk.setVuex("$user.login.password", this.form.password);
					} else {
						vk.setVuex("$user.login.username", "");
						vk.setVuex("$user.login.password", "");
					}
					this.$emit('success', data);
				},
				fail: err => {
					vk.toast(err.msg || err.message || "登录失败", "none");
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
