// API Configuration and Services

import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3457/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FaceConditionPrediction {
  [condition: string]: number;
}

export interface FaceAnalysisResult {
  topPrediction: {
    condition: string;
    confidence: number;
  };
  allPredictions: Array<{
    condition: string;
    confidence: number;
    percentage: string;
  }>;
  rawPredictions: FaceConditionPrediction;
}

export interface TreatmentStep {
  step: number;
  title: string;
  description: string;
  products?: string[];
  frequency: string;
  duration: string;
  tips: string[];
}

export interface TreatmentRecommendation {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  overview: string;
  steps: TreatmentStep[];
  expectedResults: string;
  warnings: string[];
  professionalAdvice: string;
  personalizedNotes?: string;
}

export interface TimelinePhase {
  phase: number;
  title: string;
  timeframe: string;
  description: string;
  expectedChanges: string[];
  skinCareAdjustments?: string[];
  milestones: string[];
}

export interface TreatmentTimeline {
  condition: string;
  totalDuration: string;
  phases: TimelinePhase[];
  maintenancePhase: {
    title: string;
    description: string;
    ongoingCare: string[];
  };
  checkupSchedule: string[];
}

export interface CompleteTreatmentPlan {
  condition: string;
  confidence: number;
  recommendation: TreatmentRecommendation;
  timeline: TreatmentTimeline;
  personalizedNotes: string[];
}

export interface AgeDetectionResult {
  estimatedAge: number;
  confidence: number;
  confidencePercentage: number;
}

export interface ComprehensiveAnalysisResult {
  analysis: FaceAnalysisResult;
  treatment: CompleteTreatmentPlan;
  ageDetection: AgeDetectionResult;
}

// Analysis History Types
export interface AnalysisHistoryItem {
  _id: string;
  userId: string;
  predictions: FaceConditionPrediction;
  topPrediction: {
    condition: string;
    confidence: number;
  };
  treatmentRecommendation: TreatmentRecommendation;
  treatmentTimeline: TreatmentTimeline;
  personalizedNotes: string[];
  analysisType: string;
  aiModel: string;
  userAge?: number;
  skinType?: string;
  currentProducts?: string[];
  originalImageName?: string;
  imageSize?: number;
  imageType?: string;
  imagePath?: string; // Relative path to saved image file
  tags?: string[];
  notes?: string;
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisHistoryResponse {
  history: AnalysisHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProgressSummary {
  conditionSummary: Array<{
    condition: string;
    count: number;
    averageConfidence: number;
    firstSeen: string;
    lastSeen: string;
    trend: 'improving' | 'stable' | 'worsening';
  }>;
  totalAnalyses: number;
  recentAnalyses: Array<{
    _id: string;
    condition: string;
    confidence: number;
    createdAt: string;
    analysisType: string;
  }>;
  dateRange: {
    firstAnalysis: string | null;
    lastAnalysis: string | null;
  };
}

export interface DashboardAnalytics {
  totalAnalyses: number;
  thisMonth: number;
  lastMonth: number;
  averageConfidence: number;
  mostCommonCondition: string;
  improvementRate: number;
  weeklyAnalyses: Array<{
    week: string;
    count: number;
  }>;
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birth?: string;
  avatarPath?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  subscription?: {
    status: string;
    plan: any;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    totalAnalyses: number;
    thisMonthAnalyses: number;
    memberSince: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Create axios instance  
const api = axios.create({
    // If production, use the production backend url
    baseURL: (import.meta as any).env.MODE === 'production' 
        ? (import.meta as any).env.VITE_BACKEND_URL 
        : 'http://localhost:3457/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout for AI operations
});

// Request interceptor for adding auth token  
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get current session from localStorage
        const token = localStorage.getItem('auth_token');

        // Add token to request headers if exists  
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: any) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling  
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Return the data directly for successful responses
        return response.data;
    },
    (error: any) => {
        // Global error handling  
        if (error.response) {
            // The request was made and the server responded with a status code  
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    console.error('Unauthorized access - invalid or expired token');
                    localStorage.removeItem('auth_token');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Forbidden access - insufficient permissions');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 413:
                    console.error('File too large');
                    break;
                case 429:
                    console.error('Too many requests - rate limited');
                    break;
                case 500:
                    console.error('Internal server error');
                    break;
                default:
                    console.error(`API Error ${status}:`, data?.message || error.message);
            }
            
            // Return a structured error response
            return Promise.reject({
                success: false,
                message: data?.message || `HTTP ${status}: ${error.response.statusText}`,
                status: status,
                data: data
            });
        } else if (error.request) {
            console.error('No response received - network error');
            return Promise.reject({
                success: false,
                message: 'Network error - please check your connection',
                status: 0
            });
        } else {
            console.error('Request setup error:', error.message);
            return Promise.reject({
                success: false,
                message: error.message || 'Request failed',
                status: -1
            });
        }
    }
);

// API Service Class
class ApiService {
    // Authentication Methods
    async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
        return api.post('/auth/login', { email, password });
    }

    async register(data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }): Promise<ApiResponse<AuthResponse>> {
        return api.post('/auth/register', data);
    }

    async getProfile(): Promise<ApiResponse<UserProfile>> {
        return api.get('/users/profile');
    }

    async forgotPassword(email: string): Promise<ApiResponse> {
        return api.post('/auth/forgot-password', { email });
    }

    async resetPassword(token: string, password: string): Promise<ApiResponse> {
        return api.post('/auth/reset-password', { token, password });
    }

    // AI Analysis Methods
    async analyzeFace(imageFile: File): Promise<ApiResponse<FaceAnalysisResult>> {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await api.post('/ai/analyze-face', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    }

    async detectAge(imageFile: File): Promise<ApiResponse<AgeDetectionResult>> {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await api.post('/ai/detect-age', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    }

    async getTreatmentRecommendation(data: {
        condition: string;
        confidence: number;
        userAge?: number;
        skinType?: string;
        currentProducts?: string[];
    }): Promise<ApiResponse<CompleteTreatmentPlan>> {
        const response = await api.post('/ai/treatment/recommendation', data);
        return response.data;
    }

    async getTreatmentTimeline(
        condition: string, 
        severity: 'mild' | 'moderate' | 'severe' = 'moderate'
    ): Promise<ApiResponse<TreatmentTimeline>> {
        return api.get('/ai/treatment/timeline', {
            params: { condition, severity }
        });
    }

    async getComprehensiveAnalysis(
        imageFile: File,
        userDetails?: {
            userAge?: number;
            skinType?: string;
            currentProducts?: string[];
        }
    ): Promise<ApiResponse<ComprehensiveAnalysisResult>> {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        if (userDetails?.userAge) {
            formData.append('userAge', userDetails.userAge.toString());
        }
        if (userDetails?.skinType) {
            formData.append('skinType', userDetails.skinType);
        }
        if (userDetails?.currentProducts) {
            userDetails.currentProducts.forEach(product => {
                formData.append('currentProducts', product);
            });
        }

        return api.post('/ai/comprehensive-analysis', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async getAvailableConditions(): Promise<ApiResponse<{ conditions: string[]; total: number }>> {
        return api.get('/ai/conditions');
    }

    async checkAIHealth(): Promise<ApiResponse<{ service: string; status: string; timestamp: string }>> {
        return api.get('/ai/health');
    }

    // User Management Methods
    async updateProfile(data: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        birth?: string;
    }): Promise<ApiResponse<UserProfile>> {
        return api.put('/users/profile', data);
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
        return api.post('/auth/change-password', { currentPassword, newPassword });
    }

    // Avatar management methods
    async uploadAvatar(avatarFile: File): Promise<ApiResponse<{ avatarUrl: string; avatarPath: string }>> {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        return api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteAvatar(): Promise<ApiResponse> {
        return api.delete('/users/avatar');
    }

    // Analysis History Methods
    async getAnalysisHistory(params?: {
        page?: number;
        limit?: number;
        condition?: string;
        analysisType?: string;
    }): Promise<ApiResponse<AnalysisHistoryResponse>> {
        return api.get('/history', { params });
    }

    async getRecentAnalyses(limit?: number): Promise<ApiResponse<AnalysisHistoryItem[]>> {
        return api.get('/history/recent', { params: { limit } });
    }

    async getAnalysisById(id: string): Promise<ApiResponse<AnalysisHistoryItem>> {
        return api.get(`/history/${id}`);
    }

    async getProgressSummary(): Promise<ApiResponse<ProgressSummary>> {
        return api.get('/history/summary');
    }

    async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
        return api.get('/history/analytics');
    }

    async getConditionTrend(condition: string, days?: number): Promise<ApiResponse<any>> {
        return api.get(`/history/trend/${condition}`, { params: { days } });
    }

    async addAnalysisNotes(id: string, notes: string): Promise<ApiResponse<AnalysisHistoryItem>> {
        return api.put(`/history/${id}/notes`, { notes });
    }

    async deleteAnalysis(id: string): Promise<ApiResponse> {
        return api.delete(`/history/${id}`);
    }

    // Utility Methods
    setAuthToken(token: string | null) {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    logout() {
        this.setAuthToken(null);
        window.location.href = '/login';
    }

    isAuthenticated(): boolean {
        return !!this.getAuthToken();
    }
}

// Create and export service instance
export const apiService = new ApiService();

// Export specific service groups for convenience
export const authService = {
    login: apiService.login.bind(apiService),
    register: apiService.register.bind(apiService),
    getProfile: apiService.getProfile.bind(apiService),
    forgotPassword: apiService.forgotPassword.bind(apiService),
    resetPassword: apiService.resetPassword.bind(apiService),
    changePassword: apiService.changePassword.bind(apiService),
    setToken: apiService.setAuthToken.bind(apiService),
    getToken: apiService.getAuthToken.bind(apiService),
    logout: apiService.logout.bind(apiService),
    isAuthenticated: apiService.isAuthenticated.bind(apiService),
};

export const aiService = {
    analyzeFace: apiService.analyzeFace.bind(apiService),
    detectAge: apiService.detectAge.bind(apiService),
    getTreatmentRecommendation: apiService.getTreatmentRecommendation.bind(apiService),
    getTreatmentTimeline: apiService.getTreatmentTimeline.bind(apiService),
    getComprehensiveAnalysis: apiService.getComprehensiveAnalysis.bind(apiService),
    getAvailableConditions: apiService.getAvailableConditions.bind(apiService),
    checkHealth: apiService.checkAIHealth.bind(apiService),
};

export const userService = {
    getProfile: apiService.getProfile.bind(apiService),
    updateProfile: apiService.updateProfile.bind(apiService),
    uploadAvatar: apiService.uploadAvatar.bind(apiService),
    deleteAvatar: apiService.deleteAvatar.bind(apiService),
    changePassword: apiService.changePassword.bind(apiService),
};

export const historyService = {
    getHistory: apiService.getAnalysisHistory.bind(apiService),
    getRecent: apiService.getRecentAnalyses.bind(apiService),
    getById: apiService.getAnalysisById.bind(apiService),
    getProgressSummary: apiService.getProgressSummary.bind(apiService),
    getDashboardAnalytics: apiService.getDashboardAnalytics.bind(apiService),
    getConditionTrend: apiService.getConditionTrend.bind(apiService),
    addNotes: apiService.addAnalysisNotes.bind(apiService),
    deleteAnalysis: apiService.deleteAnalysis.bind(apiService),
};

// Export the raw axios instance for advanced usage
export { api };

export default apiService; 