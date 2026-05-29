import { useState, useEffect, useRef } from "react";
import Konva from "konva";
import { Group, Rect, Circle, Text, Path, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { CanvasObject, Zone } from "../../../data/types";
import type { ResolvedStatus } from "../../../data/status-resolver";
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
} from "../admin/office-builder/floorplan-paths";

const STATUS_FILL: Record<ResolvedStatus, string> = {
  available: "#dcfce7",
  booked: "#ede9fe",
  occupied: "#fef3c7",
  maintenance: "#f1f5f9",
};

const STATUS_STROKE: Record<ResolvedStatus, string> = {
  available: "#22c55e",
  booked: "#7c3aed",
  occupied: "#f59e0b",
  maintenance: "#94a3b8",
};

interface Props {
  obj: CanvasObject;
  zones: Zone[];
  bookingStatus?: ResolvedStatus;
  isTeammate?: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  occupantName?: string;
  occupantAvatar?: string;
  zoneName?: string;
  onClick?: () => void;
}

function getZoneColor(zones: Zone[], zoneId?: string): string | undefined {
  if (!zoneId) return undefined;
  return zones.find((z) => z.id === zoneId)?.color;
}

function sx(obj: CanvasObject) { return obj.width / 100; }
function sy(obj: CanvasObject) { return obj.height / 100; }

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function AvatarBubble({ url, x, y, size, strokeColor, fallbackName }: { url: string; x: number; y: number; size: number; strokeColor: string; fallbackName?: string }) {
  const [image, status] = useImage(url);
  const radius = size / 2;

  // Initials fallback when image not loaded
  if (status !== "loaded" || !image) {
    const initials = fallbackName ? getInitials(fallbackName) : "?";
    return (
      <Group x={x - radius} y={y - radius}>
        <Circle x={radius} y={radius} radius={radius + 2} fill="white" />
        <Circle x={radius} y={radius} radius={radius} fill={strokeColor} opacity={0.85} />
        <Text text={initials} x={0} y={radius - 5} width={size} align="center" fontSize={size * 0.38} fontStyle="700" fill="white" />
        <Circle x={radius} y={radius} radius={radius + 2} stroke={strokeColor} strokeWidth={2.5} fill="transparent" />
      </Group>
    );
  }

  return (
    <Group x={x - radius} y={y - radius}>
      <Circle x={radius} y={radius} radius={radius + 2} fill="white" />
      <Group clipFunc={(ctx: any) => { ctx.arc(radius, radius, radius, 0, Math.PI * 2); }}>
        <KonvaImage image={image} x={0} y={0} width={size} height={size} />
      </Group>
      <Circle x={radius} y={radius} radius={radius + 2} stroke={strokeColor} strokeWidth={2.5} fill="transparent" />
    </Group>
  );
}
/** Subtle pulsing glow behind available desks */
function PulseGlow({ width, height, color }: { width: number; height: number; color: string }) {
  const rectRef = useRef<Konva.Rect>(null);

  useEffect(() => {
    const node = rectRef.current;
    if (!node) return;
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const period = 3500;
      const opacity = 0.03 + 0.05 * Math.sin((frame.time / period) * Math.PI * 2);
      node.opacity(opacity);
    }, node.getLayer());
    anim.start();
    return () => { anim.stop(); };
  }, []);

  return (
    <Rect
      ref={rectRef}
      x={-2}
      y={-2}
      width={width + 4}
      height={height + 4}
      fill={color}
      cornerRadius={6}
      opacity={0.05}
      listening={false}
    />
  );
}

export function BookingCanvasObjectRenderer({
  obj,
  zones,
  bookingStatus,
  isTeammate,
  isSelected,
  isDimmed,
  occupantName,
  occupantAvatar,
  zoneName,
  onClick,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isResource = obj.type === "desk" || obj.type === "room";
  const hasStatus = isResource && bookingStatus;

  const zoneColor = getZoneColor(zones, obj.zoneId);
  const baseStyle = getObjectStyle(obj.type, zoneColor);

  // Determine if resource is unavailable (booked/occupied/maintenance)
  const isUnavailable = isResource && bookingStatus && bookingStatus !== "available";

  // Override colors for resources with booking status — grey out unavailable
  const fill = hasStatus
    ? (isUnavailable ? "#f1f5f9" : STATUS_FILL[bookingStatus])
    : baseStyle.fill;
  const stroke = hasStatus
    ? (isUnavailable ? "#cbd5e1" : STATUS_STROKE[bookingStatus])
    : baseStyle.stroke;
  const strokeWidth = 1.5;
  const shadowBlur = 6;
  const shadowOpacity = 0.15;
  const isWall = obj.type === "wall";
  const showLabel = !isWall && obj.width >= 50 && obj.height >= 40;
  const cursor = isResource ? (isUnavailable ? "not-allowed" : "pointer") : "default";

  const renderShape = () => {
    switch (obj.type) {
      case "wall":
        return (
          <Rect
            width={obj.width}
            height={obj.height}
            fill={baseStyle.fill}
            stroke={baseStyle.stroke}
            strokeWidth={strokeWidth}
            cornerRadius={baseStyle.cornerRadius}
          />
        );

      case "desk":
        return (
          <>
            <Path
              data={DESK_PATH}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            <Path
              data={DESK_MONITOR_PATH}
              fill={stroke}
              opacity={0.4}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
            />
            <Path
              data={DESK_KEYBOARD_PATH}
              stroke={stroke}
              strokeWidth={1.5 / sx(obj)}
              opacity={0.3}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              listening={false}
            />
          </>
        );

      case "chair":
        return (
          <>
            <Circle
              x={obj.width / 2}
              y={obj.height / 2 + 4 * sy(obj)}
              radius={Math.min(obj.width, obj.height) * 0.35}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
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
            <Path
              data={SOFA_PATH}
              fill={baseStyle.fill}
              stroke={baseStyle.stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {obj.width >= 60 && (
              <>
                <Path data={SOFA_CUSHION_1} stroke={baseStyle.stroke} strokeWidth={0.8 / sx(obj)} opacity={0.35} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
                <Path data={SOFA_CUSHION_2} stroke={baseStyle.stroke} strokeWidth={0.8 / sx(obj)} opacity={0.35} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
              </>
            )}
          </>
        );

      case "table":
        return (
          <>
            <Path
              data={TABLE_RECT_PATH}
              fill={baseStyle.fill}
              stroke={baseStyle.stroke}
              strokeWidth={strokeWidth / sx(obj)}
              scaleX={sx(obj)}
              scaleY={sy(obj)}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {obj.width >= 60 && obj.height >= 60 && (
              <>
                <Path data={TABLE_CENTER_CROSS_1} stroke={baseStyle.stroke} strokeWidth={0.8 / sx(obj)} opacity={0.2} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
                <Path data={TABLE_CENTER_CROSS_2} stroke={baseStyle.stroke} strokeWidth={0.8 / sy(obj)} opacity={0.2} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
              </>
            )}
          </>
        );

      case "plant":
        return (
          <>
            {getLeafPetals(6).map((d, i) => (
              <Path key={i} data={d} fill={baseStyle.fill} stroke={baseStyle.stroke} strokeWidth={1 / sx(obj)} opacity={0.7} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
            ))}
            <Circle
              x={obj.width / 2}
              y={obj.height / 2}
              radius={Math.min(obj.width, obj.height) * 0.15}
              fill={baseStyle.stroke}
              stroke={baseStyle.stroke}
              strokeWidth={strokeWidth}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
            />
          </>
        );

      case "kitchen":
        return (
          <>
            <Rect width={obj.width} height={obj.height} fill={baseStyle.fill} stroke={baseStyle.stroke} strokeWidth={strokeWidth} cornerRadius={baseStyle.cornerRadius} shadowColor={baseStyle.shadowColor} shadowBlur={shadowBlur} shadowOpacity={shadowOpacity} shadowOffsetY={2} />
            <Path data={KITCHEN_COUNTER_PATH} stroke={baseStyle.stroke} strokeWidth={1 / sx(obj)} opacity={0.5} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
            <Circle x={KITCHEN_SINK.cx * sx(obj)} y={KITCHEN_SINK.cy * sy(obj)} radius={KITCHEN_SINK.r * Math.min(sx(obj), sy(obj))} stroke={baseStyle.stroke} strokeWidth={1.2} fill="transparent" listening={false} />
            {obj.width >= 60 && obj.height >= 60 && KITCHEN_BURNERS.map((b, i) => (
              <Circle key={i} x={b.cx * sx(obj)} y={b.cy * sy(obj)} radius={b.r * Math.min(sx(obj), sy(obj))} stroke={baseStyle.stroke} strokeWidth={0.8} fill="transparent" opacity={0.5} listening={false} />
            ))}
          </>
        );

      case "bathroom":
        return (
          <>
            <Rect width={obj.width} height={obj.height} fill={baseStyle.fill} stroke={baseStyle.stroke} strokeWidth={strokeWidth} cornerRadius={baseStyle.cornerRadius} shadowColor={baseStyle.shadowColor} shadowBlur={shadowBlur} shadowOpacity={shadowOpacity} shadowOffsetY={2} />
            <Path data={TOILET_PATH} fill="white" stroke={baseStyle.stroke} strokeWidth={1.2 / sx(obj)} scaleX={sx(obj) * 0.5} scaleY={sy(obj) * 0.8} x={obj.width * 0.35} y={obj.height * 0.05} listening={false} />
            <Path data={TOILET_TANK_PATH} fill={baseStyle.stroke} opacity={0.3} scaleX={sx(obj) * 0.5} scaleY={sy(obj) * 0.8} x={obj.width * 0.35} y={obj.height * 0.05} listening={false} />
            <Circle x={BATHROOM_SINK.cx * sx(obj)} y={BATHROOM_SINK.cy * sy(obj)} radius={BATHROOM_SINK.r * Math.min(sx(obj), sy(obj))} stroke={baseStyle.stroke} strokeWidth={1} fill="white" listening={false} />
          </>
        );

      case "elevator":
        return (
          <>
            <Rect width={obj.width} height={obj.height} fill={baseStyle.fill} stroke={baseStyle.stroke} strokeWidth={strokeWidth} cornerRadius={baseStyle.cornerRadius} shadowColor={baseStyle.shadowColor} shadowBlur={shadowBlur} shadowOpacity={shadowOpacity} />
            <Path data={ELEVATOR_CROSS_1} stroke={baseStyle.stroke} strokeWidth={1.5 / sx(obj)} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
            <Path data={ELEVATOR_CROSS_2} stroke={baseStyle.stroke} strokeWidth={1.5 / sx(obj)} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
          </>
        );

      case "stairs":
        return (
          <>
            <Rect width={obj.width} height={obj.height} fill={baseStyle.fill} stroke={baseStyle.stroke} strokeWidth={strokeWidth} cornerRadius={baseStyle.cornerRadius} shadowColor={baseStyle.shadowColor} shadowBlur={shadowBlur} shadowOpacity={shadowOpacity} />
            {getStairTreadLines(6).map((d, i) => (
              <Path key={i} data={d} stroke={baseStyle.stroke} strokeWidth={1 / sx(obj)} opacity={0.5} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
            ))}
            <Path data={STAIRS_ARROW_PATH} fill={baseStyle.stroke} opacity={0.25} scaleX={sx(obj)} scaleY={sy(obj)} listening={false} />
          </>
        );

      case "room":
        return (
          <>
            <Rect
              width={obj.width}
              height={obj.height}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={baseStyle.cornerRadius}
              shadowColor={baseStyle.shadowColor}
              shadowBlur={shadowBlur}
              shadowOpacity={shadowOpacity}
              shadowOffsetY={2}
            />
            {obj.width >= 60 && (
              <>
                <Line points={[8, obj.height - 1, 28, obj.height - 1]} stroke={stroke} strokeWidth={3} lineCap="round" />
                <Line points={[8, obj.height - 1, 8, obj.height - 10]} stroke={stroke} strokeWidth={1.5} dash={[3, 2]} />
              </>
            )}
          </>
        );

      default:
        return (
          <Rect width={obj.width} height={obj.height} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={baseStyle.cornerRadius} />
        );
    }
  };

  const statusLabel = bookingStatus === "available" ? "Available" : bookingStatus === "booked" ? "Booked" : bookingStatus === "occupied" ? "Occupied" : bookingStatus === "maintenance" ? "Maintenance" : "";
  const capacityLabel = obj.type === "room" && obj.capacity ? `${obj.capacity} seats` : "";
  const tooltipText = obj.label ? `${obj.label}${zoneName ? ` · ${zoneName}` : ""}${capacityLabel ? `\n${capacityLabel}` : ""}${statusLabel ? `\n${statusLabel}` : ""}` : "";
  const showTooltip = hovered && isResource && !isSelected && tooltipText;

  // Tooltip dimensions
  const tooltipPadX = 8;
  const tooltipPadY = 5;
  const tooltipFontSize = 10;
  const tooltipLines = tooltipText.split("\n");
  const tooltipW = Math.max(...tooltipLines.map((l) => l.length * 5.5)) + tooltipPadX * 2;
  const tooltipH = tooltipLines.length * (tooltipFontSize + 3) + tooltipPadY * 2;

  return (
    <Group
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
      onClick={isUnavailable ? undefined : onClick}
      onTap={isUnavailable ? undefined : onClick}
      onMouseEnter={() => { if (isResource) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      opacity={isDimmed ? 0.35 : 1}
    >
      {/* Pulse glow for available resources — blue for rooms, green for desks */}
      {isResource && bookingStatus === "available" && !isSelected && !isDimmed && (
        <PulseGlow width={obj.width} height={obj.height} color={obj.type === "room" ? "#3b82f6" : STATUS_STROKE.available} />
      )}

      {/* Hit area for pointer cursor on resources */}
      {isResource && (
        <Rect
          width={obj.width}
          height={obj.height}
          fill="transparent"
          listening={true}
        />
      )}

      {renderShape()}

      {/* Strikethrough for unavailable resources */}
      {isUnavailable && obj.width >= 30 && (
        <Line
          points={[4, obj.height - 4, obj.width - 4, 4]}
          stroke="#94a3b8"
          strokeWidth={1.5}
          lineCap="round"
          opacity={0.5}
          listening={false}
        />
      )}

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

      {/* Teammate indicator dot (fallback when no avatar) */}
      {isTeammate && !occupantAvatar && (
        <Circle
          x={obj.width - 8}
          y={8}
          radius={5}
          fill="#6366f1"
          stroke="white"
          strokeWidth={1.5}
        />
      )}

      {/* Occupant avatar bubble for booked/occupied */}
      {(occupantAvatar || occupantName) && obj.width >= 50 && (
        <AvatarBubble
          url={occupantAvatar || ""}
          x={obj.width / 2}
          y={obj.type === "room" ? obj.height / 2 - 6 : obj.height / 2 - 4}
          size={obj.type === "room" ? Math.min(40, obj.width * 0.3) : Math.min(32, obj.width * 0.45)}
          strokeColor={isTeammate ? "#6366f1" : (stroke as string)}
          fallbackName={occupantName}
        />
      )}

      {/* Status dot */}
      {hasStatus && (
        <Circle
          x={8}
          y={8}
          radius={4}
          fill={STATUS_STROKE[bookingStatus]}
          stroke="white"
          strokeWidth={1}
        />
      )}

      {/* Selected state ring */}
      {isSelected && (
        <>
          <Rect
            x={-4}
            y={-4}
            width={obj.width + 8}
            height={obj.height + 8}
            stroke="#3b82f6"
            strokeWidth={2.5}
            cornerRadius={6}
            fill="transparent"
            dash={[6, 3]}
            listening={false}
          />
          <Circle
            x={obj.width / 2}
            y={-10}
            radius={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
            listening={false}
          />
        </>
      )}

      {/* Hover tooltip */}
      {showTooltip && (
        <Group
          x={(obj.width - tooltipW) / 2}
          y={-tooltipH - 8}
          listening={false}
        >
          <Rect
            width={tooltipW}
            height={tooltipH}
            fill="#1e293b"
            cornerRadius={4}
            shadowColor="#000"
            shadowBlur={6}
            shadowOpacity={0.15}
          />
          {tooltipLines.map((line, i) => (
            <Text
              key={i}
              text={line}
              x={tooltipPadX}
              y={tooltipPadY + i * (tooltipFontSize + 3)}
              fontSize={tooltipFontSize}
              fontStyle={i === 0 ? "600" : "400"}
              fill={i === 0 ? "white" : "#94a3b8"}
            />
          ))}
        </Group>
      )}
    </Group>
  );
}
