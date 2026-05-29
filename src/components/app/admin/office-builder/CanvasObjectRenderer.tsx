import { useRef, useEffect } from "react";
import { Group, Rect, Circle, Text, Line, Path, Transformer } from "react-konva";
import type { CanvasObject, Zone } from "../../../../data/types";
import type Konva from "konva";
import {
  getObjectStyle,
  DESK_PATH,
  DESK_MONITOR_PATH,
  DESK_KEYBOARD_PATH,
  CHAIR_BACKREST_PATH,
  SOFA_PATH,
  SOFA_CUSHION_1,
  SOFA_CUSHION_2,
  KITCHEN_COUNTER_PATH,
  KITCHEN_SINK,
  KITCHEN_BURNERS,
  TOILET_PATH,
  TOILET_TANK_PATH,
  BATHROOM_SINK,
  ELEVATOR_CROSS_1,
  ELEVATOR_CROSS_2,
  getStairTreadLines,
  STAIRS_ARROW_PATH,
  getLeafPetals,
  TABLE_RECT_PATH,
  TABLE_CENTER_CROSS_1,
  TABLE_CENTER_CROSS_2,
} from "./floorplan-paths";

interface CanvasObjectRendererProps {
  obj: CanvasObject;
  zones: Zone[];
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<CanvasObject>) => void;
}

function getZoneColor(zones: Zone[], zoneId?: string): string | undefined {
  if (!zoneId) return undefined;
  return zones.find((z) => z.id === zoneId)?.color;
}

// Scale factor to map 100-unit paths to actual object dimensions
function sx(obj: CanvasObject) { return obj.width / 100; }
function sy(obj: CanvasObject) { return obj.height / 100; }

export function CanvasObjectRenderer({
  obj,
  zones,
  isSelected,
  onSelect,
  onChange,
}: CanvasObjectRendererProps) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const zoneColor = getZoneColor(zones, obj.zoneId);
  const style = getObjectStyle(obj.type, zoneColor);
  const isWall = obj.type === "wall";
  const selectedStroke = "#6366f1";
  const stroke = isSelected ? selectedStroke : style.stroke;
  const strokeWidth = isSelected ? 2.5 : 1.5;
  const shadowBlur = isSelected ? 12 : 6;
  const shadowOpacity = isSelected ? 0.3 : 0.15;
  const showLabel = !isWall && obj.width >= 50 && obj.height >= 40;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.max(20, Math.round(obj.width * scaleX)),
      height: Math.max(20, Math.round(obj.height * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  };

  const renderShape = () => {
    switch (obj.type) {
      case "wall":
        return (
          <Rect
            width={obj.width}
            height={obj.height}
            fill={style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={style.cornerRadius}
          />
        );

      case "desk":
        return (
          <>
            {/* L-shaped desk surface */}
            <Path
              data={DESK_PATH}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Monitor */}
            <Path
              data={DESK_MONITOR_PATH}
              fill={zoneColor ?? "#64748b"}
              opacity={0.5}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
            />
            {/* Keyboard tray */}
            <Path
              data={DESK_KEYBOARD_PATH}
              stroke={zoneColor ?? "#94a3b8"}
              strokeWidth={1.5 / sx(obj)}
              opacity={0.35}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
          </>
        );

      case "chair":
        return (
          <>
            {/* Seat circle */}
            <Circle
              x={obj.width / 2}
              y={obj.height / 2 + 4 * sy(obj)}
              radius={Math.min(obj.width, obj.height) * 0.35}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
            {/* Backrest arc */}
            <Path
              data={CHAIR_BACKREST_PATH}
              stroke={stroke}
              strokeWidth={2.5 / sx(obj)}
              fill="transparent"
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
          </>
        );

      case "sofa":
        return (
          <>
            {/* U-shaped body */}
            <Path
              data={SOFA_PATH}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Cushion dividers */}
            {obj.width >= 60 && (
              <>
                <Path
                  data={SOFA_CUSHION_1}
                  stroke={stroke}
                  strokeWidth={0.8 / sx(obj)}
                  opacity={0.35}
                  scaleX={sx(obj)}
                  scaleY={sy(obj)}
                  listening={false}
                />
                <Path
                  data={SOFA_CUSHION_2}
                  stroke={stroke}
                  strokeWidth={0.8 / sx(obj)}
                  opacity={0.35}
                  scaleX={sx(obj)}
                  scaleY={sy(obj)}
                  listening={false}
                />
              </>
            )}
          </>
        );

      case "table":
        return (
          <>
            {/* Table surface */}
            <Path
              data={TABLE_RECT_PATH}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Center cross for meeting tables */}
            {obj.width >= 60 && obj.height >= 60 && (
              <>
                <Path
                  data={TABLE_CENTER_CROSS_1}
                  stroke={stroke}
                  strokeWidth={0.8 / sx(obj)}
                  opacity={0.2}
                  scaleX={sx(obj)}
                  scaleY={sy(obj)}
                  listening={false}
                />
                <Path
                  data={TABLE_CENTER_CROSS_2}
                  stroke={stroke}
                  strokeWidth={0.8 / sy(obj)}
                  opacity={0.2}
                  scaleX={sx(obj)}
                  scaleY={sy(obj)}
                  listening={false}
                />
              </>
            )}
          </>
        );

      case "plant":
        return (
          <>
            {/* Leaf petals */}
            {getLeafPetals(6).map((d, i) => (
              <Path
                key={i}
                data={d}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={1 / sx(obj)}
                opacity={0.7}
                scaleX={sx(obj)}
                scaleY={sy(obj)}
                listening={false}
              />
            ))}
            {/* Center pot */}
            <Circle
              x={obj.width / 2}
              y={obj.height / 2}
              radius={Math.min(obj.width, obj.height) * 0.15}
              fill={style.stroke}
              stroke={isSelected ? selectedStroke : style.stroke}
              strokeWidth={strokeWidth}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
          </>
        );

      case "kitchen":
        return (
          <>
            {/* Base rectangle */}
            <Rect
              width={obj.width}
              height={obj.height}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={style.cornerRadius}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Counter divider */}
            <Path
              data={KITCHEN_COUNTER_PATH}
              stroke={stroke}
              strokeWidth={1 / sx(obj)}
              opacity={0.5}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
            {/* Sink */}
            <Circle
              x={KITCHEN_SINK.cx * sx(obj)}
              y={KITCHEN_SINK.cy * sy(obj)}
              radius={KITCHEN_SINK.r * Math.min(sx(obj), sy(obj))}
              stroke={stroke}
              strokeWidth={1.2}
              fill="transparent"
              listening={false}
            />
            {/* Stove burners */}
            {obj.width >= 60 && obj.height >= 60 &&
              KITCHEN_BURNERS.map((b, i) => (
                <Circle
                  key={i}
                  x={b.cx * sx(obj)}
                  y={b.cy * sy(obj)}
                  radius={b.r * Math.min(sx(obj), sy(obj))}
                  stroke={stroke}
                  strokeWidth={0.8}
                  fill="transparent"
                  opacity={0.5}
                  listening={false}
                />
              ))}
          </>
        );

      case "bathroom":
        return (
          <>
            {/* Base rectangle */}
            <Rect
              width={obj.width}
              height={obj.height}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={style.cornerRadius}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Toilet bowl */}
            <Path
              data={TOILET_PATH}
              fill="white"
              stroke={stroke}
              strokeWidth={1.2 / sx(obj)}
              scaleX={sx(obj) * 0.5}
              scaleY={sy(obj) * 0.8}
              x={obj.width * 0.35}
              y={obj.height * 0.05}
              listening={false}
            />
            {/* Toilet tank */}
            <Path
              data={TOILET_TANK_PATH}
              fill={style.stroke}
              opacity={0.3}
              scaleX={sx(obj) * 0.5}
              scaleY={sy(obj) * 0.8}
              x={obj.width * 0.35}
              y={obj.height * 0.05}
              listening={false}
            />
            {/* Sink */}
            <Circle
              x={BATHROOM_SINK.cx * sx(obj)}
              y={BATHROOM_SINK.cy * sy(obj)}
              radius={BATHROOM_SINK.r * Math.min(sx(obj), sy(obj))}
              stroke={stroke}
              strokeWidth={1}
              fill="white"
              listening={false}
            />
          </>
        );

      case "elevator":
        return (
          <>
            <Rect
              width={obj.width}
              height={obj.height}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={style.cornerRadius}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
            {/* Diagonal cross */}
            <Path
              data={ELEVATOR_CROSS_1}
              stroke={stroke}
              strokeWidth={1.5 / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
            <Path
              data={ELEVATOR_CROSS_2}
              stroke={stroke}
              strokeWidth={1.5 / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
          </>
        );

      case "stairs":
        return (
          <>
            <Rect
              width={obj.width}
              height={obj.height}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={style.cornerRadius}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
            {/* Tread lines */}
            {getStairTreadLines(6).map((d, i) => (
              <Path
                key={i}
                data={d}
                stroke={stroke}
                strokeWidth={1 / sx(obj)}
                opacity={0.5}
                scaleX={sx(obj)}
                scaleY={sy(obj)}
                listening={false}
              />
            ))}
            {/* Direction arrow */}
            <Path
              data={STAIRS_ARROW_PATH}
              fill={stroke}
              opacity={0.25}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
          </>
        );

      case "room":
        return (
          <>
            <Rect
              width={obj.width}
              height={obj.height}
              fill={style.fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={style.cornerRadius}
              shadowColor={style.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {/* Door indicator */}
            {obj.width >= 60 && (
              <>
                <Line
                  points={[8, obj.height - 1, 28, obj.height - 1]}
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  lineCap="round"
                />
                <Line
                  points={[8, obj.height - 1, 8, obj.height - 10]}
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dash={[3, 2]}
                />
              </>
            )}
          </>
        );

      default:
        return (
          <Rect
            width={obj.width}
            height={obj.height}
            fill={style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={style.cornerRadius}
          />
        );
    }
  };

  return (
    <>
      <Group
        ref={shapeRef}
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        rotation={obj.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderShape()}

        {/* Label */}
        {showLabel && obj.label && (
          <Text
            text={obj.label}
            x={2}
            y={obj.height * 0.7}
            width={obj.width - 4}
            align="center"
            fontSize={9}
            fontStyle="600"
            fill="#1e293b"
            ellipsis
            wrap="none"
          />
        )}

        {/* Room capacity badge */}
        {obj.type === "room" && obj.capacity && obj.width >= 80 && (
          <Text
            text={`${obj.capacity} seats`}
            x={2}
            y={obj.height * 0.82}
            width={obj.width - 4}
            align="center"
            fontSize={8}
            fill="#64748b"
          />
        )}
      </Group>

      {/* Transformer for resize/rotate */}
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotateEnabled={!isWall}
          enabledAnchors={
            isWall
              ? ["middle-left", "middle-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"]
          }
          anchorFill="#6366f1"
          anchorStroke="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#6366f1"
          borderStrokeWidth={1.5}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
