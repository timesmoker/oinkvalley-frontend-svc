// app/(default)/layout.tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="flex-grow pt-20 px-0 sm:px-6">{children}</main>
            <Footer />
            </>
    )
}