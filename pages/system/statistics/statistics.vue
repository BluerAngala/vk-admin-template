<template>
  <view class="page-body">
    <!-- 统计卡片 -->
    <view class="stats-cards">
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-label">总用户数</div>
          <div class="stats-value">{{ summaryStats.totalUsers }}</div>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-label">总购买积分</div>
          <div class="stats-value" style="color: #67C23A">{{ summaryStats.totalPoints }} 积分</div>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-label">总消耗积分</div>
          <div class="stats-value" style="color: #E6A23C">{{ summaryStats.totalConsumed }} 积分</div>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-label">总剩余积分</div>
          <div class="stats-value" style="color: #409EFF">{{ summaryStats.totalAvailable }} 积分</div>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-label">用户绑定的机器数量</div>
          <div class="stats-value" style="color: #F56C6C">{{ summaryStats.totalMachines }} 台</div>
        </div>
      </el-card>
    </view>

    <!-- 购买记录搜索区域 -->
    <el-card class="tools-card" >
      <div class="tools-header">
        <span class="tools-title">购买记录查询</span>
        <!-- 管理员工具按钮 -->
        <template v-if="isAdmin">
          <el-button 
            type="primary" 
            size="small" 
            style="margin-left: 20px;"
            @click="showCheckOrderDialog"
          >
            查询订单状态
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            style="margin-left: 10px;"
            @click="showBlacklistDialog"
          >
            黑名单管理
          </el-button>
          <el-dropdown 
            split-button 
            type="warning" 
            size="small"
            style="margin-left: 10px;"
            @click="scanDuplicateRecharge"
            @command="handleDataFixCommand"
          >
            <span>数据修复</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="scanDuplicate">扫描重复充值</el-dropdown-item>
              <el-dropdown-item command="checkNegative">检查欠费用户</el-dropdown-item>
              <el-dropdown-item command="removeDuplicateCards" divided>清理重复卡密</el-dropdown-item>
              <el-dropdown-item command="viewCardStats">查看卡密统计</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
      <el-form :inline="true" :model="purchaseRecordsDialog.queryForm" class="purchase-query-form">
        <el-form-item label="用户ID">
          <el-input 
            v-model="purchaseRecordsDialog.queryForm.user_id" 
            placeholder="请输入用户ID"
            clearable
            style="width: 200px;"
            @keyup.enter.native="searchPurchaseRecords"
          ></el-input>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input 
            v-model="purchaseRecordsDialog.queryForm.product_id" 
            placeholder="请输入产品ID"
            clearable
            style="width: 200px;"
            @keyup.enter.native="searchPurchaseRecords"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchPurchaseRecords" :loading="purchaseRecordsLoading">查询</el-button>
          <el-button @click="resetPurchaseRecordsQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户积分汇总表格 -->
    <vk-data-table
      ref="table1"
      :action="table1.action"
      :columns="table1.columns"
      :row-no="true"
      :pagination="true"
      :page-size="10"
      :custom-right-btns="table1.customRightBtns"
    >
      <!-- 用户名列 -->
      <template v-slot:user_info="{ row }">
        <div>
          <div style="font-weight: 500;">{{ row.user_display_name }}</div>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            ID: {{ row.user_id }}
          </div>
        </div>
      </template>
      <!-- 绑定机器数列 -->
      <template v-slot:total_machines="{ row }">
        <span style="color: #F56C6C; font-weight: 500;">{{ row.total_machines || 0 }} 台</span>
      </template>
    </vk-data-table>

    <!-- 详情弹窗 -->
    <el-dialog
      title="用户积分详情"
      :visible.sync="detailDialog.visible"
      width="70%"
      :close-on-click-modal="false"
      class="detail-dialog"
      top="10vh"
    >
      <div class="detail-dialog-body" style="height: 65vh; overflow-y: auto; display: flex; flex-direction: column;">
        <div v-if="detailDialog.loading" class="detail-loading">
          <i class="el-icon-loading"></i> 加载中...
        </div>
        <div v-else-if="detailDialog.detailList && detailDialog.detailList.length > 0">
          <!-- 重复订单号告警 -->
          <el-alert
            v-if="detailDialog.duplicateCount > 0"
            :title="`发现 ${detailDialog.duplicateCount} 条重复订单记录`"
            type="warning"
            show-icon
            style="margin-bottom: 15px;"
          >
            <div style="margin-top: 5px;">
              重复订单号：{{ detailDialog.duplicateOrders.map(d => `${d.order_id}(${d.count}条)`).join('、') }}
            </div>
          </el-alert>
          <div class="detail-summary">
            <div class="summary-item">
              <span class="summary-label">用户：</span>
              <span class="summary-value">{{ detailDialog.userName }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">用户ID：</span>
              <span class="summary-value">{{ detailDialog.userId }}</span>
            </div>
          </div>
          <el-table :data="detailDialog.detailList" border stripe size="small" style="margin-top: 20px; flex: 1;">
            <el-table-column prop="_add_time_str" label="时间" width="180"></el-table-column>
            <el-table-column prop="type_text" label="类型" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" size="mini">
                  {{ scope.row.type_text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="积分数量" width="100" align="right">
              <template slot-scope="scope">
                <span :style="{ color: scope.row.amount > 0 ? '#67C23A' : '#F56C6C', fontWeight: '500' }">
                  {{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="操作后余额" width="120" align="right"></el-table-column>
            <el-table-column prop="source_text" label="来源" width="120"></el-table-column>
            <el-table-column prop="order_id" label="订单号" width="180">
              <template slot-scope="scope">
                <span v-if="scope.row.order_id" style="color: #409EFF; font-family: monospace;">{{ scope.row.order_id }}</span>
                <span v-else style="color: #C0C4CC;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
          </el-table>
        </div>
        <div v-else class="detail-empty">
          暂无收支记录
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 手动充值弹窗 -->
    <el-dialog
      title="手动充值积分"
      :visible.sync="rechargeDialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rechargeDialog.form" label-width="100px">
        <el-form-item label="用户">
          <span style="font-weight: 500;">{{ rechargeDialog.userName }}</span>
          <span style="color: #909399; margin-left: 10px;">ID: {{ rechargeDialog.userId }}</span>
        </el-form-item>
        <el-form-item label="当前余额">
          <span style="color: #409EFF; font-weight: 500;">{{ rechargeDialog.currentBalance }} 积分</span>
        </el-form-item>
        <el-form-item label="订单号" required>
          <el-input 
            v-model="rechargeDialog.form.order_id" 
            placeholder="请输入充值订单号（如：LD2512233FGCIK）"
            maxlength="50"
            style="width: 300px;"
          ></el-input>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">订单号用于防止重复充值</div>
        </el-form-item>
        <el-form-item label="充值积分" required>
          <el-input-number 
            v-model="rechargeDialog.form.amount" 
            :min="1" 
            :max="999999"
            style="width: 200px;"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="rechargeDialog.form.remark" 
            placeholder="请输入备注（可选）"
            maxlength="200"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submitRecharge" :loading="rechargeDialog.loading">确认充值</el-button>
      </span>
    </el-dialog>

    <!-- 清理重复卡密弹窗 -->
    <el-dialog
      title="清理重复卡密"
      :visible.sync="removeDuplicateDialog.visible"
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
        <el-radio-group v-model="removeDuplicateDialog.dryRun" :disabled="removeDuplicateDialog.loading || removeDuplicateDialog.deleting">
          <el-radio-button :label="true">预览模式</el-radio-button>
          <el-radio-button :label="false">删除模式</el-radio-button>
        </el-radio-group>
        <el-button 
          type="primary" 
          @click="scanDuplicateCards"
          :loading="removeDuplicateDialog.loading"
          :disabled="removeDuplicateDialog.deleting"
        >
          <i class="el-icon-search"></i> 开始扫描
        </el-button>
      </div>

      <div v-if="removeDuplicateDialog.loading" class="detail-loading">
        <i class="el-icon-loading"></i> 正在扫描数据库...
      </div>

      <div v-else-if="removeDuplicateDialog.result">
        <!-- 扫描结果摘要 -->
        <el-card shadow="never" style="margin-bottom: 15px;">
          <div slot="header" style="font-weight: 500;">扫描结果</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="总记录数">{{ removeDuplicateDialog.result.total }}</el-descriptions-item>
            <el-descriptions-item label="唯一编码数">{{ removeDuplicateDialog.result.unique_codes }}</el-descriptions-item>
            <el-descriptions-item label="重复编码数">
              <span :style="{ color: removeDuplicateDialog.result.duplicates_count > 0 ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">
                {{ removeDuplicateDialog.result.duplicates_count }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="待删除记录数" :span="3">
              <span :style="{ color: removeDuplicateDialog.result.to_delete_count > 0 ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">
                {{ removeDuplicateDialog.result.to_delete_count }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 重复详情列表 -->
        <el-card shadow="never" v-if="removeDuplicateDialog.result.details && removeDuplicateDialog.result.details.length > 0">
          <div slot="header" style="font-weight: 500;">重复详情（前10条）</div>
          <el-table :data="removeDuplicateDialog.result.details" border stripe size="small" max-height="300">
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
                  <div style="color: #909399;">时间: {{ formatDateTime(scope.row.keep._add_time) }}</div>
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
        <div v-if="!removeDuplicateDialog.dryRun && removeDuplicateDialog.result.to_delete_count > 0" style="margin-top: 20px; text-align: center;">
          <el-button 
            type="danger" 
            size="large"
            @click="executeRemoveDuplicateCards"
            :loading="removeDuplicateDialog.deleting"
          >
            <i class="el-icon-delete"></i> 确认删除 {{ removeDuplicateDialog.result.to_delete_count }} 条重复记录
          </el-button>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px; color: #909399;">
        <i class="el-icon-info" style="font-size: 48px; margin-bottom: 10px;"></i>
        <div>请选择模式后点击"开始扫描"</div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="removeDuplicateDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 查询订单状态弹窗 -->
    <el-dialog
      title="查询订单状态"
      :visible.sync="checkOrderDialog.visible"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :inline="true" :model="checkOrderDialog.form">
        <el-form-item label="订单号">
          <el-input 
            v-model="checkOrderDialog.form.trade_no" 
            placeholder="请输入订单号（如：LD260117VX6DPE）"
            clearable
            style="width: 300px;"
            @keyup.enter.native="checkOrderStatus"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="checkOrderStatus" :loading="checkOrderDialog.loading">查询</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="checkOrderDialog.loading" class="detail-loading">
        <i class="el-icon-loading"></i> 查询中...
      </div>
      <div v-else-if="checkOrderDialog.result">
        <!-- 诊断结果 -->
        <el-alert
          :title="checkOrderDialog.result.diagnosis"
          :type="checkOrderDialog.result.canManualRecharge ? 'warning' : (checkOrderDialog.result.order.status === 'success' ? 'success' : 'error')"
          show-icon
          style="margin-bottom: 20px;"
        ></el-alert>
        
        <!-- 订单信息 -->
        <el-card shadow="never" style="margin-bottom: 15px;">
          <div slot="header" style="font-weight: 500;">订单信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">{{ checkOrderDialog.result.order.trade_no }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag 
                :type="checkOrderDialog.result.order.status === 'success' ? 'success' : (checkOrderDialog.result.order.status === 'failed' ? 'danger' : 'warning')"
                size="small"
              >
                {{ checkOrderDialog.result.order.status === 'pending' ? '待支付' : 
                   checkOrderDialog.result.order.status === 'paid' ? '已支付待充值' : 
                   checkOrderDialog.result.order.status === 'success' ? '充值成功' : '充值失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="套餐名称">{{ checkOrderDialog.result.order.package_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="基础积分">{{ checkOrderDialog.result.order.points || 0 }}</el-descriptions-item>
            <el-descriptions-item label="赠送积分">{{ checkOrderDialog.result.order.bonus || 0 }}</el-descriptions-item>
            <el-descriptions-item label="总积分">
              <span style="color: #67C23A; font-weight: 500;">{{ (checkOrderDialog.result.order.points || 0) + (checkOrderDialog.result.order.bonus || 0) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ checkOrderDialog.result.order._add_time_str }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ checkOrderDialog.result.order._update_time_str }}</el-descriptions-item>
            <el-descriptions-item label="失败原因" v-if="checkOrderDialog.result.order.fail_reason" :span="2">
              <span style="color: #F56C6C;">{{ checkOrderDialog.result.order.fail_reason }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 用户信息 -->
        <el-card shadow="never" style="margin-bottom: 15px;" v-if="checkOrderDialog.result.userInfo">
          <div slot="header" style="font-weight: 500;">用户信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="用户ID">{{ checkOrderDialog.result.order.user_id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ checkOrderDialog.result.userInfo.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ checkOrderDialog.result.userInfo.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ checkOrderDialog.result.userInfo.mobile || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 积分账户 -->
        <el-card shadow="never" style="margin-bottom: 15px;" v-if="checkOrderDialog.result.userPoints">
          <div slot="header" style="font-weight: 500;">积分账户</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="可用积分">
              <span style="color: #409EFF; font-weight: 500;">{{ checkOrderDialog.result.userPoints.available_points || 0 }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="总积分">{{ checkOrderDialog.result.userPoints.total_points || 0 }}</el-descriptions-item>
            <el-descriptions-item label="已消耗">{{ checkOrderDialog.result.userPoints.consumed_points || 0 }}</el-descriptions-item>
            <el-descriptions-item label="冻结积分">{{ checkOrderDialog.result.userPoints.frozen_points || 0 }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 积分流水 -->
        <el-card shadow="never" v-if="checkOrderDialog.result.pointsLog">
          <div slot="header" style="font-weight: 500;">积分流水记录</div>
          <el-table :data="checkOrderDialog.result.pointsLog" border stripe size="small">
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
        <div v-if="checkOrderDialog.result.canManualRecharge" style="margin-top: 20px; text-align: center;">
          <el-button 
            type="danger" 
            @click="manualRechargeFromOrder"
            :loading="checkOrderDialog.recharging"
          >
            手动补发积分
          </el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="checkOrderDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 购买记录查询弹窗 -->
    <el-dialog
      title="购买记录查询"
      :visible.sync="purchaseRecordsDialog.visible"
      width="1400px"
      :close-on-click-modal="false"
    >
      <!-- 查询表单 -->
      <el-form :inline="true" :model="purchaseRecordsDialog.queryForm" class="purchase-query-form">
        <el-form-item label="用户ID">
          <el-input 
            v-model="purchaseRecordsDialog.queryForm.user_id" 
            placeholder="请输入用户ID"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input 
            v-model="purchaseRecordsDialog.queryForm.product_id" 
            placeholder="请输入产品ID"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadPurchaseRecords" :loading="purchaseRecordsLoading">查询</el-button>
          <el-button @click="resetPurchaseRecordsQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 筛选选项 -->
      <div v-if="purchaseRecordsDialog.allData && purchaseRecordsDialog.allData.length > 0" style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <el-checkbox v-model="purchaseRecordsDialog.filterRemarkMismatch" @change="filterPurchaseRecords">
              仅显示产品表名称与积分流水备注名称不一致的记录
            </el-checkbox>
            <span v-if="purchaseRecordsDialog.filterRemarkMismatch" style="margin-left: 10px; color: #E6A23C; font-size: 12px; font-weight: 500;">
              已筛选出 {{ purchaseRecordsDialog.data.length }} 条不一致记录（共 {{ purchaseRecordsDialog.allData.length }} 条）
            </span>
          </div>
          <el-button 
            v-if="purchaseRecordsDialog.filterRemarkMismatch && purchaseRecordsDialog.data.length > 0" 
            type="primary" 
            size="small"
            :loading="purchaseRecordsDialog.fixing"
            @click="fixProductNames"
          >
            <i class="el-icon-edit"></i> 修正名称
          </el-button>
        </div>
      </div>

      <div v-if="purchaseRecordsDialog.loading" class="detail-loading">
        <i class="el-icon-loading"></i> 查询中...
      </div>
      <div v-else-if="purchaseRecordsDialog.data && purchaseRecordsDialog.data.length > 0">
        <div class="check-summary" style="margin-bottom: 15px;">
          <div class="summary-item">
            <span class="summary-label">共找到：</span>
            <span class="summary-value">{{ purchaseRecordsDialog.total }} 条记录</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">有问题：</span>
            <span class="summary-value" style="color: #E6A23C;">
              {{ purchaseRecordsDialog.data.filter(r => r.has_issue).length }} 条
            </span>
          </div>
        </div>
        <el-table 
          :data="purchaseRecordsDialog.data" 
          border 
          stripe 
          size="small"
          max-height="500"
        >
          <el-table-column prop="card_add_time_str" label="购买时间" width="180" fixed="left"></el-table-column>
          <el-table-column prop="user_name" label="用户" width="120">
            <template slot-scope="scope">
              <div>{{ scope.row.user_name }}</div>
              <div style="font-size: 12px; color: #909399;">{{ scope.row.user_username }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="card_code" label="卡密" width="150" show-overflow-tooltip></el-table-column>
          <el-table-column label="卡密记录" width="180">
            <template slot-scope="scope">
              <div style="font-size: 12px; color: #909399;">产品ID:</div>
              <div>{{ scope.row.card_product_id || '-' }}</div>
              <div style="font-size: 12px; color: #909399; margin-top: 4px;">产品名称:</div>
              <div :style="{ color: scope.row.has_issue && scope.row.card_product_name !== scope.row.correct_product_name ? '#F56C6C' : '' }">
                {{ scope.row.card_product_name || '-' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="积分流水记录" width="180">
            <template slot-scope="scope">
              <div style="font-size: 12px; color: #909399;">产品ID:</div>
              <div :style="{ color: scope.row.has_issue && scope.row.card_product_id !== scope.row.points_log_product_id ? '#F56C6C' : '' }">
                {{ scope.row.points_log_product_id || '-' }}
              </div>
              <div style="font-size: 12px; color: #909399; margin-top: 4px;">产品名称:</div>
              <div :style="{ color: scope.row.has_issue && scope.row.points_log_product_name && scope.row.points_log_product_name !== scope.row.points_log_product_name_from_table ? '#F56C6C' : '' }">
                {{ scope.row.points_log_product_name || '-' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="correct_product_name" label="产品表中的正确名称" width="200">
            <template slot-scope="scope">
              <span style="color: #67C23A; font-weight: 500;">{{ scope.row.correct_product_name || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="points_log_product_name_from_remark" label="积分流水备注中的名称" width="200">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.has_issue && scope.row.points_log_product_name_from_remark && scope.row.points_log_product_name_from_remark !== scope.row.points_log_product_name ? '#F56C6C' : '' }">
                {{ scope.row.points_log_product_name_from_remark || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="points_log_remark" label="积分流水备注" min-width="250" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>
      <div v-else class="detail-empty">
        没有找到购买记录
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="purchaseRecordsDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 黑名单管理弹窗 -->
    <el-dialog
      title="黑名单管理"
      :visible.sync="blacklistDialog.visible"
      width="900px"
      :close-on-click-modal="false"
    >
      <!-- 添加黑名单 -->
      <el-card shadow="never" style="margin-bottom: 15px;">
        <div slot="header" style="font-weight: 500;">添加黑名单用户</div>
        <el-form :inline="true" :model="blacklistDialog.form" size="small">
          <el-form-item label="用户ID" required>
            <el-input
              v-model="blacklistDialog.form.user_id"
              placeholder="请输入要封禁的用户ID"
              clearable
              style="width: 250px;"
              @keyup.enter.native="addBlacklist"
            ></el-input>
          </el-form-item>
          <el-form-item label="封禁原因">
            <el-input
              v-model="blacklistDialog.form.reason"
              placeholder="可选，填写封禁原因"
              clearable
              style="width: 250px;"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" @click="addBlacklist" :loading="blacklistDialog.adding">
              <i class="el-icon-plus"></i> 添加封禁
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 黑名单列表 -->
      <el-card shadow="never">
        <div slot="header" style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 500;">黑名单列表</span>
          <el-button type="primary" size="mini" icon="el-icon-refresh" @click="loadBlacklist" :loading="blacklistDialog.loading">刷新</el-button>
        </div>
        <div v-if="blacklistDialog.loading" style="text-align: center; padding: 30px;">
          <i class="el-icon-loading"></i> 加载中...
        </div>
        <el-table
          v-else
          :data="blacklistDialog.list"
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
        <div v-if="!blacklistDialog.loading && blacklistDialog.list.length === 0" style="text-align: center; padding: 30px; color: #909399;">
          暂无黑名单用户
        </div>
      </el-card>

      <span slot="footer" class="dialog-footer">
        <el-button @click="blacklistDialog.visible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </view>
</template>

<script>
let that;
let vk = uni.vk;

export default {
  data() {
    return {
      isAdmin: false,
      fixLoading: false,
      summaryStats: {
        totalUsers: 0,
        totalPoints: 0,
        totalConsumed: 0,
        totalAvailable: 0,
        totalMachines: 0,
      },
      table1: {
        action: "admin/statistics/sys/getUserPointsSummary",
        columns: [
          {
            key: "user_info",
            title: "用户信息",
            type: "text",
            width: 200,
            slot: true,
          },
          {
            key: "total_points",
            title: "购买积分数",
            type: "text",
            width: 120,
            align: "right",
          },
          {
            key: "consumed_points",
            title: "使用积分数",
            type: "text",
            width: 120,
            align: "right",
          },
          {
            key: "available_points",
            title: "剩余积分数",
            type: "text",
            width: 120,
            align: "right",
          },
          {
            key: "frozen_points",
            title: "冻结积分",
            type: "text",
            width: 100,
            align: "right",
          },
          {
            key: "total_machines",
            title: "绑定机器数",
            type: "text",
            width: 120,
            align: "right",
            slot: true,
          },
          {
            key: "_update_time_str",
            title: "更新时间",
            type: "text",
            width: 180,
          },
        ],
        customRightBtns: [
          {
            title: "充值",
            icon: "el-icon-plus",
            type: "success",
            onClick: (item) => that.showRechargeDialog(item),
          },
          {
            title: "查看详情",
            icon: "el-icon-view",
            type: "primary",
            onClick: (item) => that.showUserDetail(item),
          },
        ],
      },
      rechargeDialog: {
        visible: false,
        loading: false,
        userId: '',
        userName: '',
        currentBalance: 0,
        form: {
          amount: 100,
          remark: '',
        },
      },
      detailDialog: {
        visible: false,
        loading: false,
        userId: '',
        userName: '',
        detailList: [],
        duplicateOrders: [],
        duplicateCount: 0,
      },
      purchaseRecordsDialog: {
        visible: false,
        loading: false,
        fixing: false, // 是否正在修正
        data: [],
        allData: [], // 保存所有查询到的数据
        total: 0,
        filterRemarkMismatch: false, // 是否筛选产品表名称与积分流水备注名称不一致的记录
        queryForm: {
          user_id: '',
          product_id: '',
        },
      },
      purchaseRecordsLoading: false,
      checkOrderDialog: {
        visible: false,
        loading: false,
        recharging: false,
        form: {
          trade_no: '',
        },
        result: null,
      },
      // 清理重复卡密弹窗
      removeDuplicateDialog: {
        visible: false,
        loading: false,
        deleting: false,
        dryRun: true,
        result: null,
      },
      // 黑名单管理弹窗
      blacklistDialog: {
        visible: false,
        loading: false,
        adding: false,
        list: [],
        form: {
          user_id: '',
          reason: '',
        },
      },
    };
  },
  onLoad() {
    that = this;
    vk = that.vk;
    that.init();
    that.checkAdmin();
  },
  methods: {
    // 检查是否是管理员
    async checkAdmin() {
      try {
        const userInfo = vk.getVuex('$user.userInfo') || {};
        that.isAdmin = userInfo.role && Array.isArray(userInfo.role) && userInfo.role.includes('admin');
      } catch (e) {
        that.isAdmin = false;
      }
    },
    // 处理数据修复命令
    handleDataFixCommand(command) {
      if (command === 'scanDuplicate') {
        that.scanDuplicateRecharge();
      } else if (command === 'checkNegative') {
        that.checkNegativePoints();
      } else if (command === 'removeDuplicateCards') {
        that.showRemoveDuplicateDialog();
      } else if (command === 'viewCardStats') {
        that.viewCardStats();
      }
    },
    // 扫描重复充值
    async scanDuplicateRecharge() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/fixDuplicateRecharge",
          data: { action: 'scan' }
        });
        
        if (res.code === 0 && res.data && res.data.users && res.data.users.length > 0) {
          const users = res.data.users;
          let message = `发现 ${users.length} 个用户有重复充值问题：\n\n`;
          users.forEach((u, i) => {
            message += `${i + 1}. ${u.user_name}：${u.extra_records}条重复记录，多充${u.extra_points}积分\n`;
          });
          message += '\n是否立即修复？（将删除重复记录并扣除多充的积分）';
          
          try {
            await that.$confirm(message, '扫描结果', {
              confirmButtonText: '立即修复',
              cancelButtonText: '取消',
              type: 'warning'
            });
            // 执行修复
            await that.fixDuplicateRecharge();
          } catch (e) {
            // 用户取消
          }
        } else {
          vk.toast(res.msg || '没有发现重复充值问题');
        }
      } catch (err) {
        vk.toast('扫描失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    // 修复重复充值
    async fixDuplicateRecharge() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/fixDuplicateRecharge",
          data: { action: 'fix' }
        });
        
        if (res.code === 0) {
          vk.toast(res.msg, 'success');
          // 刷新数据
          that.$refs.table1.refresh();
          that.loadSummaryStats();
          // 如果详情弹窗打开着，刷新详情
          if (that.detailDialog.visible && that.detailDialog.userId) {
            that.refreshUserDetail();
          }
        } else {
          vk.toast(res.msg || '修复失败');
        }
      } catch (err) {
        vk.toast('修复失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    // 刷新用户详情
    async refreshUserDetail() {
      if (!that.detailDialog.userId) return;
      
      that.detailDialog.loading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/statistics/sys/getUserPointsDetail",
          data: {
            user_id: that.detailDialog.userId,
            pageSize: 200,
          },
        });

        if (res.code === 0) {
          that.detailDialog.detailList = res.rows || [];
          that.checkDuplicateOrders();
        }
      } catch (err) {
        console.error('刷新用户详情失败：', err);
      } finally {
        that.detailDialog.loading = false;
      }
    },
    // 检查欠费用户
    async checkNegativePoints() {
      that.fixLoading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/checkNegativePoints"
        });
        
        if (res.code === 0 && res.data) {
          const users = res.data.users || [];
          if (users.length === 0) {
            vk.toast('所有用户积分正常');
            return;
          }
          
          let message = `<div style="max-height: 400px; overflow-y: auto;">`;
          message += `<p style="margin-bottom: 10px;">发现 <b>${users.length}</b> 个用户积分有问题：</p>`;
          message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`;
          message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">用户</th><th style="padding: 8px; border: 1px solid #eee;">当前</th><th style="padding: 8px; border: 1px solid #eee;">应为</th><th style="padding: 8px; border: 1px solid #eee;">需补</th></tr>`;
          
          users.slice(0, 50).forEach(u => {
            message += `<tr>`;
            message += `<td style="padding: 6px; border: 1px solid #eee;">${u.user_name}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right;">${u.current_points}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right; color: #F56C6C;">${u.calculated_points}</td>`;
            message += `<td style="padding: 6px; border: 1px solid #eee; text-align: right; color: #E6A23C; font-weight: bold;">${u.should_pay}</td>`;
            message += `</tr>`;
          });
          
          message += `</table>`;
          message += `<p style="margin-top: 15px; font-weight: bold; color: #F56C6C;">总计需补：${res.data.total_should_pay} 积分</p>`;
          message += `</div>`;
          
          that.$alert(message, '欠费用户检查结果', { 
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          });
        } else {
          vk.toast(res.msg || '检查失败');
        }
      } catch (err) {
        vk.toast('检查失败：' + (err.message || '未知错误'));
      } finally {
        that.fixLoading = false;
      }
    },
    // 初始化
    async init() {
      that.loadSummaryStats();
    },
    // 加载汇总统计
    async loadSummaryStats() {
      const res = await vk.callFunction({
        url: "admin/statistics/sys/getUserPointsSummary",
        data: {
          pageSize: -1, // 获取所有数据用于统计
        },
      });

      if (res.code === 0 && res.rows) {
        that.summaryStats.totalUsers = res.rows.length;
        that.summaryStats.totalPoints = res.rows.reduce(
          (sum, item) => sum + (item.total_points || 0),
          0
        );
        that.summaryStats.totalConsumed = res.rows.reduce(
          (sum, item) => sum + (item.consumed_points || 0),
          0
        );
        that.summaryStats.totalAvailable = res.rows.reduce(
          (sum, item) => sum + (item.available_points || 0),
          0
        );
      }
      
      // 获取所有用户绑定的机器总数
      try {
        const machinesRes = await vk.callFunction({
          url: "admin/statistics/sys/getTotalMachines",
        });
        
        if (machinesRes.code === 0 && machinesRes.data) {
          that.summaryStats.totalMachines = machinesRes.data.totalMachines || 0;
        }
      } catch (err) {
        console.error('获取机器数量失败：', err);
        that.summaryStats.totalMachines = 0;
      }
    },
    // 显示用户详情
    async showUserDetail(row) {
      if (!row.user_id) return;

      that.detailDialog.visible = true;
      that.detailDialog.userId = row.user_id;
      that.detailDialog.userName = row.user_display_name;
      that.detailDialog.detailList = [];
      that.detailDialog.loading = true;

      try {
        const res = await vk.callFunction({
          url: "admin/statistics/sys/getUserPointsDetail",
          data: {
            user_id: row.user_id,
            pageSize: 200, // 最多显示200条记录
          },
        });

        if (res.code === 0) {
          that.detailDialog.detailList = res.rows || [];
          // 检测重复订单号
          that.checkDuplicateOrders();
        } else {
          vk.toast(res.msg || '加载失败');
          that.detailDialog.detailList = [];
          that.detailDialog.duplicateOrders = [];
          that.detailDialog.duplicateCount = 0;
        }
      } catch (err) {
        console.error('加载用户详情失败：', err);
        vk.toast('加载失败');
        that.detailDialog.detailList = [];
        that.detailDialog.duplicateOrders = [];
        that.detailDialog.duplicateCount = 0;
      } finally {
        that.detailDialog.loading = false;
      }
    },
    // 检测重复订单号
    checkDuplicateOrders() {
      const orderCount = {};
      
      // 统计每个订单号出现的次数
      that.detailDialog.detailList.forEach(item => {
        if (item.order_id) {
          orderCount[item.order_id] = (orderCount[item.order_id] || 0) + 1;
        }
      });
      
      // 找出重复的订单号（出现次数 > 1）
      const duplicates = [];
      let totalDuplicateCount = 0;
      
      for (const [orderId, count] of Object.entries(orderCount)) {
        if (count > 1) {
          duplicates.push({ order_id: orderId, count });
          totalDuplicateCount += count;
        }
      }
      
      that.detailDialog.duplicateOrders = duplicates;
      that.detailDialog.duplicateCount = totalDuplicateCount;
    },
    // 搜索购买记录（点击查询按钮）
    async searchPurchaseRecords() {
      // 验证至少输入了用户ID或产品ID
      const user_id = (that.purchaseRecordsDialog.queryForm.user_id || '').trim();
      const product_id = (that.purchaseRecordsDialog.queryForm.product_id || '').trim();
      
      if (!user_id && !product_id) {
        vk.toast('请输入用户ID或产品ID');
        return;
      }
      
      // 先打开弹窗
      that.purchaseRecordsDialog.visible = true;
      // 然后执行搜索（弹窗中会显示加载状态）
      await that.loadPurchaseRecords();
    },
    // 加载购买记录
    async loadPurchaseRecords() {
      // 验证至少输入了用户ID或产品ID
      const user_id = (that.purchaseRecordsDialog.queryForm.user_id || '').trim();
      const product_id = (that.purchaseRecordsDialog.queryForm.product_id || '').trim();
      
      if (!user_id && !product_id) {
        vk.toast('请输入用户ID或产品ID');
        return;
      }
      
      that.purchaseRecordsDialog.loading = true;
      that.purchaseRecordsLoading = true;

      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/getPurchaseRecords",
          data: {
            user_id: user_id || '',
            product_id: product_id || '',
            pageIndex: 1,
            pageSize: 100
          },
        });

        if (res.code === 0) {
          that.purchaseRecordsDialog.allData = res.rows || [];
          that.purchaseRecordsDialog.total = res.total || 0;
          // 应用筛选
          that.filterPurchaseRecords();
          vk.toast(res.msg || '查询完成');
        } else {
          vk.toast(res.msg || '查询失败');
        }
      } catch (err) {
        console.error('查询购买记录失败：', err);
        vk.toast('查询失败');
      } finally {
        that.purchaseRecordsDialog.loading = false;
        that.purchaseRecordsLoading = false;
      }
    },
    // 筛选购买记录
    filterPurchaseRecords() {
      if (!that.purchaseRecordsDialog.filterRemarkMismatch) {
        // 不筛选，显示所有数据
        that.purchaseRecordsDialog.data = that.purchaseRecordsDialog.allData;
      } else {
        // 筛选出产品表正确名称与积分流水备注名称不一致的记录
        // 使用积分流水中的product_id对应的产品表名称（points_log_product_name_from_table）
        // 与积分流水备注中的名称（points_log_product_name_from_remark）对比
        that.purchaseRecordsDialog.data = that.purchaseRecordsDialog.allData.filter(record => {
          // 优先使用积分流水中的product_id对应的产品表名称
          const correctName = record.points_log_product_name_from_table || record.correct_product_name || '';
          const remarkName = record.points_log_product_name_from_remark || '';
          // 两个名称都存在且不一致
          return correctName && remarkName && correctName !== remarkName;
        });
      }
    },
    // 重置购买记录查询
    resetPurchaseRecordsQuery() {
      that.purchaseRecordsDialog.queryForm = {
        user_id: '',
        product_id: '',
      };
      that.purchaseRecordsDialog.data = [];
      that.purchaseRecordsDialog.allData = [];
      that.purchaseRecordsDialog.total = 0;
      that.purchaseRecordsDialog.filterRemarkMismatch = false;
    },
    // 修正产品名称
    async fixProductNames() {
      // 获取需要修正的记录（当前筛选出的不一致记录）
      const recordsToFix = that.purchaseRecordsDialog.data.filter(record => {
        // 只修正产品表名称与积分流水备注名称不一致的记录
        const correctName = record.points_log_product_name_from_table || record.correct_product_name || '';
        const remarkName = record.points_log_product_name_from_remark || '';
        return correctName && remarkName && correctName !== remarkName;
      });
      
      if (recordsToFix.length === 0) {
        vk.toast('没有需要修正的记录');
        return;
      }
      
      // 确认操作
      try {
        await that.$confirm(
          `确定要修正 ${recordsToFix.length} 条记录吗？\n将修改积分流水的备注和卡密记录的名称，使其与产品表中的名称一致。`,
          '确认修正',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      } catch {
        return; // 用户取消
      }
      
      that.purchaseRecordsDialog.fixing = true;
      
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/fixProductNames",
          data: {
            records: recordsToFix.map(record => ({
              card_id: record.card_id,
              points_log_id: record.points_log_id,
              correct_product_id: record.points_log_product_id || record.correct_product_id,
              correct_product_name: record.points_log_product_name_from_table || record.correct_product_name,
            }))
          },
        });
        
        if (res.code === 0) {
          vk.toast(res.msg || '修正成功', 'success');
          // 重新加载数据
          await that.loadPurchaseRecords();
        } else {
          vk.toast(res.msg || '修正失败');
        }
      } catch (err) {
        console.error('修正名称失败：', err);
        vk.toast('修正失败：' + (err.message || '未知错误'));
      } finally {
        that.purchaseRecordsDialog.fixing = false;
      }
    },
    // 显示充值弹窗
    showRechargeDialog(row) {
      that.rechargeDialog.userId = row.user_id;
      that.rechargeDialog.userName = row.user_display_name;
      that.rechargeDialog.currentBalance = row.available_points || 0;
      that.rechargeDialog.form = {
        order_id: '',
        amount: 100,
        remark: '',
      };
      that.rechargeDialog.visible = true;
    },
    // 提交充值
    async submitRecharge() {
      const orderId = (that.rechargeDialog.form.order_id || '').trim();
      
      if (!orderId) {
        vk.toast('请输入订单号');
        return;
      }
      
      if (!that.rechargeDialog.form.amount || that.rechargeDialog.form.amount <= 0) {
        vk.toast('请输入有效的充值积分数量');
        return;
      }
      
      try {
        await that.$confirm(
          `确定要给用户 ${that.rechargeDialog.userName} 充值 ${that.rechargeDialog.form.amount} 积分吗？\n订单号：${orderId}`,
          '确认充值',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      } catch {
        return;
      }
      
      that.rechargeDialog.loading = true;
      
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/recharge",
          data: {
            user_id: that.rechargeDialog.userId,
            order_id: orderId,
            amount: that.rechargeDialog.form.amount,
            remark: that.rechargeDialog.form.remark || '',
          },
        });
        
        if (res.code === 0) {
          vk.toast('充值成功', 'success');
          that.rechargeDialog.visible = false;
          // 刷新表格数据
          that.$refs.table1.refresh();
          that.loadSummaryStats();
        } else {
          vk.toast(res.msg || '充值失败');
        }
      } catch (err) {
        console.error('充值失败：', err);
        vk.toast('充值失败：' + (err.message || '未知错误'));
      } finally {
        that.rechargeDialog.loading = false;
      }
    },
    // 显示查询订单弹窗
    showCheckOrderDialog() {
      that.checkOrderDialog.visible = true;
      that.checkOrderDialog.form.trade_no = '';
      that.checkOrderDialog.result = null;
    },
    // 显示清理重复卡密弹窗
    showRemoveDuplicateDialog() {
      that.removeDuplicateDialog.visible = true;
      that.removeDuplicateDialog.dryRun = true;
      that.removeDuplicateDialog.result = null;
    },
    // 查看卡密统计
    async viewCardStats() {
      try {
        const res = await vk.callFunction({
          url: "admin/card/sys/getCardStats",
          data: {}
        });

        if (res.code === 0 && res.data) {
          const data = res.data;
          let message = `<div style="max-height: 500px; overflow-y: auto;">`;

          // 总记录数
          message += `<h4 style="margin: 15px 0 10px;">总记录数：${data.total}</h4>`;

          // 卡密类型分布
          if (data.type_distribution && data.type_distribution.length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">卡密类型分布：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">类型</th><th style="padding: 8px; border: 1px solid #eee;">数量</th></tr>`;
            data.type_distribution.forEach(item => {
              message += `<tr><td style="padding: 6px; border: 1px solid #eee;">${item._id || '未分类'}</td><td style="padding: 6px; border: 1px solid #eee; text-align: right;">${item.count}</td></tr>`;
            });
            message += `</table>`;
          }

          // 卡密长度分布
          if (data.length_distribution && Object.keys(data.length_distribution).length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">卡密长度分布：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 8px; border: 1px solid #eee;">长度</th><th style="padding: 8px; border: 1px solid #eee;">数量</th></tr>`;
            Object.entries(data.length_distribution).sort((a, b) => a[0] - b[0]).forEach(([len, count]) => {
              message += `<tr><td style="padding: 6px; border: 1px solid #eee;">${len} 位</td><td style="padding: 6px; border: 1px solid #eee; text-align: right;">${count}</td></tr>`;
            });
            message += `</table>`;
          }

          // 最近的卡密示例
          if (data.recent_cards && data.recent_cards.length > 0) {
            message += `<h4 style="margin: 15px 0 10px;">最近的卡密示例：</h4>`;
            message += `<table style="width: 100%; border-collapse: collapse; font-size: 12px;">`;
            message += `<tr style="background: #f5f7fa;"><th style="padding: 6px; border: 1px solid #eee;">卡密编码</th><th style="padding: 6px; border: 1px solid #eee;">类型</th><th style="padding: 6px; border: 1px solid #eee;">时间</th></tr>`;
            data.recent_cards.forEach(card => {
              const timeStr = that.formatDateTime(card._add_time);
              message += `<tr><td style="padding: 4px; border: 1px solid #eee; font-family: monospace;">${card.card_code}</td><td style="padding: 4px; border: 1px solid #eee;">${card.card_type || '-'}</td><td style="padding: 4px; border: 1px solid #eee; color: #909399;">${timeStr}</td></tr>`;
            });
            message += `</table>`;
          }

          message += `</div>`;

          that.$alert(message, '卡密统计信息', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            customClass: 'card-stats-dialog'
          });
        } else {
          vk.toast(res.msg || '获取统计失败');
        }
      } catch (err) {
        console.error('获取卡密统计失败：', err);
        vk.toast('获取统计失败：' + (err.message || '未知错误'));
      }
    },
    // 格式化日期时间
    formatDateTime(timestamp) {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    // 扫描重复卡密
    async scanDuplicateCards() {
      that.removeDuplicateDialog.loading = true;
      that.removeDuplicateDialog.result = null;

      try {
        const res = await vk.callFunction({
          url: "admin/card/sys/removeDuplicateCards",
          data: {
            dry_run: that.removeDuplicateDialog.dryRun
          }
        });

        if (res.code === 0) {
          that.removeDuplicateDialog.result = res.data;
          if (that.removeDuplicateDialog.dryRun) {
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
        that.removeDuplicateDialog.loading = false;
      }
    },
    // 执行删除重复卡密
    async executeRemoveDuplicateCards() {
      const toDeleteCount = that.removeDuplicateDialog.result?.to_delete_count || 0;
      if (toDeleteCount === 0) return;

      try {
        await that.$confirm(
          `确定要删除 ${toDeleteCount} 条重复卡密记录吗？\n此操作不可恢复，请谨慎操作！`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'danger'
          }
        );
      } catch {
        return; // 用户取消
      }

      that.removeDuplicateDialog.deleting = true;

      try {
        const res = await vk.callFunction({
          url: "admin/card/sys/removeDuplicateCards",
          data: {
            dry_run: false
          }
        });

        if (res.code === 0) {
          vk.toast(res.msg, 'success');
          that.removeDuplicateDialog.result = res.data;
          // 删除完成后，重新扫描以更新状态
          setTimeout(() => {
            that.scanDuplicateCards();
          }, 500);
        } else {
          vk.toast(res.msg || '删除失败');
        }
      } catch (err) {
        console.error('删除重复卡密失败：', err);
        vk.toast('删除失败：' + (err.message || '未知错误'));
      } finally {
        that.removeDuplicateDialog.deleting = false;
      }
    },
    // 查询订单状态
    async checkOrderStatus() {
      const trade_no = (that.checkOrderDialog.form.trade_no || '').trim();
      
      if (!trade_no) {
        vk.toast('请输入订单号');
        return;
      }
      
      that.checkOrderDialog.loading = true;
      
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/checkOrderStatus",
          data: { trade_no },
        });
        
        if (res.code === 0) {
          that.checkOrderDialog.result = res.data;
        } else {
          vk.toast(res.msg || '查询失败');
          that.checkOrderDialog.result = null;
        }
      } catch (err) {
        console.error('查询订单状态失败：', err);
        vk.toast('查询失败：' + (err.message || '未知错误'));
        that.checkOrderDialog.result = null;
      } finally {
        that.checkOrderDialog.loading = false;
      }
    },
    // 从订单手动补发积分
    async manualRechargeFromOrder() {
      const result = that.checkOrderDialog.result;
      if (!result || !result.order) return;
      
      const order = result.order;
      const totalPoints = (order.points || 0) + (order.bonus || 0);
      
      try {
        await that.$confirm(
          `确定要手动补发积分吗？\n订单号：${order.trade_no}\n积分数量：${totalPoints}`,
          '确认补发',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      } catch {
        return;
      }
      
      that.checkOrderDialog.recharging = true;
      
      try {
        const res = await vk.callFunction({
          url: "admin/points/sys/recharge",
          data: {
            user_id: order.user_id,
            order_id: order.trade_no,
            amount: totalPoints,
            remark: `手动补发：${order.package_name}`,
          },
        });
        
        if (res.code === 0) {
          vk.toast('补发成功', 'success');
          // 重新查询订单状态
          await that.checkOrderStatus();
          // 刷新表格数据
          that.$refs.table1.refresh();
          that.loadSummaryStats();
        } else {
          vk.toast(res.msg || '补发失败');
        }
      } catch (err) {
        console.error('补发失败：', err);
        vk.toast('补发失败：' + (err.message || '未知错误'));
      } finally {
        that.checkOrderDialog.recharging = false;
      }
    },
    // ==================== 黑名单管理 ====================
    // 显示黑名单弹窗
    showBlacklistDialog() {
      that.blacklistDialog.visible = true;
      that.blacklistDialog.form = { user_id: '', reason: '' };
      that.loadBlacklist();
    },
    // 加载黑名单列表
    async loadBlacklist() {
      that.blacklistDialog.loading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/blacklist/sys/getList",
          data: { pageSize: 200 },
        });
        if (res.code === 0) {
          that.blacklistDialog.list = (res.data && res.data.rows) || [];
          // 格式化时间
          that.blacklistDialog.list.forEach(item => {
            item._add_time_str = that.formatDateTime(item._add_time);
          });
        } else {
          vk.toast(res.msg || '加载失败');
        }
      } catch (err) {
        console.error('加载黑名单失败：', err);
        vk.toast('加载失败');
      } finally {
        that.blacklistDialog.loading = false;
      }
    },
    // 添加黑名单
    async addBlacklist() {
      const user_id = (that.blacklistDialog.form.user_id || '').trim();
      if (!user_id) {
        vk.toast('请输入用户ID');
        return;
      }

      that.blacklistDialog.adding = true;
      try {
        const res = await vk.callFunction({
          url: "admin/blacklist/sys/add",
          data: {
            user_id,
            reason: (that.blacklistDialog.form.reason || '').trim(),
          },
        });
        if (res.code === 0) {
          vk.toast(res.msg || '添加成功', 'success');
          that.blacklistDialog.form = { user_id: '', reason: '' };
          that.loadBlacklist();
        } else {
          vk.toast(res.msg || '添加失败');
        }
      } catch (err) {
        console.error('添加黑名单失败：', err);
        vk.toast('添加失败');
      } finally {
        that.blacklistDialog.adding = false;
      }
    },
    // 移除黑名单
    async removeBlacklist(row) {
      try {
        await that.$confirm(
          `确定要解除用户 ${row.user_id} 的封禁吗？`,
          '解除封禁',
          {
            confirmButtonText: '确定解除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      } catch {
        return;
      }

      try {
        const res = await vk.callFunction({
          url: "admin/blacklist/sys/delete",
          data: { _id: row._id },
        });
        if (res.code === 0) {
          vk.toast(res.msg || '已解除', 'success');
          that.loadBlacklist();
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

<style lang="scss" scoped>
.page-body {
  padding: 20px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stats-card {
  flex: 1;
  min-width: 200px;
}

.stats-item {
  text-align: center;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.detail-loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.detail-empty {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.detail-summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  color: #909399;
  margin-right: 8px;
}

.summary-value {
  font-weight: 500;
  color: #303133;
}

.tools-card {
  ::v-deep .el-card__body {
    padding: 15px 20px;
  }
}

.tools-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.tools-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.tools-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.check-summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.purchase-query-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
