<template>
  <el-dialog
    title="黑名单管理"
    :visible.sync="visible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 添加黑名单 -->
    <el-card shadow="never" style="margin-bottom: 15px;">
      <div slot="header" style="font-weight: 500;">添加黑名单用户</div>
      <el-form :inline="true" :model="form" size="small">
        <el-form-item label="用户ID" required>
          <el-input
            v-model="form.user_id"
            placeholder="请输入要封禁的用户ID"
            clearable
            style="width: 250px;"
            @keyup.enter.native="addBlacklist"
          ></el-input>
        </el-form-item>
        <el-form-item label="封禁原因">
          <el-input
            v-model="form.reason"
            placeholder="可选，填写封禁原因"
            clearable
            style="width: 250px;"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="addBlacklist" :loading="adding">
            <i class="el-icon-plus"></i> 添加封禁
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 黑名单列表 -->
    <el-card shadow="never">
      <div slot="header" style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 500;">黑名单列表</span>
        <el-button type="primary" size="mini" icon="el-icon-refresh" @click="loadBlacklist" :loading="loading">刷新</el-button>
      </div>
      <div v-if="loading" style="text-align: center; padding: 30px;">
        <i class="el-icon-loading"></i> 加载中...
      </div>
      <el-table
        v-else
        :data="list"
        border
        stripe
        size="small"
        max-height="400"
      >
        <el-table-column prop="user_id" label="用户ID" width="220">
          <template slot-scope="scope">
            <span style="font-family: monospace; font-weight: 500; color: #F56C6C;">{{ scope.row.user_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="封禁原因" min-width="200">
          <template slot-scope="scope">
            {{ scope.row.reason || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="_add_time_str" label="添加时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" style="color: #67C23A;" @click="removeBlacklist(scope.row)">解除封禁</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && list.length === 0" style="text-align: center; padding: 30px; color: #909399;">
        暂无黑名单用户
      </div>
    </el-card>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatDateTime } from '../utils/format.js';

let vk = uni.vk;

export default {
  name: 'BlacklistDialog',
  data() {
    return {
      visible: false,
      loading: false,
      adding: false,
      list: [],
      form: {
        user_id: '',
        reason: '',
      },
    };
  },
  methods: {
    open() {
      this.visible = true;
      this.form = { user_id: '', reason: '' };
      this.loadBlacklist();
    },
    handleClose() {
      // 弹窗关闭时重置状态
    },
    async loadBlacklist() {
      this.loading = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/blacklist/sys/getList',
          data: { pageSize: 200 },
        });
        if (res.code === 0) {
          this.list = (res.data && res.data.rows) || [];
          this.list.forEach(item => {
            item._add_time_str = formatDateTime(item._add_time);
          });
        } else {
          vk.toast(res.msg || '加载失败');
        }
      } catch (err) {
        console.error('加载黑名单失败：', err);
        vk.toast('加载失败');
      } finally {
        this.loading = false;
      }
    },
    async addBlacklist() {
      const user_id = (this.form.user_id || '').trim();
      if (!user_id) {
        vk.toast('请输入用户ID');
        return;
      }
      this.adding = true;
      try {
        const res = await vk.callFunction({
          url: 'admin/blacklist/sys/add',
          data: {
            user_id,
            reason: (this.form.reason || '').trim(),
          },
        });
        if (res.code === 0) {
          vk.toast(res.msg || '添加成功', 'success');
          this.form = { user_id: '', reason: '' };
          this.loadBlacklist();
        } else {
          vk.toast(res.msg || '添加失败');
        }
      } catch (err) {
        console.error('添加黑名单失败：', err);
        vk.toast('添加失败');
      } finally {
        this.adding = false;
      }
    },
    async removeBlacklist(row) {
      try {
        await this.$confirm(
          `确定要解除用户 ${row.user_id} 的封禁吗？`,
          '解除封禁',
          {
            confirmButtonText: '确定解除',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      } catch {
        return;
      }
      try {
        const res = await vk.callFunction({
          url: 'admin/blacklist/sys/delete',
          data: { _id: row._id },
        });
        if (res.code === 0) {
          vk.toast(res.msg || '已解除', 'success');
          this.loadBlacklist();
        } else {
          vk.toast(res.msg || '操作失败');
        }
      } catch (err) {
        console.error('移除黑名单失败：', err);
        vk.toast('操作失败');
      }
    },
  },
};
</script>
