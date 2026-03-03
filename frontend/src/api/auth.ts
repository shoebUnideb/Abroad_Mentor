import apiClient from './apiClient';
import type { User } from '../types';

export interface LoginPayload { username: string; password: string; }

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<User>('/api/auth/login/', payload),

  logout: () =>
    apiClient.post<void>('/api/auth/logout/'),

  me: () =>
    apiClient.get<User>('/api/auth/me/'),
};
