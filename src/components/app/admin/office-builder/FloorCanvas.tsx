import { useCallback, useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import type Konva from "konva";
import type { CanvasObject, Zone, FloorLayout } from "../../../../data/types";
import type { ToolMode } from "./CanvasToolbar";
import { CanvasObjectRenderer } from "./CanvasObjectRenderer";

const GRID_STEP = 20;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const EDGE_SNAP_THRESHOLD = 8;

function snap(v: number): number {
  return Math.round(v / GRID_STEP) * GRID_STEP;
}

function snapToEdges(
  draggedId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  others: CanvasObject[]
): { x: number; y: number; guideLines: { x?: number; y?: number } } {
  let snappedX = x;
  let snappedY = y;
  let bestDx = EDGE_SNAP_THRESHOLD + 1;
  let bestDy = EDGE_SNAP_THRESHOLD + 1;
  const guideLines: { x?: number; y?: number } = {};

  const dragL = x, dragR = x + w, dragT = y, dragB = y + h;

  for (const other of others) {
    if (other.id === draggedId) continue;
    const oL = other.x, oR = other.x + other.width, oT = other.y, oB = other.y + other.height;

    // X-axis edge pairs: left↔right, right↔left, left↔left, right↔right
    const xPairs = [
      { drag: dragL, other: oR, offset: 0 },      // left → other right
      { drag: dragR, other: oL, offset: -(w) },    // right → other left
      { drag: dragL, other: oL, offset: 0 },        // left → other left
      { drag: dragR, other: oR, offset: -(w) },    // right → other right
    ];
    for (const p of xPairs) {
      const d = Math.abs(p.drag - p.other);
      if (d < bestDx) {
        bestDx = d;
        snappedX = p.other + p.offset;
        guideLines.x = p.other;
      }
    }

    // Y-axis edge pairs
    const yPairs = [
      { drag: dragT, other: oB, offset: 0 },
      { drag: dragB, other: oT, offset: -(h) },
      { drag: dragT, other: oT, offset: 0 },
      { drag: dragB, other: oB, offset: -(h) },
    ];
    for (const p of yPairs) {
      const d = Math.abs(p.drag - p.other);
      if (d < bestDy) {
        bestDy = d;
        snappedY = p.other + p.offset;
        guideLines.y = p.other;
      }
    }
  }

  if (bestDx > EDGE_SNAP_THRESHOLD) { snappedX = x; delete guideLines.x; }
  if (bestDy > EDGE_SNAP_THRESHOLD) { snappedY = y; delete guideLines.y; }

  return { x: snappedX, y: snappedY, guideLines };
}

interface FloorCanvasProps {
  layout: FloorLayout;
  objects: CanvasObject[];
  zones: Zone[];
  tool: ToolMode;
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onMoveObject: (id: string, x: number, y: number) => void;
  onUpdateObject?: (id: string, data: Partial<CanvasObject>) => void;
  onDeleteObject: (id: string) => void;
  onPlaceObject: (x: number, y: number) => void;
  onCreateWall: (x: number, y: number, w: number, h: number) => void;
  snapEnabled: boolean;
  externalZoom: number;
  onExternalZoomChange: (z: number) => void;
}

export function FloorCanvas({
  layout,
  objects,
  zones,
  tool,
  selectedId,
  onSelectObject,
  onMoveObject,
  onUpdateObject,
  onDeleteObject,
  onPlaceObject,
  onCreateWall,
  snapEnabled,
  externalZoom,
  onExternalZoomChange,
}: FloorCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [wallDraw, setWallDraw] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }>({});

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

  // Sync external zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const currentScale = stage.scaleX();
    if (Math.abs(currentScale - externalZoom) > 0.01) {
      stage.scale({ x: externalZoom, y: externalZoom });
      stage.batchDraw();
    }
  }, [externalZoom]);

  // Zoom via wheel
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
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
      onExternalZoomChange(newScale);
    },
    [onExternalZoomChange]
  );

  // Get canvas position from pointer
  const getCanvasPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const scale = stage.scaleX();
    const pos = stage.position();
    return {
      x: (pointer.x - pos.x) / scale,
      y: (pointer.y - pos.y) / scale,
    };
  }, []);

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only handle clicks on empty canvas (not on objects)
      const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs?.name === "canvas-bg";
      if (!clickedOnEmpty) return;

      const pos = getCanvasPos();
      if (!pos) return;

      if (tool === "select") {
        onSelectObject(null);
        return;
      }

      if (tool === "place") {
        const x = snapEnabled ? snap(pos.x) : Math.round(pos.x);
        const y = snapEnabled ? snap(pos.y) : Math.round(pos.y);
        onPlaceObject(x, y);
        return;
      }

      if (tool === "wall") {
        const sx = snap(pos.x);
        const sy = snap(pos.y);
        setWallDraw({ startX: sx, startY: sy, endX: sx, endY: sy });
        return;
      }
    },
    [tool, getCanvasPos, snapEnabled, onSelectObject, onPlaceObject]
  );

  const handleStageMouseMove = useCallback(
    () => {
      if (!wallDraw) return;
      const pos = getCanvasPos();
      if (!pos) return;
      setWallDraw((w) => w ? { ...w, endX: snap(pos.x), endY: snap(pos.y) } : null);
    },
    [wallDraw, getCanvasPos]
  );

  const handleStageMouseUp = useCallback(() => {
    if (!wallDraw) return;
    const x = Math.min(wallDraw.startX, wallDraw.endX);
    const y = Math.min(wallDraw.startY, wallDraw.endY);
    const w = Math.abs(wallDraw.endX - wallDraw.startX);
    const h = Math.abs(wallDraw.endY - wallDraw.startY);
    setWallDraw(null);
    if (w < 20 && h < 20) return;
    if (w >= h) {
      onCreateWall(x, y, Math.max(w, 40), 12);
    } else {
      onCreateWall(x, y, 12, Math.max(h, 40));
    }
  }, [wallDraw, onCreateWall]);

  const handleObjectChange = useCallback(
    (id: string, attrs: Partial<CanvasObject>) => {
      if (attrs.x !== undefined && attrs.y !== undefined && attrs.width === undefined) {
        // Move only — try edge snap first, then grid snap
        const obj = objects.find((o) => o.id === id);
        const w = obj?.width ?? 60;
        const h = obj?.height ?? 60;
        const edgeResult = snapToEdges(id, attrs.x, attrs.y, w, h, objects);
        let x = edgeResult.x;
        let y = edgeResult.y;
        // Fall back to grid snap on axes where no edge snap occurred
        if (edgeResult.guideLines.x === undefined && snapEnabled) x = snap(attrs.x);
        if (edgeResult.guideLines.y === undefined && snapEnabled) y = snap(attrs.y);
        if (x === attrs.x && snapEnabled && edgeResult.guideLines.x === undefined) x = snap(attrs.x);
        if (y === attrs.y && snapEnabled && edgeResult.guideLines.y === undefined) y = snap(attrs.y);
        setSnapGuides(edgeResult.guideLines);
        onMoveObject(id, x, y);
      } else if (onUpdateObject) {
        // Resize/rotate
        const snapped: Partial<CanvasObject> = { ...attrs };
        if (snapEnabled && snapped.x !== undefined) snapped.x = snap(snapped.x);
        if (snapEnabled && snapped.y !== undefined) snapped.y = snap(snapped.y);
        onUpdateObject(id, snapped);
        setSnapGuides({});
      }
    },
    [snapEnabled, onMoveObject, onUpdateObject, objects]
  );

  const handleObjectSelect = useCallback(
    (obj: CanvasObject) => {
      setSnapGuides({});
      if (tool === "erase") {
        onDeleteObject(obj.id);
        return;
      }
      onSelectObject(obj.id);
    },
    [tool, onDeleteObject, onSelectObject]
  );

  // Sort: walls first
  const sorted = [...objects].sort((a, b) => {
    if (a.type === "wall" && b.type !== "wall") return -1;
    if (a.type !== "wall" && b.type === "wall") return 1;
    return 0;
  });

  const cursorClass =
    tool === "place" || tool === "wall" ? "cursor-crosshair"
    : tool === "erase" ? "cursor-pointer"
    : "cursor-default";

  // Determine if stage should be draggable (select mode, not drawing wall)
  const stageDraggable = tool === "select" && !wallDraw;

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-hidden bg-muted/30 ${cursorClass}`}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable={stageDraggable}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchStart={handleStageMouseDown as any}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            name="canvas-bg"
            x={0}
            y={0}
            width={layout.canvasWidth}
            height={layout.canvasHeight}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth={1}
            cornerRadius={8}
            shadowColor="#000000"
            shadowBlur={20}
            shadowOpacity={0.06}
            shadowOffsetY={4}
          />

          {/* Grid dots */}
          {snapEnabled &&
            Array.from({ length: Math.floor(layout.canvasWidth / GRID_STEP) + 1 }, (_, xi) =>
              Array.from({ length: Math.floor(layout.canvasHeight / GRID_STEP) + 1 }, (_, yi) => (
                <Circle
                  key={`${xi}-${yi}`}
                  x={xi * GRID_STEP}
                  y={yi * GRID_STEP}
                  radius={0.6}
                  fill="#94a3b8"
                  opacity={0.2}
                  listening={false}
                  perfectDrawEnabled={false}
                />
              ))
            )}

          {/* Objects */}
          {sorted.map((obj) => (
            <CanvasObjectRenderer
              key={obj.id}
              obj={obj}
              zones={zones}
              isSelected={selectedId === obj.id}
              onSelect={() => handleObjectSelect(obj)}
              onChange={(attrs) => handleObjectChange(obj.id, attrs)}
            />
          ))}

          {/* Wall draw preview */}
          {wallDraw && (
            <Rect
              x={Math.min(wallDraw.startX, wallDraw.endX)}
              y={Math.min(wallDraw.startY, wallDraw.endY)}
              width={Math.abs(wallDraw.endX - wallDraw.startX) || 12}
              height={Math.abs(wallDraw.endY - wallDraw.startY) || 12}
              fill="rgba(51, 65, 85, 0.3)"
              stroke="rgba(51, 65, 85, 0.6)"
              strokeWidth={1}
              dash={[4, 2]}
              cornerRadius={1}
              listening={false}
            />
          )}

          {/* Snap guide lines */}
          {snapGuides.x !== undefined && (
            <Line
              points={[snapGuides.x, 0, snapGuides.x, layout.canvasHeight]}
              stroke="hsl(220, 90%, 56%)"
              strokeWidth={1}
              dash={[4, 3]}
              opacity={0.7}
              listening={false}
            />
          )}
          {snapGuides.y !== undefined && (
            <Line
              points={[0, snapGuides.y, layout.canvasWidth, snapGuides.y]}
              stroke="hsl(220, 90%, 56%)"
              strokeWidth={1}
              dash={[4, 3]}
              opacity={0.7}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
