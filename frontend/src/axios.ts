import axios from "axios"

export const instance = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

instance.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error),
)
