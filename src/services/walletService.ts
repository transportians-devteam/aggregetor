import api, { idempotencyKey } from "./api";

export interface Wallet {
  id: string;
  availableBalance: number;
  heldBalance: number;
  currency: string;
}

export interface WalletEntry {
  id: string;
  direction: string;
  type: string;
  amount: number;
  availableBalanceAfter: number;
  heldBalanceAfter: number;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  checkoutUrl: string;
  providerOrderId: string;
}

export interface VehicleFundingQuote {
  vehicleId: string;
  securityDeposit: number;
  onboardingFee: number;
  annualVehicleFee: number;
  annualBaseFee: number;
  discountedAnnualFee: number;
  discountPercentage: number;
  proratedMonths: number;
  feeWaived: boolean;
  registrationAgeVerified: boolean;
  fuelType: string | null;
  calculationRule: string;
  totalRequired: number;
  availableBalance: number;
  shortfall: number;
  sufficientBalance: boolean;
}

export interface VehicleBatchFundingQuote {
  vehicles: VehicleFundingQuote[];
  totalSecurityDeposit: number;
  totalAnnualVehicleFee: number;
  totalRequired: number;
  availableBalance: number;
  shortfall: number;
  sufficientBalance: boolean;
}

export const getWallet = async (): Promise<Wallet> =>
  (await api.get("/wallet")).data;
export const getWalletEntries = async (): Promise<WalletEntry[]> =>
  (await api.get("/wallet/entries")).data;
export const getVehicleFundingQuote = async (
  vehicleId: string,
): Promise<VehicleFundingQuote> =>
  (await api.get(`/wallet/vehicles/${vehicleId}/funding-quote`)).data;

export const getVehicleBatchFundingQuote = async (
  vehicleIds: string[],
): Promise<VehicleBatchFundingQuote> =>
  (await api.post("/wallet/vehicles/funding-quote", { vehicleIds })).data;

export const createTopUp = async (amount: number): Promise<PaymentIntent> =>
  (
    await api.post(
      "/wallet/top-ups",
      { amount },
      { headers: { "Idempotency-Key": idempotencyKey("topup") } },
    )
  ).data;

export const completeDevelopmentPayment = async (
  intentId: string,
): Promise<Wallet> =>
  (await api.post(`/dev/payments/${intentId}/complete`)).data;

export const fundVehicle = async (vehicleId: string): Promise<Wallet> =>
  (
    await api.post(`/wallet/vehicles/${vehicleId}/fund`, undefined, {
      headers: { "Idempotency-Key": idempotencyKey(`vehicle-${vehicleId}`) },
    })
  ).data;

export const fundVehicles = async (vehicleIds: string[]): Promise<Wallet> =>
  (
    await api.post(
      "/wallet/vehicles/fund-batch",
      { vehicleIds },
      { headers: { "Idempotency-Key": idempotencyKey("vehicle-batch") } },
    )
  ).data;

export const payPenalty = async (penaltyId: string): Promise<Wallet> =>
  (
    await api.post(`/wallet/penalties/${penaltyId}/pay`, undefined, {
      headers: { "Idempotency-Key": idempotencyKey(`penalty-${penaltyId}`) },
    })
  ).data;

export const releaseVehicleDeposit = async (
  vehicleId: string,
): Promise<void> => {
  await api.post(
    `/admin/wallet/deposits/vehicles/${vehicleId}/release`,
    undefined,
    { headers: { "Idempotency-Key": idempotencyKey(`release-${vehicleId}`) } },
  );
};
export const forfeitVehicleDeposit = async (
  vehicleId: string,
): Promise<void> => {
  await api.post(
    `/admin/wallet/deposits/vehicles/${vehicleId}/forfeit`,
    undefined,
    { headers: { "Idempotency-Key": idempotencyKey(`forfeit-${vehicleId}`) } },
  );
};
