<template>
  <el-dialog
    title="查询订单状态"
    :visible.sync="visible"
    width="900px"
    :close-on-click-modal="false"
  >
    <el-form :inline="true" :model="form">
      <el-form-item label="订单号">
        <el-input
          v-model="form.trade_no"
          placeholder="请输入订单号（如：LD260117VX6DPE）"
          clearable
          style="width: 300px;"
          @keyup.enter.native="checkOrderStatus"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="checkOrderStatus" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>

    <div v-if="loading" class="detail-loading">
      <i class="el-icon-loading"></i> 查询中...
    </div>
    <div v-else-if="result">
      <!-- 诊断结果 -->
      <el-alert
        :title="result.diagnosis"
        :type="result.canManualRecharge ? 'warning' : (result.order.status === 'success' ? 'success' : 'error')"
        show-icon
        style="margin-bottom: 20px;"
      ></el-alert>

      <!-- 订单信息 -->
      <el-card shadow="never" style="margin-bottom: 15px;">
        <div slot="header" style="font-weight: 500;">订单信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ result.order.trade_no }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag
              :type="result.order.status === 'success' ? 'success' : (result.order.status === 'failed' ? 'danger' : 'warning')"
              size="small"
            >
              {{ result.order.status === 'pending' ? '待支付' :
                 result.order.status === 'paid' ? '已支付待充值' :
                 result.order.status === 'success' ? '充值成功' : '充值失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="套餐名称">{{ result.order.package_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="基础积分">{{ result.order.points || 0 }}</el-descriptions-item>
          <el-descriptions-item label="赠送积分">{{ result.order.bonus || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总积分">
            <span style="color: #67C23A; font-weight: 500;">{{ (result.order.points || 0) + (result.order.bonus || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ result.order._add_time_str }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ result.order._update_time_str }}</el-descriptions-item>
          <el-descriptions-item label="失败原因" v-if="result.order.fail_reason" :span="2">
            <span style="color: #F56C6C;">{{ result.order.fail_reason }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 用户信息 -->
      <el-card shadow="never" style="margin-bottom: 15px;" v-if="result.userInfo">
        <div slot="header" style="font-weight: 500;">用户信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="用户ID">{{ result.order.user_id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ result.userInfo.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ result.userInfo.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ result.userInfo.mobile || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 积分账户 -->
      <el-card shadow="never" style="margin-bottom: 15px;" v-if="result.userPoints">
        <div slot="header" style="font-weight: 500;">积分账户</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="可用积分">
            <span style="color: #409EFF; font-weight: 500;">{{ result.userPoints.available_points || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="总积分">{{ result.userPoints.total_points || 0 }}</el-descriptions-item>
          <el-descriptions-item label="已消耗">{{ result.userPoints.consumed_points || 0 }}</el-descriptions-item>
          <el-descriptions-item label="冻结积分">{{ result.userPoints.frozen_points || 0 }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 积分流水 -->
      <el-card shadow="never" v-if="result.pointsLog">
        <div slot="header" style="font-weight: 500;">积分流水记录</div>
        <el-table :data="result.pointsLog" border stripe size="small">
          <el-table-column prop="_add_time_str" label="时间" width="180"></el-table-column>
          <el-table-column prop="amount" label="积分数量" width="100" align="right">
            <template slot-scope="scope">
              <span style="color: #67C23A; font-weight: 500;">+{{ scope.row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="操作后余额" width="120" align="right"></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
        </el-table>
      </el-card>
      <el-card shadow="never" v-else>
        <div style="text-align: center; padding: 20px; color: #909399;">
          <i class="el-icon-warning" style="font-size: 48px; margin-bottom: 10px;"></i>
          <div>未找到积分流水记录（积分未发放）</div>
        </div>
      </el-card>

      <!-- 手动补发按钮 -->
      <div v-if="result.canManualRecharge" style="margin-top: 20px; text-align: center;">
        <el-button
          type="danger"
          @click="manualRechargeFromOrder"
          :loading="recharging"
        >
          手动补发积分
        </el-button>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
let vk = uni.vk;

export default {
  name: 'CheckOrderDialog',
  data() {
    return {
      visible: false,
      loading: false,
      recharging: false,
      form: {
        trade_no: '',
      },
      result: null,
    };
  },
  methods: {
    open() {
      this.visible = true;
      this.form.trade_no = '';
      this.result = null;
    },
    async checkOrderStatus() {
      const trade_no = (this.form.trade_no || '').trim();
      if (!trade_no) {
        vk.toast('请输入订单号');
        return;
      }
      this.loading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/checkOrderStatus',
          data: { trade_no },
        });
        if (res.code === 0) {
          this.result = res.data;
        } else {
          vk.toast(res.msg || '查询失败');
          this.result = null;
        }
      } catch (err) {
        console.error('查询订单状态失败：', err);
        vk.toast('查询失败：' + (err.message || '未知错误'));
        this.result = null;
      } finally {
        this.loading = false;
      }
    },
    async manualRechargeFromOrder() {
      const result = this.result;
      if (!result || !result.order) return;
      const order = result.order;
      const totalPoints = (order.points || 0) + (order.bonus || 0);
      try {
        await this.$confirm(
          `确定要手动补发积分吗？\n订单号：${order.trade_no}\n积分数量：${totalPoints}`,
          '确认补发',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      } catch {
        return;
      }
      this.recharging = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/points/sys/recharge',
          data: {
            user_id: order.user_id,
            order_id: order.trade_no,
            amount: totalPoints,
            remark: `手动补发：${order.package_name}`,
          },
        });
        if (res.code === 0) {
          vk.toast('补发成功', 'success');
          await this.checkOrderStatus();
          this.$emit('refresh');
        } else {
          vk.toast(res.msg || '补发失败');
        }
      } catch (err) {
        console.error('补发失败：', err);
        vk.toast('补发失败：' + (err.message || '未知错误'));
      } finally {
        this.recharging = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>
