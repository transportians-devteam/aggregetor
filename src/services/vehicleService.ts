import api from './api';

export interface VehicleDto {
  id: number;
  registrationNumber: string;
  vehicleClass: string;
  category: string;
  fuelType: string;
  maker: string;
  model: string;
  insuranceStatus: string;
  puccStatus: string;
  status: string;
  licenseAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface VehicleOnboardRequest {
  registrationNumber: string;
  vehicleClass?: string;
  category?: string;
  fuelType?: string;
  maker?: string;
  model?: string;
}

export async function onboardVehicle(request: VehicleOnboardRequest): Promise<VehicleDto> {
  const response = await api.post('/vehicles/onboard', request);
  return response.data as VehicleDto;
}

export async function getMyVehicles(): Promise<VehicleDto[]> {
  const response = await api.get('/vehicles');
  return response.data as VehicleDto[];
}
