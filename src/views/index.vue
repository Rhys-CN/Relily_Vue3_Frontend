<template>
  <div class="app-container home">
    <!-- 欢迎区 -->
    <div class="welcome-card">
      <div class="welcome-info">
        <h2>你好，{{ userStore.nickName || userStore.name }}，欢迎回来</h2>
        <p>今天是 {{ today }}，祝你工作顺利，预约安排妥帖有序。</p>
      </div>
      <el-button type="primary" size="large" @click="router.push('/appointment/create')">
        <el-icon><Plus /></el-icon>&nbsp;新建预约
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="item in stats" :key="item.label">
        <el-card shadow="never" class="stat-card">
          <div class="stat-body">
            <div class="stat-icon" :style="{ background: item.bg, color: item.color }">
              <el-icon :size="22"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-meta">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 功能入口 -->
    <el-card shadow="never" class="entry-card">
      <template #header>
        <div class="card-title">快捷入口</div>
      </template>
      <div class="entry-list">
        <div class="entry-item" v-for="item in entries" :key="item.title" @click="router.push(item.path)">
          <div class="entry-icon" :style="{ background: item.bg, color: item.color }">
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
          </div>
          <span class="entry-title">{{ item.title }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="Index">
import useUserStore from '@/store/modules/user'
import { Calendar, Clock, CircleCheck, CircleClose, Plus, User, List, Files, Timer } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const today = ref('')
const weekMap = ['日', '一', '二', '三', '四', '五', '六']

const date = new Date()
today.value = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekMap[date.getDay()]}`

// 预约统计（示例数据，可对接后端接口）
const stats = ref([
  { label: '今日预约', value: 8, icon: Calendar, bg: 'rgba(0, 229, 255, 0.12)', color: '#00a3d9' },
  { label: '待确认', value: 3, icon: Clock, bg: 'rgba(255, 170, 0, 0.12)', color: '#e6a23c' },
  { label: '已完成', value: 45, icon: CircleCheck, bg: 'rgba(0, 200, 83, 0.12)', color: '#67c23a' },
  { label: '已取消', value: 6, icon: CircleClose, bg: 'rgba(245, 108, 108, 0.12)', color: '#f56c6c' }
])

// 快捷入口
const entries = ref([
  { title: '新建预约', path: '/appointment/create', icon: Plus, bg: 'rgba(0, 229, 255, 0.12)', color: '#00a3d9' },
  { title: '我的预约', path: '/appointment/list', icon: List, bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' },
  { title: '客户管理', path: '/customer/list', icon: User, bg: 'rgba(0, 200, 83, 0.12)', color: '#67c23a' },
  { title: '服务项目', path: '/service/list', icon: Files, bg: 'rgba(255, 170, 0, 0.12)', color: '#e6a23c' },
  { title: '预约记录', path: '/appointment/records', icon: Timer, bg: 'rgba(245, 108, 108, 0.12)', color: '#f56c6c' },
  { title: '预约日历', path: '/appointment/calendar', icon: Calendar, bg: 'rgba(249, 116, 143, 0.12)', color: '#f9748f' }
])
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;

  .welcome-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px 24px;
    margin-bottom: 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--el-fill-color-light, #f0f9ff) 0%, var(--el-fill-color-lighter, #eef2ff) 100%);
    border: 1px solid var(--el-border-color-light, #e0e7ff);

    h2 {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 600;
      color: var(--el-text-color-primary, #1e293b);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-regular, #64748b);
    }
  }

  .stat-row {
    margin-bottom: 16px;

    .stat-card {
      border-radius: 8px;
      border: 1px solid var(--el-border-color-lighter, #eef0f4);

      .stat-body {
        display: flex;
        align-items: center;
        gap: 14px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--el-text-color-primary, #1e293b);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: var(--el-text-color-secondary, #94a3b8);
          margin-top: 2px;
        }
      }
    }
  }

  .entry-card {
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter, #eef0f4);

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary, #1e293b);
    }

    .entry-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .entry-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--el-border-color-lighter, #f1f5f9);

      &:hover {
        border-color: var(--el-color-primary-light-5, #c7d2fe);
        background: var(--el-fill-color-light, #f5f8ff);
        transform: translateY(-2px);
      }

      .entry-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .entry-title {
        font-size: 14px;
        color: var(--el-text-color-primary, #334155);
        font-weight: 500;
      }
    }
  }
}

/* 暗色主题适配 */
:global(html.dark) {
  .home {
    .welcome-card {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%);
      border: 1px solid rgba(0, 229, 255, 0.15);
    }

    .stat-card,
    .entry-card {
      border-color: var(--el-border-color-lighter, #2a2a2a);
    }

    .entry-item {
      border-color: var(--el-border-color-lighter, #2a2a2a);

      &:hover {
        border-color: var(--el-color-primary-light-7, #2a3a4a);
        background: var(--el-fill-color, #1d1e1f);
      }
    }
  }
}
</style>