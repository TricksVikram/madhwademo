import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "../../components/app/resources/ResourcesPage";

export const Route = createFileRoute("/app/resources")({
  component: ResourcesPage,
});
