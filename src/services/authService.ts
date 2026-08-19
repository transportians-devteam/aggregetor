import api from "./api";

export type UserRole =
  | "aggregator"
  | "dsp"
  | "officer"
  | "appellate_officer"
  | "enforcement"
  | "admin";

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresInMs: number;
  refreshTokenExpiresInMs: number;
  user: UserProfile;
}

export interface OtpChallenge {
  challengeId: string;
  destination: string;
  expiresInSeconds: number;
}

export interface DevelopmentRegistration {
  companyName: string;
  companyType: "Aggregator" | "DSP" | "E-Commerce";
  cin: string;
  regAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  categories: string[];
}

export const loginDevelopment = async (
  phone: string,
  role: UserRole,
): Promise<LoginResponse> =>
  (await api.post("/auth/login", { phone, role })).data;

export const requestLoginOtp = async (
  phone: string,
  role: UserRole,
): Promise<OtpChallenge> =>
  (await api.post("/auth/otp/request", { phone, role })).data;

export const verifyLoginOtp = async (
  challengeId: string,
  code: string,
): Promise<LoginResponse> =>
  (await api.post("/auth/otp/verify", { challengeId, code })).data;

export const registerDevelopment = async (
  request: DevelopmentRegistration,
): Promise<void> => {
  await api.post("/auth/register", request);
};

export const requestRegistrationOtp = async (
  request: DevelopmentRegistration,
): Promise<OtpChallenge> =>
  (await api.post("/auth/registration/request", request)).data;

export const verifyRegistrationOtp = async (
  challengeId: string,
  code: string,
): Promise<LoginResponse> =>
  (await api.post("/auth/registration/verify", { challengeId, code })).data;

export const fetchProfile = async (): Promise<UserProfile> =>
  (await api.get("/auth/profile")).data;

export const updateProfile = async (request: {
  name: string;
  email: string;
}): Promise<UserProfile> =>
  (await api.patch("/auth/profile", request)).data;

export const logoutServer = async (): Promise<void> => {
  await api.post("/auth/logout");
};
