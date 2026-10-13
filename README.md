# Relily Vue3 Frontend

基于 Vue 3 + Element Plus + Vite 的前端项目。

## 项目简介

Relily Vue3 Frontend 是一个基于 Vue 3 的前端管理后台，配合后端 API 提供完整的后台管理系统功能。

## 技术栈

- Vue 3
- Element Plus
- Vite
- Pinia
- Vue Router 4
- Axios

## 项目结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 公共组件
├── layout/       # 布局组件
├── router/       # 路由配置
├── store/        # 状态管理
├── utils/        # 工具函数
└── views/        # 页面视图
```

## 快速开始

### 环境要求

- Node.js 16+
- yarn 或 npm

### 安装运行

```bash
# 克隆项目
git clone https://github.com/xxx/relily-vue3.git

# 进入项目目录
cd relily-vue3

# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动开发服务
yarn dev
```

### 构建打包

```bash
# 构建测试环境
yarn build:stage

# 构建生产环境
yarn build:prod
```

## 开发说明

- 前端访问地址：http://localhost:80
- 默认账号：admin / admin123

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VUE_APP_BASE_API | API 基础路径 | /dev-api |

## 许可证

MIT License
