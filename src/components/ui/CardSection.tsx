import ProfileCard from "@/components/ui/ProfileCard";
import { profileCards } from "@/data/cards";

export default function CardSection() {
    return (
        <section className="relative flex justify-center items-start gap-4 sm:gap-20 py-16 pb-28 px-4 min-h-[380px] sm:min-h-[420px]">
            {profileCards.map((card) => (
                <ProfileCard key={card.name} {...card} />
            ))}
        </section>
    );
}
