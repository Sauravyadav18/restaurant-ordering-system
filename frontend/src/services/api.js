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
    verify: () => api.get('/auth/verify')
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
    updateStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
    updatePayment: (id) => api.patch(`/orders/${id}/payment`)
};

export default api;
