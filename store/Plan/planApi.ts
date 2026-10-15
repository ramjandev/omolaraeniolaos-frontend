import { baseAPI } from "../BaseApi/baseAPI";
import type {
  DeletePlanResponse,
  GetPlansResponse,
  PlanOrganizerType,
  PlanPayload,
  PlanResponse,
} from "./types/planTypes";

export const planAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    // Without a type the admin gets every plan, archived ones included.
    // With a type only active plans for that organizer type are returned.
    getPlans: build.query<GetPlansResponse, PlanOrganizerType | void>({
      query: (type) => ({
        url: "/admin/plans",
        method: "GET",
        params: type ? { type } : undefined,
      }),
      providesTags: ["Plan"],
    }),

    createPlan: build.mutation<PlanResponse, PlanPayload>({
      query: (body) => ({
        url: "/admin/plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),

    updatePlan: build.mutation<PlanResponse, { id: string; data: Partial<PlanPayload> }>({
      query: ({ id, data }) => ({
        url: `/admin/plans/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),

    deletePlan: build.mutation<DeletePlanResponse, string>({
      query: (id) => ({
        url: `/admin/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planAPI;
