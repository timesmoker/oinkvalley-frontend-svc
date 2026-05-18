'use client'

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Menu, X } from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/useLogout';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const { logout } = useLogout();

    const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

    return (
        <header className="w-full px-6 py-4 flex justify-between items-center border-b bg-white/60 backdrop-blur-md fixed top-0 z-50">
            <Link
                href="/"
                className="font-bold text-xl hover:opacity-80 transition min-w-[168px]"
            >
                🐽 오잉크밸리
            </Link>

            <nav className="hidden md:flex justify-end gap-6 text-sm text-gray-600">
                <Link href="#" className="hover:scale-125 hover:text-black transition">달력</Link>
                <Link href="/boards/office-of-architect" className="hover:scale-125 hover:text-black transition">건축 사무소</Link>
                <Link href="/boards" className="hover:scale-125 hover:text-black transition">게시판</Link>
                <Link href="#" className="hover:scale-125 hover:text-black transition">칭찬 스티커</Link>
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
                <button onClick={toggleMobileMenu} className="p-2">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="hidden md:flex gap-2 min-w-[200px] h-9 items-center justify-end">
                {hasHydrated ? (
                    isLoggedIn ? (
                        <Button
                            variant="default"
                            onClick={logout}
                            className="transition-all duration-200 hover:scale-110 hover:opacity-80"
                        >
                            로그아웃
                        </Button>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button
                                    variant="outline"
                                    className="transition-all duration-200 hover:scale-110 hover:text-black"
                                >
                                    Sign in
                                </Button>
                            </Link>
                            <Link href="/signup">
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
                        <div className="w-[80px] h-9 bg-gray-100 rounded animate-pulse" />
                        <div className="w-[80px] h-9 bg-gray-100 rounded animate-pulse" />
                    </>
                )}
            </div>

            {/* 모바일 메뉴 */}
            {mobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-t flex flex-col gap-4 px-6 py-4 z-40 text-gray-800 text-sm">
                    <Link href="#" onClick={toggleMobileMenu}>달력</Link>
                    <Link href="/boards/office-of-architect" onClick={toggleMobileMenu}>건축 사무소</Link>
                    <Link href="/boards" onClick={toggleMobileMenu}>게시판</Link>
                    <Link href="#" onClick={toggleMobileMenu}>칭찬 스티커</Link>
                    {hasHydrated && (
                        isLoggedIn ? (
                            <Button
                                onClick={logout} >
                                로그아웃</Button>
                        ) : (
                            <>
                                <Link href="/login" onClick={toggleMobileMenu}><Button variant="outline">Sign in</Button></Link>
                                <Link href="/signup" onClick={toggleMobileMenu}><Button variant="default">Sign up</Button></Link>
                            </>
                        )
                    )}
                </div>
            )}
        </header>
    );
}