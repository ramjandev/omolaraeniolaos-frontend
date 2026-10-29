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

    updateProfile: build.mutation<
      ApiResponse<User>,
      { fullName: string; email: string; phone?: string; avatarUrl?: string }
    >({
      query: (body) => ({
        url: "/auth/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Me", "Auth"],
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

    getAccountSettings: build.query<
      ApiResponse<{
        email: string;
        emailVerified: boolean;
        notifications: {
          rsvpUpdates: boolean;
          guestReminders: boolean;
          eventUpdates: boolean;
          billingNotifications: boolean;
        };
      }>,
      void
    >({
      query: () => ({
        url: "/auth/settings",
        method: "GET",
      }),
      providesTags: ["Me"],
    }),

    saveNotificationPreferences: build.mutation<
      ApiResponse<{
        notifications: {
          rsvpUpdates: boolean;
          guestReminders: boolean;
          eventUpdates: boolean;
          billingNotifications: boolean;
        };
      }>,
      {
        rsvpUpdates: boolean;
        guestReminders: boolean;
        eventUpdates: boolean;
        billingNotifications: boolean;
      }
    >({
      query: (body) => ({
        url: "/auth/notification-preferences",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Me"],
    }),

    changePassword: build.mutation<
      ApiResponse<TokenResponse & { changed: boolean }>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    logoutOtherDevices: build.mutation<
      ApiResponse<TokenResponse & { loggedOutOthers: boolean }>,
      void
    >({
      query: () => ({
        url: "/auth/logout-other-devices",
        method: "POST",
      }),
    }),

    deleteAccount: build.mutation<ApiResponse<{ deleted: boolean }>, void>({
      query: () => ({
        url: "/auth/account",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useRegisterIndividualMutation,
  useRegisterAgencyMutation,
  useRegisterVenueMutation,
  usePayPlanMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAccountSettingsQuery,
  useSaveNotificationPreferencesMutation,
  useChangePasswordMutation,
  useLogoutOtherDevicesMutation,
  useDeleteAccountMutation,
} = authAPI;

export const authApi = authAPI;
