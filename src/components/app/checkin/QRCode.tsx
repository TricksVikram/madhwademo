import { useMemo } from "react";

interface QRCodeProps {
  resourceId: string;
  label?: string;
  size?: number;
}

/**
 * Generates a deterministic QR-like SVG pattern based on resourceId.
 * Not a real QR code — purely decorative for demo purposes.
 */
export function QRCode({ resourceId, label, size = 120 }: QRCodeProps) {
  const cells = useMemo(() => generatePattern(resourceId), [resourceId]);
  const gridSize = 21; // Standard QR grid
  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-sm"
        role="img"
        aria-label={`QR code for ${label ?? resourceId}`}
      >
        <rect width={size} height={size} fill="white" />
        {cells.map((row, y) =>
          row.map(
            (filled, x) =>
              filled && (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="black"
                  rx={cellSize * 0.1}
                />
              )
          )
        )}
        {/* Finder patterns (top-left, top-right, bottom-left) */}
        <FinderPattern x={0} y={0} cellSize={cellSize} />
        <FinderPattern x={(gridSize - 7) * cellSize} y={0} cellSize={cellSize} />
        <FinderPattern x={0} y={(gridSize - 7) * cellSize} cellSize={cellSize} />
      </svg>
      {label && (
        <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-full truncate">
          {label}
        </span>
      )}
    </div>
  );
}

function FinderPattern({ x, y, cellSize }: { x: number; y: number; cellSize: number }) {
  const s = cellSize;
  return (
    <g>
      <rect x={x} y={y} width={s * 7} height={s * 7} fill="black" rx={s * 0.2} />
      <rect x={x + s} y={y + s} width={s * 5} height={s * 5} fill="white" rx={s * 0.15} />
      <rect x={x + s * 2} y={y + s * 2} width={s * 3} height={s * 3} fill="black" rx={s * 0.15} />
    </g>
  );
}

function generatePattern(seed: string): boolean[][] {
  const gridSize = 21;
  const grid: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Simple hash from string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  }

  // Fill data area (avoid finder pattern regions)
  const isFinderRegion = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= 13 && y < 8) || (x < 8 && y >= 13);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (isFinderRegion(x, y)) continue;
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      grid[y][x] = hash % 3 !== 0; // ~67% fill for QR-like density
    }
  }

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  return grid;
}
