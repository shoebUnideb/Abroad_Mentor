import apiClient from './apiClient';
import type { StudentProfile, MentorProfile } from '../types';

export const profilesApi = {
  // Student
  getStudentProfile: () =>
    apiClient.get<StudentProfile>('/api/student/profile/'),

  updateStudentProfile: (data: FormData) =>
    fetch('/api/student/profile/', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCookie('csrftoken') ?? '',
        'Accept': 'application/json',
      },
      body: data,
    }).then(r => r.json() as Promise<StudentProfile>),

  // Mentor
  getMentorProfile: () =>
    apiClient.get<MentorProfile>('/api/mentor/profile/'),

  updateMentorProfile: (data: FormData) =>
    fetch('/api/mentor/profile/', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCookie('csrftoken') ?? '',
        'Accept': 'application/json',
      },
      body: data,
    }).then(r => r.json() as Promise<MentorProfile>),

  // Mentor → their students
  getMentorStudents: () =>
    apiClient.get<StudentProfile[]>('/api/mentor/students/'),

  getMentorStudentDetail: (studentId: number) =>
    apiClient.get<StudentProfile>(`/api/mentor/students/${studentId}/`),
};

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
