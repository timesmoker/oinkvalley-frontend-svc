export default function ZzangPage() {
    return (
        <div className="relative min-h-screen select-none">
            {/* 헤더(h-16) 바로 아래 — 스크롤해도 화면에 고정 */}
            <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center pt-[9vh] px-4">
                <div className="pointer-events-auto flex flex-col w-[40vw] max-w-lg min-w-[280px] text-black p-8 items-center text-center">
                    <p className="text-6xl font-bold shrink-0">⚾</p>
                    <p className="text-3xl font-bold mt-2">
                        <br />
                        장-하다,장윤지
                    </p>
                    <p className="text-8xl font-bold leading-none">d0.ZZang</p>
                    <p className="text-lg font-bold mt-4">
                        <br />
                        장윤지를 구성하는 것들로 가득차 있습니다.
                    </p>
                    <p className="text-lg font-bold mt-2">
                        공간을 부유하는 것들을 잡아채 확인해보세요.
                    </p>
                    <div className="flex flex-row gap-8 p-8">
                        <a href="#" className="text-6xl font-bold">
                            🟩
                        </a>
                        <a href="#" className="text-6xl font-bold">
                            🟪
                        </a>
                    </div>
                </div>
            </div>

            {/* 이 영역만 스크롤 */}
            <div className="relative h-[1000vh] bg-gray-100 p-8">
                <a
                    href="#"
                    className="text-4xl font-bold absolute top-[20vh] left-[105vw] -translate-x-1/2 -translate-y-1/2"
                >
                    👇
                </a>
                <a
                    href="#"
                    className="text-4xl font-bold absolute top-[80vh] -translate-x-1/2 -translate-y-1/2"
                >
                    👇
                </a>
            </div>
        </div>
    );
}
