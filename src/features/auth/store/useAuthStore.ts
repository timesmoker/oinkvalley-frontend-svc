// src/store/useAuthStore.ts
import { create } from "zustand";

/**
 * 인증은 httpOnly 쿠키(auth가 Set-Cookie) — JS에 accessToken 저장 안 함.
 * 로그인 여부·userId는 /auth/me 로만 맞춤.
 */
type AuthStore = {
  userId: number | null;
  isLoggedIn: boolean;
  login: (userId: number) => void;
  logout: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  userId: null,
  isLoggedIn: false,
  login: (userId: number) => {
    set({ userId, isLoggedIn: true });
  },
  logout: () => {
    set({ userId: null, isLoggedIn: false });
  },
  hasHydrated: false,
  setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
}));
