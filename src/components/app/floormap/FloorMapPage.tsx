import { useState, useMemo, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { useSearch } from "@tanstack/react-router";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { FloorGridSkeleton } from "../skeletons/FloorGridSkeleton";
import { CalendarIcon, Users } from "lucide-react";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Toggle } from "../../ui/toggle";
import { FloorLegend } from "./FloorLegend";
import { FloorMapCanvas } from "./FloorMapCanvas";
import { BookingPanel } from "./BookingPanel";
import { BookingWizard } from "../booking/wizard/BookingWizard";
import { floorLayouts } from "../../../data/mock-data";
import { getZonesForFloor } from "../../../data/helpers";
import type { CanvasObject } from "../../../data/types";

export function FloorMapPage() {
  const { currentUser } = useDemoRole();
  const { floors, users, bookings, canvasObjects, zones, desks } = useMockData();
  const searchParams = useSearch({ from: "/app/floor-map" });
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id ?? "");
  const initialDate = useMemo(() => {
    if (searchParams.date) {
      const parsed = parseISO(searchParams.date);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [searchParams.date]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showTeammates, setShowTeammates] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const currentMockUser = users.find((u) => u.id === currentUser.id);
  const teammateIds = useMemo(() => {
    if (!showTeammates || !currentMockUser) return new Set<string>();
    return new Set(
      users.filter((u) => u.teamId === currentMockUser.teamId).map((u) => u.id)
    );
  }, [showTeammates, users, currentMockUser]);

  const floorObjects = useMemo(
    () => canvasObjects.filter((o) => o.floorId === selectedFloorId),
    [canvasObjects, selectedFloorId]
  );

  const floorZones = useMemo(
    () => getZonesForFloor(zones, selectedFloorId),
    [zones, selectedFloorId]
  );

  const layout = floorLayouts.find((l) => l.floorId === selectedFloorId) ?? {
    floorId: selectedFloorId,
    gridWidth: 20,
    gridHeight: 14,
    canvasWidth: 1600,
    canvasHeight: 1000,
  };

  const selectedObject = useMemo(
    () => floorObjects.find((o) => o.id === selectedObjectId) ?? null,
    [floorObjects, selectedObjectId]
  );

  // Clear selection when floor changes
  useEffect(() => {
    setSelectedObjectId(null);
  }, [selectedFloorId]);

  // Escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedObjectId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute availability count for selected floor
  const floorDesks = useMemo(() => desks.filter((d) => d.floorId === selectedFloorId), [desks, selectedFloorId]);
  const bookedDeskIds = useMemo(() => {
    const todayBookings = bookings.filter(
      (b) =>
        b.date === dateStr &&
        b.resourceType === "desk" &&
        b.status !== "cancelled" &&
        b.status !== "auto-released" &&
        b.status !== "completed"
    );
    return new Set(todayBookings.map((b) => b.resourceId));
  }, [bookings, dateStr]);
  const availableCount = floorDesks.filter(
    (d) => d.status !== "maintenance" && !bookedDeskIds.has(d.id)
  ).length;

  const handleObjectClick = (obj: CanvasObject) => {
    if ((obj.type === "desk" || obj.type === "room") && obj.resourceId) {
      setSelectedObjectId((prev) => (prev === obj.id ? null : obj.id));
    }
  };

  const handleOpenWizard = () => {
    if (!selectedObject?.resourceId) return;
    const desk = desks.find((d) => d.id === selectedObject.resourceId);
    const floor = floors.find((f) => f.id === selectedFloorId);
    const zone = desk ? zones.find((z) => z.id === desk.zoneId) : null;
    setWizardOpen(true);
  };

  const isLoading = useSimulatedLoading(400, [selectedFloorId]);

  if (isLoading) return <FloorGridSkeleton />;

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-2" data-testid="page-floor-map">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Floor map</h1>
            <p className="text-sm text-muted-foreground">
              {availableCount} of {floorDesks.filter((d) => d.status !== "maintenance").length} desks available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Toggle
              pressed={showTeammates}
              onPressedChange={setShowTeammates}
              size="sm"
              aria-label="Show teammates"
              className="gap-1.5 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Teammates</span>
            </Toggle>

            <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 font-normal">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <FloorLegend floorId={selectedFloorId} date={dateStr} />

        <div className="relative">
          <FloorMapCanvas
            canvasWidth={layout.canvasWidth}
            canvasHeight={layout.canvasHeight}
            objects={floorObjects}
            zones={floorZones}
            bookings={bookings}
            users={users}
            date={dateStr}
            showTeammateIds={teammateIds}
            selectedObjectId={selectedObjectId}
            onObjectClick={handleObjectClick}
          />

          {selectedObject && (
            <BookingPanel
              selectedObject={selectedObject}
              date={dateStr}
              onClose={() => setSelectedObjectId(null)}
              onOpenFullDialog={handleOpenWizard}
            />
          )}
        </div>
      </div>

      <BookingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        prefill={{
          date: dateStr,
          floorId: selectedFloorId,
        }}
        initialStep={1}
      />
    </>
  );
}
