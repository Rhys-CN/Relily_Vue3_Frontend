<template>
  <div class="register">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>
    <div class="deco deco-3"></div>
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <div class="brand">
        <div class="brand-logo">芮</div>
        <div class="brand-name">{{ title }}</div>
        <div class="brand-slogan">焕新之美 · 从这里开始</div>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" :rules="registerPwdValidator">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          size="large"
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="register-btn"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"
import defaultSettings from '@/settings'
import { usePasswordRule } from "@/utils/passwordRule"

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()
const { registerPwdValidator } = usePasswordRule()

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(res => {
        const username = registerForm.value.username
        ElMessageBox({
          title: '注册成功',
          showClose: false,
          confirmButtonText: '前往登录',
          center: true,
          customClass: 'register-success-dialog',
          dangerouslyUseHTMLString: true,
          message: `<div class="register-success-content">
            <div class="register-success-text">账号 <strong>${username}</strong> 注册成功</div>
            <div class="register-success-hint">请使用新账号登录系统</div>
          </div>`
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

getCode()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(160deg, #fdf2f5 0%, #fce4ec 30%, #f3e5f5 60%, #ede7f6 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(247, 140, 160, 0.25) 0%, transparent 70%);
    pointer-events: none;
  }
}

.deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.register .deco-1 {
  width: 250px;
  height: 250px;
  top: -60px;
  right: -40px;
  background: radial-gradient(circle, rgba(249, 116, 143, 0.3) 0%, transparent 70%);
}
.register .deco-2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(186, 170, 240, 0.5) 0%, transparent 70%);
}
.register .deco-3 {
  width: 180px;
  height: 180px;
  top: 50%;
  left: 12%;
  background: radial-gradient(circle, rgba(255, 214, 165, 0.5) 0%, transparent 70%);
}

.brand {
  text-align: center;
  margin-bottom: 30px;

  .brand-logo {
    width: 56px;
    height: 56px;
    margin: 0 auto 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;
    background: linear-gradient(135deg, #f78ca0, #f9748f, #a18cd1);
    box-shadow: 0 6px 18px rgba(247, 116, 143, 0.4);
  }

  .brand-name {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #5c3a4a;
  }

  .brand-slogan {
    margin-top: 8px;
    font-size: 13px;
    letter-spacing: 1px;
    color: #c09aa8;
  }
}

.register-form {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  width: 400px;
  padding: 36px 34px 20px 34px;
  z-index: 1;
  box-shadow: 0 16px 40px rgba(214, 130, 150, 0.22);

  .el-input {
    height: 44px;
    input {
      height: 44px;
      border-radius: 10px;
      background: #fff8f9;
      border: 1px solid #f4dde3;
      &:focus {
        border-color: #f78ca0;
      }
    }
  }
  .input-icon {
    height: 43px;
    width: 14px;
    margin-left: 0px;
    color: #d8a0ad;
  }
}

.register-code {
  width: 33%;
  height: 44px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #c09aa8;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 2;
}
.register-code-img {
  height: 44px;
  padding-left: 12px;
  border-radius: 8px;
}

.register-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #f78ca0, #f9748f);
  box-shadow: 0 8px 20px rgba(247, 116, 143, 0.35);
  &:hover {
    opacity: 0.9;
  }
}

html.dark .register {
  background: linear-gradient(160deg, #2a1620 0%, #241426 45%, #2c1a24 100%);

  .register-form {
    background: var(--el-bg-color-overlay) !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);

    .el-input input {
      background: #1d1e1f;
      border: 1px solid #3a2a32;
      color: var(--el-text-color-primary);
      &:focus {
        border-color: #f78ca0;
      }
    }
  }

  .brand-name {
    color: #f3d6de;
  }
  .brand-slogan {
    color: #a58a94;
  }
  .el-register-footer {
    color: #8a6f7a;
  }
}

:deep(.register-success-dialog) {
  border-radius: 16px;
  padding: 20px 24px 24px;
  overflow: hidden;

  .el-message-box__header {
    padding: 0;
  }
  .el-message-box__content {
    padding: 0;
  }
  .el-message-box__message {
    padding: 0;
  }
  .el-message-box__btns {
    padding: 0 20px 16px;
  }
}

.register-success-content {
  text-align: center;
  padding: 16px 24px;
}

.register-success-text {
  font-size: 15px;
  color: #303133;
  margin-bottom: 8px;

  strong {
    color: #f78ca0;
    font-weight: 600;
  }
}

.register-success-hint {
  font-size: 13px;
  color: #909399;
}

html.dark .register-success-dialog {
  .register-success-text {
    color: #f3d6de;

    strong {
      color: #f9748f;
    }
  }
  .register-success-hint {
    color: #a58a94;
  }
}
</style>
