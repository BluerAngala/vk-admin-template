<template>
  <el-dialog
    title="手动充值积分"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="用户">
        <span style="font-weight: 500;">{{ userName }}</span>
        <span style="color: #909399; margin-left: 10px;">ID: {{ userId }}</span>
      </el-form-item>
      <el-form-item label="当前余额">
        <span style="color: #409EFF; font-weight: 500;">{{ currentBalance }} 积分</span>
      </el-form-item>
      <el-form-item label="订单号" required>
        <el-input
          v-model="form.order_id"
          placeholder="请输入充值订单号（如：LD2512233FGCIK）"
          maxlength="50"
          style="width: 300px;"
        ></el-input>
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">订单号用于防止重复充值</div>
      </el-form-item>
      <el-form-item label="充值积分" required>
        <el-input-number
          v-model="form.amount"
          :min="1"
          :max="999999"
          style="width: 200px;"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          placeholder="请输入备注（可选）"
          maxlength="200"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submitRecharge" :loading="loading">确认充值</el-button>
    </span>
  </el-dialog>
</template>

<script>
let vk = uni.vk;

export default {
  name: 'RechargeDialog',
  data() {
    return {
      visible: false,
      loading: false,
      userId: '',
      userName: '',
      currentBalance: 0,
      form: {
        order_id: '',
        amount: 100,
        remark: '',
      },
    };
  },
  methods: {
    open(row) {
      this.userId = row.user_id;
      this.userName = row.user_display_name;
      this.currentBalance = row.available_points || 0;
      this.form = { order_id: '', amount: 100, remark: '' };
      this.visible = true;
    },
    async submitRecharge() {
      const orderId = (this.form.order_id || '').trim();
      if (!orderId) {
        vk.toast('请输入订单号');
        return;
      }
      if (!this.form.amount || this.form.amount <= 0) {
        vk.toast('请输入有效的充值积分数量');
        return;
      }
      try {
        await this.$confirm(
          `确定要给用户 ${this.userName} 充值 ${this.form.amount} 积分吗？\n订单号：${orderId}`,
          '确认充值',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      } catch {
        return;
      }
      this.loading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/recharge',
          data: {
            user_id: this.userId,
            order_id: orderId,
            amount: this.form.amount,
            remark: this.form.remark || '',
          },
        });
        if (res.code === 0) {
          vk.toast('充值成功', 'success');
          this.visible = false;
          this.$emit('refresh');
        } else {
          vk.toast(res.msg || '充值失败');
        }
      } catch (err) {
        console.error('充值失败：', err);
        vk.toast('充值失败：' + (err.message || '未知错误'));
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
