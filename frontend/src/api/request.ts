// src/api/request.js
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user' // 引入 Pinia 的 user store

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量中获取基础 URL
    timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        const userStore = useUserStore()
        if (userStore.token) {
            // 如果有 Token，则添加到请求头
            config.headers['Authorization'] = `Bearer ${userStore.token}`
        }
        return config
    },
    (error) => {
        // 对请求错误做些什么
        console.error('request error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        const res = response.data

        // 假设你的后端约定，当 code 不为 200 时为错误
        if (res.code !== 200) {
            message.error(res.message || '请求失败')
            return Promise.reject(res)
        } else {
            return res
        }
    },
    (error) => {
        // 对响应错误做点什么
        // 处理 401 Unauthorized 错误
        if (error.response && error.response.status === 401) {
            message.error('身份验证失败，请重新登录')
            const userStore = useUserStore()
            userStore.logout() // 清除 Token 并跳转登录页
        } else {
            message.error(error.message || '服务器错误')
        }

        return Promise.reject(error)
    }
)

export default service