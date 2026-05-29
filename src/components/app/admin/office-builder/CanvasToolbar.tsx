import { cn } from "../../../../lib/utils";
import { MousePointer2, Minus, Plus, Eraser, Grid3X3 } from "lucide-react";
import { Slider } from "../../../../components/ui/slider";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Undo2 } from "lucide-react";

export type ToolMode = "select" | "place" | "wall" | "erase";

interface CanvasToolbarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  snapEnabled: boolean;
  onSnapToggle: (v: boolean) => void;
  canUndo: boolean;
  onUndo: () => void;
}

const tools: { mode: ToolMode; icon: typeof MousePointer2; label: string }[] = [
  { mode: "select", icon: MousePointer2, label: "Select" },
  { mode: "place", icon: Plus, label: "Place" },
  { mode: "wall", icon: Minus, label: "Draw wall" },
  { mode: "erase", icon: Eraser, label: "Erase" },
];

export function CanvasToolbar({
  tool,
  onToolChange,
  zoom,
  onZoomChange,
  snapEnabled,
  onSnapToggle,
  canUndo,
  onUndo,
}: CanvasToolbarProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
      {/* Tool buttons */}
      <div className="flex items-center gap-0.5">
        {tools.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onToolChange(mode)}
            title={label}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              tool === mode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Snap toggle */}
      <div className="flex items-center gap-1.5">
        <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-[10px] text-muted-foreground">Snap</Label>
        <Switch checked={snapEnabled} onCheckedChange={onSnapToggle} className="scale-75" />
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Zoom</span>
        <Slider
          min={25}
          max={300}
          step={5}
          value={[Math.round(zoom * 100)]}
          onValueChange={([v]) => onZoomChange(v / 100)}
          className="w-20"
        />
        <span className="w-8 text-right text-[10px] text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Undo */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo2 className="mr-1 h-3 w-3" />
        Undo
      </Button>
    </div>
  );
}
