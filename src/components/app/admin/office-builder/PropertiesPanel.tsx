import type { CanvasObject, Zone } from "../../../../data/types";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Trash2, X } from "lucide-react";
import { ScrollArea } from "../../../../components/ui/scroll-area";

interface PropertiesPanelProps {
  object: CanvasObject;
  zones: Zone[];
  onUpdate: (id: string, data: Partial<CanvasObject>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function PropertiesPanel({
  object: obj,
  zones,
  onUpdate,
  onDelete,
  onClose,
}: PropertiesPanelProps) {
  return (
    <ScrollArea className="h-full w-56 border-l border-border bg-card">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Properties
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground capitalize">
          {obj.type}
        </div>

        {/* Label */}
        {obj.type !== "wall" && (
          <div className="space-y-1">
            <Label className="text-[11px]">Label</Label>
            <Input
              value={obj.label ?? ""}
              onChange={(e) => onUpdate(obj.id, { label: e.target.value })}
              className="h-7 text-xs"
              placeholder="Enter label"
            />
          </div>
        )}

        {/* Zone (desks) */}
        {obj.type === "desk" && zones.length > 0 && (
          <div className="space-y-1">
            <Label className="text-[11px]">Zone</Label>
            <Select
              value={obj.zoneId ?? ""}
              onValueChange={(v) => onUpdate(obj.id, { zoneId: v })}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: z.color }}
                      />
                      {z.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Capacity (rooms) */}
        {obj.type === "room" && (
          <div className="space-y-1">
            <Label className="text-[11px]">Capacity</Label>
            <Input
              type="number"
              min={1}
              value={obj.capacity ?? 4}
              onChange={(e) => onUpdate(obj.id, { capacity: parseInt(e.target.value, 10) || 4 })}
              className="h-7 text-xs"
            />
          </div>
        )}

        {/* Position (read-only display) */}
        <div className="space-y-1">
          <Label className="text-[11px]">Position</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">X</span>
              <Input
                type="number"
                value={obj.x}
                onChange={(e) => onUpdate(obj.id, { x: parseInt(e.target.value, 10) || 0 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">Y</span>
              <Input
                type="number"
                value={obj.y}
                onChange={(e) => onUpdate(obj.id, { y: parseInt(e.target.value, 10) || 0 })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px]">Size</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">W</span>
              <Input
                type="number"
                min={20}
                value={obj.width}
                onChange={(e) => onUpdate(obj.id, { width: parseInt(e.target.value, 10) || 40 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">H</span>
              <Input
                type="number"
                min={20}
                value={obj.height}
                onChange={(e) => onUpdate(obj.id, { height: parseInt(e.target.value, 10) || 40 })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1">
          <Label className="text-[11px]">Rotation</Label>
          <Input
            type="number"
            step={15}
            value={obj.rotation}
            onChange={(e) => onUpdate(obj.id, { rotation: parseInt(e.target.value, 10) || 0 })}
            className="h-7 text-xs"
          />
        </div>

        <div className="pt-2">
          <Button
            variant="destructive"
            size="sm"
            className="w-full text-xs"
            onClick={() => onDelete(obj.id)}
          >
            <Trash2 className="mr-1.5 h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
