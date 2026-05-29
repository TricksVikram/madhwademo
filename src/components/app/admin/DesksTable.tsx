import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useMockData } from "../../../contexts/MockDataContext";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";

const AMENITY_OPTIONS = ["Monitor", "Standing desk", "Quiet zone", "Window seat", "Power outlet"];

export function DesksTable() {
  const { desks, floors, zones } = useMockData();
  const { addDesk, updateDesk, deleteDesk, toggleDeskMaintenance } = useAdminData();

  const [floorFilter, setFloorFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [floorId, setFloorId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => floorFilter === "all" ? desks : desks.filter((d) => d.floorId === floorFilter),
    [desks, floorFilter]
  );

  const floorZones = useMemo(() => zones.filter((z) => z.floorId === floorId), [zones, floorId]);

  const openAdd = () => {
    setEditId(null); setLabel(""); setFloorId(floors[0]?.id ?? "");
    setZoneId(zones.find((z) => z.floorId === floors[0]?.id)?.id ?? ""); setAmenities([]); setDialogOpen(true);
  };
  const openEdit = (d: typeof desks[0]) => {
    setEditId(d.id); setLabel(d.label); setFloorId(d.floorId); setZoneId(d.zoneId); setAmenities(d.amenities); setDialogOpen(true);
  };

  const handleSave = () => {
    if (!label.trim() || !floorId || !zoneId) return;
    if (editId) { updateDesk(editId, { label: label.trim(), floorId, zoneId, amenities }); toast.success("Desk updated"); }
    else { addDesk(label.trim(), floorId, zoneId, amenities); toast.success("Desk added"); }
    setDialogOpen(false);
  };

  const handleDelete = () => { if (deleteId) { deleteDesk(deleteId); toast.success("Desk deleted"); } setDeleteId(null); };

  const toggleAmenity = (a: string) => setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by floor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All floors</SelectItem>
            {floors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add desk</Button>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.label}</TableCell>
                <TableCell>{floors.find((f) => f.id === d.floorId)?.name}</TableCell>
                <TableCell>{zones.find((z) => z.id === d.zoneId)?.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={d.status === "maintenance" ? "bg-chart-4/10 text-chart-4" : "bg-chart-2/10 text-chart-2"}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {d.amenities.map((a) => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleDeskMaintenance(d.id)} title="Toggle maintenance">
                      <Wrench className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit desk" : "Add desk"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Floor</Label>
              <Select value={floorId} onValueChange={(v) => { setFloorId(v); setZoneId(zones.find((z) => z.floorId === v)?.id ?? ""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{floors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Zone</Label>
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{floorZones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amenities</Label>
              <div className="space-y-1">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />{a}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete desk</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
