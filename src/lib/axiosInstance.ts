import axios from "axios";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi";
import { useAdminStore } from "#/stores/admin";
import { getUserToken, getAdminToken } from "@/lib/auth/tokenManager";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  // Get tokens from both sources for redundancy
  const userToken = useAuthStore.getState().token?.accessToken || getUserToken();
  const adminToken = getAdminToken();

  if (userToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${userToken}`;
  } else if (adminToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  
  return config;
});

// === TỰ ĐỘNG REFRESH KHI 401 (nếu bạn có refreshToken) ===
let refreshing = false;
let queue: Array<() => void> = [];

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    const original = config;

    if (response?.status === 401 && !original._retry) {
      original._retry = true;
      const store = useAuthStore.getState();
      const refresh = store.token?.refreshToken;

      if (!refresh) {
        useAuthStore.getState().resetAuth();
        return Promise.reject(err);
      }

      if (!refreshing) {
        refreshing = true;
        try {
          const data = await authApi.requestToken(refresh);
          useAuthStore.getState().setTokenPartial({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          queue.forEach((fn) => fn());
          queue = [];
          return axiosInstance(original);
        } catch (e) {
          useAuthStore.getState().resetAuth();
          return Promise.reject(e);
        } finally {
          refreshing = false;
        }
      }

      // đợi refresh xong rồi bắn lại
      return new Promise((resolve) => {
        queue.push(() => resolve(axiosInstance(original)));
      });
    }

    // 403: thiếu quyền/role
    if (response?.status === 403) {
      console.warn("403 Forbidden:", original?.url);
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
