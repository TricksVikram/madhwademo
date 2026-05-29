import { createFileRoute } from "@tanstack/react-router";
import { MyBookingsPage } from "../../components/app/bookings/MyBookingsPage";

export const Route = createFileRoute("/app/bookings")({
  component: MyBookingsPage,
});
