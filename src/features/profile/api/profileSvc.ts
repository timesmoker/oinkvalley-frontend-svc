/**
 * 클라이언트 안전(client-safe) 프로필 유틸.
 *
 * 서버 전용 `fetch` 헬퍼는 `./profileQueries`로 분리되어 있다.
 * (이 파일은 `next/headers` 등 서버 의존성을 들이지 않아 클라 번들에도 안전하게 포함된다.)
 */

export type ProfileResponse = {
  userId: number;
  nickname: string;
};

export function profilesToNicknameRecord(
  profiles: ProfileResponse[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of profiles) {
    out[String(p.userId)] = p.nickname;
  }
  return out;
}

/** 프로필 미조회 시 보드 `userId` 표시용 폴백 */
export function authorLabel(
  nicknameByUserId: Record<string, string> | undefined,
  userId: number,
): string {
  const nick = nicknameByUserId?.[String(userId)];
  return nick ?? `사용자 #${userId}`;
}
