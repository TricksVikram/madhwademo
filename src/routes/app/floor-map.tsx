import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { FloorMapPage } from "../../components/app/floormap/FloorMapPage";

const floorMapSearchSchema = z.object({
  date: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/app/floor-map")({
  validateSearch: zodValidator(floorMapSearchSchema),
  component: FloorMapPage,
});
