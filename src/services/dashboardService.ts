import api from './api';

export interface CategoryStatDto {
  label: string;
  current: number;
  target: number;
  status: string;
}

export interface DashboardStatsDto {
  fleetSize: number;
  walletBalance: number;
  evPercent: number;
  categories: CategoryStatDto[];
}

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const response = await api.get('/dashboard/stats');
  return response.data as DashboardStatsDto;
}
