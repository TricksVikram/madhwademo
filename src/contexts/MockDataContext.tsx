import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AdminDataProvider } from "./AdminDataContext";
import type {
  Floor,
  Zone,
  Desk,
  Room,
  ParkingSpot,
  Locker,
  User,
  Team,
  Booking,
  Notification,
  BookingStatus,
  WaitlistEntry,
  CanvasObject,
} from "../data/types";
import {
  floors as initialFloors,
  zones as initialZones,
  desks as initialDesks,
  rooms as initialRooms,
  parkingSpots as initialParkingSpots,
  lockers as initialLockers,
  users as initialUsers,
  teams as initialTeams,
  initialBookings,
  initialNotifications,
  initialWaitlist,
  initialCanvasObjects,
} from "../data/mock-data";

interface CreateBookingInput {
  resourceType: Booking["resourceType"];
  resourceId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  isRecurring?: boolean;
  recurringGroupId?: string;
  buddyGroupId?: string;
  guestInfo?: { name: string; email: string; company?: string };
}

interface MockDataContextValue {
  floors: Floor[];
  zones: Zone[];
  desks: Desk[];
  rooms: Room[];
  parkingSpots: ParkingSpot[];
  lockers: Locker[];
  users: User[];
  teams: Team[];
  bookings: Booking[];
  notifications: Notification[];
  waitlist: WaitlistEntry[];
  canvasObjects: CanvasObject[];
  createBooking: (input: CreateBookingInput) => Booking;
  cancelBooking: (bookingId: string) => void;
  cancelRecurringSeries: (recurringGroupId: string, fromDate: string) => void;
  checkInBooking: (bookingId: string) => void;
  autoReleaseBooking: (bookingId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void;
  joinWaitlist: (resourceId: string, resourceType: Booking["resourceType"], date: string, startTime: string, endTime: string, userId: string) => void;
  leaveWaitlist: (entryId: string) => void;
  getWaitlistPosition: (resourceId: string, userId: string, date: string) => number | null;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [floors, setFloors] = useState<Floor[]>(initialFloors);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [desks, setDesks] = useState<Desk[]>(initialDesks);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [parkingSpots] = useState<ParkingSpot[]>(initialParkingSpots);
  const [lockers] = useState<Locker[]>(initialLockers);
  const [users] = useState<User[]>(initialUsers);
  const [teams] = useState<Team[]>(initialTeams);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist);
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>(initialCanvasObjects);

  // Refs for stale closure avoidance
  const bookingsRef = useRef(bookings);

  const updateBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    },
    []
  );

  const createBooking = useCallback((input: CreateBookingInput): Booking => {
    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      userId: input.userId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "upcoming",
      isRecurring: input.isRecurring ?? false,
      recurringGroupId: input.recurringGroupId,
      buddyGroupId: input.buddyGroupId,
      guestInfo: input.guestInfo,
      notes: input.notes ?? "",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);
    toast.success("Booking confirmed");
    addNotificationRef.current({
      type: "booking_confirmed",
      title: "Booking confirmed",
      message: `Your ${input.resourceType} is booked for ${input.date}.`,
      read: false,
      bookingId: newBooking.id,
    });
    return newBooking;
  }, []);

  const addNotificationRef = useRef<(n: Omit<Notification, "id" | "createdAt">) => void>(() => {});
  const autoBumpRef = useRef<(b: Booking) => void>(() => {});

  const cancelBooking = useCallback(
    (bookingId: string) => {
      const booking = bookingsRef.current.find((b) => b.id === bookingId);
      updateBookingStatus(bookingId, "cancelled");
      toast("Booking cancelled", { description: "Your booking has been cancelled." });
      addNotificationRef.current({
        type: "general",
        title: "Booking cancelled",
        message: "Your booking has been cancelled.",
        read: false,
        bookingId,
      });
      if (booking) setTimeout(() => autoBumpRef.current(booking), 0);
    },
    [updateBookingStatus]
  );

  const cancelRecurringSeries = useCallback(
    (recurringGroupId: string, fromDate: string) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.recurringGroupId === recurringGroupId &&
          b.date >= fromDate &&
          b.status !== "completed" &&
          b.status !== "cancelled"
            ? { ...b, status: "cancelled" as const }
            : b
        )
      );
    },
    []
  );

  const checkInBooking = useCallback(
    (bookingId: string) => {
      updateBookingStatus(bookingId, "checked-in");
      toast.success("Checked in successfully");
      addNotificationRef.current({
        type: "checkin_reminder",
        title: "Checked in",
        message: "You have successfully checked in.",
        read: false,
        bookingId,
      });
    },
    [updateBookingStatus]
  );

  const autoReleaseBooking = useCallback(
    (bookingId: string) => {
      const booking = bookingsRef.current.find((b) => b.id === bookingId);
      updateBookingStatus(bookingId, "auto-released");
      toast.warning("Booking auto-released", { description: "You didn't check in on time." });
      addNotificationRef.current({
        type: "auto_release",
        title: "Booking auto-released",
        message: "Your booking was released because you didn't check in.",
        read: false,
        bookingId,
      });
      if (booking) setTimeout(() => autoBumpRef.current(booking), 0);
    },
    [updateBookingStatus]
  );

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "createdAt">) => {
      const newNotif: Notification = {
        ...n,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  addNotificationRef.current = addNotification;

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── Waitlist functions ──────────────────────
  const waitlistRef = useRef(waitlist);
  waitlistRef.current = waitlist;

  const joinWaitlist = useCallback(
    (resourceId: string, resourceType: Booking["resourceType"], date: string, startTime: string, endTime: string, userId: string) => {
      setWaitlist((prev) => {
        const existing = prev.filter(
          (w) => w.resourceId === resourceId && w.date === date && w.startTime < endTime && w.endTime > startTime
        );
        const position = existing.length + 1;
        return [
          ...prev,
          {
            id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            resourceId,
            resourceType,
            userId,
            date,
            startTime,
            endTime,
            position,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    []
  );

  const leaveWaitlist = useCallback((entryId: string) => {
    setWaitlist((prev) => {
      const entry = prev.find((w) => w.id === entryId);
      if (!entry) return prev;
      const remaining = prev.filter((w) => w.id !== entryId);
      // Re-order positions for same resource/date
      return remaining.map((w) => {
        if (
          w.resourceId === entry.resourceId &&
          w.date === entry.date &&
          w.position > entry.position
        ) {
          return { ...w, position: w.position - 1 };
        }
        return w;
      });
    });
  }, []);

  const getWaitlistPosition = useCallback(
    (resourceId: string, userId: string, date: string): number | null => {
      const entry = waitlistRef.current.find(
        (w) => w.resourceId === resourceId && w.userId === userId && w.date === date
      );
      return entry?.position ?? null;
    },
    []
  );

  // ── Auto-bump helper ───────────────────────
  const autoBumpWaitlist = useCallback(
    (booking: Booking) => {
      const match = waitlistRef.current.find(
        (w) =>
          w.resourceId === booking.resourceId &&
          w.date === booking.date &&
          w.startTime < booking.endTime &&
          w.endTime > booking.startTime &&
          w.position === 1
      );
      if (!match) return;

      // Create booking for waitlisted user
      const newBooking: Booking = {
        id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        resourceType: match.resourceType,
        resourceId: match.resourceId,
        userId: match.userId,
        date: match.date,
        startTime: match.startTime,
        endTime: match.endTime,
        status: "upcoming",
        isRecurring: false,
        notes: "",
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [...prev, newBooking]);

      // Remove from waitlist and reorder
      setWaitlist((prev) => {
        const remaining = prev.filter((w) => w.id !== match.id);
        return remaining.map((w) => {
          if (
            w.resourceId === match.resourceId &&
            w.date === match.date &&
            w.position > 1
          ) {
            return { ...w, position: w.position - 1 };
          }
          return w;
        });
      });

      // Notify
      addNotification({
        type: "waitlist_bump",
        title: "Waitlist bump",
        message: `Great news! ${booking.resourceId} is now yours — you were bumped from the waitlist.`,
        read: false,
        bookingId: newBooking.id,
      });
    },
    [addNotification]
  );

  autoBumpRef.current = autoBumpWaitlist;

  // ── Live status simulation (every 30s) ──────
  const SIMULATION_INTERVAL_MS = 30_000;

  useEffect(() => {
    const simInterval = setInterval(() => {
      const now = new Date();
      const todayStr = format(now, "yyyy-MM-dd");
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.date !== todayStr || booking.status !== "upcoming") return booking;

          const [h, m] = booking.startTime.split(":").map(Number);
          const bookingStartMinutes = h * 60 + m;

          if (currentMinutes >= bookingStartMinutes) {
            // 60% chance auto-check-in, 40% stay as upcoming for auto-release demo
            if (Math.random() < 0.6) {
              return { ...booking, status: "checked-in" as const };
            }
          }
          return booking;
        })
      );
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(simInterval);
  }, []);

  // ── Auto-release simulation ─────────────────
  const GRACE_PERIOD_MINUTES = 15;
  const AUTO_RELEASE_INTERVAL_MS = 60_000;

  bookingsRef.current = bookings;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = format(now, "yyyy-MM-dd");
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      bookingsRef.current.forEach((booking) => {
        if (booking.date !== todayStr || booking.status !== "upcoming") return;

        const [h, m] = booking.startTime.split(":").map(Number);
        const bookingStartMinutes = h * 60 + m;

        if (currentMinutes >= bookingStartMinutes + GRACE_PERIOD_MINUTES) {
          autoReleaseBooking(booking.id);
          addNotification({
            type: "auto_release",
            title: "Booking auto-released",
            message: `Your booking for ${booking.resourceId} was released — no check-in detected.`,
            read: false,
            bookingId: booking.id,
          });
        }
      });
    }, AUTO_RELEASE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [autoReleaseBooking, addNotification]);

  return (
    <MockDataContext.Provider
      value={{
        floors,
        zones,
        desks,
        rooms,
        parkingSpots,
        lockers,
        users,
        teams,
        bookings,
        notifications,
        waitlist,
        canvasObjects,
        createBooking,
        cancelBooking,
        cancelRecurringSeries,
        checkInBooking,
        autoReleaseBooking,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        joinWaitlist,
        leaveWaitlist,
        getWaitlistPosition,
      }}
    >
      <AdminDataProvider
        setFloors={setFloors}
        setZones={setZones}
        setDesks={setDesks}
        setRooms={setRooms}
        setCanvasObjects={setCanvasObjects}
      >
        {children}
      </AdminDataProvider>
    </MockDataContext.Provider>
  );
}

export function useMockData(): MockDataContextValue {
  const ctx = useContext(MockDataContext);
  if (!ctx) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return ctx;
}
