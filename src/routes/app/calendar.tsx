import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "../../components/app/calendar/CalendarPage";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
});
