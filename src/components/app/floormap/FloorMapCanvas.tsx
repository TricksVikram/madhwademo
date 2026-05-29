import { useCallback, useRef, useEffect, useState, useMemo, useImperativeHandle, forwardRef } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import type Konva from "konva";
import type { CanvasObject, Zone, Booking, User } from "../../../data/types";
import { BookingCanvasObjectRenderer } from "./BookingCanvasObjectRenderer";
import type { ResolvedStatus } from "../../../data/status-resolver";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

export interface FloorMapCanvasHandle {
  zoomToZone: (zoneId: string) => void;
  resetView: () => void;
}

interface FloorMapCanvasProps {
  canvasWidth: number;
  canvasHeight: number;
  objects: CanvasObject[];
  zones: Zone[];
  bookings: Booking[];
  users: User[];
  date: string;
  showTeammateIds: Set<string>;
  selectedObjectId: string | null;
  onObjectClick: (obj: CanvasObject) => void;
  /** When set, dims objects of this type (used by wizard to focus desk or room) */
  dimResourceType?: "desk" | "room";
}

export const FloorMapCanvas = forwardRef<FloorMapCanvasHandle, FloorMapCanvasProps>(function FloorMapCanvas({
  canvasWidth,
  canvasHeight,
  objects,
  zones,
  bookings,
  users,
  date,
  showTeammateIds,
  selectedObjectId,
  onObjectClick,
  dimResourceType,
}, ref) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Resize stage to fit container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setStageSize({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Fit canvas to view on mount / floor change
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !stageSize.width) return;
    const padding = 40;
    const scaleX = (stageSize.width - padding * 2) / canvasWidth;
    const scaleY = (stageSize.height - padding * 2) / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    const offsetX = (stageSize.width - canvasWidth * scale) / 2;
    const offsetY = (stageSize.height - canvasHeight * scale) / 2;
    stage.scale({ x: scale, y: scale });
    stage.position({ x: offsetX, y: offsetY });
    stage.batchDraw();
  }, [canvasWidth, canvasHeight, stageSize]);

  // Expose imperative methods for parent components
  useImperativeHandle(ref, () => ({
    zoomToZone(zoneId: string) {
      const stage = stageRef.current;
      if (!stage) return;
      const zoneObjs = objects.filter((o) => o.zoneId === zoneId);
      if (zoneObjs.length === 0) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const o of zoneObjs) {
        minX = Math.min(minX, o.x);
        minY = Math.min(minY, o.y);
        maxX = Math.max(maxX, o.x + o.width);
        maxY = Math.max(maxY, o.y + o.height);
      }
      const padding = 80;
      const bboxW = maxX - minX + padding * 2;
      const bboxH = maxY - minY + padding * 2;
      const zScaleX = stageSize.width / bboxW;
      const zScaleY = stageSize.height / bboxH;
      const newScale = Math.min(zScaleX, zScaleY, MAX_ZOOM);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const newX = stageSize.width / 2 - centerX * newScale;
      const newY = stageSize.height / 2 - centerY * newScale;
      stage.to({ x: newX, y: newY, scaleX: newScale, scaleY: newScale, duration: 0.4 });
    },
    resetView() {
      const stage = stageRef.current;
      if (!stage || !stageSize.width) return;
      const pad = 40;
      const scX = (stageSize.width - pad * 2) / canvasWidth;
      const scY = (stageSize.height - pad * 2) / canvasHeight;
      const sc = Math.min(scX, scY, 1);
      const oX = (stageSize.width - canvasWidth * sc) / 2;
      const oY = (stageSize.height - canvasHeight * sc) / 2;
      stage.to({ x: oX, y: oY, scaleX: sc, scaleY: sc, duration: 0.4 });
    },
  }), [objects, stageSize, canvasWidth, canvasHeight]);

  // Zoom via wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const delta = e.evt.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldScale * delta));
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    stage.batchDraw();
  }, []);

  // Build resource status map — date-aware (not wall-clock dependent)
  const resourceStatusMap = useMemo(() => {
    const map = new Map<string, ResolvedStatus>();

    // Pre-filter bookings for the selected date
    const dateBookings = bookings.filter(
      (b) => b.date === date && b.status !== "cancelled" && b.status !== "auto-released" && b.status !== "completed"
    );
    const checkedInIds = new Set(dateBookings.filter((b) => b.status === "checked-in").map((b) => b.resourceId));
    const bookedIds = new Set(dateBookings.map((b) => b.resourceId));

    for (const obj of objects) {
      if ((obj.type === "desk" || obj.type === "room") && obj.resourceId) {
        if (checkedInIds.has(obj.resourceId)) {
          map.set(obj.id, "occupied");
        } else if (bookedIds.has(obj.resourceId)) {
          map.set(obj.id, "booked");
        } else {
          map.set(obj.id, "available");
        }
      }
    }
    return map;
  }, [objects, bookings, date]);

  // Build occupant map (resourceId → user info)
  const occupantMap = useMemo(() => {
    const map = new Map<string, { userId: string; name: string; avatar: string }>();
    const dateBookings = bookings.filter(
      (b) => b.date === date && b.status !== "cancelled" && b.status !== "auto-released" && b.status !== "completed"
    );
    for (const b of dateBookings) {
      const user = users.find((u) => u.id === b.userId);
      if (user) {
        map.set(b.resourceId, { userId: user.id, name: user.name.split(" ")[0], avatar: user.avatar });
      }
    }
    return map;
  }, [bookings, users, date]);

  // Whether any resource is selected (to dim others)
  const hasSelection = selectedObjectId !== null;

  // Sort: walls first
  const sorted = useMemo(
    () =>
      [...objects].sort((a, b) => {
        if (a.type === "wall" && b.type !== "wall") return -1;
        if (a.type !== "wall" && b.type === "wall") return 1;
        return 0;
      }),
    [objects]
  );

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-border bg-muted/30 overflow-hidden"
      style={{ height: "calc(100vh - 12rem)", minHeight: 500 }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable
        onWheel={handleWheel}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth={1}
            cornerRadius={8}
            shadowColor="#000000"
            shadowBlur={20}
            shadowOpacity={0.06}
            shadowOffsetY={4}
          />

          {/* Objects */}
          {sorted.map((obj) => {
            const status = resourceStatusMap.get(obj.id);
            const occupant = obj.resourceId ? occupantMap.get(obj.resourceId) : undefined;
            const isTeammate = occupant && showTeammateIds.size > 0 && showTeammateIds.has(occupant.userId);
            const isResource = obj.type === "desk" || obj.type === "room";
            const isSelected = obj.id === selectedObjectId;
            // Dim non-available resources and non-resources when a selection is active; also dim filtered resource type
            const isDimmedByType = dimResourceType && obj.type === dimResourceType;
            const isDimmed = isDimmedByType || (hasSelection && !isSelected && (isResource ? status !== "available" : true));

            const zoneName = obj.zoneId ? zones.find((z) => z.id === obj.zoneId)?.name : undefined;

            return (
              <BookingCanvasObjectRenderer
                key={obj.id}
                obj={obj}
                zones={zones}
                bookingStatus={status}
                isTeammate={!!isTeammate}
                isSelected={isSelected}
                isDimmed={isDimmed}
                occupantName={occupant?.name}
                occupantAvatar={occupant?.avatar}
                zoneName={zoneName}
                onClick={() => onObjectClick(obj)}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});
