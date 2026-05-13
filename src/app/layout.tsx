// app/layout.tsx
import type { Metadata } from "next"
import { Inter, Fira_Code } from "next/font/google"
import "./globals.css"
import React from "react"
import AuthInitializer from "@/features/auth/components/AuthInitializer";


const inter = Inter({ variable: "--font-sans", subsets: ["latin"] })
const fira = Fira_Code({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
    title: "오잉크 밸리",
    description: "오잉크들의 안식처",
    icons: { icon: "/favicon.ico" },
    robots: {
        index: false,
        follow: false,
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <AuthInitializer />
        <body className={`flex flex-col min-h-screen ${inter.variable} ${fira.variable} antialiasing`}>

        {children}
        </body>
        </html>
    )
}
