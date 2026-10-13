<template>
  <el-dialog title="物流轨迹" v-model="open" width="560px" append-to-body>
    <div class="track-head">
      <span>单号：{{ track.expressNo }}</span>
      <el-button link type="primary" icon="Refresh" @click="load(true)">刷新</el-button>
      <el-switch v-model="autoRefresh" active-text="自动刷新" style="margin-left: 10px" />
    </div>
    <el-empty v-if="!nodes.length" description="暂无物流轨迹" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="(node, index) in nodes"
        :key="index"
        :timestamp="node.time"
        :type="index === 0 ? 'primary' : ''"
        placement="top"
      >
        {{ node.context }}
      </el-timeline-item>
    </el-timeline>
  </el-dialog>
</template>

<script setup name="ExpressTrack">
import { getExpressTrack } from "@/api/system/cosmeticsAppointment"

const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(["update:modelValue"])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const track = ref({})
const nodes = ref([])
const autoRefresh = ref(false)
let timer = null

function open2(appointmentId) {
  track.value = { appointmentId }
  open.value = true
  load()
  if (!timer) {
    timer = setInterval(() => {
      if (open.value && autoRefresh.value) load()
    }, 5000)
  }
}

function load(manual = false) {
  if (!track.value.appointmentId) return
  getExpressTrack(track.value.appointmentId).then(res => {
    track.value = res.data || {}
    try {
      const arr = JSON.parse(track.value.trackInfo || "[]")
      nodes.value = Array.isArray(arr) ? arr : []
    } catch (e) {
      nodes.value = []
    }
  }).catch(() => {
    if (manual) proxy.$modal.msgError("查询物流失败")
  })
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

watch(() => open.value, (val) => { if (!val) autoRefresh.value = false })

defineExpose({ open: open2 })
</script>

<style scoped>
.track-head { display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
</style>