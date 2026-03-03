import apiClient from './apiClient';
import type { Step, Comment, Document } from '../types';

export interface CreateStepPayload {
  title: string;
  description?: string;
  order?: number;
  due_date?: string;
}

export const stepsApi = {
  addToApplication: (appId: number, payload: CreateStepPayload) =>
    apiClient.post<Step>(`/api/applications/${appId}/steps/`, payload),

  get: (id: number) =>
    apiClient.get<Step>(`/api/steps/${id}/`),

  update: (id: number, payload: Partial<CreateStepPayload>) =>
    apiClient.patch<Step>(`/api/steps/${id}/`, payload),

  submit: (id: number) =>
    apiClient.post<Step>(`/api/steps/${id}/submit/`),

  approve: (id: number) =>
    apiClient.post<Step>(`/api/steps/${id}/review/`, { action: 'approve' }),

  requestRevision: (id: number) =>
    apiClient.post<Step>(`/api/steps/${id}/review/`, { action: 'needs_revision' }),

  addComment: (id: number, text: string) =>
    apiClient.post<Comment>(`/api/steps/${id}/comments/`, { text }),

  uploadDocument: (id: number, file: File, title: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    return apiClient.post<Document>(`/api/steps/${id}/documents/`, form);
  },
};
