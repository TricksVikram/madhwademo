import { format } from "date-fns";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { QRCode } from "../checkin/QRCode";
import type { GuestInfo } from "../../../data/types";

interface VisitorBadgeProps {
  isOpen: boolean;
  onClose: () => void;
  guestInfo: GuestInfo;
  hostName: string;
  date: string;
  resourceId: string;
}

export function VisitorBadge({
  isOpen,
  onClose,
  guestInfo,
  hostName,
  date,
  resourceId,
}: VisitorBadgeProps) {
  const handlePrint = () => {
    toast.success("Badge sent to printer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Visitor badge</DialogTitle>
        </DialogHeader>

        <div className="mx-auto w-full max-w-[280px] rounded-xl border-2 border-border bg-card p-6 shadow-lg">
          {/* VISITOR header */}
          <div className="mb-4 rounded-lg bg-primary px-4 py-2 text-center">
            <span className="text-lg font-bold tracking-widest text-primary-foreground uppercase">
              VISITOR
            </span>
          </div>

          {/* Guest details */}
          <div className="space-y-2 text-center">
            <p className="text-xl font-bold text-foreground">{guestInfo.name}</p>
            {guestInfo.company && (
              <p className="text-sm text-muted-foreground">{guestInfo.company}</p>
            )}
            <div className="mx-auto my-3 h-px w-3/4 bg-border" />
            <p className="text-xs text-muted-foreground">
              Hosted by {hostName}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(date + "T12:00:00"), "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* QR code */}
          <div className="mt-4 flex justify-center">
            <QRCode
              resourceId={`visitor-${guestInfo.email}-${date}`}
              label="Scan to check in"
              size={100}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            Print badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
