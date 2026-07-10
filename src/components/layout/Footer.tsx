import { iconCredits } from "@/data/credits";

export default function Footer() {
    return (
        <footer className="text-xs text-muted-foreground text-center mt-12 py-8 border-t">
            <div className="mb-2 font-semibold text-gray-800">🐽 오잉크 밸리</div>
            <p className="mb-2 text-gray-600">오잉크들의 행복한 공간</p>

            <div className="mt-3 text-[11px] text-gray-500 flex justify-center flex-wrap gap-x-1">
                <span>Credits |</span>
                {iconCredits.map((credit, i) => (
                    <span key={credit.id} className="inline">
                        {credit.content}
                        {i < iconCredits.length - 1 && <span>,</span>}
                    </span>
                ))}
            </div>

            <p className="text-[10px] mt-4 text-gray-400">
                &copy; {new Date().getFullYear()} Oink Valley. All rights reserved.
            </p>
        </footer>
    );
}
