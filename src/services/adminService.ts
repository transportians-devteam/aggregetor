import api from './api';

export interface AggregatorStatDto {
  id: number;
  name: string;
  licenseNo: string;
  fleetSize: number;
  evPercent: number;
  complianceRate: number;
  walletBalance: number;
  licenseStatus: string;
}

export interface AdminStatsDto {
  totalFleet: number;
  avgCompliance: number;
  totalFees: number;
  aggregators: AggregatorStatDto[];
}

export async function getAdminStats(): Promise<AdminStatsDto> {
  const response = await api.get('/admin/stats');
  return response.data as AdminStatsDto;
}

export interface DocumentDto {
  name: string;
  uploaded: boolean;
  verified: boolean;
}

export interface ApplicationDto {
  id: string;
  companyName: string;
  companyType: string;
  cin: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  evCommitment: string;
  status: string;
  filedDate: string;
  categories: string[];
  documents: DocumentDto[];
}

export async function getApplications(): Promise<ApplicationDto[]> {
  const response = await api.get('/admin/applications');
  return response.data as ApplicationDto[];
}

export async function updateApplicationStatus(id: string, status: string): Promise<void> {
  await api.put(`/admin/applications/${id}/status`, { status });
}
