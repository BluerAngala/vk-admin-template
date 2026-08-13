<template>
	<view class="form-content">
		<view class="field">
			<text class="label">QQ邮箱 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.email" 
				type="text" 
				placeholder="请输入注册时的QQ邮箱" 
			/>
		</view>

		<view class="field">
			<text class="label">验证码 <text class="req">*</text></text>
			<view class="code-row">
				<input 
					class="input code-input" 
					v-model="form.code" 
					type="number" 
					placeholder="邮箱验证码" 
					maxlength="6" 
				/>
				<view 
					:class="['btn-code', codeBtnDisabled ? 'disabled' : '']" 
					@click="sendCode"
				>
					<text class="btn-code-text">{{ codeBtnText }}</text>
				</view>
			</view>
		</view>

		<view class="field">
			<text class="label">新密码 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.password" 
				type="password" 
				placeholder="请输入新密码" 
			/>
		</view>

		<view class="field">
			<text class="label">确认密码 <text class="req">*</text></text>
			<input 
				class="input" 
				v-model="form.password2" 
				type="password" 
				placeholder="再次输入新密码" 
			/>
		</view>

		<view class="btn-primary" @click="handleSubmit">
			<text class="btn-text">重置密码</text>
		</view>
	</view>
</template>

<script>
let vk = uni.vk;

export default {
	data() {
		return {
			form: {
				email: "",
				code: "",
				password: "",
				password2: ""
			},
			codeBtnText: "获取验证码",
			codeBtnDisabled: false,
			codeCountdown: 0
		}
	},
	methods: {
		sendCode() {
			let { email } = this.form;
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
					this.startCountdown();
				}
			});
		},
		startCountdown() {
			this.codeBtnDisabled = true;
			this.codeCountdown = 60;
			this.codeBtnText = this.codeCountdown + 's';
			let timer = setInterval(() => {
				this.codeCountdown--;
				if (this.codeCountdown <= 0) {
					clearInterval(timer);
					this.codeBtnDisabled = false;
					this.codeBtnText = '获取验证码';
				} else {
					this.codeBtnText = this.codeCountdown + 's';
				}
			}, 1000);
		},
		handleSubmit() {
			let { email, code, password, password2 } = this.form;
			
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
					email,
					code,
					password
				},
				loading: true,
				success: (res) => {
					vk.toast('密码重置成功', 'success');
					this.form = {
						email: "",
						code: "",
						password: "",
						password2: ""
					};
					this.$emit('success');
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
