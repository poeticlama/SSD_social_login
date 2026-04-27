import { instance as axios } from "../axios"
import type { AuthResponse, LoginEventsResponse, LogoutResponse, TelegramUser } from "../types"

export const authApi = {
    loginWithTelegram(payload: TelegramUser) {
        return axios.post<unknown, AuthResponse>("/auth/telegram", payload)
    },

    me() {
        return axios.get<unknown, AuthResponse>("/auth/me")
    },

    logout() {
        return axios.post<unknown, LogoutResponse>("/auth/logout")
    },

    getLoginEvents() {
        return axios.get<unknown, LoginEventsResponse>("/auth/login-events")
    },
}

