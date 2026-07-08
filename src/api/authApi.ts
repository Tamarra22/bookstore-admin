import { api } from './axiosInstance';
import type { ApiEnvelope } from '../types/api.types';
import type { LoginPayload, LoginResponseData, User } from '../types/auth.types';

export const authApi = {
  login: (payload: LoginPayload) =>
    api
      .post<ApiEnvelope<LoginResponseData>>('/api/login', payload)
      .then((res) => res.data.data),

  logout: () => api.post('/api/logout'),

  me: () => api.get<ApiEnvelope<User>>('/api/me').then((res) => res.data.data),
};
