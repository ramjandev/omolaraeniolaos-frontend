import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import type { RootState } from "../store";

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const baseQueryAPI = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    let token = state?.auth?.accessToken;

    if (!token && typeof window !== "undefined") {
      token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        null;
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithToasts: typeof baseQueryAPI = async (
  args,
  api,
  extraOptions,
) => {
  const options = (extraOptions ?? {}) as { silent?: boolean };
  const result = await baseQueryAPI(args, api, extraOptions);

  const method =
    typeof args === "object" && "method" in args ? args.method : "GET";

  const requestUrl =
    typeof args === "object" && "url" in args ? String(args.url) : "";
  const isAuthPasswordFlow =
    requestUrl.includes("/auth/forgot-password") ||
    requestUrl.includes("/auth/reset-password") ||
    requestUrl.includes("/auth/change-password");
  const suppressToast = Boolean(options.silent) || isAuthPasswordFlow;

  if (method !== "GET") {
    if (
      result?.data &&
      typeof result.data === "object" &&
      "message" in result.data
    ) {
      const message = (result.data as { message?: string }).message;
      if (message && !suppressToast) {
        if (typeof window !== "undefined") {
          if (method === "DELETE") {
            toast.warning(message);
          } else {
            toast.success(message);
          }
        }
      }
    }

    if (result?.error) {
      const errorData = result.error.data as {
        message?: string;
        error?: string;
      };
      const isSessionExpired =
        result.error.status === 401 &&
        errorData?.error === "Unauthorized" &&
        !requestUrl.includes("/auth/login");

      if (isSessionExpired) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
        }
      } else if (!suppressToast) {
        if (typeof window !== "undefined") {
          toast.error(
            errorData?.message || "Something went wrong. Please try again.",
          );
        }
      }
    }
  }

  return result;
};

export const baseAPI = createApi({
  reducerPath: "baseAPI",
  baseQuery: baseQueryWithToasts,
  tagTypes: [
    "Auth",
    "User",
    "Me",
    "Event",
    "Attendee",
    "GateStaff",
    "Agency",
    "Venue",
    "Booking",
    "Plan",
    "Payment",
    "Billing",
    "Communication",
    "Admin",
  ],

  endpoints: () => ({}),
});

export const baseApi = baseAPI;
export default baseAPI;
