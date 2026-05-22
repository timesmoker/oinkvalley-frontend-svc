import { redirect } from "next/navigation";
import { AuthRequiredError } from "@/lib/api/authRequiredError";

/** 권한 없음 전용 페이지로 보냄 (존재·접근 여부를 숨길 때 사용) */
export function redirectForbidden(): never {
  redirect("/forbidden");
}

/**
 * 보호된 페이지(보드·스티커보드 등) SSR fetch 공통 에러 분기.
 * - 401(AuthRequiredError): 로그인으로 보냄
 * - 그 외: /forbidden
 */
export function handleProtectedPageError(
  error: unknown,
  nextPath: string,
): never {
  if (error instanceof AuthRequiredError) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  redirectForbidden();
}
