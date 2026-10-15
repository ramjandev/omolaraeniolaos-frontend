import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types/authTypes";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

export function persistSession(payload: {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", payload.accessToken);
  localStorage.setItem("accessToken", payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem("refreshToken", payload.refreshToken);
  }
  if (payload.user) {
    localStorage.setItem("mcenies_auth_user", JSON.stringify(payload.user));
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("mcenies_auth_user");
  localStorage.removeItem("user");
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        user?: User;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.isAuthenticated = true;
      persistSession(action.payload);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearSession();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
