// src/utils/auth.js

// Token 存储的键名
const TokenKey = 'Admin-Token'

/**
 * 设置 Token
 * @param {string} token
 */
export function setToken(token: string) {
    return localStorage.setItem(TokenKey, token)
}

/**
 * 获取 Token
 */
export function getToken() {
    return localStorage.getItem(TokenKey)
}

/**
 * 移除 Token
 */
export function removeToken() {
    return localStorage.removeItem(TokenKey)
}