import { useState, useMemo } from "react";
import { useMockData } from "../../../contexts/MockDataContext";
import { getDesksForFloor } from "../../../data/helpers";
import {
  generateDeskHeatmap,
  getHeatmapColor,
  type DateRange,
} from "../../../data/analytics-helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

interface Props {
  range: DateRange;
}

const LEGEND = [
  { label: "0–40%", color: "var(--color-chart-2)" },
  { label: "40–70%", color: "var(--color-chart-5)" },
  { label: "70–90%", color: "var(--color-chart-1)" },
  { label: "90–100%", color: "hsl(0 72% 51%)" },
];

export function DeskHeatmap({ range }: Props) {
  const { floors, desks } = useMockData();
  const [floorId, setFloorId] = useState(floors[0]?.id ?? "");

  const floorDesks = useMemo(() => getDesksForFloor(desks, floorId), [desks, floorId]);
  const heatmapData = useMemo(() => generateDeskHeatmap(floorDesks, range), [floorDesks, range]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Desk utilization heatmap</CardTitle>
          <p className="text-xs text-muted-foreground">Color-coded by usage intensity</p>
        </div>
        <Select value={floorId} onValueChange={setFloorId}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {floors.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-auto pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {heatmapData.map((d) => (
              <Tooltip key={d.deskId}>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-12 cursor-default items-center justify-center rounded-md border text-[10px] font-medium text-foreground"
                    style={{ backgroundColor: getHeatmapColor(d.utilization), opacity: 0.85 }}
                  >
                    {d.label}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{d.label} — {d.utilization}% utilization</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <div className="flex flex-wrap items-center gap-3">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.85 }} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
