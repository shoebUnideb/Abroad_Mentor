import apiClient from './apiClient';
import type { Message } from '../types';

export interface InboxItem {
  mentor: import('../types').User;
  unread: number;
}

export const messagesApi = {
  getThread: (mentorId?: number) => {
    const qs = mentorId ? `?mentor_id=${mentorId}` : '';
    return apiClient.get<Message[]>(`/api/messages/${qs}`);
  },
  getInbox: () => apiClient.get<InboxItem[]>('/api/messages/inbox/'),
  send: (receiverId: number, body: string) =>
    apiClient.post<Message>('/api/messages/send/', { receiver_id: receiverId, body }),
};
