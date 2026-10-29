import { baseAPI } from "../BaseApi/baseAPI";
import {
  CreateEventPayload,
  CreateEventResponse,
  GetEventByIdResponse,
  GetEventsParams,
  GetEventsResponse,
  UpdateEventPayload,
  UpdateEventResponse,
  UpdateSetupStepPayload,
  GetEventGuestsResponse,
  GetGuestsParams,
  AddGuestPayload,
  AddGuestResponse,
  BulkAddGuestsPayload,
  BulkAddGuestsResponse,
  UpdateGuestPayload,
  GetEventSeatingResponse,
  AssignSeatingPayload,
  CreateSeatingPayload,
  AssignSeatingResponse,
  GetCheckInMonitorResponse,
  ResolveFlagPayload,
  ResolveFlagResponse,
} from "./types/eventTypes";

export const eventAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    // -------------------------------------------------------------------------
    // 1. Events Lifecycle
    // -------------------------------------------------------------------------
    createEvent: build.mutation<CreateEventResponse, CreateEventPayload>({
      query: (data) => ({
        url: `/individual/events`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Event"],
    }),

    getEvents: build.query<GetEventsResponse, GetEventsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.search) queryParams.search = params.search;
        if (params?.status) queryParams.status = params.status;
        if (params?.category) queryParams.category = params.category;

        return {
          url: `/individual/events`,
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Event"],
    }),

    getEventById: build.query<GetEventByIdResponse, string>({
      query: (id) => ({
        url: `/individual/events/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Event", id },
        { type: "Event", id: "DETAILS" },
      ],
    }),

    updateEvent: build.mutation<
      UpdateEventResponse,
      { id: string; data: UpdateEventPayload }
    >({
      query: ({ id, data }) => ({
        url: `/individual/events/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    updateSetupStep: build.mutation<
      any,
      { id: string; data: UpdateSetupStepPayload }
    >({
      query: ({ id, data }) => ({
        url: `/individual/events/${id}/setup-step`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Event", id },
      ],
    }),

    publishEvent: build.mutation<any, string>({
      query: (id) => ({
        url: `/individual/events/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Event", id },
        "Event",
      ],
    }),

    deleteEvent: build.mutation<void, string>({
      query: (id) => ({
        url: `/individual/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),

    // -------------------------------------------------------------------------
    // 2. Guest Roster & RSVP
    // -------------------------------------------------------------------------
    getEventGuests: build.query<
      GetEventGuestsResponse,
      { id: string; params?: GetGuestsParams }
    >({
      query: ({ id, params }) => {
        const queryParams: Record<string, string> = {};
        if (params?.search) queryParams.search = params.search;
        if (params?.status) queryParams.status = params.status;
        if (params?.type) queryParams.type = params.type;

        return {
          url: `/individual/events/${id}/guests`,
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Attendee"],
    }),

    addGuest: build.mutation<
      AddGuestResponse,
      { eventId: string; data: AddGuestPayload }
    >({
      query: ({ eventId, data }) => ({
        url: `/individual/events/${eventId}/guests`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendee", "Event"],
    }),

    bulkAddGuests: build.mutation<
      BulkAddGuestsResponse,
      { eventId: string; data: BulkAddGuestsPayload }
    >({
      query: ({ eventId, data }) => ({
        url: `/individual/events/${eventId}/guests/bulk`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendee", "Event"],
    }),

    updateGuest: build.mutation<
      any,
      { eventId: string; guestId: string; data: UpdateGuestPayload }
    >({
      query: ({ eventId, guestId, data }) => ({
        url: `/individual/events/${eventId}/guests/${guestId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Attendee"],
    }),

    deleteGuest: build.mutation<
      void,
      { eventId: string; guestId: string }
    >({
      query: ({ eventId, guestId }) => ({
        url: `/individual/events/${eventId}/guests/${guestId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendee"],
    }),

    sendAllInvites: build.mutation<
      { message?: string; data?: { sent: number; failed: number; total: number } },
      { eventId: string; guestIds?: string[] }
    >({
      query: ({ eventId, guestIds }) => ({
        url: `/individual/events/${eventId}/guests/invitations`,
        method: "POST",
        body: guestIds?.length ? { guestIds } : {},
      }),
      invalidatesTags: ["Attendee"],
    }),

    sendGuestInvite: build.mutation<
      any,
      { eventId: string; guestId: string; channel?: string }
    >({
      query: ({ eventId, guestId, channel }) => ({
        url: `/individual/events/${eventId}/guests/${guestId}/invite`,
        method: "POST",
        body: { channel: channel || "WhatsApp" },
      }),
      invalidatesTags: ["Attendee"],
    }),

    // -------------------------------------------------------------------------
    // 3. Seating Protocol
    // -------------------------------------------------------------------------
    createEventSeating: build.mutation<
      { message?: string; data?: { id: string; name: string } },
      { eventId: string; data: CreateSeatingPayload }
    >({
      query: ({ eventId, data }) => ({
        url: `/individual/events/${eventId}/seating`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Event', 'Attendee'],
    }),

    updateEventSeating: build.mutation<
      { message?: string },
      { eventId: string; zoneId: string; data: CreateSeatingPayload }
    >({
      query: ({ eventId, zoneId, data }) => ({
        url: `/individual/events/${eventId}/seating/${zoneId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Event', 'Attendee'],
    }),

    deleteEventSeating: build.mutation<{ message?: string }, { eventId: string; zoneId: string }>({
      query: ({ eventId, zoneId }) => ({
        url: `/individual/events/${eventId}/seating/${zoneId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event', 'Attendee'],
    }),

    getEventSeating: build.query<GetEventSeatingResponse, string>({
      query: (eventId) => ({
        url: `/individual/events/${eventId}/seating`,
        method: "GET",
      }),
      providesTags: ["Event", "Attendee"],
    }),

    assignGuestSeating: build.mutation<
      AssignSeatingResponse,
      { eventId: string; data: AssignSeatingPayload }
    >({
      query: ({ eventId, data }) => ({
        url: `/individual/events/${eventId}/seating/assign`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Event", "Attendee"],
    }),

    // -------------------------------------------------------------------------
    // 4. Live Turnstile Check-In Telemetry
    // -------------------------------------------------------------------------
    getEventCheckInMonitor: build.query<GetCheckInMonitorResponse, string>({
      query: (eventId) => ({
        url: `/individual/events/${eventId}/check-in`,
        method: "GET",
      }),
      providesTags: ["GateStaff", "Attendee"],
    }),

    resolveCheckInFlag: build.mutation<
      ResolveFlagResponse,
      { eventId: string; data: ResolveFlagPayload }
    >({
      query: ({ eventId, data }) => ({
        url: `/individual/events/${eventId}/check-in/resolve-flag`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GateStaff", "Attendee"],
    }),

    assignAllGateStaff: build.mutation<any, string>({
      query: (eventId) => ({
        url: `/individual/events/${eventId}/check-in/assign-all-gates`,
        method: "POST",
      }),
      invalidatesTags: ["GateStaff"],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useUpdateSetupStepMutation,
  usePublishEventMutation,
  useDeleteEventMutation,
  useGetEventGuestsQuery,
  useLazyGetEventGuestsQuery,
  useAddGuestMutation,
  useBulkAddGuestsMutation,
  useUpdateGuestMutation,
  useDeleteGuestMutation,
  useSendGuestInviteMutation,
  useSendAllInvitesMutation,
  useCreateEventSeatingMutation,
  useUpdateEventSeatingMutation,
  useDeleteEventSeatingMutation,
  useGetEventSeatingQuery,
  useAssignGuestSeatingMutation,
  useGetEventCheckInMonitorQuery,
  useResolveCheckInFlagMutation,
  useAssignAllGateStaffMutation,
} = eventAPI;
