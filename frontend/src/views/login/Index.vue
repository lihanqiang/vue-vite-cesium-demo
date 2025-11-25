<template>
  <div class="auth-container">
    <a-card class="auth-card">
      <!-- 动态标题 -->
      <div class="auth-header">
        <h2>{{ isLoginMode ? '用户登录' : '用户注册' }}</h2>
      </div>

      <!-- 登录表单 -->
      <a-form v-if="isLoginMode" :model="loginForm" :rules="loginRules" ref="loginFormRef" :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }" autocomplete="off" class="auth-form">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="loginForm.username" placeholder="请输入用户名" allow-clear />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="loginForm.password" placeholder="请输入密码" allow-clear />
        </a-form-item>

        <a-form-item name="remember" value-prop-name="checked" :wrapper-col="{ offset: 8 }" :label-col="{ span: 0 }">
          <a-checkbox v-model:checked="loginForm.remember">
            记住我
          </a-checkbox>
          <a class="auth-form-forgot" href="/forgot-password">
            忘记密码
          </a>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" @click="handleLogin" :loading="loading" block>
            登录
          </a-button>
          <div style="text-align: center; margin-top: 16px">
            还没有账号? <a href="javascript:;" @click="goToRegister">立即注册</a>
          </div>
        </a-form-item>
      </a-form>

      <!-- 注册表单 -->
      <a-form v-else :model="registerForm" :rules="registerRules" ref="registerFormRef" :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }" autocomplete="off" class="auth-form">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="registerForm.username" placeholder="请输入用户名" allow-clear />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="registerForm.password" placeholder="请输入密码" allow-clear />
        </a-form-item>

        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码" allow-clear />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" @click="handleRegister" :loading="loading" block>
            注册
          </a-button>
          <div style="text-align: center; margin-top: 16px">
            已有账号? <a href="javascript:;" @click="goToLogin">返回登录</a>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormInstance, message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

// 切换模式状态
const isLoginMode = ref(true)
// 加载状态
const loading = ref(false)
// 路由实例
const router = useRouter()
// 用户状态管理
const userStore = useUserStore()

// 登录表单引用
const loginFormRef = ref<FormInstance>()
// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: true
})
// 登录表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ]
}

// 注册表单引用
const registerFormRef = ref<FormInstance>()
// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})
// 注册表单校验规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      required: true, trigger: 'blur', validator: (_rule: any, value: string) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            reject('请确认密码');
          }
          if (value === registerForm.password) {
            resolve('');
          } else {
            reject('两次输入密码不一致'); // reject with error message
          }
        })
      }
    }
  ]
}

/**
 * 前往注册页面（实际上是切换表单）
 */
const goToRegister = () => {
  isLoginMode.value = false
  // 重置登录表单
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}

/**
 * 前往登录页面（实际上是切换表单）
 */
const goToLogin = () => {
  isLoginMode.value = true
  // 重置注册表单
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}

/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true
    // 这里调用你的登录 API
    // await userStore.login(loginForm.username, loginForm.password)
    message.success('登录成功')
    router.push('/')
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message || '登录失败，请检查用户名或密码')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册逻辑
 */
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    loading.value = true
    // 这里调用你的注册 API
    message.success('注册成功，请登录')
    goToLogin() // 注册成功后切换回登录表单
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message || '注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
// 主色调
@primary-dark: #132843;
@primary-mid: #3966A2;
@primary-light: #6191D3;
@primary-bg: #D6DEEB;
@white: #F8F6F6;

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // 使用指定的浅色作为背景
  background-color: @primary-bg;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  // 使用白色作为卡片背景
  background: @white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden; // 确保内部元素不会超出圆角
}

// 头部标题
.auth-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid fade(@primary-mid, 20%);

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: @primary-dark;
    margin: 0;
  }
}

// 表单通用样式
.auth-form {
  padding: 20px;
}

// "忘记密码"链接样式
.auth-form-forgot {
  float: right;
  color: @primary-light;
  transition: color 0.3s;

  &:hover {
    color: @primary-mid;
  }
}

// 覆盖 Ant Design Vue 按钮主色调
:deep(.ant-btn-primary) {
  background-color: @primary-mid;
  border-color: @primary-mid;

  &:hover {
    background-color: @primary-dark;
    border-color: @primary-dark;
  }

  &:active {
    background-color: @primary-dark;
    border-color: @primary-dark;
  }
}

// 输入框聚焦样式
:deep(.ant-input-affix-wrapper:focus-within) {
  border-color: @primary-light;
  box-shadow: 0 0 0 2px fade(@primary-light, 20%);
}

// 链接样式
a {
  color: @primary-light;
  transition: color 0.3s;

  &:hover {
    color: @primary-mid;
  }
}
</style>