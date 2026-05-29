import { useMemo } from "react";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMockData } from "../../../contexts/MockDataContext";
import { getTeamById, getFloorById, getZoneById } from "../../../data/helpers";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import type { User } from "../../../data/types";

interface TeammateCardProps {
  user: User;
  onBookNear: (floorId: string) => void;
}

export function TeammateCard({ user, onBookNear }: TeammateCardProps) {
  const { bookings, desks, teams, floors, zones } = useMockData();

  const team = getTeamById(teams, user.teamId);
  const today = format(new Date(), "yyyy-MM-dd");

  const todayBooking = useMemo(
    () =>
      bookings.find(
        (b) =>
          b.userId === user.id &&
          b.date === today &&
          b.resourceType === "desk" &&
          b.status !== "cancelled" &&
          b.status !== "auto-released" &&
          b.status !== "completed"
      ),
    [bookings, user.id, today]
  );

  const isCheckedIn = todayBooking?.status === "checked-in";
  const isInOffice = !!todayBooking;

  const desk = todayBooking
    ? desks.find((d) => d.id === todayBooking.resourceId)
    : undefined;
  const floor = desk ? getFloorById(floors, desk.floorId) : undefined;
  const zone = desk ? getZoneById(zones, desk.zoneId) : undefined;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="hover:bg-accent/30 transition-colors" data-testid={`teammate-card-${user.id}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Link to="/app/floor-map" className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {user.name}
            </span>
            {team && (
              <Badge
                variant="outline"
                className="text-[10px] shrink-0"
                style={{
                  borderColor: team.color,
                  color: team.color,
                  backgroundColor: `${team.color}10`,
                }}
              >
                {team.name}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="relative">
              <div
                className={`h-2 w-2 rounded-full ${
                  isCheckedIn
                    ? "bg-chart-2"
                    : isInOffice
                      ? "bg-chart-2"
                      : "bg-muted-foreground/40"
                }`}
              />
              {isCheckedIn && (
                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-chart-2/40" />
              )}
            </div>
            {isInOffice ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {desk?.label}, {floor?.name}
                {zone ? ` · ${zone.name}` : ""}
              </span>
            ) : (
              <span>Not in office today</span>
            )}
          </div>
          {isInOffice && desk && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1.5 h-7 px-2 text-xs text-primary"
              onClick={() => onBookNear(desk.floorId)}
            >
              Book nearby
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
