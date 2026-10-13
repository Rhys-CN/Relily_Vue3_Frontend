<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入商品名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input
          v-model="queryParams.category"
          placeholder="洁面 / 面霜 / 乳液..."
          clearable
          style="width: 160px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="商品状态" clearable style="width: 120px">
          <el-option label="上架" value="0" />
          <el-option label="下架" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-if="isSellerView"
          v-hasPermi="['cosmetics:product:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList">
      <el-table-column label="主图" align="center" width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.image"
            :src="scope.row.image"
            fit="cover"
            style="width: 48px; height: 48px; border-radius: 4px"
            :preview-src-list="[scope.row.image]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <a class="link-type" style="cursor:pointer" @click="handleView(scope.row)">{{ scope.row.goodsName }}</a>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" prop="category" width="90" />
      <el-table-column label="品牌" align="center" prop="brand" width="90" />
      <el-table-column label="成色" align="center" width="110">
        <template #default="scope">
          <dict-tag :options="cosm_condition_level" :value="scope.row.conditionLevel" />
        </template>
      </el-table-column>
      <el-table-column label="价格(元)" align="center" prop="price" width="100" />
      <el-table-column label="库存" align="center" prop="stock" width="80" />
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="卖家" align="center" prop="sellerName" width="100" />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button
            v-if="!isSellerView && scope.row.status === '0' && scope.row.stock > 0"
            link
            type="primary"
            icon="ShoppingCart"
            @click="handleBook(scope.row)"
            v-hasPermi="['cosmetics:appointment:add']"
          >预约</el-button>
          <template v-if="isSellerView">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['cosmetics:product:edit']">修改</el-button>
            <el-button
              link
              :type="scope.row.status === '0' ? 'info' : 'success'"
              @click="handleChangeStatus(scope.row)"
              v-hasPermi="['cosmetics:product:edit']"
            >{{ scope.row.status === '0' ? '下架' : '上架' }}</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['cosmetics:product:remove']">删除</el-button>
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

    <!-- 商品详情浏览 -->
    <el-dialog :title="form.goodsName" v-model="viewOpen" width="720px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商品名称">{{ form.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ form.brand }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ form.category }}</el-descriptions-item>
        <el-descriptions-item label="成色">
          <dict-tag :options="cosm_condition_level" :value="form.conditionLevel" />
        </el-descriptions-item>
        <el-descriptions-item label="单价(元)">{{ form.price }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ form.stock }}</el-descriptions-item>
        <el-descriptions-item label="卖家">{{ form.sellerName }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ form.status === '0' ? '上架' : '下架' }}</el-descriptions-item>
        <el-descriptions-item label="说明详情" :span="2">{{ form.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注意事项" :span="2">
          <span style="color: #f56c6c">{{ form.notice || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="!isSellerView && form.status === '0' && form.stock > 0"
            type="primary"
            @click="viewOpen = false; handleBook(form)"
            v-hasPermi="['cosmetics:appointment:add']"
          >立即预约</el-button>
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 下单预约弹窗 -->
    <el-dialog :title="'预约下单 - ' + bookForm.goodsName" v-model="bookOpen" width="620px" append-to-body :close-on-click-modal="false">
      <el-form ref="bookRef" :model="bookForm" :rules="bookRules" label-width="110px">
        <el-form-item label="单价(元)">
          <span>{{ bookForm.unitPrice }}</span>
        </el-form-item>
        <el-form-item label="库存余量">
          <span>{{ bookForm.stock }}</span>
        </el-form-item>
        <el-form-item label="预约数量" prop="quantity">
          <el-input-number v-model="bookForm.quantity" :min="1" :max="bookForm.stock" />
        </el-form-item>
        <el-form-item label="预约到店时间" prop="appointTime">
          <el-date-picker
            v-model="bookForm.appointTime"
            type="datetime"
            placeholder="选择预约时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="bookForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="bookForm.receiverName" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="收货联系方式" prop="receiverPhone">
          <el-input v-model="bookForm.receiverPhone" placeholder="请输入收货联系方式" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiverAddr">
          <el-input v-model="bookForm.receiverAddr" type="textarea" :rows="2" placeholder="请输入收货地址(线下发货用)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBook">确认预约</el-button>
          <el-button @click="bookOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑商品(卖家/管理员) -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="goodsName">
              <el-input v-model="form.goodsName" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-input v-model="form.category" placeholder="洁面/面霜/乳液..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成色" prop="conditionLevel">
              <el-select v-model="form.conditionLevel" placeholder="请选择成色">
                <el-option v-for="dict in cosm_condition_level" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="主图地址" prop="image">
              <el-input v-model="form.image" placeholder="http://... 商品主图地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="0">上架</el-radio>
                <el-radio value="1">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明详情">
              <el-input v-model="form.description" type="textarea" placeholder="规格/使用情况等" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="注意事项">
              <el-input v-model="form.notice" type="textarea" placeholder="过敏提醒/过期提醒等" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CosmeticsProduct">
import {
  listProduct, getProduct, delProduct, addProduct, updateProduct, changeProductStatus
} from "@/api/system/cosmeticsProduct"
import { addAppointment } from "@/api/system/cosmeticsAppointment"
import useUserStore from "@/store/modules/user"

const { proxy } = getCurrentInstance()
const { cosm_condition_level } = useDict("cosm_condition_level")

// 当前用户是否为卖家/管理员(决定列表操作形态)
const userStore = useUserStore()
const roles = computed(() => userStore.roles)
const isSellerView = computed(() => roles.value.includes("seller") || roles.value.includes("admin"))

const productList = ref([])
const open = ref(false)
const viewOpen = ref(false)
const bookOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {
    id: undefined, version: undefined, goodsName: undefined, category: undefined,
    brand: undefined, price: undefined, stock: undefined, conditionLevel: undefined,
    image: undefined, description: undefined, notice: undefined, status: "0"
  },
  queryParams: { pageNum: 1, pageSize: 10, goodsName: undefined, category: undefined, status: undefined },
  rules: {
    goodsName: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
    price: [{ required: true, message: "单价不能为空", trigger: "blur" }]
  },
  bookForm: {},
  bookRules: {
    quantity: [{ required: true, message: "预约数量不能为空", trigger: "blur" }],
    receiverName: [{ required: true, message: "收货人不能为空", trigger: "blur" }],
    receiverPhone: [{ required: true, message: "收货联系方式不能为空", trigger: "blur" }],
    receiverAddr: [{ required: true, message: "收货地址不能为空", trigger: "blur" }]
  }
})

const { form, queryParams, rules, bookForm, bookRules } = toRefs(data)

/** 查询商品列表 */
function getList() {
  loading.value = true
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 查看详情 */
function handleView(row) {
  form.value = { ...row }
  viewOpen.value = true
}

/** 新增按钮 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商品"
}

/** 修改按钮 */
function handleUpdate(row) {
  reset()
  getProduct(row.id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改商品"
  })
}

/** 上架/下架 */
function handleChangeStatus(row) {
  const target = row.status === '0' ? '1' : '0'
  proxy.$modal.confirm('是否确认将该商品' + (target === '0' ? '上架' : '下架') + '？').then(() => {
    changeProductStatus({ id: row.id, status: target }).then(response => {
      proxy.$modal.msgSuccess("操作成功")
      getList()
    })
  }).catch(() => {})
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined, version: undefined, goodsName: undefined, category: undefined,
    brand: undefined, price: undefined, stock: undefined, conditionLevel: undefined,
    image: undefined, description: undefined, notice: undefined, status: "0"
  }
  proxy.resetForm("productRef")
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateProduct(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProduct(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除商品"' + row.goodsName + '"？').then(() => {
    return delProduct(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 打开下单预约弹窗 */
function handleBook(row) {
  bookForm.value = {
    goodsId: row.id,
    goodsName: row.goodsName,
    unitPrice: row.price,
    stock: row.stock,
    quantity: 1,
    appointTime: undefined,
    contactPhone: undefined,
    receiverName: undefined,
    receiverPhone: undefined,
    receiverAddr: undefined
  }
  bookOpen.value = true
}

/** 提交预约 */
function submitBook() {
  proxy.$refs["bookRef"].validate(valid => {
    if (valid) {
      addAppointment(bookForm.value).then(() => {
        proxy.$modal.msgSuccess("预约成功, 请等待卖家确认")
        bookOpen.value = false
      })
    }
  })
}

getList()
</script>