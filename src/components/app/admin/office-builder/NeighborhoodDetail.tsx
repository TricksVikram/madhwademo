import type { Desk, Zone, Team, User } from "../../../../data/types";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface NeighborhoodDetailProps {
  zone: Zone;
  desks: Desk[];
  totalDesks: number;
  teams: Team[];
  users: User[];
  onClose: () => void;
}

export function NeighborhoodDetail({
  zone,
  desks,
  totalDesks,
  teams,
  users,
  onClose,
}: NeighborhoodDetailProps) {
  const team = teams.find((t) => t.id === zone.teamId);
  const assignedDesks = desks.filter((d) => d.assignedUserId);
  const openDesks = desks.filter((d) => !d.assignedUserId);
  const teamMembers = team
    ? users.filter((u) => u.teamId === team.id)
    : [];

  const chartData = [
    { name: zone.name, value: desks.length, color: zone.color },
    {
      name: "Other",
      value: totalDesks - desks.length,
      color: "hsl(var(--muted))",
    },
  ];

  return (
    <div className="w-72 shrink-0 border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: zone.color }}
          />
          <h3 className="text-sm font-semibold text-foreground">{zone.name}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-3.5rem)]">
        <div className="space-y-6 p-4">
          {/* Donut chart */}
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">
                  {desks.length}
                </span>
                <span className="text-[10px] text-muted-foreground">desks</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {desks.length} of {totalDesks} desks on this floor
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {assignedDesks.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Assigned</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {openDesks.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Open</div>
            </div>
          </div>

          {/* Team info */}
          {team && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {team.name} team
              </p>
              <div className="space-y-2">
                {teamMembers.map((user) => {
                  const assignedDesk = desks.find(
                    (d) => d.assignedUserId === user.id
                  );
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {user.name}
                        </div>
                      </div>
                      {assignedDesk && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {assignedDesk.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desk list */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Desks in this neighborhood
            </p>
            <div className="space-y-1">
              {desks.map((desk) => {
                const assignedUser = desk.assignedUserId
                  ? users.find((u) => u.id === desk.assignedUserId)
                  : null;
                return (
                  <div
                    key={desk.id}
                    className="flex items-center justify-between rounded-md border border-border/50 px-2 py-1.5 text-xs"
                  >
                    <span className="font-mono">{desk.label}</span>
                    <span className="text-muted-foreground">
                      {assignedUser ? assignedUser.name.split(" ")[0] : "Open"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
