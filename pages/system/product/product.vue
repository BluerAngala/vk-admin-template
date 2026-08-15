<template>
  <view class="page-body">
    <!-- 表格搜索组件 -->
    <vk-data-table-query
      v-model="queryForm1.formData"
      :columns="queryForm1.columns"
      @search="search"
    >
      <template slot="right-btns">
        <el-button
          v-if="isAdmin"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="addBtn"
          >新增产品</el-button
        >
        <el-button
          v-if="isAdmin"
          type="primary"
          icon="el-icon-edit"
          @click="batchEditBtn"
          :disabled="table1.multipleSelection.length === 0"
          >批量修改</el-button
        >
        <el-button
          v-if="isAdmin"
          type="warning"
          icon="el-icon-refresh"
          @click="migrateCustomUsersToPurchased"
          >执行数据迁移</el-button
        >
      </template>
    </vk-data-table-query>

    <!-- 表格组件 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :query-form-param="queryForm1"
      :right-btns="isAdmin ? ['update', 'delete'] : []"
      :custom-right-btns="isAdmin ? table1.customRightBtns : []"
      :row-no="true"
      :pagination="true"
      :selection="isAdmin"
      @update="editBtn"
      @delete="deleteBtn"
      @selection-change="selectionChange"
    >
      <!-- 产品图列 -->
      <template v-slot:product_image="{ row }">
        <el-image
          v-if="getImageUrl(row.product_image)"
          :src="getImageUrl(row.product_image)"
          :preview-src-list="[getImageUrl(row.product_image)]"
          style="width: 80px; height: 80px; border-radius: 4px"
          fit="cover"
        >
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
        <div v-else class="no-image">
          <i class="el-icon-picture-outline"></i>
        </div>
      </template>

      <!-- 状态列 -->
      <template v-slot:status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          active-text="上架"
          inactive-text="下架"
          @change="changeStatus(row)"
        ></el-switch>
      </template>

      <!-- 收费标准列 -->
      <template v-slot:price_standard="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'price_standard'"
          @click.stop
          @keyup.esc.native="cancelCellEdit"
          style="display: flex; gap: 5px; align-items: center;"
          tabindex="0"
        >
          <el-input-number
            v-model="editingCell.priceData.price_points"
            :min="1"
            size="mini"
            style="flex: 1"
            :controls="false"
            placeholder="积分"
            @keyup.esc.native="cancelCellEdit"
            @blur="handlePriceStandardBlur(row)"
          ></el-input-number>
          <span style="color: #909399; font-size: 12px;">积分 /</span>
          <el-input-number
            v-model="editingCell.priceData.price_months"
            :min="1"
            size="mini"
            style="flex: 1"
            :controls="false"
            placeholder="月"
            @keyup.esc.native="cancelCellEdit"
            @blur="handlePriceStandardBlur(row)"
          ></el-input-number>
          <span style="color: #909399; font-size: 12px;">月 /</span>
          <el-input-number
            v-model="editingCell.priceData.price_machines"
            :min="1"
            size="mini"
            style="flex: 1"
            :controls="false"
            placeholder="机器"
            @keyup.esc.native="cancelCellEdit"
            @blur="handlePriceStandardBlur(row)"
          ></el-input-number>
          <span style="color: #909399; font-size: 12px;">机器</span>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-check"
            @click="savePriceStandard(row)"
            style="margin-left: 5px;"
          ></el-button>
          <el-button
            type="default"
            size="mini"
            icon="el-icon-close"
            @click="cancelCellEdit"
          ></el-button>
        </div>
        <div
          v-else
          @dblclick="startPriceStandardEdit(row)"
          style="cursor: pointer; min-height: 40px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          <div style="color: #e6a23c; font-weight: bold">
            {{ row.price_points }}积分 / {{ row.price_months }}月 /
            {{ row.price_machines }} 机器
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            单价：{{ calculateBasePrice(row) }}积分/月/机器
          </div>
        </div>
      </template>

      <!-- 产品名称列 -->
      <template v-slot:product_name="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'product_name'"
          @click.stop
          :data-editing-cell="`${row._id}-product_name`"
        >
          <el-input
            v-model="editingCell.value"
            size="mini"
            @blur="handleBlur(row, 'product_name')"
            @keyup.enter.native="saveCellEdit(row)"
            @keyup.esc.native="cancelCellEdit"
            autofocus
          ></el-input>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'product_name', row.product_name)"
          style="cursor: pointer; min-height: 20px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          {{ row.product_name }}
        </div>
      </template>

      <!-- 产品描述列 -->
      <template v-slot:description="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'description'"
          @click.stop
          :data-editing-cell="`${row._id}-description`"
        >
          <el-input
            v-model="editingCell.value"
            type="textarea"
            :rows="2"
            size="mini"
            @blur="handleBlur(row, 'description')"
            @keyup.ctrl.enter.native="saveCellEdit(row)"
            @keyup.esc.native="cancelCellEdit"
            autofocus
          ></el-input>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'description', row.description || '')"
          style="cursor: pointer; min-height: 20px; word-break: break-word;"
          :title="isAdmin ? '双击编辑' : (row.description || '')"
        >
          {{ row.description || '-' }}
        </div>
      </template>

      <!-- 下载地址列 -->
      <template v-slot:download_url="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'download_url'"
          @click.stop
          :data-editing-cell="`${row._id}-download_url`"
        >
          <el-input
            v-model="editingCell.value"
            size="mini"
            @blur="handleBlur(row, 'download_url')"
            @keyup.enter.native="saveCellEdit(row)"
            @keyup.esc.native="cancelCellEdit"
            autofocus
          ></el-input>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'download_url', row.download_url || '')"
          style="cursor: pointer; min-height: 20px; word-break: break-all;"
          :title="isAdmin ? '双击编辑' : (row.download_url || '')"
        >
          {{ row.download_url || '-' }}
        </div>
      </template>

      <!-- 购买价格列 -->
      <template v-slot:buy_price="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'buy_price'"
          @click.stop
          :data-editing-cell="`${row._id}-buy_price`"
        >
          <el-input-number
            v-model="editingCell.value"
            :min="0"
            size="mini"
            style="width: 100%"
            @blur="handleBlur(row, 'buy_price')"
            @keyup.enter.native="saveCellEdit(row)"
            @keyup.esc.native="cancelCellEdit"
            :controls="false"
            autofocus
          ></el-input-number>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'buy_price', row.buy_price || 0)"
          style="cursor: pointer; min-height: 20px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          <div v-if="row.buy_price && row.buy_price > 0" style="color: #67C23A; font-weight: bold">
            {{ row.buy_price }} 积分
          </div>
          <div v-else style="color: #909399; font-size: 12px;">
            不可购买
          </div>
        </div>
      </template>

      <!-- 可见范围列 -->
      <template v-slot:custom_user_ids="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'custom_user_ids'"
          @click.stop
          :data-editing-cell="`${row._id}-custom_user_ids`"
        >
          <el-select
            v-model="editingCell.value"
            multiple
            filterable
            placeholder="请选择可见用户"
            size="mini"
            style="width: 100%"
            @visible-change="(visible) => !visible && handleSelectBlur(row, 'custom_user_ids')"
            @keyup.esc.native="cancelCellEdit"
          >
            <el-option
              key="all"
              label="🌐 所有人（公开）"
              value="all"
            >
              <span style="float: left; font-weight: bold; color: #67C23A;">
                <i class="el-icon-user"></i> 所有人（公开）
              </span>
            </el-option>
            <el-option disabled value="">───────── 指定用户 ─────────</el-option>
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'custom_user_ids', row.custom_user_ids || [])"
          style="cursor: pointer; min-height: 20px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          <el-tag
            v-if="!row.custom_user_ids || row.custom_user_ids.length === 0"
            type="info"
            size="small"
          >
            所有人不可见
          </el-tag>
          <el-tag
            v-else-if="row.custom_user_ids.includes('all')"
            type="success"
            size="small"
          >
            公开
          </el-tag>
          <el-tag v-else type="warning" size="small">
            指定用户({{ row.custom_user_ids.length }}人)
          </el-tag>
        </div>
      </template>

      <!-- 特殊价格用户列 -->
      <template v-slot:special_price_user_ids="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'special_price_user_ids'"
          @click.stop
          :data-editing-cell="`${row._id}-special_price_user_ids`"
        >
          <el-select
            v-model="editingCell.value"
            multiple
            filterable
            placeholder="请选择特殊价格用户"
            size="mini"
            style="width: 100%"
            @visible-change="(visible) => !visible && handleSelectBlur(row, 'special_price_user_ids')"
            @keyup.esc.native="cancelCellEdit"
          >
            <el-option disabled value="">───────── 特殊价格用户 ─────────</el-option>
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'special_price_user_ids', row.special_price_user_ids || [])"
          style="cursor: pointer; min-height: 20px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          <el-tag
            v-if="!row.special_price_user_ids || row.special_price_user_ids.length === 0"
            type="info"
            size="small"
          >
            无
          </el-tag>
          <el-tag v-else type="success" size="small">
            {{ row.special_price || 1 }}积分({{ row.special_price_user_ids.length }}人)
          </el-tag>
        </div>
      </template>

      <!-- 特殊价格列 -->
      <template v-slot:special_price="{ row }">
        <div
          v-if="editingCell.rowId === row._id && editingCell.field === 'special_price'"
          @click.stop
          :data-editing-cell="`${row._id}-special_price`"
        >
          <el-input-number
            v-model="editingCell.value"
            :min="0.1"
            :max="999999"
            :precision="2"
            :step="0.1"
            size="mini"
            style="width: 100%"
            @blur="handleBlur(row, 'special_price')"
            @keyup.enter.native="saveCellEdit(row)"
            @keyup.esc.native="cancelCellEdit"
            :controls="false"
            autofocus
          ></el-input-number>
        </div>
        <div
          v-else
          @dblclick="startCellEdit(row, 'special_price', row.special_price || 1)"
          style="cursor: pointer; min-height: 20px;"
          :title="isAdmin ? '双击编辑' : ''"
        >
          <span style="color: #67C23A; font-weight: bold">{{ row.special_price || 1 }}</span>
          <span style="color: #909399; font-size: 12px;"> 积分/月/机器</span>
        </div>
      </template>
    </vk-data-table>

    <!-- 表单弹窗 -->
    <vk-data-dialog
      v-model="form1.props.show"
      :title="form1.props.title"
      width="800px"
      mode="form"
    >
      <vk-data-form
        ref="form1"
        v-model="form1.data"
        :rules="form1.props.rules"
        :action="form1.props.action"
        :form-type="form1.props.formType"
        :columns="form1.props.columns"
        label-width="130px"
        @before-submit="beforeSubmit"
        @success="formSuccess"
      >
         <!-- 产品类型自定义插槽 -->
         <template v-slot:product_type>
           <el-select
             v-model="form1.data.product_type"
             filterable
             allow-create
             default-first-option
             placeholder="请选择或输入产品类型"
             style="width: 100%"
           >
             <el-option
               v-for="item in productTypeData"
               :key="item.value"
               :label="item.label"
               :value="item.value"
             ></el-option>
           </el-select>
         </template>

         <!-- 可见范围自定义插槽 -->
        <template v-slot:custom_user_ids>
          <el-select
            v-model="form1.data.custom_user_ids"
            multiple
            filterable
            placeholder="请选择可见用户（可多选）"
            style="width: 100%"
          >
            <!-- 所有人选项 -->
            <el-option
              key="all"
              label="🌐 所有人（公开）"
              value="all"
            >
              <span style="float: left; font-weight: bold; color: #67C23A;">
                <i class="el-icon-user"></i> 所有人（公开）
              </span>
            </el-option>
            <el-option disabled value="">───────── 指定用户 ─────────</el-option>
            <!-- 用户列表 -->
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i>
            <span v-if="!form1.data.custom_user_ids || form1.data.custom_user_ids.length === 0" style="color: #F56C6C;">
              未选择=产品不可见
            </span>
            <span v-else-if="form1.data.custom_user_ids.includes('all')" style="color: #67C23A;">
              已选择"所有人"=公开可见（原价）
            </span>
            <span v-else style="color: #E6A23C;">
              已选择{{ form1.data.custom_user_ids.length }}位用户=仅他们可见且享受3折优惠
            </span>
          </div>
        </template>
        <!-- 收费标准自定义插槽 -->
        <template v-slot:price_standard>
          <div style="display: flex; gap: 10px; align-items: center">
            <el-input-number
              v-model="form1.data.price_points"
              :min="1"
              placeholder="积分"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">积分 /</span>
            <el-input-number
              v-model="form1.data.price_months"
              :min="1"
              placeholder="月数"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">月 /</span>
            <el-input-number
              v-model="form1.data.price_machines"
              :min="1"
              placeholder="机器数"
              style="flex: 1"
            ></el-input-number>
            <span style="color: #909399">机器数</span>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 收费标准：积分数 / 月数 / 机器数
          </div>
        </template>

        <!-- 特殊价格配置自定义插槽 -->
        <template v-slot:special_price_config>
          <div class="special-price-configs">
            <div
              v-for="(config, index) in form1.data.special_price_configs"
              :key="index"
              class="config-item"
            >
              <div class="config-header">
                <span class="config-title">配置 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeSpecialPriceConfig(index)"
                ></el-button>
              </div>
              <div class="config-body">
                <el-select
                  v-model="config.user_ids"
                  multiple
                  filterable
                  placeholder="选择用户"
                  style="width: 100%; margin-bottom: 10px;"
                >
                  <el-option
                    v-for="user in userList"
                    :key="user._id"
                    :label="`${user.nickname || user.username} (${user.username})`"
                    :value="user._id"
                  >
                    <span style="float: left">{{ user.nickname || user.username }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ user.username }}</span>
                  </el-option>
                </el-select>
                <div style="display: flex; gap: 10px;">
                  <div style="flex: 1;">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">购买价格（积分）</div>
                    <el-input-number
                      v-model="config.buy_price"
                      :min="0"
                      :precision="0"
                      placeholder="购买价格"
                      style="width: 100%;"
                    ></el-input-number>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">积分扣除（积分/月/机器）</div>
                    <el-input-number
                      v-model="config.points_price"
                      :min="0.1"
                      :precision="2"
                      :step="0.1"
                      placeholder="积分价格"
                      style="width: 100%;"
                    ></el-input-number>
                  </div>
                </div>
              </div>
            </div>
            <el-button
              type="dashed"
              icon="el-icon-plus"
              style="width: 100%; margin-top: 10px;"
              @click="addSpecialPriceConfig"
            >
              添加特殊价格配置
            </el-button>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 10px;">
            <i class="el-icon-info"></i>
            为不同用户配置独立的购买价格和积分扣除价格，未配置的用户使用默认价格
          </div>
        </template>

        <!-- 已购买用户自定义插槽 -->
        <template v-slot:purchased_user_ids>
          <el-select
            v-model="form1.data.purchased_user_ids"
            multiple
            filterable
            placeholder="请选择已购买用户（可多选）"
            style="width: 100%"
          >
            <el-option disabled value="">───────── 已购买用户 ─────────</el-option>
            <!-- 用户列表 -->
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i>
            <span v-if="!form1.data.purchased_user_ids || form1.data.purchased_user_ids.length === 0" style="color: #909399;">
              未选择=无已购买用户（用户购买后会自动添加）
            </span>
            <span v-else style="color: #67C23A;">
              已选择{{ form1.data.purchased_user_ids.length }}位用户=这些用户已拥有该产品
            </span>
          </div>
        </template>

        <!-- 卡密收费自定义插槽 -->
        <template v-slot:valid_days_options>
          <div class="valid-days-options">
            <!-- 表头 -->
            <div class="option-header">
              <span class="header-item" style="width: 120px;">有效期（天）</span>
              <span class="header-item" style="width: 150px; margin-left: 10px;">显示名称</span>
              <span class="header-item" style="width: 120px; margin-left: 10px;">折扣系数</span>
              <span class="header-item" style="width: 50px; margin-left: 10px;">操作</span>
            </div>
            <div
              v-for="(option, index) in form1.data.valid_days_options"
              :key="index"
              class="option-item"
            >
              <el-input-number
                v-model="option.days"
                :min="1"
                :max="9999"
                placeholder="天数"
                style="width: 120px"
              ></el-input-number>
              <el-input
                v-model="option.label"
                placeholder="如：月卡、季卡"
                style="width: 150px; margin-left: 10px"
              ></el-input>
              <el-input-number
                v-model="option.discount"
                :min="0.1"
                :max="1"
                :step="0.1"
                :precision="2"
                placeholder="折扣"
                style="width: 120px; margin-left: 10px"
              ></el-input-number>
              <span style="margin-left: 5px; color: #909399">折</span>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="removeOption(index)"
                style="margin-left: 10px"
              ></el-button>
            </div>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="addOption"
              style="margin-top: 10px"
            >
              添加卡密选项
            </el-button>
            <div style="color: #909399; font-size: 12px; margin-top: 10px;">
              <i class="el-icon-info"></i>
              示例：30天=月卡(1折)，90天=季卡(0.9折)，365天=年卡(0.8折)
            </div>
          </div>
        </template>

        <!-- 版本更新日志自定义插槽 -->
        <template v-slot:version_logs>
          <div class="version-logs-editor">
            <div
              v-for="(versionLog, index) in form1.data.version_logs"
              :key="index"
              class="version-log-item"
            >
              <div class="version-log-header">
                <span class="version-tag">版本 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeVersionLog(index)"
                ></el-button>
              </div>
              <div class="version-log-content">
                <el-row :gutter="10">
                  <el-col :span="12">
                    <div class="form-item">
                      <label>版本号</label>
                      <el-input
                        v-model="versionLog.version"
                        placeholder="如: 1.2.0"
                        clearable
                      ></el-input>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="form-item">
                      <label>发布时间</label>
                      <el-date-picker
                        v-model="versionLog.date"
                        type="datetime"
                        placeholder="选择发布时间"
                        value-format="timestamp"
                        style="width: 100%"
                      ></el-date-picker>
                    </div>
                  </el-col>
                </el-row>
                <div class="form-item">
                  <label>更新内容</label>
                  <el-input
                    v-model="versionLog.log"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入更新内容，每行一条更新记录&#10;如：&#10;• 新增批量导出功能&#10;• 修复导入编码问题&#10;• 优化加载速度"
                  ></el-input>
                  <div style="color: #909399; font-size: 12px; margin-top: 5px">
                    <i class="el-icon-info"></i> 建议使用 "• " 或 "- " 开头，每行一条更新记录
                  </div>
                </div>
                <div class="form-item">
                  <label>下载地址（可选）</label>
                  <el-input
                    v-model="versionLog.download_url"
                    placeholder="留空则使用产品默认下载地址"
                    clearable
                  >
                    <template slot="prepend">
                      <i class="el-icon-link"></i>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="addVersionLog"
              style="margin-top: 10px"
            >
              添加新版本
            </el-button>
            <div v-if="!form1.data.version_logs || form1.data.version_logs.length === 0" 
                 style="color: #909399; text-align: center; padding: 20px;">
              <i class="el-icon-info"></i> 暂无版本记录，点击上方按钮添加
            </div>
          </div>
        </template>

      </vk-data-form>
    </vk-data-dialog>

    <!-- 批量修改弹窗 -->
    <el-dialog
      title="批量修改产品"
      :visible.sync="batchEditDialog.show"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchEditDialog.form" label-width="140px">
        <el-form-item label="已选择产品">
          <el-tag type="info" size="small" style="margin-right: 5px">
            {{ table1.multipleSelection.length }} 个产品
          </el-tag>
        </el-form-item>
        
        <el-divider></el-divider>
        
        <el-form-item label="收费标准">
          <div style="display: flex; gap: 10px; align-items: center; width: 100%">
            <el-input-number
              v-model="batchEditDialog.form.price_points"
              :min="1"
              placeholder="积分"
              style="flex: 1"
              :controls="false"
              @change="batchEditDialog.modifiedFields.price_points = true"
            ></el-input-number>
            <span style="color: #909399">积分 /</span>
            <el-input-number
              v-model="batchEditDialog.form.price_months"
              :min="1"
              placeholder="月数"
              style="flex: 1"
              :controls="false"
              @change="batchEditDialog.modifiedFields.price_months = true"
            ></el-input-number>
            <span style="color: #909399">月 /</span>
            <el-input-number
              v-model="batchEditDialog.form.price_machines"
              :min="1"
              placeholder="机器数"
              style="flex: 1"
              :controls="false"
              @change="batchEditDialog.modifiedFields.price_machines = true"
            ></el-input-number>
            <span style="color: #909399">机器</span>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 留空则不修改该字段，可只修改其中一项或多项
          </div>
        </el-form-item>
        
        <el-form-item label="购买价格">
          <el-input-number
            v-model="batchEditDialog.form.buy_price"
            :min="0"
            placeholder="购买价格（积分）"
            style="width: 100%"
            :controls="false"
            @change="batchEditDialog.modifiedFields.buy_price = true"
          ></el-input-number>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 留空则不修改该字段，0表示不可购买
          </div>
        </el-form-item>
        
        <el-form-item label="可见范围">
          <el-select
            v-model="batchEditDialog.form.custom_user_ids"
            multiple
            filterable
            placeholder="请选择可见用户（可多选）"
            style="width: 100%"
            clearable
            @change="batchEditDialog.modifiedFields.custom_user_ids = true"
          >
            <el-option
              key="all"
              label="🌐 所有人（公开）"
              value="all"
            >
              <span style="float: left; font-weight: bold; color: #67C23A;">
                <i class="el-icon-user"></i> 所有人（公开）
              </span>
            </el-option>
            <el-option disabled value="">───────── 指定用户 ─────────</el-option>
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 留空则不修改该字段
          </div>
        </el-form-item>
        
        <el-form-item label="特殊价格">
          <el-input-number
            v-model="batchEditDialog.form.special_price"
            :min="0.1"
            :max="999999"
            :precision="2"
            :step="0.1"
            placeholder="特殊价格（积分/月/机器）"
            style="width: 100%"
            :controls="false"
            @change="batchEditDialog.modifiedFields.special_price = true"
          ></el-input-number>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 留空则不修改该字段
          </div>
        </el-form-item>
        
        <el-form-item label="特殊价格用户">
          <el-select
            v-model="batchEditDialog.form.special_price_user_ids"
            multiple
            filterable
            placeholder="请选择特殊价格用户（可多选）"
            style="width: 100%"
            clearable
            @change="batchEditDialog.modifiedFields.special_price_user_ids = true"
          >
            <el-option disabled value="">───────── 特殊价格用户 ─────────</el-option>
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user._id"
            >
              <span style="float: left">{{
                user.nickname || user.username
              }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                user.username
              }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            <i class="el-icon-info"></i> 留空则不修改该字段
          </div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchEditDialog.show = false">取消</el-button>
        <el-button type="primary" @click="batchEditSubmit" :loading="batchEditDialog.loading">
          确定修改
        </el-button>
      </div>
    </el-dialog>
  </view>
</template>

<script>
let that;
let vk = uni.vk;
let originalForms = {};

// 状态数据
const statusData = [
  { value: 0, label: "下架" },
  { value: 1, label: "上架" },
];

export default {
  data() {
    return {
      isAdmin: false, // 是否是管理员
      productTypeData: [], // 产品类型选项（从数据库加载）
      userList: [], // 用户列表
      // machineStats -> computed
      // 单元格编辑状态
      editingCell: {
        rowId: null,
        field: null,
        value: null,
        // 收费标准编辑状态（包含三个字段）
        priceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
        // 保存原始值，用于取消时恢复
        originalValue: null,
        originalPriceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
      },
      batchEditDialog: {
        show: false,
        loading: false,
        form: {
          price_points: null,
          price_months: null,
          price_machines: null,
          buy_price: null,
          custom_user_ids: [],
          special_price: null,
          special_price_user_ids: [],
        },
        // 标记哪些字段被修改过（用于区分"未修改"和"清空"）
        modifiedFields: {
          price_points: false,
          price_months: false,
          price_machines: false,
          buy_price: false,
          custom_user_ids: false,
          special_price: false,
          special_price_user_ids: false,
        },
      },
      table1: {
        action: "admin/product/sys/getList",
        multipleSelection: [], // 多选列表
        columns: [
          { key: "_add_time", title: "创建时间", type: "time", width: 180 },
          {
            key: "product_image",
            title: "产品图",
            type: "text",
            width: 120,
            slot: true,
          },
          { key: "product_id", title: "产品ID", type: "text", width: 180 },
          { key: "product_name", title: "产品名称", type: "text", width: 150, slot: true },
          { key: "description", title: "产品描述", type: "text", width: 200, slot: true },
          { key: "product_type", title: "产品类型", type: "text", width: 120 },
          { key: "download_url", title: "下载地址", type: "text", width: 250, slot: true },
          {
            key: "price_standard",
            title: "收费标准",
            type: "text",
            width: 200,
            slot: true,
          },
          {
            key: "buy_price",
            title: "购买价格",
            type: "text",
            width: 120,
            slot: true,
          },
          {
            key: "custom_user_ids",
            title: "可见范围",
            type: "text",
            width: 120,
            slot: true,
          },
          {
            key: "special_price_user_ids",
            title: "特殊价格用户",
            type: "text",
            width: 150,
            slot: true,
          },
          {
            key: "special_price",
            title: "特殊价格",
            type: "text",
            width: 120,
            slot: true,
          },
          { key: "remark", title: "备注", type: "text", width: 200 },
          {
            key: "status",
            title: "状态",
            type: "text",
            width: 150,
            slot: true,
          },
        ],
      },
      queryForm1: {
        formData: {},
        columns: [
          {
            key: "product_name",
            type: "text",
            title: "产品名称",
            placeholder: "请输入产品名称",
            mode: "%%",
            col: { span: 5 },
          },
          {
            key: "product_type",
            type: "select",
            title: "产品类型",
            placeholder: "选择类型",
            data: [], // 从数据库动态加载
            col: { span: 4 },
            mode: "=",
          },
          {
            key: "status",
            type: "select",
            title: "状态",
            placeholder: "选择状态",
            data: statusData,
            col: { span: 3 },
            mode: "=",
          },
        ],
      },
      form1: {
        data: {},
        props: {
          action: "",
          columns: [
            // ========== 基本信息 ==========
            { key: "", title: "基本信息", type: "bar-title" },
            {
              key: "product_id",
              title: "产品ID",
              type: "text",
              placeholder: "请输入产品唯一标识（英文）",
              tips: "产品唯一标识，创建后不可修改",
              show: ["add"],
            },
            {
              key: "product_name",
              title: "产品名称",
              type: "text",
              placeholder: "请输入产品名称",
            },
            {
              key: "product_type",
              title: "产品类型",
              slot: true,
            },
            {
              key: "status",
              title: "状态",
              type: "radio",
              data: statusData,
              defaultValue: 1,
            },
            // ========== 产品详情 ==========
            { key: "", title: "产品详情", type: "bar-title" },
            {
              key: "product_image",
              title: "产品图",
              type: "image",
              limit: 1,
              tips: "支持jpg/png格式，建议尺寸400x300",
            },
            {
              key: "description",
              title: "产品描述",
              type: "textarea",
              placeholder: "请输入产品描述",
            },
            {
              key: "download_url",
              title: "下载地址",
              type: "text",
              placeholder: "请输入下载地址",
              tips: "已购买用户可下载的地址",
            },
            {
              key: "version_logs",
              title: "版本更新日志",
              slot: true,
            },
            // ========== 收费配置 ==========
            { key: "", title: "收费配置", type: "bar-title" },
            {
              key: "buy_price",
              title: "购买价格",
              type: "number",
              placeholder: "请输入公开产品的购买价格",
              tips: "公开产品的一次性购买价格（积分），0表示不可购买",
              defaultValue: 0,
            },
            {
              key: "price_standard",
              title: "收费标准",
              slot: true,
            },
            {
              key: "valid_days_options",
              title: "卡密收费",
              slot: true,
              tips: "可选配置，支持按天数+折扣灵活定价",
            },
            // ========== 高级配置 ==========
            { key: "", title: "高级配置", type: "bar-title" },
            {
              key: "custom_user_ids",
              title: "可见范围",
              slot: true,
            },
            {
              key: "special_price_config",
              title: "特殊价格配置",
              slot: true,
            },
            {
              key: "purchased_user_ids",
              title: "已购买用户",
              slot: true,
            },
            {
              key: "remark",
              title: "备注",
              type: "textarea",
              placeholder: "请输入备注",
            },
          ],
          rules: {
            product_id: [
              { required: true, message: "请输入产品ID", trigger: "blur" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "只能包含小写字母、数字和连字符",
                trigger: "blur",
              },
            ],
            product_name: [
              { required: true, message: "请输入产品名称", trigger: "blur" },
            ],
            product_type: [
              { required: true, message: "请选择产品类型", trigger: "change" },
            ],
            price_points: [
              { required: true, message: "请输入收费积分", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费积分必须大于0",
                trigger: "blur",
              },
            ],
            price_months: [
              { required: true, message: "请输入收费月数", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费月数必须大于0",
                trigger: "blur",
              },
            ],
            price_machines: [
              { required: true, message: "请输入收费机器数", trigger: "blur" },
              {
                type: "number",
                min: 1,
                message: "收费机器数必须大于0",
                trigger: "blur",
              },
            ],
            status: [
              { required: true, message: "请选择状态", trigger: "change" },
            ],
          },
          formType: "",
          title: "",
          show: false,
        },
      },
    };
  },
  computed: {
    machineStats() { return this.$store.state.$user.machineStats; },
  },
  onLoad(options = {}) {
    that = this;
    vk = that.vk;
    that.init();
  },
  onUnload() {
    // 移除全局点击事件
    if (that && that.removeGlobalClickHandler) {
      that.removeGlobalClickHandler();
    }
  },
  methods: {
    // 初始化
    init() {
      originalForms["form1"] = vk.pubfn.copyObject(that.form1);
      that.checkAdminRole();
      that.loadProductCategories();
      that.loadUserList();
      that.$store.dispatch('$user/loadMachineStats');
    },
    // 加载产品分类数据
    loadProductCategories() {
      vk.callFunction({
        url: 'admin/product-category/sys/getAll',
        data: {},
        success: (res) => {
          if (res.data && Array.isArray(res.data)) {
            const categories = res.data.map(item => ({
              value: item.value,
              label: item.label
            }));
            // 更新表单中的产品类型选项
            that.productTypeData = categories;
            // 更新搜索表单中的产品类型选项
            const categoryColumn = that.queryForm1.columns.find(col => col.key === 'product_type');
            if (categoryColumn) {
              categoryColumn.data = categories;
            }
          }
        },
        fail: (err) => {
          console.error('加载产品分类失败：', err);
        }
      });
    },
    // 检查是否是管理员
    checkAdminRole() {
      const userInfo = vk.getVuex("$user.userInfo");
      that.isAdmin =
        userInfo &&
        userInfo.role &&
        Array.isArray(userInfo.role) &&
        userInfo.role.includes("admin");
    },
    // 加载用户列表
    loadUserList() {
      if (!that.isAdmin) {
        return; // 非管理员不需要加载用户列表
      }
      vk.callFunction({
        url: "admin/system/user/sys/getList",
        data: {
          pageSize: 999,
        },
        success: (data) => {
          that.userList = data.rows || [];
          // 更新表单中的用户列表数据
          const customUserField = that.form1.props.columns.find(
            (col) => col.key === "custom_user_ids"
          );
          if (customUserField) {
            customUserField.data = that.userList.map((user) => ({
              value: user._id,
              label: `${user.nickname || user.username} (${user.username})`,
            }));
          }
        },
      });
    },
    // 搜索
    search(obj) {
      that.$refs.table1.query(obj);
    },
    // 刷新
    refresh() {
      that.$refs.table1.refresh();
    },
    // 新增
    addBtn() {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能新增产品");
        return;
      }
      vk.pubfn.resetForm(originalForms, that);
      that.form1.props.action = "admin/product/sys/add";
      that.form1.props.formType = "add";
      that.form1.props.title = "新增产品";
      that.$set(that.form1, "data", {
        product_id: "",
        product_name: "",
        product_type: "",
        product_image: "",
        download_url: "",
        price_points: 1,
        price_months: 1,
        price_machines: 1,
        buy_price: 0,
        description: "",
        remark: "",
        status: 1,
        valid_days_options: [
          { days: 30, label: "月卡(30天)", discount: 1 },
          { days: 90, label: "季卡(90天)", discount: 1 },
          { days: 180, label: "半年卡(180天)", discount: 1 },
          { days: 365, label: "年卡(365天)", discount: 1 },
        ],
        custom_user_ids: ["all"], // 默认为所有人可见
        special_price: 1, // 特殊价格，默认为1积分/月/机器（兼容旧数据）
        special_price_user_ids: [], // 特殊价格用户列表（兼容旧数据）
        special_price_configs: [], // 特殊价格配置（新）
        purchased_user_ids: [], // 已购买用户列表
        version_logs: [], // 版本更新日志
      });
      that.form1.props.show = true;
    },
    // 编辑
    editBtn({ item }) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能编辑产品");
        return;
      }
      vk.pubfn.resetForm(originalForms, that);
      that.form1.props.action = "admin/product/sys/update";
      that.form1.props.formType = "edit";
      that.form1.props.title = "编辑产品";
      that.$set(that.form1, "data", {
        _id: item._id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_type: item.product_type,
        product_image: item.product_image || "",
        download_url: item.download_url || "",
        price_points: item.price_points || 5,
        price_months: item.price_months || 1,
        price_machines: item.price_machines || 1,
        buy_price: item.buy_price || 0,
        description: item.description || "",
        remark: item.remark || "",
        status: item.status,
        valid_days_options: item.valid_days_options || [],
        custom_user_ids: item.custom_user_ids || [],
        special_price: item.special_price || 1, // 特殊价格，默认为1（兼容旧数据）
        special_price_user_ids: item.special_price_user_ids || [], // 兼容旧数据
        special_price_configs: item.special_price_configs || [], // 特殊价格配置（新）
        purchased_user_ids: item.purchased_user_ids || [],
        version_logs: item.version_logs || [],
      });
      that.form1.props.show = true;
    },
    // 删除
    deleteBtn({ item, deleteFn }) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能删除产品");
        return;
      }
      vk.confirm(`确定要删除产品【${item.product_name}】吗？`, "提示", "确定", "取消", (res) => {
        if (res.confirm) {
        deleteFn({
          action: "admin/product/sys/delete",
          data: { _id: item._id },
        });
        }
      });
    },
    // 执行数据迁移：将定制用户迁移为已购买用户
    migrateCustomUsersToPurchased() {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能执行数据迁移");
        return;
      }
      vk.confirm(
        "确定要执行数据迁移吗？\n\n将把现有产品中 custom_user_ids 里的用户ID（除了'all'）迁移到 purchased_user_ids，并从 custom_user_ids 中移除。\n\n此操作不可逆，请确保已备份数据！",
        "数据迁移确认",
        "确定执行",
        "取消",
        (res) => {
          if (res.confirm) {
            vk.callFunction({
              url: "admin/product/sys/migrateCustomUsersToPurchased",
              data: {},
              title: "正在执行数据迁移...",
              success: (data) => {
                vk.toast(data.msg || "迁移完成");
                if (data.data) {
                  console.log("迁移结果：", data.data);
                  vk.alert(
                    `迁移完成！\n\n处理产品数：${data.data.totalProducts}\n迁移产品数：${data.data.migratedProducts}\n迁移用户数：${data.data.totalUsersMigrated}`,
                    "迁移结果",
                    "确定",
                    () => {
                      // 刷新表格
                      that.refresh();
                    }
                  );
                } else {
                  that.refresh();
                }
              },
              fail: (err) => {
                vk.toast(err.msg || "迁移失败");
              },
            });
          }
        }
      );
    },
    // 改变状态
    changeStatus(row) {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能修改产品状态");
        // 恢复原状态
        row.status = row.status === 1 ? 0 : 1;
        return;
      }
      vk.callFunction({
        url: "admin/product/sys/update",
        data: {
          _id: row._id,
          status: row.status,
        },
        success: () => {
          vk.toast("状态更新成功");
          that.$store.commit('$user/SET_PRODUCT_LIST', []);
          that.refresh();
        },
        fail: () => {
          // 失败时恢复原状态
          row.status = row.status === 1 ? 0 : 1;
        },
      });
    },
    // 添加有效期选项
    addOption() {
      if (!that.form1.data.valid_days_options) {
        that.$set(that.form1.data, "valid_days_options", []);
      }
      that.form1.data.valid_days_options.push({
        days: 30,
        label: "月卡(30天)",
        discount: 1,
      });
    },
    // 移除有效期选项
    removeOption(index) {
      that.form1.data.valid_days_options.splice(index, 1);
    },
    // 添加特殊价格配置
    addSpecialPriceConfig() {
      if (!that.form1.data.special_price_configs) {
        that.$set(that.form1.data, "special_price_configs", []);
      }
      that.form1.data.special_price_configs.push({
        user_ids: [],
        buy_price: 0,
        points_price: 1,
      });
    },
    // 移除特殊价格配置
    removeSpecialPriceConfig(index) {
      that.form1.data.special_price_configs.splice(index, 1);
    },
    // 添加版本日志
    addVersionLog() {
      if (!that.form1.data.version_logs) {
        that.$set(that.form1.data, "version_logs", []);
      }
      that.form1.data.version_logs.unshift({
        version: "",
        date: Date.now(),
        log: "",
        download_url: "",
      });
    },
    // 移除版本日志
    removeVersionLog(index) {
      that.form1.data.version_logs.splice(index, 1);
    },
     // 表单提交前处理
     async beforeSubmit() {
       // 检查是否有图片
       if (!that.form1.data.product_image) {
         vk.toast("请上传产品图");
         return false;
       }
       return true; // 返回true继续提交
     },
    // 表单提交成功
    formSuccess() {
      that.form1.props.show = false;
      vk.toast("操作成功");
      that.$store.commit('$user/SET_PRODUCT_LIST', []);
      that.refresh();
    },
    // 获取图片URL（兼容多种数据格式）
    getImageUrl(imageData) {
      if (!imageData) return "";

      // 如果是字符串，直接返回
      if (typeof imageData === "string") {
        return imageData;
      }

      // 如果是对象，尝试获取url属性
      if (typeof imageData === "object") {
        if (imageData.url) return imageData.url;
        if (imageData[0] && typeof imageData[0] === "string")
          return imageData[0];
        if (imageData[0] && imageData[0].url) return imageData[0].url;
      }

      return "";
    },
    // 加载机器统计（从 store 响应式读取）
    loadMachineStats() {
      that.$store.dispatch('$user/loadMachineStats', { force: true });
    },
    // 计算基础价格
    calculateBasePrice(row) {
      if (!row.price_points || !row.price_months || !row.price_machines) {
        return 0;
      }

      // 获取当前用户信息
      const userInfo = vk.getVuex("$user.userInfo");
      const userId = userInfo?._id;

      // 判断是否是特殊价格用户
      const specialPriceUserIds = row.special_price_user_ids || [];
      const isSpecialPriceUser = userId &&
        Array.isArray(specialPriceUserIds) &&
        specialPriceUserIds.length > 0 &&
        specialPriceUserIds.includes(userId);

      // 获取用户绑定机器总数
      const totalMachines = that.machineStats?.total_machines || 0;

      // 如果是特殊价格用户且绑定机器数不超过1000台，则使用产品配置的特殊价格
      if (isSpecialPriceUser && totalMachines <= 1000) {
        const specialPrice = row.special_price || 1;
        return specialPrice.toFixed(2);
      }

      // 否则使用正常价格
      const basePrice = row.price_points / row.price_months / row.price_machines;
      return basePrice.toFixed(2);
    },
    // 多选变化
    selectionChange(list) {
      that.table1.multipleSelection = list;
    },
    // 开始单元格编辑
    startCellEdit(row, field, value) {
      if (!that.isAdmin) {
        return; // 非管理员不能编辑
      }
      const originalValue = Array.isArray(value) ? [...value] : value;
      that.editingCell = {
        rowId: row._id,
        field: field,
        value: Array.isArray(value) ? [...value] : value, // 数组需要深拷贝
        originalValue: originalValue, // 保存原始值
        priceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
        originalPriceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
      };
    },
    // 开始收费标准编辑
    startPriceStandardEdit(row) {
      if (!that.isAdmin) {
        return; // 非管理员不能编辑
      }
      that.editingCell = {
        rowId: row._id,
        field: 'price_standard',
        value: null,
        originalValue: null,
        priceData: {
          price_points: row.price_points || 1,
          price_months: row.price_months || 1,
          price_machines: row.price_machines || 1,
        },
        originalPriceData: {
          price_points: row.price_points || 1,
          price_months: row.price_months || 1,
          price_machines: row.price_machines || 1,
        },
      };
    },
    // 保存收费标准
    async savePriceStandard(row) {
      if (!that.editingCell.rowId || that.editingCell.field !== 'price_standard') {
        return;
      }
      
      const priceData = that.editingCell.priceData;
      const pricePoints = priceData.price_points;
      const priceMonths = priceData.price_months;
      const priceMachines = priceData.price_machines;
      
      // 验证
      if (!pricePoints || !priceMonths || !priceMachines) {
        vk.toast('请填写完整的收费标准');
        return;
      }
      
      // 检查是否有变化
      if (pricePoints === row.price_points && 
          priceMonths === row.price_months && 
          priceMachines === row.price_machines) {
        that.cancelCellEdit();
        return;
      }
      
      // 计算 base_price
      const basePrice = pricePoints / priceMonths / priceMachines;
      
      const updateData = {
        price_points: pricePoints,
        price_months: priceMonths,
        price_machines: priceMachines,
        base_price: basePrice,
        _update_time: Date.now(),
      };
      
      try {
        await vk.callFunction({
          url: 'admin/product/sys/update',
          data: {
            _id: row._id,
            ...updateData
          }
        });
        
        // 更新本地数据
        row.price_points = pricePoints;
        row.price_months = priceMonths;
        row.price_machines = priceMachines;
        row.base_price = basePrice;
        vk.toast('修改成功');

        // 清除产品列表缓存
        that.$store.commit('$user/SET_PRODUCT_LIST', []);

        // 取消编辑状态
        that.cancelCellEdit();
      } catch (err) {
        console.error('保存失败：', err);
        vk.toast(err.msg || '保存失败');
      }
    },
    // 保存单元格编辑
    async saveCellEdit(row) {
      if (!that.editingCell.rowId || that.editingCell.field === null) {
        return;
      }
      
      const field = that.editingCell.field;
      let newValue = that.editingCell.value;
      const oldValue = row[field];
      
      // 数组类型字段需要特殊处理
      if (Array.isArray(newValue)) {
        // 如果值没有变化，直接取消编辑
        if (JSON.stringify(newValue) === JSON.stringify(oldValue || [])) {
          that.cancelCellEdit();
          return;
        }
      } else {
        // 如果值没有变化，直接取消编辑
        if (newValue === oldValue) {
          that.cancelCellEdit();
          return;
        }
      }
      
      // 构建更新数据
      const updateData = {
        [field]: newValue,
        _update_time: Date.now(),
      };
      
      // 字符串类型字段需要去除首尾空格
      if (typeof newValue === 'string') {
        updateData[field] = newValue.trim();
      }
      
      // 数组类型字段确保是数组
      if (Array.isArray(newValue)) {
        updateData[field] = newValue;
      }
      
      try {
        await vk.callFunction({
          url: 'admin/product/sys/update',
          data: {
            _id: row._id,
            ...updateData
          }
        });
        
        // 更新本地数据
        if (Array.isArray(newValue)) {
          row[field] = [...newValue]; // 深拷贝
        } else {
          row[field] = newValue;
        }
        vk.toast('修改成功');

        // 清除产品列表缓存，确保用户端同步更新
        that.$store.commit('$user/SET_PRODUCT_LIST', []);

        // 取消编辑状态
        that.cancelCellEdit();
      } catch (err) {
        console.error('保存失败：', err);
        vk.toast(err.msg || '保存失败');
        // 恢复原值
        if (Array.isArray(oldValue)) {
          row[field] = oldValue ? [...oldValue] : [];
        } else {
          row[field] = oldValue;
        }
      }
    },
    // 处理失焦事件（点击其他地方）
    handleBlur(row, field) {
      // 延迟执行，避免点击保存按钮时被触发
      setTimeout(() => {
        if (that.editingCell.rowId === row._id && that.editingCell.field === field) {
          // 检查值是否有变化
          const newValue = that.editingCell.value;
          const oldValue = that.editingCell.originalValue;
          
          if (Array.isArray(newValue) && Array.isArray(oldValue)) {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              // 有变化，保存
              that.saveCellEdit(row);
            } else {
              // 无变化，取消
              that.cancelCellEdit();
            }
          } else if (newValue !== oldValue) {
            // 有变化，保存
            that.saveCellEdit(row);
          } else {
            // 无变化，取消
            that.cancelCellEdit();
          }
        }
      }, 200);
    },
    // 处理收费标准失焦事件
    handlePriceStandardBlur(row) {
      // 延迟执行，避免点击保存按钮时被触发
      setTimeout(() => {
        if (that.editingCell.rowId === row._id && that.editingCell.field === 'price_standard') {
          // 检查值是否有变化
          const priceData = that.editingCell.priceData;
          const originalPriceData = that.editingCell.originalPriceData;
          
          if (priceData.price_points === originalPriceData.price_points &&
              priceData.price_months === originalPriceData.price_months &&
              priceData.price_machines === originalPriceData.price_machines) {
            // 无变化，取消编辑
            that.cancelCellEdit();
          }
          // 有变化时不自动保存，需要点击保存按钮
        }
      }, 200);
    },
    // 处理下拉框失焦事件
    handleSelectBlur(row, field) {
      // 延迟执行，避免点击其他元素时被触发
      setTimeout(() => {
        if (that.editingCell.rowId === row._id && that.editingCell.field === field) {
          // 检查值是否有变化
          const newValue = that.editingCell.value;
          const oldValue = that.editingCell.originalValue;
          
          if (Array.isArray(newValue) && Array.isArray(oldValue)) {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              // 有变化，保存
              that.saveCellEdit(row);
            } else {
              // 无变化，取消
              that.cancelCellEdit();
            }
          } else {
            // 无变化，取消
            that.cancelCellEdit();
          }
        }
      }, 200);
    },
    // 取消单元格编辑
    cancelCellEdit() {
      // 直接重置编辑状态，不需要恢复原始值
      // 因为表格数据是从服务器获取的，取消编辑时直接重置状态即可
      // 如果用户修改了值但没有保存，表格会自动恢复到原始状态
      that.editingCell = {
        rowId: null,
        field: null,
        value: null,
        originalValue: null,
        priceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
        originalPriceData: {
          price_points: null,
          price_months: null,
          price_machines: null,
        },
      };
    },
    // 添加全局点击事件处理（用于点击外部取消编辑）
    addGlobalClickHandler() {
      // 在 uni-app 中，主要通过失焦事件来处理取消编辑
      // 全局点击事件在 uni-app 中可能不可用，所以这里留空
      that.globalClickHandler = null;
    },
    // 移除全局点击事件处理
    removeGlobalClickHandler() {
      if (that.globalClickHandler) {
        that.globalClickHandler = null;
      }
    },
    // 批量修改
    batchEditBtn() {
      if (!that.isAdmin) {
        vk.toast("只有管理员才能批量修改产品");
        return;
      }
      if (!that.table1.multipleSelection || that.table1.multipleSelection.length === 0) {
        vk.toast("请先选择要修改的产品");
        return;
      }
      // 重置表单（所有字段都为空，避免误操作）
      that.batchEditDialog.form = {
        price_points: null,
        price_months: null,
        price_machines: null,
        buy_price: null,
        custom_user_ids: [],
        special_price: null,
        special_price_user_ids: [],
      };
      // 重置修改标记
      that.batchEditDialog.modifiedFields = {
        price_points: false,
        price_months: false,
        price_machines: false,
        buy_price: false,
        custom_user_ids: false,
        special_price: false,
        special_price_user_ids: false,
      };
      that.batchEditDialog.show = true;
    },
    // 批量修改提交
    batchEditSubmit() {
      if (!that.table1.multipleSelection || that.table1.multipleSelection.length === 0) {
        vk.toast("请先选择要修改的产品");
        return;
      }
      
      // 构建更新数据（只包含被修改过的字段）
      const updateData = {};
      const modifiedFields = that.batchEditDialog.modifiedFields;
      
      // 数字类型字段：如果被修改过，则更新（包括0值）
      if (modifiedFields.price_points && that.batchEditDialog.form.price_points !== null && that.batchEditDialog.form.price_points !== undefined) {
        updateData.price_points = that.batchEditDialog.form.price_points;
      }
      if (modifiedFields.price_months && that.batchEditDialog.form.price_months !== null && that.batchEditDialog.form.price_months !== undefined) {
        updateData.price_months = that.batchEditDialog.form.price_months;
      }
      if (modifiedFields.price_machines && that.batchEditDialog.form.price_machines !== null && that.batchEditDialog.form.price_machines !== undefined) {
        updateData.price_machines = that.batchEditDialog.form.price_machines;
      }
      if (modifiedFields.buy_price && that.batchEditDialog.form.buy_price !== null && that.batchEditDialog.form.buy_price !== undefined) {
        updateData.buy_price = that.batchEditDialog.form.buy_price;
      }
      
      // 数组类型字段：如果被修改过，则更新（包括空数组）
      // 注意：空数组 [] 表示清空，null 表示不修改
      if (modifiedFields.custom_user_ids) {
        updateData.custom_user_ids = Array.isArray(that.batchEditDialog.form.custom_user_ids) 
          ? that.batchEditDialog.form.custom_user_ids 
          : [];
      }
      if (modifiedFields.special_price && that.batchEditDialog.form.special_price !== null && that.batchEditDialog.form.special_price !== undefined) {
        updateData.special_price = that.batchEditDialog.form.special_price;
      }
      if (modifiedFields.special_price_user_ids) {
        updateData.special_price_user_ids = Array.isArray(that.batchEditDialog.form.special_price_user_ids) 
          ? that.batchEditDialog.form.special_price_user_ids 
          : [];
      }
      
      // 检查是否有要更新的字段
      if (Object.keys(updateData).length === 0) {
        vk.toast("请至少修改一个字段");
        return;
      }
      
      // 如果收费标准有更新，重新计算 base_price
      // 需要从原产品数据中获取未修改的字段值
      const needRecalculateBasePrice = modifiedFields.price_points || modifiedFields.price_months || modifiedFields.price_machines;
      
      // 更新时间
      updateData._update_time = Date.now();
      
      // 获取选中的产品ID列表
      const productIds = that.table1.multipleSelection.map(item => item._id);
      
      // 如果需要重新计算 base_price，需要为每个产品单独计算（因为可能只修改了部分字段）
      const finalUpdateData = needRecalculateBasePrice ? null : updateData;
      
      vk.confirm(
        `确定要批量修改 ${productIds.length} 个产品吗？`,
        '提示',
        '确定',
        '取消',
        async (res) => {
          if (res.confirm) {
            that.batchEditDialog.loading = true;
            try {
              // 批量更新产品
              let successCount = 0;
              let failCount = 0;
              
              for (const productId of productIds) {
                try {
                  let productUpdateData = finalUpdateData;
                  
                  // 如果需要重新计算 base_price，需要获取原产品数据
                  if (needRecalculateBasePrice) {
                    productUpdateData = { ...updateData };
                    // 获取原产品数据
                    const productRes = await vk.callFunction({
                      url: 'admin/product/sys/getList',
                      data: {
                        whereJson: { _id: productId }
                      }
                    });
                    
                    if (productRes && productRes.rows && productRes.rows.length > 0) {
                      const product = productRes.rows[0];
                      // 使用修改后的值或原值
                      const pricePoints = modifiedFields.price_points ? updateData.price_points : product.price_points;
                      const priceMonths = modifiedFields.price_months ? updateData.price_months : product.price_months;
                      const priceMachines = modifiedFields.price_machines ? updateData.price_machines : product.price_machines;
                      
                      if (pricePoints > 0 && priceMonths > 0 && priceMachines > 0) {
                        productUpdateData.base_price = pricePoints / priceMonths / priceMachines;
                      }
                    }
                  }
                  
                  await vk.callFunction({
                    url: 'admin/product/sys/update',
                    data: {
                      _id: productId,
                      ...productUpdateData
                    }
                  });
                  successCount++;
                } catch (err) {
                  console.error(`更新产品 ${productId} 失败：`, err);
                  failCount++;
                }
              }
              
              that.batchEditDialog.loading = false;
              that.batchEditDialog.show = false;
              
              if (failCount === 0) {
                vk.toast(`成功修改 ${successCount} 个产品`);
              } else {
                vk.alert(`修改完成！\n成功：${successCount} 个\n失败：${failCount} 个`, '批量修改结果');
              }
              
              // 清空选择
              that.table1.multipleSelection = [];
              that.$refs.table1.clearSelection();

              // 清除产品列表缓存
              that.$store.commit('$user/SET_PRODUCT_LIST', []);

              // 刷新表格
              that.refresh();
            } catch (err) {
              that.batchEditDialog.loading = false;
              vk.toast(err.msg || '批量修改失败');
            }
          }
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

/* 卡密收费样式 */
.valid-days-options {
  .option-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 8px 12px;
    background: #e4e7ed;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    font-weight: 500;

    .header-item {
      text-align: center;
    }
  }

  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

/* 特殊价格配置样式 */
.special-price-configs {
  .config-item {
    margin-bottom: 15px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    .config-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .config-title {
        font-weight: 500;
        color: #303133;
      }
    }

    .config-body {
      // 内容区域
    }
  }
}

/* 版本日志编辑样式 */
.version-logs-editor {
  .version-log-item {
    margin-bottom: 15px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    border-left: 3px solid #409EFF;

    .version-log-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;

      .version-tag {
        font-size: 14px;
        font-weight: bold;
        color: #409EFF;
      }
    }

    .version-log-content {
      .form-item {
        margin-bottom: 15px;

        label {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }
}

/* 产品图样式 */
.no-image {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #c0c4cc;
  font-size: 24px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}

</style>

