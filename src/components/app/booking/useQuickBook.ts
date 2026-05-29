import { useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getAvailableDesks, getFloorById } from "../../../data/helpers";

export function useQuickBook() {
  const { currentUser } = useDemoRole();
  const { desks, bookings, floors, createBooking } = useMockData();

  const quickBook = useCallback(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    // Find next available hour slot
    let startHour = Math.max(8, now.getHours() + 1);
    if (now.getMinutes() > 0) startHour = Math.max(8, now.getHours() + 1);
    if (startHour >= 20) {
      toast.error("No desks available right now");
      return;
    }

    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;

    const available = getAvailableDesks(desks, bookings, todayStr, startTime, endTime);
    if (available.length === 0) {
      toast.error("No desks available right now");
      return;
    }

    const desk = available[0];
    const floor = getFloorById(floors, desk.floorId);

    createBooking({
      resourceType: "desk",
      resourceId: desk.id,
      userId: currentUser.id,
      date: todayStr,
      startTime,
      endTime,
    });

    toast.success(
      `${desk.label} booked on ${floor?.name ?? ""} for ${startTime}–${endTime}`
    );
  }, [currentUser.id, desks, bookings, floors, createBooking]);

  return quickBook;
}
