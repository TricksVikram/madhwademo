import { createFileRoute } from "@tanstack/react-router";
import { PlannerPage } from "../../components/app/planner/PlannerPage";

export const Route = createFileRoute("/app/planner")({
  component: PlannerPage,
});
