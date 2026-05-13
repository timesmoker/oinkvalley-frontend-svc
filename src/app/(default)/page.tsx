import Link from "next/link";

export default function HomePage() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
            <h1 className="text-3xl font-bold">오잉크 밸리</h1>
            <p className="text-muted-foreground">게시판에서 글을 읽고 쓸 수 있습니다.</p>
            <Link
                href="/boards"
                className="rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-500 transition"
            >
                게시판으로 가기
            </Link>
        </div>
    );
}
