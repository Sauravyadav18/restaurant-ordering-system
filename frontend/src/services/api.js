// Use environment variable for API URL in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import axios from 'axios';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (mobile, password) => api.post('/auth/login', { mobile, password }),
    verify: () => api.get('/auth/verify'),
    changePassword: (oldPassword, newPassword, confirmPassword) =>
        api.post('/auth/change-password', { oldPassword, newPassword, confirmPassword }),
    sendResetOtp: (mobile) => api.post('/auth/send-reset-otp', { mobile }),
    verifyResetOtp: (mobile, otp, newPassword, confirmPassword) =>
        api.post('/auth/verify-reset-otp', { mobile, otp, newPassword, confirmPassword })
};

// Menu API
export const menuAPI = {
    getAll: (category) => api.get('/menu', { params: category ? { category } : {} }),
    getOne: (id) => api.get(`/menu/${id}`),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`)
};

// Orders API
export const ordersAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getAll: (params = {}) => api.get('/orders', { params }),
    getOne: (id) => api.get(`/orders/${id}`),
    getByToken: (token) => api.get(`/orders/token/${token}`),
    updateStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
    updatePayment: (id) => api.patch(`/orders/${id}/payment`),
    cancelOrder: (id) => api.put(`/orders/${id}/cancel`)
};

// Tables API
export const tablesAPI = {
    getAvailable: () => api.get('/tables/available'),
    getAll: () => api.get('/tables'),
    updateStatus: (id, data) => api.patch(`/tables/${id}`, data),
    freeTable: (id) => api.patch(`/tables/${id}/free`),
    setTotalTables: (totalTables) => api.post('/tables/set-total', { totalTables })
};
// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    create: (name) => api.post('/categories', { name })
};

export default api;
