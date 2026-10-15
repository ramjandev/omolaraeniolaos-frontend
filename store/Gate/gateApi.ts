import { baseAPI } from "../BaseApi/baseAPI";
import type { ApiResponse } from "../Auth/types/authTypes";

export interface GateStaffMember {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  assignedEventsCount: number;
  currentAssignment?: string | null;
  currentEventId?: string | null;
  gateNumber?: string | null;
  isOwner: boolean;
}

export interface GateEventOption {
  id: string;
  title: string;
}

export interface GateOverview {
  metrics: {
    ownerCount: number;
    gateStaffCount: number;
    activeEventsCount: number;
  };
  staff: GateStaffMember[];
  events: GateEventOption[];
}

export interface InviteGateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  eventId?: string;
  gateNumber?: string;
}

export interface AssignGateStaffPayload {
  staffId: string;
  eventId: string;
  gateNumber?: string;
}

export interface AssignAllGateStaffPayload {
  eventId: string;
  gatePrefix?: string;
  staffIds?: string[];
}

export const gateAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getGateOverview: build.query<ApiResponse<GateOverview>, void>({
      query: () => ({
        url: "/individual/gate",
        method: "GET",
      }),
      providesTags: ["GateStaff"],
    }),
    inviteGateStaff: build.mutation<ApiResponse<{ temporaryPassword?: string | null }>, InviteGateStaffPayload>({
      query: (body) => ({
        url: "/individual/gate/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GateStaff"],
    }),
    assignGateStaff: build.mutation<ApiResponse<unknown>, AssignGateStaffPayload>({
      query: (body) => ({
        url: "/individual/gate/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GateStaff"],
    }),
    assignRosterGateStaff: build.mutation<ApiResponse<{ assignedCount?: number }>, AssignAllGateStaffPayload>({
      query: (body) => ({
        url: "/individual/gate/assign-all",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GateStaff"],
    }),
  }),
});

export const {
  useGetGateOverviewQuery,
  useInviteGateStaffMutation,
  useAssignGateStaffMutation,
  useAssignRosterGateStaffMutation,
} = gateAPI;
