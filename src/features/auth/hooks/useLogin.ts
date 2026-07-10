import { useState } from "react";
import { loginApi } from "@/features/auth/api/loginApi";
import type { MeResponse } from "@/features/auth/api/authTypes";
import apiClient from "@/lib/api/apiClient";
import axios from "axios";

/** 세션 변경 후 Router Cache/RSC 꼬임 방지 — 전체 새로고침 */
function hardNavigateAfterAuthChange(path = "/") {
  window.location.assign(path);
}

export function useLogin() {
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    try {
      await loginApi(email, password);

      try {
        await apiClient.get<MeResponse>("/auth/me");
      } catch {
        setError("로그인은 되었지만 세션을 확인하지 못했습니다.");
        return;
      }

      hardNavigateAfterAuthChange("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setError("이메일 형식이 올바른지 확인해 주세요.");
        } else if (status === 401) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          const msg =
            (err.response?.data as { message?: string })?.message ||
            (err.response?.data as { error?: string })?.error;
          setError(typeof msg === "string" ? msg : "로그인에 실패했습니다.");
        }
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return { handleLogin, error };
}
