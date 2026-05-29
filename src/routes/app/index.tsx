import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../../components/app/dashboard/DashboardPage";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});
