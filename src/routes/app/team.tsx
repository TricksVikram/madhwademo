import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "../../components/app/team/TeamPage";

export const Route = createFileRoute("/app/team")({
  component: TeamPage,
});
