import { create } from "zustand";
import { UserType } from "../types/auth.type";
import Cookies from "js-cookie";

interface AuthState {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (userData) => {
    console.log("SET USER DIPANGGIL:", userData);
    set({ user: userData });
  },
  clearAuth: () => {
    set({ user: null });
  },
  logout: () => {
    Cookies.remove("token");
    set({ user: null });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
}));
