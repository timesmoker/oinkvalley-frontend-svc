export default function HeroSection() {
    return (
        <section className="relative flex flex-col items-center justify-center text-center h-[30vh] min-h-[500px] bg-[url('/oinkvalley/oink-card.webp')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/40 z-0" />
            <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-2 text-white">오잉크 밸리</h1>
                <p className="text-white text-lg">오잉크들의 행복한 공간~</p>
            </div>
        </section>
    );
}
