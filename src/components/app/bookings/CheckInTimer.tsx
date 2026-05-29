import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Progress } from "../../ui/progress";

const GRACE_PERIOD_MS = 15 * 60 * 1000; // 15 minutes

interface CheckInTimerProps {
  /** ISO datetime or Date when the grace period ends (startTime + 15 min) */
  deadline: Date;
  compact?: boolean;
}

export function CheckInTimer({ deadline, compact = false }: CheckInTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, deadline.getTime() - Date.now())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, deadline.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining <= 0) return null;

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = (remaining / GRACE_PERIOD_MS) * 100;

  const colorClass =
    minutes < 2
      ? "text-destructive"
      : minutes < 5
        ? "text-chart-4"
        : "text-primary";

  const progressColor =
    minutes < 2
      ? "[&>div]:bg-destructive"
      : minutes < 5
        ? "[&>div]:bg-chart-4"
        : "[&>div]:bg-primary";

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
        <AlertCircle className="h-3 w-3" />
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className={`flex items-center justify-between text-xs font-medium ${colorClass}`}>
        <span className="flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Check in now
        </span>
        <span>
          {minutes}:{seconds.toString().padStart(2, "0")} remaining
        </span>
      </div>
      <Progress value={progress} className={`h-1.5 ${progressColor}`} />
    </div>
  );
}

/**
 * Returns deadline Date for a booking's grace period, or null if not applicable.
 */
export function getGraceDeadline(
  bookingDate: string,
  startTime: string,
  status: string
): Date | null {
  if (status !== "upcoming") return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (bookingDate !== todayStr) return null;

  const [h, m] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(h, m, 0, 0);

  if (now.getTime() < startDate.getTime()) return null; // Not started yet

  const deadline = new Date(startDate.getTime() + GRACE_PERIOD_MS);
  if (now.getTime() >= deadline.getTime()) return null; // Already expired

  return deadline;
}
