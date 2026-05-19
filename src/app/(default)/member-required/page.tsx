import Link from "next/link";

export default function MemberRequiredPage({
  searchParams,
}: {
  searchParams: { next?: string; message?: string };
}) {
  const message = searchParams.message
    ? decodeURIComponent(searchParams.message)
    : "정식 회원만 열람할 수 있습니다.";
  const next = searchParams.next ? decodeURIComponent(searchParams.next) : null;

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center px-6 py-16 text-center max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">열람 권한이 없습니다</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          홈으로
        </Link>
        {next ? (
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            로그인
          </Link>
        ) : null}
      </div>
    </div>
  );
}
