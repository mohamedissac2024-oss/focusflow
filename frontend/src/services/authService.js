import api from './api';

const authService = {
    async register(userData) {
        // userData: { username, email, password }

        const response = await api.post('/register', userData);

        return response.data;
    },

    async login(credentials) {
        // credentials: { email, password }

        const response = await api.post('/login', credentials);

        return response.data;
    },

    async logout() {
        const response = await api.post('/logout');

        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/me');

        return response.data;
    },
};

export default authService;

// named exports too, so "import * as authService" works as well as the default import
export const { register, login, logout, getCurrentUser } = authService;

export const changePassword = (payload) =>
    api.post("/change-password", payload);

export const forgotPassword = (email) =>
    api.post("/forgot-password", { email });

export const resetPassword = (payload) =>
    api.post("/reset-password", payload);