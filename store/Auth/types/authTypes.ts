export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: PaginationMeta;
}

export type BackendUserRole =
  | "ADMIN"
  | "INDIVIDUAL"
  | "AGENCY"
  | "VENUE"
  | "GATE"
  | "GUEST";

export interface UserPlan {
  planId?: string | null;
  planName?: string | null;
  isPaid?: boolean;
  status?: string | null;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: BackendUserRole | string;
  avatarUrl?: string | null;
  createdAt?: string;
  plan?: UserPlan | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RegisterAccountFields {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterIndividualPayload extends RegisterAccountFields {
  eventName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  venueLocation: string;
  expectedGuests?: number;
  planId?: string;
  skipPayment?: boolean;
  paymentMethod?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface AgencyInvitedMember {
  email: string;
  role: string;
}

export interface RegisterAgencyPayload extends RegisterAccountFields {
  agencyName: string;
  logoUrl?: string;
  agencyType: string;
  country?: string;
  city?: string;
  eventTypes?: string[];
  eventsPerYear?: string;
  teamSize?: string;
  invitedMembers?: AgencyInvitedMember[];
  planId?: string;
  billingCycle?: string;
  skipPayment?: boolean;
  paymentMethod?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface VenueSpaceItem {
  name: string;
  capacity?: number;
  type?: string;
  operatingHours?: string;
}

export interface VenueInvitedMember {
  email: string;
  role: string;
}

export interface RegisterVenuePayload extends RegisterAccountFields {
  businessName: string;
  logoUrl?: string;
  businessType: string;
  venueName?: string;
  venueType?: string;
  capacity?: number;
  address?: string;
  description?: string;
  spaces?: VenueSpaceItem[];
  invitedMembers?: VenueInvitedMember[];
  planId?: string;
  billingCycle?: string;
  skipPayment?: boolean;
  paymentMethod?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface PayPlanPayload {
  planId: string;
  redirectUrl?: string;
  billingCycle?: string;
}

export interface MessageResponse {
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}
