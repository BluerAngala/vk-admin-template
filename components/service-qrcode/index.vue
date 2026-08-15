<template>
  <vk-data-dialog
    v-model="visible"
    title="联系客服"
    width="400px"
    :close-on-click-modal="true"
  >
    <view class="service-dialog-content">
      <div class="qrcode-container">
        <img :src="qrcodeImg" class="qrcode-img" />
      </div>
      <p class="service-tips">
        <i class="el-icon-info"></i>
        {{ tips }}
      </p>
      <p class="service-time">工作时间：{{ workTime }}</p>
    </view>
    <template v-slot:footer="{ close }">
      <el-button @click="close">关闭</el-button>
    </template>
  </vk-data-dialog>
</template>

<script>
// 用 require 引入图片，这是 uni-app 自定义组件中引用本地图片的正确方式
const defaultQrcode = require('@/static/service-qrcode.png');

export default {
  name: 'ServiceQrcode',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    qrcodeSrc: {
      type: String,
      default: '',
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
    qrcodeImg() {
      return this.qrcodeSrc || defaultQrcode;
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
