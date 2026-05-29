import { useState, useCallback, useRef } from "react";
import { useDemoRole } from "../../../../contexts/DemoRoleContext";
import { useMockData } from "../../../../contexts/MockDataContext";
import { useAdminData } from "../../../../contexts/AdminDataContext";
import { ShieldAlert } from "lucide-react";
import { FloorCanvas } from "./FloorCanvas";
import { ObjectPalette } from "./ObjectPalette";
import { PropertiesPanel } from "./PropertiesPanel";
import { CanvasToolbar, type ToolMode } from "./CanvasToolbar";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { floorLayouts } from "../../../../data/mock-data";
import { Check, PenLine } from "lucide-react";
import { toast } from "sonner";
import type { CanvasObject, CanvasObjectType } from "../../../../data/types";

const DEFAULT_SIZES: Record<CanvasObjectType, { w: number; h: number }> = {
  desk: { w: 80, h: 60 },
  room: { w: 240, h: 180 },
  wall: { w: 200, h: 12 },
  kitchen: { w: 180, h: 160 },
  bathroom: { w: 120, h: 100 },
  elevator: { w: 80, h: 80 },
  stairs: { w: 80, h: 80 },
  table: { w: 160, h: 80 },
  chair: { w: 40, h: 40 },
  sofa: { w: 160, h: 60 },
  plant: { w: 40, h: 40 },
};

const MAX_UNDO = 20;

export function OfficeBuilderPage() {
  const { role } = useDemoRole();
  const { floors, zones, canvasObjects } = useMockData();
  const { addCanvasObject, updateCanvasObject, deleteCanvasObject } = useAdminData();

  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id ?? "");
  const [isDraft, setIsDraft] = useState(false);
  const [tool, setTool] = useState<ToolMode>("select");
  const [zoom, setZoom] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeObjectType, setActiveObjectType] = useState<CanvasObjectType | null>(null);
  const [activeZoneId, setActiveZoneId] = useState("");

  // Undo stack
  const [undoStack, setUndoStack] = useState<{ action: string; data: any }[]>([]);

  const layout = floorLayouts.find((l) => l.floorId === selectedFloorId) ?? {
    floorId: selectedFloorId,
    gridWidth: 20,
    gridHeight: 14,
    canvasWidth: 1600,
    canvasHeight: 1000,
  };

  const floorObjects = canvasObjects.filter((o) => o.floorId === selectedFloorId);
  const floorZones = zones.filter((z) => z.floorId === selectedFloorId);
  const effectiveActiveZoneId = activeZoneId || floorZones[0]?.id || "";

  const selectedObject = selectedObjectId
    ? floorObjects.find((o) => o.id === selectedObjectId) ?? null
    : null;

  // Counter for desk labels
  const deskCounter = useRef(
    Math.max(0, ...canvasObjects.filter((o) => o.type === "desk").map((o) => {
      const m = o.label?.match(/D-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })) + 1
  );

  const pushUndo = useCallback((action: string, data: any) => {
    setUndoStack((s) => [...s.slice(-MAX_UNDO + 1), { action, data }]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const last = s[s.length - 1];
      if (last.action === "add") {
        deleteCanvasObject(last.data.id);
      } else if (last.action === "delete") {
        addCanvasObject(last.data);
      } else if (last.action === "move") {
        updateCanvasObject(last.data.id, { x: last.data.prevX, y: last.data.prevY });
      }
      return s.slice(0, -1);
    });
  }, [addCanvasObject, deleteCanvasObject, updateCanvasObject]);

  const handlePlaceObject = useCallback(
    (x: number, y: number) => {
      if (!activeObjectType) {
        toast.error("Select an object type from the palette");
        return;
      }
      const size = DEFAULT_SIZES[activeObjectType];
      const obj: Omit<CanvasObject, "id"> = {
        type: activeObjectType,
        floorId: selectedFloorId,
        x,
        y,
        width: size.w,
        height: size.h,
        rotation: 0,
        ...(activeObjectType === "desk" && {
          zoneId: effectiveActiveZoneId,
          label: `D-${(deskCounter.current++).toString().padStart(2, "0")}`,
        }),
        ...(activeObjectType === "room" && {
          label: "New room",
          capacity: 4,
        }),
        ...(["kitchen", "bathroom", "elevator", "stairs"].includes(activeObjectType) && {
          label: activeObjectType.charAt(0).toUpperCase() + activeObjectType.slice(1),
        }),
      };
      const id = addCanvasObject(obj);
      pushUndo("add", { id });
      setIsDraft(true);
      setSelectedObjectId(id);
    },
    [activeObjectType, selectedFloorId, effectiveActiveZoneId, addCanvasObject, pushUndo]
  );

  const handleCreateWall = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const id = addCanvasObject({
        type: "wall",
        floorId: selectedFloorId,
        x, y,
        width: w,
        height: h,
        rotation: 0,
      });
      pushUndo("add", { id });
      setIsDraft(true);
    },
    [selectedFloorId, addCanvasObject, pushUndo]
  );

  const handleMoveObject = useCallback(
    (id: string, x: number, y: number) => {
      const obj = canvasObjects.find((o) => o.id === id);
      if (obj) pushUndo("move", { id, prevX: obj.x, prevY: obj.y });
      updateCanvasObject(id, { x, y });
      setIsDraft(true);
    },
    [canvasObjects, updateCanvasObject, pushUndo]
  );

  const handleDeleteObject = useCallback(
    (id: string) => {
      const obj = canvasObjects.find((o) => o.id === id);
      if (obj) pushUndo("delete", obj);
      deleteCanvasObject(id);
      if (selectedObjectId === id) setSelectedObjectId(null);
      setIsDraft(true);
      toast.success("Object removed");
    },
    [canvasObjects, deleteCanvasObject, selectedObjectId, pushUndo]
  );

  const handleUpdateObject = useCallback(
    (id: string, data: Partial<CanvasObject>) => {
      updateCanvasObject(id, data);
      setIsDraft(true);
    },
    [updateCanvasObject]
  );

  const handleToolChange = useCallback((t: ToolMode) => {
    setTool(t);
    if (t !== "select") setSelectedObjectId(null);
    if (t === "place" && !activeObjectType) setActiveObjectType("desk");
  }, [activeObjectType]);

  const handleSelectObjectType = useCallback((type: CanvasObjectType) => {
    setActiveObjectType(type);
    if (type === "wall") {
      setTool("wall");
    } else {
      setTool("place");
    }
  }, []);

  const handlePublish = () => {
    setIsDraft(false);
    setUndoStack([]);
    toast.success("Floor layout published");
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) handleDeleteObject(selectedObjectId);
      }
      if (e.key === "Escape") {
        setSelectedObjectId(null);
        setTool("select");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    },
    [selectedObjectId, handleDeleteObject, handleUndo]
  );

  if (role === "user") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="admin-access-denied">
        <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need admin privileges to view this page
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-4rem)] flex-col"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">
            Office builder
          </h1>
          <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
            <SelectTrigger className="w-[180px]">
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
        </div>
        <div className="flex items-center gap-2">
          {isDraft ? (
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-amber-600"
            >
              <PenLine className="mr-1 h-3 w-3" />
              Draft
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
            >
              <Check className="mr-1 h-3 w-3" />
              Published
            </Badge>
          )}
          <Button size="sm" disabled={!isDraft} onClick={handlePublish}>
            Publish changes
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-center border-b border-border bg-muted/20 px-4 py-1.5">
        <CanvasToolbar
          tool={tool}
          onToolChange={handleToolChange}
          zoom={zoom}
          onZoomChange={setZoom}
          snapEnabled={snapEnabled}
          onSnapToggle={setSnapEnabled}
          canUndo={undoStack.length > 0}
          onUndo={handleUndo}
        />
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Object palette */}
        <ObjectPalette
          activeType={tool === "place" || tool === "wall" ? activeObjectType : null}
          onSelect={handleSelectObjectType}
          zones={floorZones}
          activeZoneId={effectiveActiveZoneId}
          onActiveZoneChange={setActiveZoneId}
        />

        {/* Center: Canvas */}
        <FloorCanvas
          layout={layout}
          objects={floorObjects}
          zones={floorZones}
          tool={tool}
          selectedId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onMoveObject={handleMoveObject}
          onUpdateObject={handleUpdateObject}
          onDeleteObject={handleDeleteObject}
          onPlaceObject={handlePlaceObject}
          onCreateWall={handleCreateWall}
          snapEnabled={snapEnabled}
          externalZoom={zoom}
          onExternalZoomChange={setZoom}
        />

        {/* Right: Properties panel */}
        {selectedObject && (
          <PropertiesPanel
            object={selectedObject}
            zones={floorZones}
            onUpdate={handleUpdateObject}
            onDelete={handleDeleteObject}
            onClose={() => setSelectedObjectId(null)}
          />
        )}
      </div>
    </div>
  );
}
