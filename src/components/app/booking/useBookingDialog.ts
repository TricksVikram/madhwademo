import { useState, useCallback } from "react";
import type { ResourceType } from "../../../data/types";

export interface BookingPrefill {
  date?: string;
  startTime?: string;
  resourceType?: ResourceType;
  resourceId?: string;
}

interface BookingDialogState {
  isOpen: boolean;
  prefill: BookingPrefill;
  open: (prefill?: BookingPrefill) => void;
  close: () => void;
}

export function useBookingDialog(): BookingDialogState {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<BookingPrefill>({});

  const open = useCallback((p?: BookingPrefill) => {
    setPrefill(p ?? {});
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPrefill({});
  }, []);

  return { isOpen, prefill, open, close };
}
