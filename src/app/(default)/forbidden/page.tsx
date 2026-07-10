import Image from "next/image";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <Image
        src="/oinkvalley/oink-construction.png"
        alt="접근 불가"
        width={512}
        height={512}
        className="mb-6"
      />
      <h1 className="text-xl font-bold text-gray-700">
        🐷 오잉크? 여긴 들어갈 권한이 없다 오잉크~
        <br />
        다른 곳을 둘러보면 좋겠다 오잉크~
      </h1>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-5 py-2 text-white shadow-md transition hover:bg-blue-500"
      >
        홈으로
      </Link>
    </div>
  );
}
