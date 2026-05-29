import { useState, useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { Users } from "lucide-react";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { TeammateCard } from "./TeammateCard";
import { WeeklyAttendance } from "./WeeklyAttendance";
import { BookingDialog } from "../booking/BookingDialog";
import { useBookingDialog } from "../booking/useBookingDialog";
import { EmptyState } from "../EmptyState";

export function TeamPage() {
  const { currentUser } = useDemoRole();
  const { teams, users } = useMockData();
  const [selectedTeamId, setSelectedTeamId] = useState("all");
  const bookingDialog = useBookingDialog();

  const filteredUsers = useMemo(
    () =>
      selectedTeamId === "all"
        ? users
        : users.filter((u) => u.teamId === selectedTeamId),
    [users, selectedTeamId]
  );

  const handleBookNear = (floorId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    bookingDialog.open({ date: today, resourceType: "desk" });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="page-team">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} member{filteredUsers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No team members"
              description="No team members match the selected filter."
            />
          </div>
        ) : (
          filteredUsers.map((user) => (
            <TeammateCard
              key={user.id}
              user={user}
              onBookNear={handleBookNear}
            />
          ))
        )}
      </div>

      <WeeklyAttendance
        users={filteredUsers}
        selectedTeamId={selectedTeamId}
      />

      <BookingDialog
        isOpen={bookingDialog.isOpen}
        onClose={bookingDialog.close}
        prefill={bookingDialog.prefill}
      />
    </div>
  );
}
