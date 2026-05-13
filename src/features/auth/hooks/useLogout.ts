import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/apiClient";

/**
 * 쿠키는 JS로 지울 수 없음 — 서버에 `POST /auth/logout`이 있으면 호출 후 스토어 정리.
 */
export function useLogout() {
  const logoutState = useAuthStore((s) => s.logout);
  const router = useRouter();

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      /* 엔드포인트 없거나 네트워크 실패 — 로컬 상태는 항상 정리 */
    } finally {
      logoutState();
      router.push("/");
    }
  };

  return { logout };
}
