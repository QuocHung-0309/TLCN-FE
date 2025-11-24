import axios from "axios"
import { BASE_URL } from "@/app/admin/utils/config"


const api = axios.create({
    baseURL: BASE_URL
})

api.interceptors.request.use(config=> {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const refreshToken = localStorage.getItem("refreshToken")
                const response = await axios.post(`${BASE_URL}/users/request-token`,{refreshToken})
                const newAccessToken = response.data.accessToken
                localStorage.setItem("accessToken", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch (err) {
                console.log("Refresh token failed, user must login again");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/admin/login"; 
                return Promise.reject(err);
            }
        } 
        return Promise.reject(error);
    }
)

export default api;