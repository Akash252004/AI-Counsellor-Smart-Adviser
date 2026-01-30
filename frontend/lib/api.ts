import axios from 'axios';
import { getAccessToken } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API functions
export const apiClient = {
    // Auth endpoints (using Supabase directly, but keeping for backend sync)
    async syncUser(userId: string, email: string, name: string) {
        return api.post('/auth/sync', { userId, email, name });
    },

    // Profile endpoints
    async createProfile(profileData: any) {
        return api.post('/profile/', profileData);
    },

    async getProfile() {
        return api.get('/profile/');
    },

    async updateProfile(profileData: any) {
        return api.put('/profile/', profileData);
    },

    async getProfileStrength() {
        return api.get('/profile/strength');
    },

    // Dashboard
    async getDashboard() {
        return api.get('/dashboard');
    },

    async markTaskComplete(taskId: number) {
        return api.patch(`/dashboard/tasks/${taskId}/complete`);
    },

    // AI Chat
    async sendMessage(message: string) {
        return api.post('/ai/chat', { message });
    },

    async getChatHistory(limit?: number, after?: string) {
        return api.get('/ai/history', { params: { limit, after } });
    },

    // Universities
    async searchUniversities(filters?: any) {
        return api.get('/universities/', { params: filters });
    },

    async getRecommendations(limit?: number) {
        return api.get('/universities/recommendations', { params: { limit } });
    },

    async getUniversityDetails(id: number) {
        return api.get(`/universities/${id}`);
    },

    async getMatchAnalysis(id: number) {
        return api.get(`/universities/${id}/match`);
    },

    async getCountries() {
        return api.get('/universities/countries/list');
    },

    // Shortlist
    async getShortlist() {
        return api.get('/shortlist/');
    },

    async addToShortlist(universityId: number, bucket: string, whyFits?: string, risks?: string) {
        return api.post('/shortlist/add', {
            university_id: universityId,
            bucket,
            why_fits: whyFits,
            risks
        });
    },

    async removeFromShortlist(shortlistId: number) {
        return api.delete(`/shortlist/${shortlistId}`);
    },

    async updateBucket(shortlistId: number, bucket: string) {
        return api.patch(`/shortlist/${shortlistId}/bucket`, { bucket });
    },

    async lockShortlist() {
        return api.post('/shortlist/lock');
    },

    async toggleShortlistLock(shortlistId: number) {
        return api.post(`/shortlist/${shortlistId}/toggle-lock`);
    },

    async unlockShortlist() {
        return api.post('/shortlist/unlock');
    },

    // Tasks
    async getRecommendedTasks() {
        return api.get('/tasks/recommended');
    },

    async getCustomTasks() {
        return api.get('/tasks/custom');
    },

    async createCustomTask(task: any) {
        return api.post('/tasks/custom', task);
    },

    async toggleTaskComplete(taskId: number) {
        return api.patch(`/tasks/custom/${taskId}/complete`);
    },

    async deleteTask(taskId: number) {
        return api.delete(`/tasks/custom/${taskId}`);
    },
};

export default api;
