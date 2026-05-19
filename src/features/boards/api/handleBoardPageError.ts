import { notFound, redirect } from "next/navigation";
import {
  AuthRequiredError,
  MemberRequiredError,
} from "@/features/boards/api/boardQueries";

/**
 * 보드 페이지 계열에서 공통으로 쓰는 에러 분기.
 * - 401(AuthRequiredError): 로그인으로 보냄
 * - 403(MemberRequiredError): 정식 회원 안내 페이지
 * - 그 외: notFound 처리
 */
export function handleBoardPageError(error: unknown, nextPath: string): never {
  if (error instanceof AuthRequiredError) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (error instanceof MemberRequiredError) {
    const message = encodeURIComponent(error.message);
    redirect(`/member-required?next=${encodeURIComponent(nextPath)}&message=${message}`);
  }
  notFound();
}
