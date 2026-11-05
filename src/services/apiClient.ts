import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '../units/tokenServices';
import { getStore } from '../redux/storeRegistry';
import API_ROUTES, { API_BASE_URL } from '../redux/endPoints/endPoints';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Automatic Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint with raw axios to bypass interceptors
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/${API_ROUTES.AUTH_REFRESH}`,
          { refreshToken }
        );

        const newAccessToken =
          refreshResponse.data?.accessToken ||
          refreshResponse.data?.data?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.refreshToken ||
          refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          await tokenService.setTokens(newAccessToken, newRefreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        await tokenService.clearTokens();

        const store = getStore();
        if (store?.dispatch) {
          // Dynamic import to prevent circular dependency
          const { logout } = require('../redux/features/mobileFlow/authSlice');
          store.dispatch(logout());
        }

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

