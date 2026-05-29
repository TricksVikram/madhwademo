import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useMockData } from "../../../../contexts/MockDataContext";
import { useDemoRole } from "../../../../contexts/DemoRoleContext";
import { getZonesForFloor, getAvailableDesks } from "../../../../data/helpers";
import { FloorMapCanvas } from "../../floormap/FloorMapCanvas";
import type { FloorMapCanvasHandle } from "../../floormap/FloorMapCanvas";
import { FloorLegend } from "../../floormap/FloorLegend";
import { floorLayouts } from "../../../../data/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { MapPin, DoorOpen, Users } from "lucide-react";
import type { WizardState } from "./BookingWizard";
import type { CanvasObject } from "../../../../data/types";

interface Props {
  wizard: WizardState;
  setWizard: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
  onBack: () => void;
}

export function WizardStepWhere({ wizard, setWizard, onNext, onBack }: Props) {
  const { floors, zones, canvasObjects, bookings, users, desks, rooms } = useMockData();
  const { currentUser } = useDemoRole();

  const [selectedFloorId, setSelectedFloorId] = useState(wizard.floorId || floors[0]?.id || "");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string | null>(null);
  const canvasRef = useRef<FloorMapCanvasHandle>(null);

  const resourceFilter = wizard.resourceType;

  const handleZoneChipClick = useCallback((zoneId: string | null) => {
    setActiveZoneFilter((prev) => {
      const next = prev === zoneId ? null : zoneId;
      if (next && canvasRef.current) {
        canvasRef.current.zoomToZone(next);
      } else if (!next && canvasRef.current) {
        canvasRef.current.resetView();
      }
      return next;
    });
  }, []);

  const currentMockUser = users.find((u) => u.id === currentUser.id);
  const teammateIds = useMemo(() => {
    if (!currentMockUser) return new Set<string>();
    return new Set(users.filter((u) => u.teamId === currentMockUser.teamId).map((u) => u.id));
  }, [users, currentMockUser]);

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

  // Availability for this floor
  const floorDesks = useMemo(
    () => desks.filter((d) => d.floorId === selectedFloorId),
    [desks, selectedFloorId]
  );
  const floorRooms = useMemo(
    () => rooms.filter((r) => r.floorId === selectedFloorId),
    [rooms, selectedFloorId]
  );
  const availableDesks = useMemo(
    () => getAvailableDesks(floorDesks, bookings, wizard.date, wizard.startTime, wizard.endTime),
    [floorDesks, bookings, wizard.date, wizard.startTime, wizard.endTime]
  );
  const availableRoomCount = useMemo(() => {
    const bookedRoomIds = new Set(
      bookings
        .filter((b) => b.date === wizard.date && b.resourceType === "room" && b.status !== "cancelled" && b.status !== "auto-released" && b.status !== "completed")
        .map((b) => b.resourceId)
    );
    return floorRooms.filter((r) => r.status !== "maintenance" && !bookedRoomIds.has(r.id)).length;
  }, [floorRooms, bookings, wizard.date]);

  // Reset selection when floor changes
  useEffect(() => {
    setSelectedObjectId(null);
    setActiveZoneFilter(null);
    setWizard((w) => ({ ...w, floorId: selectedFloorId, resourceId: null, resourceLabel: null, floorName: null, zoneName: null, roomCapacity: undefined, roomAmenities: undefined }));
  }, [selectedFloorId, setWizard]);

  const handleObjectClick = (obj: CanvasObject) => {
    if ((obj.type === "desk" || obj.type === "room") && obj.resourceId) {
      // Only allow clicking the active resource type
      if (obj.type !== resourceFilter) return;

      if (selectedObjectId === obj.id) {
        setSelectedObjectId(null);
        setWizard((w) => ({ ...w, resourceId: null, resourceLabel: null, floorName: null, zoneName: null, roomCapacity: undefined, roomAmenities: undefined }));
      } else {
        setSelectedObjectId(obj.id);
        const floor = floors.find((f) => f.id === selectedFloorId);

        if (obj.type === "room") {
          const room = rooms.find((r) => r.id === obj.resourceId);
          const zone = room ? zones.find((z) => z.id === obj.zoneId) : null;
          setWizard((w) => ({
            ...w,
            resourceType: "room",
            resourceId: obj.resourceId!,
            resourceLabel: obj.label || room?.name || obj.resourceId!,
            floorName: floor?.name || null,
            zoneName: zone?.name || null,
            roomCapacity: room?.capacity ?? obj.capacity,
            roomAmenities: room?.amenities ?? obj.amenities,
          }));
        } else {
          const desk = desks.find((d) => d.id === obj.resourceId);
          const zone = desk ? zones.find((z) => z.id === desk.zoneId) : null;
          setWizard((w) => ({
            ...w,
            resourceType: "desk",
            resourceId: obj.resourceId!,
            resourceLabel: obj.label || desk?.label || obj.resourceId!,
            floorName: floor?.name || null,
            zoneName: zone?.name || null,
            roomCapacity: undefined,
            roomAmenities: undefined,
          }));
        }
      }
    }
  };

  const availText = resourceFilter === "room"
    ? `${availableRoomCount} of ${floorRooms.filter((r) => r.status !== "maintenance").length} rooms available`
    : `${availableDesks.length} of ${floorDesks.filter((d) => d.status !== "maintenance").length} desks available`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 space-y-3">
      {/* Controls bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {resourceFilter === "room" ? "Pick a room" : "Pick your seat"}
          </h3>
          <p className="text-xs text-muted-foreground">{availText} on this floor</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Resource type toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            <button
              onClick={() => {
                setWizard((w) => ({ ...w, resourceType: "desk", resourceId: null, resourceLabel: null, floorName: null, zoneName: null, roomCapacity: undefined, roomAmenities: undefined }));
                setSelectedObjectId(null);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                resourceFilter === "desk"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Desks
            </button>
            <button
              onClick={() => {
                setWizard((w) => ({ ...w, resourceType: "room", resourceId: null, resourceLabel: null, floorName: null, zoneName: null, roomCapacity: undefined, roomAmenities: undefined }));
                setSelectedObjectId(null);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                resourceFilter === "room"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DoorOpen className="h-3.5 w-3.5" />
              Rooms
            </button>
          </div>

          <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {floors.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Zone filter chips */}
      {floorZones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleZoneChipClick(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeZoneFilter
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All zones
          </button>
          {floorZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleZoneChipClick(zone.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeZoneFilter === zone.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: zone.color }} />
              {zone.name}
            </button>
          ))}
        </div>
      )}

      <FloorLegend floorId={selectedFloorId} date={wizard.date} />

      {/* Canvas */}
      <FloorMapCanvas
        ref={canvasRef}
        canvasWidth={layout.canvasWidth}
        canvasHeight={layout.canvasHeight}
        objects={floorObjects}
        zones={floorZones}
        bookings={bookings}
        users={users}
        date={wizard.date}
        showTeammateIds={teammateIds}
        selectedObjectId={selectedObjectId}
        onObjectClick={handleObjectClick}
        dimResourceType={resourceFilter === "room" ? "desk" : "room"}
      />

      {/* Selected resource info bar */}
      {wizard.resourceId && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {wizard.resourceType === "room" ? (
            <DoorOpen className="h-4 w-4 text-primary" />
          ) : (
            <MapPin className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">
            {wizard.resourceLabel}
          </span>
          {wizard.roomCapacity && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {wizard.roomCapacity} seats
            </span>
          )}
          {wizard.roomAmenities && wizard.roomAmenities.length > 0 && (
            <span className="text-sm text-muted-foreground">· {wizard.roomAmenities.join(" · ")}</span>
          )}
          {wizard.zoneName && (
            <span className="text-sm text-muted-foreground">· {wizard.zoneName}</span>
          )}
          {wizard.floorName && (
            <span className="text-sm text-muted-foreground">· {wizard.floorName}</span>
          )}
        </div>
      )}
    </div>
  );
}
