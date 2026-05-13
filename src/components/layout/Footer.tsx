export default function Footer() {
    return (
        <footer className="text-xs text-muted-foreground text-center mt-12 py-8 border-t">
            <div className="mb-2 font-semibold text-gray-800">🐽 오잉크 밸리</div>
            <p className="text-[10px] mt-2 text-gray-400">
                &copy; {new Date().getFullYear()} Oink Valley. All rights reserved.
            </p>
        </footer>
    );
}
