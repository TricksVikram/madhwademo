import { createFileRoute } from "@tanstack/react-router";
import { OfficeBuilderPage } from "../../../components/app/admin/office-builder/OfficeBuilderPage";

export const Route = createFileRoute("/app/admin/office-builder")({
  component: OfficeBuilderPage,
});
