import { Filter } from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { getZonesForFloor } from "../../../data/helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useIsMobile } from "../../../hooks/use-mobile";
import type { CalendarFiltersState } from "./CalendarPage";

interface CalendarFiltersProps {
  filters: CalendarFiltersState;
  onFiltersChange: (filters: CalendarFiltersState) => void;
}

function FilterSelects({
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  const { floors, zones } = useMockData();
  const floorZones = filters.floorId
    ? getZonesForFloor(zones, filters.floorId)
    : [];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={filters.floorId ?? "all"}
        onValueChange={(val) =>
          onFiltersChange({
            ...filters,
            floorId: val === "all" ? null : val,
            zoneId: null,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All floors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All floors</SelectItem>
          {floors.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.zoneId ?? "all"}
        onValueChange={(val) =>
          onFiltersChange({
            ...filters,
            zoneId: val === "all" ? null : val,
          })
        }
        disabled={!filters.floorId}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All zones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All zones</SelectItem>
          {floorZones.map((z) => (
            <SelectItem key={z.id} value={z.id}>
              {z.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.resourceType}
        onValueChange={(val) =>
          onFiltersChange({
            ...filters,
            resourceType: val as CalendarFiltersState["resourceType"],
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="desk">Desks</SelectItem>
          <SelectItem value="room">Rooms</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function CalendarFilters(props: CalendarFiltersProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <FilterSelects {...props} />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <FilterSelects {...props} />
      </PopoverContent>
    </Popover>
  );
}
