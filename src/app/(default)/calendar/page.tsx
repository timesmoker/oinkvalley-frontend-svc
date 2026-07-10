import CalendarApp from "@/features/calendar/CalendarApp";

export default function CalendarPage() {
    return (
        <div className="flex min-h-[calc(100dvh-5rem)] w-full flex-col px-2 sm:px-4 md:h-[calc(100dvh-5rem)] md:min-h-0">
            <CalendarApp />
        </div>
    );
}
