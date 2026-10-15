import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const WIZARD_STEPS = [
  "basics",
  "details",
  "guests",
  "invitation",
  "experience",
  "payment",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const EVENT_TYPES = [
  "Gala",
  "Wedding",
  "Conference",
  "Private Dinner",
  "Birthday",
] as const;

export const GUEST_GROUPS = [
  "Family & Friend",
  "VIP",
  "General",
  "Speakers & Partners",
] as const;

export type GuestGroup = (typeof GUEST_GROUPS)[number];

export type GuestRsvpStatus = "Accepted" | "Declined" | "Pending" | "Not Sent";

export interface WizardGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  rsvpStatus: GuestRsvpStatus;
  invitationStatus: "Not Sent" | "Delivered";
  partySize: number;
  preference: string;
}

export interface EventBasics {
  eventName: string;
  eventType: (typeof EVENT_TYPES)[number];
  eventDate: string;
  expectedGuests: string;
  startTime: string;
  endTime: string;
  venue: string;
}

export interface EventDetails {
  fullVenueAddress: string;
  parkingInfo: string;
  dressCode: string;
  additionalNotes: string;
}

export interface EventInvitation {
  selectedTemplateId: string;
  customTitle: string;
  customSubHeader: string;
  customDate: string;
  customTime: string;
  customVenue: string;
  customMessage: string;
}

export const EXPERIENCE_LANGUAGES = [
  "English",
  "Yoruba",
  "Hausa",
  "Igbo",
  "Nigerian Pidgin",
] as const;

export const REMINDER_LEADS = [
  "1 day before",
  "3 days before",
  "5 days before",
  "7 days before",
] as const;

export const CONFIRMED_RESPONSE_MESSAGE =
  "Splendid news! We are truly delighted that you will grace us with your presence, {guest_name}. Let us quickly confirm a few details to make your experience seamless.";

export const TENTATIVE_RESPONSE_MESSAGE =
  "Thank you, {guest_name}. We understand that you're still deciding. We'll keep your response as tentative and keep you updated as the event approaches.";

export const DECLINED_RESPONSE_MESSAGE =
  "Thank you for letting us know, {guest_name}. We are sorry you cannot join us for {event_name}, and we hope to celebrate with you another time.";

export interface EventExperience {
  languages: string[];
  methodOneClick: boolean;
  methodText: boolean;
  methodVoice: boolean;
  collectPartySize: boolean;
  collectAccessibility: boolean;
  collectProtocol: boolean;
  collectDietary: boolean;
  collectRelationship: boolean;
  collectSeating: boolean;
  allowConfirmed: boolean;
  allowTentative: boolean;
  allowDeclined: boolean;
  confirmedMessage: string;
  tentativeMessage: string;
  declinedMessage: string;
  sendTentativeReminder: boolean;
  reminderLead: (typeof REMINDER_LEADS)[number];
  rsvpDeadline: string;
  allowResponseUpdate: boolean;
}

export interface EventPayment {
  method: "card" | "transfer";
}

export interface EventWizardState {
  activeStep: WizardStep;
  basics: EventBasics;
  details: EventDetails;
  guests: WizardGuest[];
  invitation: EventInvitation;
  experience: EventExperience;
  payment: EventPayment;
}

export const initialEventWizardState: EventWizardState = {
  activeStep: "basics",
  basics: {
    eventName: "",
    eventType: "Gala",
    eventDate: "",
    expectedGuests: "",
    startTime: "",
    endTime: "",
    venue: "",
  },
  details: {
    fullVenueAddress: "",
    parkingInfo: "",
    dressCode: "",
    additionalNotes: "",
  },
  guests: [],
  invitation: {
    selectedTemplateId: "tpl-1",
    customTitle: "",
    customSubHeader: "",
    customDate: "",
    customTime: "",
    customVenue: "",
    customMessage: "",
  },
  experience: {
    languages: ["English"],
    methodOneClick: true,
    methodText: true,
    methodVoice: true,
    collectPartySize: true,
    collectAccessibility: false,
    collectProtocol: false,
    collectDietary: false,
    collectRelationship: false,
    collectSeating: false,
    allowConfirmed: true,
    allowTentative: true,
    allowDeclined: true,
    confirmedMessage: CONFIRMED_RESPONSE_MESSAGE,
    tentativeMessage: TENTATIVE_RESPONSE_MESSAGE,
    declinedMessage: DECLINED_RESPONSE_MESSAGE,
    sendTentativeReminder: true,
    reminderLead: "3 days before",
    rsvpDeadline: "",
    allowResponseUpdate: false,
  },
  payment: {
    method: "card",
  },
};

const eventSlice = createSlice({
  name: "event",
  initialState: initialEventWizardState,
  reducers: {
    setActiveStep(state, action: PayloadAction<WizardStep>) {
      state.activeStep = action.payload;
    },
    saveBasics(state, action: PayloadAction<EventBasics>) {
      state.basics = action.payload;
    },
    saveDetails(state, action: PayloadAction<EventDetails>) {
      state.details = action.payload;
    },
    setGuests(state, action: PayloadAction<WizardGuest[]>) {
      state.guests = action.payload;
    },
    saveInvitation(state, action: PayloadAction<EventInvitation>) {
      state.invitation = action.payload;
    },
    saveExperience(state, action: PayloadAction<EventExperience>) {
      state.experience = action.payload;
    },
    savePayment(state, action: PayloadAction<EventPayment>) {
      state.payment = action.payload;
    },
    clearEventWizard() {
      return initialEventWizardState;
    },
  },
});

export const {
  setActiveStep,
  saveBasics,
  saveDetails,
  setGuests,
  saveInvitation,
  saveExperience,
  savePayment,
  clearEventWizard,
} = eventSlice.actions;

export default eventSlice.reducer;
