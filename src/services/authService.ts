import api from './api';

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export async function login(phone: string, role: string): Promise<LoginResponse> {
  const response = await api.post('/auth/login', { phone, role });
  return response.data as LoginResponse;
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await api.get('/auth/profile');
  return response.data as UserProfile;
}
