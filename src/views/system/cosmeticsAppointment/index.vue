<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="预约单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入预约单号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="预约状态" clearable style="width: 140px">
          <el-option v-for="dict in cosm_appoint_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="appointmentList">
      <el-table-column label="预约单号" align="center" prop="orderNo" min-width="150" />
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" min-width="110" />
      <el-table-column label="数量" align="center" prop="quantity" width="70" />
      <el-table-column label="总价(元)" align="center" prop="totalAmount" width="110" />
      <el-table-column label="预约人" align="center" prop="userName" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <dict-tag :options="cosm_appoint_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="预约到店时间" align="center" prop="appointTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.appointTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center" prop="expireTime" width="150">
        <template #default="scope">
          <span v-if="scope.row.status === '0' && scope.row.expireTime">{{ parseTime(scope.row.expireTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="快递信息" align="center" width="150">
        <template #default="scope">
          <span v-if="scope.row.expressNo">{{ scope.row.expressCompany }} {{ scope.row.expressNo }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" fixed="right">
        <template #default="scope">
          <!-- 买家操作 -->
          <template v-if="isBuyerView">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)" v-if="scope.row.status === '0'" v-hasPermi="['cosmetics:appointment:edit']">修改</el-button>
            <el-button
              link type="primary" icon="RefreshLeft" @click="handleCancel(scope.row)"
              v-if="scope.row.status === '0' || scope.row.status === '1'"
              v-hasPermi="['cosmetics:appointment:cancel']"
            >取消</el-button>
            <el-button link type="primary" icon="Truck" @click="handleTrack(scope.row)" v-if="scope.row.status === '4'" v-hasPermi="['cosmetics:appointment:list']">查物流</el-button>
          </template>
          <!-- 卖家操作 -->
          <template v-else-if="isSellerView">
            <el-button link type="success" icon="Check" @click="handleConfirm(scope.row)" v-if="scope.row.status === '0'" v-hasPermi="['cosmetics:appointment:ship']">确认</el-button>
            <el-button link type="warning" icon="Truck" @click="handleShip(scope.row)" v-if="scope.row.status === '1'" v-hasPermi="['cosmetics:appointment:ship']">发货</el-button>
            <el-button link type="primary" icon="Search" @click="handleTrack(scope.row)" v-if="scope.row.status === '4'" v-hasPermi="['cosmetics:appointment:list']">查物流</el-button>
          </template>
          <!-- 管理员: 确认/发货/取消/删除 -->
          <template v-if="isAdminView">
            <el-button link type="success" icon="Check" @click="handleConfirm(scope.row)" v-if="scope.row.status === '0'" v-hasPermi="['cosmetics:appointment:ship']">确认</el-button>
            <el-button link type="warning" icon="Truck" @click="handleShip(scope.row)" v-if="scope.row.status === '1'" v-hasPermi="['cosmetics:appointment:ship']">发货</el-button>
            <el-button link type="warning" icon="CancelLeft" @click="handleCancel(scope.row)" v-if="scope.row.status === '0' || scope.row.status === '1'" v-hasPermi="['cosmetics:appointment:cancel']">取消</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cosmetics:appointment:remove']">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 买家修改预约 -->
    <el-dialog title="修改预约" v-model="editOpen" width="560px" append-to-body>
      <el-form ref="editRef" :model="editForm" :rules="bookRules" label-width="110px">
        <el-form-item label="商品名称">
          <span>{{ editForm.goodsName }}</span>
        </el-form-item>
        <el-form-item label="预约数量" prop="quantity">
          <el-input-number v-model="editForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="预约到店时间" prop="appointTime">
          <el-date-picker v-model="editForm.appointTime" type="datetime" placeholder="选择预约时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="editForm.contactPhone" />
        </el-form-item>
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="editForm.receiverName" />
        </el-form-item>
        <el-form-item label="收货联系方式" prop="receiverPhone">
          <el-input v-model="editForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiverAddr">
          <el-input v-model="editForm.receiverAddr" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitEdit">确 定</el-button>
          <el-button @click="editOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 卖家发货 -->
    <el-dialog title="卖家发货" v-model="shipOpen" width="480px" append-to-body>
      <el-form ref="shipRef" :model="shipForm" :rules="shipRules" label-width="90px">
        <el-form-item label="预约单号">
          <span>{{ shipForm.orderNo }}</span>
        </el-form-item>
        <el-form-item label="快递公司" prop="expressCompany">
          <el-input v-model="shipForm.expressCompany" placeholder="如 顺丰/SF" />
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitShip">确认发货</el-button>
          <el-button @click="shipOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <express-track v-model="trackOpen" ref="trackRef" />
  </div>
</template>

<script setup name="CosmeticsAppointment">
import ExpressTrack from "./ExpressTrack"
import {
  listAppointment, cancelAppointment, confirmAppointment, shipAppointment, updateAppointment, delAppointment
} from "@/api/system/cosmeticsAppointment"
import useUserStore from "@/store/modules/user"

const { proxy } = getCurrentInstance()
const { cosm_appoint_status } = useDict("cosm_appoint_status")

const userStore = useUserStore()
const roles = computed(() => userStore.roles)
const isBuyerView = computed(() => !roles.value.includes("seller") && !roles.value.includes("admin"))
const isSellerView = computed(() => roles.value.includes("seller"))
const isAdminView = computed(() => roles.value.includes("admin"))

const appointmentList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const editOpen = ref(false)
const shipOpen = ref(false)
const trackOpen = ref(false)
const trackRef = ref()

const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, orderNo: undefined, goodsName: undefined, status: undefined },
  editForm: {},
  shipForm: {},
  bookRules: {
    quantity: [{ required: true, message: "预约数量不能为空", trigger: "blur" }],
    receiverName: [{ required: true, message: "收货人不能为空", trigger: "blur" }],
    receiverPhone: [{ required: true, message: "收货联系方式不能为空", trigger: "blur" }],
    receiverAddr: [{ required: true, message: "收货地址不能为空", trigger: "blur" }]
  },
  shipRules: {
    expressCompany: [{ required: true, message: "快递公司不能为空", trigger: "blur" }],
    expressNo: [{ required: true, message: "快递单号不能为空", trigger: "blur" }]
  }
})

const { queryParams, editForm, shipForm, bookRules, shipRules } = toRefs(data)

function getList() {
  loading.value = true
  listAppointment(queryParams.value).then(response => {
    appointmentList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm("queryRef"); handleQuery() }

/** 买家修改 */
function handleEdit(row) {
  editForm.value = {
    id: row.id, goodsName: row.goodsName, quantity: row.quantity,
    appointTime: row.appointTime, contactPhone: row.contactPhone,
    receiverName: row.receiverName, receiverPhone: row.receiverPhone, receiverAddr: row.receiverAddr
  }
  editOpen.value = true
}

function submitEdit() {
  proxy.$refs["editRef"].validate(valid => {
    if (valid) {
      updateAppointment(editForm.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        editOpen.value = false
        getList()
      })
    }
  })
}

/** 取消预约 */
function handleCancel(row) {
  proxy.$modal.confirm('是否确认取消预约单"' + row.orderNo + '"？').then(() => {
    return cancelAppointment(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("已取消")
    getList()
  }).catch(() => {})
}

/** 卖家确认 */
function handleConfirm(row) {
  proxy.$modal.confirm('是否确认预约单"' + row.orderNo + '"？').then(() => {
    return confirmAppointment(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("已确认")
    getList()
  }).catch(() => {})
}

/** 卖家发货 */
function handleShip(row) {
  shipForm.value = { id: row.id, orderNo: row.orderNo, expressCompany: undefined, expressNo: undefined }
  shipOpen.value = true
}

function submitShip() {
  proxy.$refs["shipRef"].validate(valid => {
    if (valid) {
      shipAppointment(shipForm.value).then(() => {
        proxy.$modal.msgSuccess("发货成功")
        shipOpen.value = false
        getList()
      })
    }
  })
}

/** 查看物流 */
function handleTrack(row) {
  trackRef.value.open(row.id)
}

/** 删除(管理员) */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除预约单"' + row.orderNo + '"？').then(() => {
    return delAppointment(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

getList()
</script>