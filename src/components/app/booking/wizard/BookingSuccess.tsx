import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle2, CalendarIcon, Clock, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "../../../ui/button";
import { QRCode } from "../../checkin/QRCode";
import type { Booking } from "../../../../data/types";
import { useMockData } from "../../../../contexts/MockDataContext";

interface Props {
  booking: Booking;
  onClose: () => void;
  onBookAnother: () => void;
}

export function BookingSuccess({ booking, onClose, onBookAnother }: Props) {
  const { desks } = useMockData();
  const desk = desks.find((d) => d.id === booking.resourceId);
  const label = desk?.label ?? booking.resourceId;
  const dateLabel = format(new Date(booking.date + "T12:00:00"), "EEEE, MMMM d");

  return (
    <div className="w-full max-w-md space-y-8 text-center" data-testid="booking-success">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-chart-2/10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
        >
          <CheckCircle2 className="h-12 w-12 text-chart-2" />
        </motion.div>
      </motion.div>

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-foreground"
        >
          You're all set!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-1 text-muted-foreground"
        >
          Your desk is booked. Scan the QR code on arrival to check in.
        </motion.p>
      </div>

      {/* Booking summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border bg-card p-5 space-y-3 text-left shadow-sm"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{booking.startTime} – {booking.endTime}</span>
        </div>
      </motion.div>

      {/* QR code */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <QRCode resourceId={booking.resourceId} label="Scan to check in" size={100} />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col gap-2"
      >
        <Button asChild className="w-full" data-testid="success-view-bookings">
          <Link to="/app/bookings">View my bookings</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={onBookAnother} data-testid="success-book-another">
          Book another desk
        </Button>
      </motion.div>
    </div>
  );
}
