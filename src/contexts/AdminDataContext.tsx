import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Floor, Zone, Desk, Room, CanvasObject } from "../data/types";

export interface BookingRules {
  maxDurationHours: number;
  advanceBookingDays: number;
  gracePeriodMinutes: number;
  autoReleaseEnabled: boolean;
  blackoutDates: string[];
}

const defaultRules: BookingRules = {
  maxDurationHours: 8,
  advanceBookingDays: 14,
  gracePeriodMinutes: 15,
  autoReleaseEnabled: true,
  blackoutDates: [],
};

interface AdminDataContextValue {
  bookingRules: BookingRules;
  setBookingRules: (rules: BookingRules) => void;
  addFloor: (name: string, level: number) => void;
  updateFloor: (id: string, data: Partial<Floor>) => void;
  deleteFloor: (id: string) => void;
  addZone: (name: string, floorId: string, color: string) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  addDesk: (label: string, floorId: string, zoneId: string, amenities: string[], gridPosition?: { x: number; y: number }) => void;
  updateDesk: (id: string, data: Partial<Desk>) => void;
  deleteDesk: (id: string) => void;
  toggleDeskMaintenance: (id: string) => void;
  addRoom: (name: string, floorId: string, capacity: number, amenities: string[], gridPosition?: { x: number; y: number }, gridSize?: { w: number; h: number }) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  // Canvas object CRUD
  addCanvasObject: (obj: Omit<CanvasObject, "id">) => string;
  updateCanvasObject: (id: string, data: Partial<CanvasObject>) => void;
  deleteCanvasObject: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

interface AdminDataProviderProps {
  children: ReactNode;
  setFloors: Dispatch<SetStateAction<Floor[]>>;
  setZones: Dispatch<SetStateAction<Zone[]>>;
  setDesks: Dispatch<SetStateAction<Desk[]>>;
  setRooms: Dispatch<SetStateAction<Room[]>>;
  setCanvasObjects: Dispatch<SetStateAction<CanvasObject[]>>;
}

export function AdminDataProvider({
  children,
  setFloors,
  setZones,
  setDesks,
  setRooms,
  setCanvasObjects,
}: AdminDataProviderProps) {
  const [bookingRules, setBookingRules] = useState<BookingRules>(defaultRules);

  const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const addFloor = useCallback((name: string, level: number) => {
    setFloors((p) => [...p, { id: uid(), name, level }]);
  }, [setFloors]);
  const updateFloor = useCallback((id: string, data: Partial<Floor>) => {
    setFloors((p) => p.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, [setFloors]);
  const deleteFloor = useCallback((id: string) => {
    setFloors((p) => p.filter((f) => f.id !== id));
  }, [setFloors]);

  const addZone = useCallback((name: string, floorId: string, color: string) => {
    setZones((p) => [...p, { id: uid(), name, floorId, color }]);
  }, [setZones]);
  const updateZone = useCallback((id: string, data: Partial<Zone>) => {
    setZones((p) => p.map((z) => (z.id === id ? { ...z, ...data } : z)));
  }, [setZones]);
  const deleteZone = useCallback((id: string) => {
    setZones((p) => p.filter((z) => z.id !== id));
  }, [setZones]);

  const addDesk = useCallback((label: string, floorId: string, zoneId: string, amenities: string[], gridPosition?: { x: number; y: number }) => {
    setDesks((p) => [...p, { id: uid(), label, floorId, zoneId, amenities, status: "available" as const, gridPosition }]);
  }, [setDesks]);
  const updateDesk = useCallback((id: string, data: Partial<Desk>) => {
    setDesks((p) => p.map((d) => (d.id === id ? { ...d, ...data } : d)));
  }, [setDesks]);
  const deleteDesk = useCallback((id: string) => {
    setDesks((p) => p.filter((d) => d.id !== id));
  }, [setDesks]);
  const toggleDeskMaintenance = useCallback((id: string) => {
    setDesks((p) => p.map((d) =>
      d.id === id ? { ...d, status: d.status === "maintenance" ? "available" as const : "maintenance" as const } : d
    ));
  }, [setDesks]);

  const addRoom = useCallback((name: string, floorId: string, capacity: number, amenities: string[], gridPosition?: { x: number; y: number }, gridSize?: { w: number; h: number }) => {
    setRooms((p) => [...p, { id: uid(), name, floorId, capacity, amenities, status: "available" as const, gridPosition, gridSize }]);
  }, [setRooms]);
  const updateRoom = useCallback((id: string, data: Partial<Room>) => {
    setRooms((p) => p.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }, [setRooms]);
  const deleteRoom = useCallback((id: string) => {
    setRooms((p) => p.filter((r) => r.id !== id));
  }, [setRooms]);

  // Canvas object CRUD
  const addCanvasObject = useCallback((obj: Omit<CanvasObject, "id">): string => {
    const id = uid();
    setCanvasObjects((p) => [...p, { ...obj, id } as CanvasObject]);
    return id;
  }, [setCanvasObjects]);

  const updateCanvasObject = useCallback((id: string, data: Partial<CanvasObject>) => {
    setCanvasObjects((p) => p.map((o) => (o.id === id ? { ...o, ...data } : o)));
  }, [setCanvasObjects]);

  const deleteCanvasObject = useCallback((id: string) => {
    setCanvasObjects((p) => p.filter((o) => o.id !== id));
  }, [setCanvasObjects]);

  return (
    <AdminDataContext.Provider
      value={{
        bookingRules, setBookingRules,
        addFloor, updateFloor, deleteFloor,
        addZone, updateZone, deleteZone,
        addDesk, updateDesk, deleteDesk, toggleDeskMaintenance,
        addRoom, updateRoom, deleteRoom,
        addCanvasObject, updateCanvasObject, deleteCanvasObject,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
