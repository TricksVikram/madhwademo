import { useState } from "react";
import type { Desk, Zone, Team, User } from "../../../../data/types";
import { cn } from "../../../../lib/utils";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { MapPin, Crosshair, Paintbrush } from "lucide-react";

interface NeighborhoodsSidebarProps {
  floorZones: Zone[];
  floorDesks: Desk[];
  unplacedDesks: Desk[];
  teams: Team[];
  users: User[];
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  placingDeskId: string | null;
  onPlaceDesk: (id: string | null) => void;
  assigningZoneId: string | null;
  onAssignZone: (id: string | null) => void;
}

export function NeighborhoodsSidebar({
  floorZones,
  floorDesks,
  unplacedDesks,
  teams,
  users,
  selectedZoneId,
  onSelectZone,
  placingDeskId,
  onPlaceDesk,
  assigningZoneId,
  onAssignZone,
}: NeighborhoodsSidebarProps) {
  return (
    <div className="w-72 shrink-0 border-r border-border bg-card">
      <Tabs defaultValue="neighborhoods" className="flex h-full flex-col">
        <TabsList className="mx-3 mt-3 grid w-auto grid-cols-2">
          <TabsTrigger value="neighborhoods">Neighborhoods</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="neighborhoods" className="flex-1 overflow-hidden mt-0 p-0">
          <ScrollArea className="h-full px-3 py-2">
            <div className="space-y-1">
              {floorZones.map((zone) => {
                const deskCount = floorDesks.filter(
                  (d) => d.zoneId === zone.id
                ).length;
                const team = teams.find((t) => t.id === zone.teamId);
                const isSelected = selectedZoneId === zone.id;
                const isAssigning = assigningZoneId === zone.id;

                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      if (isAssigning) {
                        onAssignZone(null);
                      } else {
                        onSelectZone(isSelected ? null : zone.id);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      "hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {zone.name}
                      </div>
                      {team && (
                        <div className="text-xs text-muted-foreground">
                          {team.name}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {deskCount}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Assign zone mode */}
            <div className="mt-4 space-y-1">
              <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assign to zone
              </p>
              {floorZones.map((zone) => {
                const isAssigning = assigningZoneId === zone.id;
                return (
                  <Button
                    key={zone.id}
                    variant={isAssigning ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignZone(isAssigning ? null : zone.id);
                    }}
                  >
                    <Paintbrush className="h-3 w-3" />
                    {isAssigning ? `Click desks for ${zone.name}` : zone.name}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="assignments" className="flex-1 overflow-hidden mt-0 p-0">
          <ScrollArea className="h-full px-3 py-2">
            {/* Unplaced desks pool */}
            {unplacedDesks.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Unplaced ({unplacedDesks.length})
                </p>
                <div className="space-y-1">
                  {unplacedDesks.map((desk) => (
                    <button
                      key={desk.id}
                      onClick={() =>
                        onPlaceDesk(placingDeskId === desk.id ? null : desk.id)
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        "hover:bg-accent",
                        placingDeskId === desk.id &&
                          "bg-primary/10 text-primary ring-1 ring-primary/30"
                      )}
                    >
                      <Crosshair className="h-3 w-3 shrink-0" />
                      <span className="font-mono text-xs">{desk.label}</span>
                      {placingDeskId === desk.id && (
                        <span className="ml-auto text-[10px] text-primary">
                          Click grid
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Placed desks with assignments */}
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Placed desks
            </p>
            <div className="space-y-1">
              {floorDesks
                .filter((d) => d.gridPosition)
                .map((desk) => {
                  const assignedUser = desk.assignedUserId
                    ? users.find((u) => u.id === desk.assignedUserId)
                    : null;
                  const zone = floorZones.find((z) => z.id === desk.zoneId);

                  return (
                    <div
                      key={desk.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                    >
                      <MapPin
                        className="h-3 w-3 shrink-0"
                        style={{ color: zone?.color }}
                      />
                      <span className="font-mono text-xs">{desk.label}</span>
                      <div className="ml-auto flex items-center gap-1">
                        {assignedUser ? (
                          <>
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={assignedUser.avatar} />
                              <AvatarFallback className="text-[8px]">
                                {assignedUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                              {assignedUser.name.split(" ")[0]}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Open
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
