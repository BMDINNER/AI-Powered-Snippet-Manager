import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const authUrl = import.meta.env.VITE_AUTH_URL;

const api: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 300000
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.config.headers.Authorization = `Bearer ${token}`;
      api(prom.config)
        .then(response => prom.resolve(response))
        .catch(err => prom.reject(err));
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ 
          resolve, 
          reject, 
          config: originalRequest 
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await axios.post(`${authUrl}/auth/refresh`, {
        refreshToken
      });

      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token in response');
      }
      
      localStorage.setItem('token', token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      originalRequest.headers.Authorization = `Bearer ${token}`;
      
      processQueue(null, token);
      
      return api(originalRequest);
      
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      processQueue(refreshError, null);
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
      
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;