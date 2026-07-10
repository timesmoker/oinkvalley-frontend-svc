import { iconCredits } from "@/data/credits";

export default function CreditsPage() {
    return (
        <main className="max-w-xl mx-auto py-16 text-sm leading-relaxed">
            <h1 className="text-xl font-bold mb-6">📝 Credits</h1>
            <ul className="list-disc pl-5 space-y-2">
                {iconCredits.map((credit) => (
                    <li key={credit.id}>{credit.content}</li>
                ))}
            </ul>
        </main>
    );
}
