// src/stores/user.js
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { setToken, getToken, removeToken } from '@/utils/auth' // 封装的 Cookie/localStorage 操作
import api from '@/api/request'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: getToken() || '', // 从缓存中获取 Token
        name: '',
        avatar: '',
        roles: []
    }),

    actions: {
        /**
         * 登录
         * @param {string} username 用户名
         * @param {string} password 密码
         */
        async login(username:string, password:string) {
            try {
                const response = await api({
                    url: '/auth/login', // 你的登录接口地址
                    method: 'post',
                    data: {
                        username,
                        password
                    }
                })

                const { token, user } = response.data

                // 存储 Token
                this.token = token
                setToken(token)

                // 存储用户信息
                this.name = user.name
                this.avatar = user.avatar
                this.roles = user.roles

                return Promise.resolve()
            } catch (error) {
                return Promise.reject(error)
            }
        },

        /**
         * 退出登录
         */
        logout() {
            // 清除状态
            this.token = ''
            this.name = ''
            this.avatar = ''
            this.roles = []

            // 清除缓存
            removeToken()

            // 跳转到登录页
            const router = useRouter()
            router.push('/login')
        }
    }
})