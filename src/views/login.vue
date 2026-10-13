<template>
  <div class="login">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>
    <div class="deco deco-3"></div>
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="brand">
        <div class="brand-logo">芮</div>
        <div class="brand-name">{{ title }}</div>
        <div class="brand-slogan">焕新之美 · 从这里开始</div>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="login-btn"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(true)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
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
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const rememberMe = Cookies.get("rememberMe")
  if (rememberMe === 'true') {
    const username = Cookies.get("username")
    const password = Cookies.get("password")
    loginForm.value = {
      username: username || "",
      password: password ? decrypt(password) : "",
      rememberMe: true
    }
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(160deg, #fff5f6 0%, #ffeef2 35%, #f3e5f5 70%, #fdeef3 100%);
}

/* 柔和的装饰色块 */
.login .deco {
  position: absolute;
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.6;
  pointer-events: none;
}
.login .deco-1 {
  width: 340px;
  height: 340px;
  top: -80px;
  right: -60px;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.5) 0%, transparent 70%);
}
.login .deco-2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(186, 170, 240, 0.5) 0%, transparent 70%);
}
.login .deco-3 {
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

.login-form {
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

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 44px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
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
.login-code-img {
  height: 44px;
  padding-left: 12px;
  border-radius: 8px;
}

.login-btn {
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

html.dark .login {
  background: linear-gradient(160deg, #2a1620 0%, #241426 45%, #2c1a24 100%);

  .login-form {
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
  .el-login-footer {
    color: #8a6f7a;
  }
}
</style>
