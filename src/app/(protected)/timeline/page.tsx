import { CalendarView } from "@/components/calendar/CalendarView";

const CalendarPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View your symptom tracking history in calendar format. See patterns, flares, and trends over time.
        </p>
      </div>
      <CalendarView />
    </div>
  );
};

export default CalendarPage;
