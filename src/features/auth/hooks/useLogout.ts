import apiClient from "@/lib/api/apiClient";
import { useRecentVisitsStore } from "@/features/boards/recent/store/useRecentVisitsStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

/** 세션 변경 후 Router Cache/RSC 꼬임 방지 — 전체 새로고침 */
function hardNavigateAfterAuthChange(path = "/") {
  window.location.assign(path);
}

/**
 * 쿠키는 JS로 지울 수 없음 — 서버에 `POST /auth/logout` 호출 후 전체 새로고침.
 */
export function useLogout() {
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      /* 엔드포인트 없거나 네트워크 실패 — 새로고침으로 화면·캐시 정리 */
    } finally {
      // 최근 본 글·방문한 게시판 기록은 계정 것 — 같은 브라우저의 다음 사용자에게 남기지 않는다 (비로그인 기록은 유지)
      const userId = useAuthStore.getState().userId;
      if (userId !== null) useRecentVisitsStore.getState().clearOwner(userId);
      hardNavigateAfterAuthChange("/");
    }
  };

  return { logout };
}
