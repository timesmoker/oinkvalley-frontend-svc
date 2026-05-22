import { redirect } from "next/navigation";
import {
  AuthRequiredError,
  MemberRequiredError,
} from "@/features/boards/api/boardQueries";

/** 권한 없음 전용 페이지로 보냄 (존재·접근 여부를 숨길 때 사용) */
export function redirectForbidden(): never {
  redirect("/forbidden");
}

/**
 * 보호된 페이지(보드 등) SSR fetch 공통 에러 분기.
 * - 401(AuthRequiredError): 로그인
 * - 403(MemberRequiredError): 정식 회원 안내 (#2)
 * - 그 외·미존재: /forbidden
 */
export function handleProtectedPageError(
  error: unknown,
  nextPath: string,
): never {
  if (error instanceof AuthRequiredError) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (error instanceof MemberRequiredError) {
    const message = encodeURIComponent(error.message);
    redirect(
      `/member-required?next=${encodeURIComponent(nextPath)}&message=${message}`,
    );
  }
  redirectForbidden();
}
