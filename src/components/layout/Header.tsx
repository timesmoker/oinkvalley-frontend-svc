'use client'

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Menu, X } from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { BROWSE_DEFINITIONS, browseHref } from '@/features/boards/browse/lib/browseDefinitions';

/** 상단 메뉴 — 데스크톱 nav 와 모바일 메뉴가 같이 쓴다 */
const NAV_LINKS = [
    { href: "/calendar", label: "달력" },
    { href: "/boards/office-of-architect", label: "건축 사무소" },
    { href: browseHref("all"), label: BROWSE_DEFINITIONS.all.title },
    { href: "/boards", label: "게시판 목록" },
    { href: "/boards/guest", label: "손님 게시판" },
    { href: "/exercise", label: "칭찬 스티커" },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const lastScrollYRef = useRef(0);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const { logout } = useLogout();

    const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const lastY = lastScrollYRef.current;
            const scrollingDown = currentY > lastY;

            if (mobileMenuOpen || currentY < 96) {
                setHidden(false);
            } else if (scrollingDown && currentY - lastY > 4) {
                setHidden(true);
            } else if (!scrollingDown && lastY - currentY > 4) {
                setHidden(false);
            }

            lastScrollYRef.current = currentY;
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const headerHeight = headerRef.current?.offsetHeight ?? 0;
        document.documentElement.style.setProperty(
            "--site-header-height",
            `${headerHeight}px`,
        );
        document.documentElement.style.setProperty(
            "--site-header-hidden-offset",
            hidden ? `-${headerHeight}px` : "0px",
        );

        return () => {
            document.documentElement.style.setProperty("--site-header-height", "0px");
            document.documentElement.style.setProperty("--site-header-hidden-offset", "0px");
        };
    }, [hidden]);

    return (
        <header
            ref={headerRef}
            className={`w-full px-6 py-4 border-b bg-white/60 backdrop-blur-md fixed top-0 z-50 transition-transform duration-200 ${
                hidden ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            <div className="mx-auto flex w-full max-w-[950px] items-center justify-between">
                <Link
                    href="/"
                    className="font-bold text-xl hover:opacity-80 transition min-w-[168px]"
                >
                    🐽 오잉크밸리
                </Link>

                <nav className="hidden md:flex justify-end gap-6 text-sm text-gray-600">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:scale-125 hover:text-black transition">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* 알림 벨은 한 번만 마운트해 데스크톱·모바일이 같이 쓴다 */}
                <div className="flex h-9 items-center justify-end gap-2 md:min-w-[200px]">
                    {hasHydrated ? (
                        isLoggedIn ? (
                            <>
                                <NotificationBell />
                                <Button
                                    variant="default"
                                    onClick={logout}
                                    className="hidden md:inline-block transition-all duration-200 hover:scale-110 hover:opacity-80"
                                >
                                    로그아웃
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <Button
                                        variant="outline"
                                        className="transition-all duration-200 hover:scale-110 hover:text-black"
                                    >
                                        Sign in
                                    </Button>
                                </Link>
                                <Link href="/signup" className="hidden md:block">
                                    <Button
                                        variant="default"
                                        className="transition-all duration-200 hover:scale-110 hover:opacity-90"
                                    >
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )
                    ) : (
                        <>
                            <div className="hidden md:block w-[80px] h-9 bg-gray-100 rounded animate-pulse" />
                            <div className="hidden md:block w-[80px] h-9 bg-gray-100 rounded animate-pulse" />
                        </>
                    )}

                    {/* 모바일 메뉴 버튼 */}
                    <button
                        onClick={toggleMobileMenu}
                        aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                        aria-expanded={mobileMenuOpen}
                        className="md:hidden -mr-2 p-2"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* 모바일 메뉴 */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full max-h-[calc(100vh-4rem)] overflow-y-auto bg-white border-t px-6 pb-5 pt-2 z-40 text-gray-800">
                    <nav className="flex flex-col text-[15px]">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} onClick={toggleMobileMenu} className="py-2.5">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    {hasHydrated && (
                        <div className="mt-2 flex gap-2 border-t pt-4">
                            {isLoggedIn ? (
                                <Button variant="outline" onClick={logout} className="w-full py-2">
                                    로그아웃
                                </Button>
                            ) : (
                                <>
                                    <Link href="/login" onClick={toggleMobileMenu} className="flex-1">
                                        <Button variant="outline" className="w-full py-2">Sign in</Button>
                                    </Link>
                                    <Link href="/signup" onClick={toggleMobileMenu} className="flex-1">
                                        <Button variant="default" className="w-full py-2">Sign up</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
