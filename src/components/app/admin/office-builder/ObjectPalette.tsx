import type { CanvasObjectType, Zone } from "../../../../data/types";
import { cn } from "../../../../lib/utils";
import {
  Monitor, DoorOpen, UtensilsCrossed, Bath, ArrowUpDown, Footprints,
  Armchair, TreePine, Table, Minus,
} from "lucide-react";
import { ScrollArea } from "../../../../components/ui/scroll-area";

interface ObjectPaletteProps {
  activeType: CanvasObjectType | null;
  onSelect: (type: CanvasObjectType) => void;
  zones: Zone[];
  activeZoneId: string;
  onActiveZoneChange: (id: string) => void;
}

interface PaletteItem {
  type: CanvasObjectType;
  label: string;
  icon: typeof Monitor;
  category: "bookable" | "amenity" | "furniture" | "structure";
}

const items: PaletteItem[] = [
  { type: "desk", label: "Desk", icon: Monitor, category: "bookable" },
  { type: "room", label: "Room", icon: DoorOpen, category: "bookable" },
  { type: "wall", label: "Wall", icon: Minus, category: "structure" },
  { type: "kitchen", label: "Kitchen", icon: UtensilsCrossed, category: "amenity" },
  { type: "bathroom", label: "Restroom", icon: Bath, category: "amenity" },
  { type: "elevator", label: "Elevator", icon: ArrowUpDown, category: "amenity" },
  { type: "stairs", label: "Stairs", icon: Footprints, category: "amenity" },
  { type: "table", label: "Table", icon: Table, category: "furniture" },
  { type: "sofa", label: "Sofa", icon: Armchair, category: "furniture" },
  { type: "plant", label: "Plant", icon: TreePine, category: "furniture" },
];

const categories = [
  { key: "bookable" as const, label: "Bookable" },
  { key: "structure" as const, label: "Structure" },
  { key: "amenity" as const, label: "Amenities" },
  { key: "furniture" as const, label: "Furniture" },
];

export function ObjectPalette({
  activeType,
  onSelect,
  zones,
  activeZoneId,
  onActiveZoneChange,
}: ObjectPaletteProps) {
  return (
    <ScrollArea className="h-full w-56 border-r border-border bg-card">
      <div className="p-3 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Objects
        </h3>

        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {cat.label}
            </span>
            <div className="grid grid-cols-2 gap-1">
              {items
                .filter((i) => i.category === cat.key)
                .map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => onSelect(type)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border border-transparent px-2 py-2 text-[10px] font-medium transition-colors",
                      activeType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
            </div>
          </div>
        ))}

        {/* Zone picker for desks */}
        {activeType === "desk" && zones.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Assign to zone
            </span>
            <div className="space-y-0.5">
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => onActiveZoneChange(z.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    activeZoneId === z.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: z.color }}
                  />
                  {z.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
