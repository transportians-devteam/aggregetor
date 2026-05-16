import api from './api';

export interface DriverDto {
  id: number;
  name: string;
  dlNumber: string;
  vehicleRegistration: string;
  dlExpiry: string;
  psvBadge: boolean;
  status: string;
}

export interface DriverOnboardRequest {
  name: string;
  dlNumber: string;
  vehicleRegistration?: string;
  dlExpiry?: string;
  psvBadge?: boolean;
}

export async function onboardDriver(request: DriverOnboardRequest): Promise<DriverDto> {
  const response = await api.post('/drivers/onboard', request);
  return response.data as DriverDto;
}

export async function getMyDrivers(): Promise<DriverDto[]> {
  const response = await api.get('/drivers');
  return response.data as DriverDto[];
}
