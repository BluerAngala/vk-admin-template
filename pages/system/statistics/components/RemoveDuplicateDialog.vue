<template>
  <el-dialog
    title="清理重复卡密"
    :visible.sync="visible"
    width="800px"
    :close-on-click-modal="false"
  >
    <div style="margin-bottom: 20px;">
      <el-alert
        title="此功能用于清理数据库中重复的卡密记录，只保留最新的一条"
        type="info"
        show-icon
        :closable="false"
      >
        <div style="margin-top: 5px;">
          建议先使用预览模式查看重复情况，确认无误后再执行删除操作。
        </div>
      </el-alert>
    </div>

    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
      <el-radio-group v-model="dryRun" :disabled="loading || deleting">
        <el-radio-button :label="true">预览模式</el-radio-button>
        <el-radio-button :label="false">删除模式</el-radio-button>
      </el-radio-group>
      <el-button
        type="primary"
        @click="scanDuplicateCards"
        :loading="loading"
        :disabled="deleting"
      >
        <i class="el-icon-search"></i> 开始扫描
      </el-button>
    </div>

    <div v-if="loading" class="detail-loading">
      <i class="el-icon-loading"></i> 正在扫描数据库...
    </div>

    <div v-else-if="result">
      <!-- 扫描结果摘要 -->
      <el-card shadow="never" style="margin-bottom: 15px;">
        <div slot="header" style="font-weight: 500;">扫描结果</div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="总记录数">{{ result.total }}</el-descriptions-item>
          <el-descriptions-item label="唯一编码数">{{ result.unique_codes }}</el-descriptions-item>
          <el-descriptions-item label="重复编码数">
            <span :style="{ color: result.duplicates_count > 0 ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">
              {{ result.duplicates_count }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="待删除记录数" :span="3">
            <span :style="{ color: result.to_delete_count > 0 ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">
              {{ result.to_delete_count }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 重复详情列表 -->
      <el-card shadow="never" v-if="result.details && result.details.length > 0">
        <div slot="header" style="font-weight: 500;">重复详情（前10条）</div>
        <el-table :data="result.details" border stripe size="small" max-height="300">
          <el-table-column prop="card_code" label="卡密编码" width="200">
            <template slot-scope="scope">
              <span style="font-family: monospace; font-weight: 500;">{{ scope.row.card_code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="重复数量" width="100" align="center">
            <template slot-scope="scope">
              <el-tag type="danger" size="mini">{{ scope.row.count }} 条</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="保留记录" min-width="200">
            <template slot-scope="scope">
              <div style="font-size: 12px;">
                <div>ID: {{ scope.row.keep._id }}</div>
                <div style="color: #909399;">时间: {{ formatTime(scope.row.keep._add_time) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="待删除" min-width="200">
            <template slot-scope="scope">
              <div style="font-size: 12px;">
                <div v-for="(del, idx) in scope.row.delete_list" :key="idx" style="margin-bottom: 4px;">
                  <span style="color: #F56C6C;">{{ del._id }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 执行删除按钮 -->
      <div v-if="!dryRun && result.to_delete_count > 0" style="margin-top: 20px; text-align: center;">
        <el-button
          type="danger"
          size="large"
          @click="executeRemoveDuplicateCards"
          :loading="deleting"
        >
          <i class="el-icon-delete"></i> 确认删除 {{ result.to_delete_count }} 条重复记录
        </el-button>
      </div>
    </div>

    <div v-else style="text-align: center; padding: 40px; color: #909399;">
      <i class="el-icon-info" style="font-size: 48px; margin-bottom: 10px;"></i>
      <div>请选择模式后点击"开始扫描"</div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatDateTime } from '../utils/format.js';

let vk = uni.vk;

export default {
  name: 'RemoveDuplicateDialog',
  data() {
    return {
      visible: false,
      loading: false,
      deleting: false,
      dryRun: true,
      result: null,
    };
  },
  methods: {
    open() {
      this.visible = true;
      this.dryRun = true;
      this.result = null;
    },
    formatTime(ts) {
      return formatDateTime(ts);
    },
    async scanDuplicateCards() {
      this.loading = true;
      this.result = null;
      try {
        const res = await vk.callFunction({
          url: 'admin/card/sys/removeDuplicateCards',
          data: { dry_run: this.dryRun },
        });
        if (res.code === 0) {
          this.result = res.data;
          if (this.dryRun) {
            vk.toast(`预览完成，发现 ${res.data.duplicates_count || 0} 个重复编码`, 'info');
          } else {
            vk.toast(res.msg, 'success');
          }
        } else {
          vk.toast(res.msg || '扫描失败');
        }
      } catch (err) {
        console.error('扫描重复卡密失败：', err);
        vk.toast('扫描失败：' + (err.message || '未知错误'));
      } finally {
        this.loading = false;
      }
    },
    async executeRemoveDuplicateCards() {
      const toDeleteCount = this.result?.to_delete_count || 0;
      if (toDeleteCount === 0) return;
      try {
        await this.$confirm(
          `确定要删除 ${toDeleteCount} 条重复卡密记录吗？\n此操作不可恢复，请谨慎操作！`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'danger',
          }
        );
      } catch {
        return;
      }
      this.deleting = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/card/sys/removeDuplicateCards',
          data: { dry_run: false },
        });
        if (res.code === 0) {
          vk.toast(res.msg, 'success');
          this.result = res.data;
          setTimeout(() => {
            this.scanDuplicateCards();
          }, 500);
        } else {
          vk.toast(res.msg || '删除失败');
        }
      } catch (err) {
        console.error('删除重复卡密失败：', err);
        vk.toast('删除失败：' + (err.message || '未知错误'));
      } finally {
        this.deleting = false;
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
