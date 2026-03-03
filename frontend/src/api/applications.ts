import apiClient from './apiClient';
import type { Application, Comment, Document } from '../types';

export interface CreateApplicationPayload {
  title: string;
  description: string;
}

export const applicationsApi = {
  list: () =>
    apiClient.get<Application[]>('/api/applications/'),

  get: (id: number) =>
    apiClient.get<Application>(`/api/applications/${id}/`),

  create: (payload: CreateApplicationPayload) =>
    apiClient.post<Application>('/api/applications/', payload),

  updateStatus: (id: number, status: string) =>
    apiClient.patch<Application>(`/api/applications/${id}/`, { status }),

  addComment: (id: number, text: string) =>
    apiClient.post<Comment>(`/api/applications/${id}/comments/`, { text }),

  uploadDocument: (id: number, file: File, title: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    return apiClient.post<Document>(`/api/applications/${id}/documents/`, form);
  },
};
