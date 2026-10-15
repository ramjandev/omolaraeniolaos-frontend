import { baseAPI } from "../BaseApi/baseAPI";
import type {
  ApiResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  PayPlanPayload,
  RefreshTokenPayload,
  RegisterAgencyPayload,
  RegisterIndividualPayload,
  RegisterVenuePayload,
  ResetPasswordPayload,
  TokenResponse,
  User,
} from "./types/authTypes";

export const authAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    loginUser: build.mutation<ApiResponse<LoginResponse>, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Me"],
    }),

    getMe: build.query<ApiResponse<User>, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Me", "Auth"],
    }),

    registerIndividual: build.mutation<
      ApiResponse<LoginResponse>,
      RegisterIndividualPayload
    >({
      query: (body) => ({
        url: "/auth/register/individual",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Me"],
    }),

    registerAgency: build.mutation<
      ApiResponse<LoginResponse>,
      RegisterAgencyPayload
    >({
      query: (body) => ({
        url: "/auth/register/agency",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Me", "Agency"],
    }),

    registerVenue: build.mutation<
      ApiResponse<LoginResponse>,
      RegisterVenuePayload
    >({
      query: (body) => ({
        url: "/auth/register/venue",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Me", "Venue"],
    }),

    payPlan: build.mutation<ApiResponse<unknown>, PayPlanPayload>({
      query: (body) => ({
        url: "/auth/plan/pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Plan", "Billing", "Me"],
    }),

    refreshToken: build.mutation<ApiResponse<TokenResponse>, RefreshTokenPayload>({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: build.mutation<
      ApiResponse<MessageResponse>,
      ForgotPasswordPayload
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: build.mutation<
      ApiResponse<MessageResponse>,
      ResetPasswordPayload
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetMeQuery,
  useRegisterIndividualMutation,
  useRegisterAgencyMutation,
  useRegisterVenueMutation,
  usePayPlanMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authAPI;

export const authApi = authAPI;
