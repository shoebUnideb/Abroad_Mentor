import apiClient from './apiClient';
import type { User } from '../types';

export interface UpdateUserPayload {
  role?: string;
  is_approved?: boolean;
  is_active?: boolean;
}

export const usersApi = {
  list: () =>
    apiClient.get<User[]>('/api/auth/users/'),

  update: (id: number, payload: UpdateUserPayload) =>
    apiClient.patch<User>(`/api/auth/users/${id}/`, payload),
};
