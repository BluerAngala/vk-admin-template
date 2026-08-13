<template>
  <el-dialog
    :visible.sync="visible"
    title="联系客服"
    width="400px"
    :close-on-click-modal="true"
    @close="$emit('close')"
  >
    <view class="service-dialog-content">
      <div class="qrcode-container">
        <img :src="qrcodeSrc" class="qrcode-img" />
      </div>
      <p class="service-tips">
        <i class="el-icon-info"></i>
        {{ tips }}
      </p>
      <p class="service-time">工作时间：{{ workTime }}</p>
    </view>
  </el-dialog>
</template>

<script>
export default {
  name: 'ServiceQrcode',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    qrcodeSrc: {
      type: String,
      default: 'static/service-qrcode.png',
    },
    tips: {
      type: String,
      default: '请使用QQ扫描二维码添加客服',
    },
    workTime: {
      type: String,
      default: '9:00 - 18:00',
    },
  },
  computed: {
    visible: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit('update:show', val);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.service-dialog-content {
  text-align: center;
  padding: 20px 0;

  .qrcode-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    .qrcode-img {
      width: 200px;
      height: 200px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
  }

  .service-tips {
    font-size: 14px;
    color: #606266;
    margin: 15px 0 10px;

    i {
      color: #409eff;
      margin-right: 5px;
    }
  }

  .service-time {
    font-size: 13px;
    color: #909399;
    margin: 5px 0;
  }
}
</style>
