import { baseAPI } from "../BaseApi/baseAPI";
import type { ApiResponse } from "../Auth/types/authTypes";

export interface IndividualBillingPlan {
  planId: string | null;
  planName: string | null;
  price: number;
  cycle: string | null;
  isPaid: boolean;
  status: string | null;
  paymentMethod: string | null;
  selectedAt: string | null;
}

export interface IndividualBillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Failed";
  invoiceNumber: string;
  paymentMethod: string | null;
  planId: string | null;
}

export interface IndividualBillingAccount {
  fullName: string;
  email: string;
  phone: string | null;
}

export interface IndividualBilling {
  account: IndividualBillingAccount | null;
  plan: IndividualBillingPlan | null;
  history: IndividualBillingHistoryItem[];
}

export const billingAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getIndividualBilling: build.query<ApiResponse<IndividualBilling>, void>({
      query: () => ({
        url: "/individual/billing",
        method: "GET",
      }),
      providesTags: ["Billing"],
    }),
  }),
});

export const { useGetIndividualBillingQuery } = billingAPI;
