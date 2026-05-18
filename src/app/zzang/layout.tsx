import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "짱 페이지",
    description: "장윤지의 공간",
};

export default function ZzangLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen antialiased">
            <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white text-black px-4 flex items-center border-b">
                <nav className="flex items-center gap-1">
                    <a href="#" className="px-3 font-bold hover:text-gray-500">
                        Menu
                    </a>
                    <a href="#" className="px-3 font-bold hover:text-gray-500">
                        About
                    </a>
                    <a href="#" className="px-3 font-bold hover:text-gray-500">
                        Schedule
                    </a>
                </nav>
                <p className="text-xl absolute left-1/2 -translate-x-1/2 font-bold pointer-events-none">
                    d0.ZZang
                </p>
                <Link
                    href="/"
                    className="ml-auto px-3 text-sm font-semibold text-gray-600 hover:text-black"
                >
                    🐽 홈
                </Link>
            </header>

            <main className="flex-grow">{children}</main>
        </div>
    );
}
