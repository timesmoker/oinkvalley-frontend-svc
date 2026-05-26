import CalendarApp from "@/features/calendar/CalendarApp";

export default function CalendarPage() {
    return (
        <div className="flex h-[calc(100dvh-5rem)] w-full min-h-0 flex-col px-2 sm:px-4">
            <CalendarApp />
        </div>
    );
}
