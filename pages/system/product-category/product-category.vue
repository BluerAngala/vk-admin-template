<template>
  <view class="page-body">
    <el-card>
      <div slot="header" class="card-header">
        <span>产品分类管理</span>
        <div>
          <el-button size="small" icon="el-icon-download" @click="loadPresets" :loading="presetLoading">加载预设</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增分类</el-button>
        </div>
      </div>

      <el-table :data="categoryList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.icon" style="font-size: 20px;" v-if="scope.row.icon"></i>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="分类标识" width="160">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{ scope.row.value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="分类名称" min-width="150" />
        <el-table-column prop="enable" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.enable ? 'success' : 'danger'" size="small">
              {{ scope.row.enable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="_add_time" label="创建时间" width="170">
          <template slot-scope="scope">
            {{ formatTime(scope.row._add_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialog.isEdit ? '编辑分类' : '新增分类'"
      :visible.sync="dialog.show"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="dialog.form" :rules="dialog.rules" ref="categoryForm" label-width="100px">
        <el-form-item label="分类标识" prop="value">
          <el-input
            v-model="dialog.form.value"
            placeholder="英文标识，如 software"
            :disabled="dialog.isEdit"
          />
          <div class="form-tip">创建后不可修改，用于数据库关联</div>
        </el-form-item>
        <el-form-item label="分类名称" prop="label">
          <el-input v-model="dialog.form.label" placeholder="显示名称，如 软件" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="dialog.form.icon" placeholder="Element UI 图标类名，如 el-icon-monitor" />
          <div class="form-tip">
            <i :class="dialog.form.icon" style="margin-right: 4px;" v-if="dialog.form.icon"></i>
            预览效果如左
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialog.form.sort" :min="0" :max="999" />
          <div class="form-tip">数值越小越靠前</div>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="dialog.form.enable" active-text="是" inactive-text="否" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialog.show = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="dialog.loading">确定</el-button>
      </span>
    </el-dialog>
  </view>
</template>

<script>
let vk = uni.vk;

export default {
  data() {
    return {
      loading: false,
      presetLoading: false,
      categoryList: [],
      dialog: {
        show: false,
        isEdit: false,
        loading: false,
        editId: '',
        form: {
          value: '',
          label: '',
          icon: '',
          sort: 0,
          enable: true
        },
        rules: {
          value: [{ required: true, message: '请输入分类标识', trigger: 'blur' }],
          label: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
        }
      }
    };
  },
  onLoad() {
    vk = this.vk;
    this.loadCategories();
  },
  methods: {
    // 加载分类列表
    loadCategories() {
      this.loading = true;
      vk.callFunction({
        url: 'admin/product-category/sys/getList',
        data: {},
        success: (res) => {
          const rows = res.rows || (res.data && res.data.rows) || [];
          this.categoryList = rows;
        },
        fail: (err) => {
          vk.toast(err.msg || '加载失败', 'none');
        },
        complete: () => {
          this.loading = false;
        }
      });
    },

    // 加载预设分类
    loadPresets() {
      this.presetLoading = true;
      vk.callFunction({
        url: 'admin/product-category/sys/initPresets',
        data: {},
        success: (res) => {
          if (res.code === 0) {
            vk.toast(res.msg || '加载成功');
            this.loadCategories();
          } else {
            vk.toast(res.msg || '加载失败', 'none');
          }
        },
        fail: (err) => {
          vk.toast(err.msg || '加载失败', 'none');
        },
        complete: () => {
          this.presetLoading = false;
        }
      });
    },

    // 打开新增弹窗
    handleAdd() {
      this.dialog.isEdit = false;
      this.dialog.editId = '';
      this.dialog.form = {
        value: '',
        label: '',
        icon: '',
        sort: 0,
        enable: true
      };
      this.dialog.show = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },

    // 打开编辑弹窗
    handleEdit(row) {
      this.dialog.isEdit = true;
      this.dialog.editId = row._id;
      this.dialog.form = {
        value: row.value,
        label: row.label,
        icon: row.icon || '',
        sort: row.sort || 0,
        enable: !!row.enable
      };
      this.dialog.show = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },

    // 提交表单
    handleSubmit() {
      this.$refs.categoryForm.validate((valid) => {
        if (!valid) return;

        this.dialog.loading = true;

        if (this.dialog.isEdit) {
          // 编辑
          vk.callFunction({
            url: 'admin/product-category/sys/update',
            data: {
              _id: this.dialog.editId,
              label: this.dialog.form.label,
              icon: this.dialog.form.icon,
              sort: Number(this.dialog.form.sort),
              enable: this.dialog.form.enable
            },
            success: (res) => {
              vk.toast('更新成功');
              this.dialog.show = false;
              this.loadCategories();
            },
            fail: (err) => {
              vk.toast(err.msg || '更新失败', 'none');
            },
            complete: () => {
              this.dialog.loading = false;
            }
          });
        } else {
          // 新增
          vk.callFunction({
            url: 'admin/product-category/sys/add',
            data: {
              value: this.dialog.form.value,
              label: this.dialog.form.label,
              icon: this.dialog.form.icon,
              sort: Number(this.dialog.form.sort),
              enable: this.dialog.form.enable
            },
            success: (res) => {
              vk.toast('添加成功');
              this.dialog.show = false;
              this.loadCategories();
            },
            fail: (err) => {
              vk.toast(err.msg || '添加失败', 'none');
            },
            complete: () => {
              this.dialog.loading = false;
            }
          });
        }
      });
    },

    // 删除分类
    handleDelete(row) {
      this.$confirm(`确定要删除分类 "${row.label}" 吗？`, '确认删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        vk.callFunction({
          url: 'admin/product-category/sys/delete',
          data: { _id: row._id },
          success: (res) => {
            vk.toast('删除成功');
            this.loadCategories();
          },
          fail: (err) => {
            vk.toast(err.msg || '删除失败', 'none');
          }
        });
      }).catch(() => {});
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '-';
      const d = new Date(timestamp);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
