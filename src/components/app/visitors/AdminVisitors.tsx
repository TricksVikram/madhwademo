import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUpDown, UserX } from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import type { Booking } from "../../../data/types";

export function AdminVisitors() {
  const { bookings, users, desks, rooms } = useMockData();
  const [sortAsc, setSortAsc] = useState(false);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const guestBookings = useMemo(() => {
    const gb = bookings.filter((b) => b.guestInfo);
    return gb.sort((a, b) =>
      sortAsc
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date)
    );
  }, [bookings, sortAsc]);

  const todayGuests = useMemo(
    () => guestBookings.filter((b) => b.date === todayStr),
    [guestBookings, todayStr]
  );

  const otherGuests = useMemo(
    () => guestBookings.filter((b) => b.date !== todayStr),
    [guestBookings, todayStr]
  );

  const getResourceLabel = (b: Booking) =>
    b.resourceType === "desk"
      ? desks.find((d) => d.id === b.resourceId)?.label
      : rooms.find((r) => r.id === b.resourceId)?.name;

  const getHostName = (userId: string) =>
    users.find((u) => u.id === userId)?.name ?? "Unknown";

  const renderRow = (b: Booking, highlight = false) => (
    <TableRow key={b.id} className={highlight ? "bg-primary/5" : ""}>
      <TableCell className="font-medium">{b.guestInfo!.name}</TableCell>
      <TableCell>{b.guestInfo!.company || "—"}</TableCell>
      <TableCell>{getHostName(b.userId)}</TableCell>
      <TableCell>{getResourceLabel(b) ?? b.resourceId}</TableCell>
      <TableCell>
        {format(new Date(b.date + "T12:00:00"), "MMM d, yyyy")}
        {b.date === todayStr && (
          <Badge variant="outline" className="ml-2 text-[10px] bg-chart-2/10 text-chart-2 border-chart-2/20">
            Today
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="text-[10px] capitalize"
        >
          {b.status}
        </Badge>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Visitors</h2>

      {guestBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <UserX className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No visitor bookings</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 -ml-3 text-xs"
                    onClick={() => setSortAsc((p) => !p)}
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayGuests.map((b) => renderRow(b, true))}
              {otherGuests.map((b) => renderRow(b))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
