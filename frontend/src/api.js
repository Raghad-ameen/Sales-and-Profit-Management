import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Request interceptor — إضافة التوكن لكل طلب
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — تجديد التوكن تلقائياً عند انتهاء صلاحيته
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // إذا كان الخطأ 401 ولم نحاول التجديد من قبل
        if (error.response?.status === 401 && !originalRequest._retry) {
            // لا نحاول تجديد التوكن لطلبات تسجيل الدخول والتسجيل
            if (originalRequest.url?.includes('token/') || originalRequest.url?.includes('register/')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

            if (!refreshToken) {
                // لا يوجد refresh token — تسجيل خروج
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                const newToken = res.data.access;

                // حفظ التوكن الجديد في نفس مكان التخزين
                if (localStorage.getItem('token')) {
                    localStorage.setItem('token', newToken);
                } else {
                    sessionStorage.setItem('token', newToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // فشل تجديد التوكن — تسجيل خروج
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;