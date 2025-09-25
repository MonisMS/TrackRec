import axios from 'axios';
import { config } from './config';
import { handleApiError } from './utils';

// Create a simple axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Simple function to get auth token (you'll set this up with Clerk later)
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(tokenProvider: () => Promise<string | null>) {
  getAuthToken = tokenProvider;
}

// Add auth token to requests automatically
api.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      window.location.href = '/sign-in';
    }
    
    // Create a simple error message
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    
    throw new Error(message);
  }
);

// Simple API functions - just like fetch but easier!

export async function apiGet<T>(url: string): Promise<T> {
  try {
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.post(url, data);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.put(url, data);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiDelete<T>(url: string): Promise<T> {
  try {
    const response = await api.delete(url);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};