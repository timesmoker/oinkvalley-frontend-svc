import HeroSection from "@/components/ui/HeroSection";
import CardSection from "@/components/ui/CardSection";

export default function HomePage() {
    return (
        <div className="flex flex-col bg-white">
            <HeroSection />
            <CardSection />
        </div>
    );
}
