import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

const ROOM_AMENITIES = ["Whiteboard", "TV", "Video conferencing", "Phone", "Projector"];

export function RoomsTable() {
  const { rooms, floors } = useMockData();
  const { addRoom, updateRoom, deleteRoom } = useAdminData();

  const [floorFilter, setFloorFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => floorFilter === "all" ? rooms : rooms.filter((r) => r.floorId === floorFilter),
    [rooms, floorFilter]
  );

  const openAdd = () => { setEditId(null); setName(""); setFloorId(floors[0]?.id ?? ""); setCapacity(4); setAmenities([]); setDialogOpen(true); };
  const openEdit = (r: typeof rooms[0]) => { setEditId(r.id); setName(r.name); setFloorId(r.floorId); setCapacity(r.capacity); setAmenities(r.amenities); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim() || !floorId) return;
    if (editId) { updateRoom(editId, { name: name.trim(), floorId, capacity, amenities }); toast.success("Room updated"); }
    else { addRoom(name.trim(), floorId, capacity, amenities); toast.success("Room added"); }
    setDialogOpen(false);
  };

  const handleDelete = () => { if (deleteId) { deleteRoom(deleteId); toast.success("Room deleted"); } setDeleteId(null); };
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
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add room</Button>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{floors.find((f) => f.id === r.floorId)?.name}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {r.amenities.map((a) => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2">{r.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit room" : "Add room"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Floor</Label>
              <Select value={floorId} onValueChange={setFloorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{floors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} /></div>
            <div className="space-y-1.5">
              <Label>Amenities</Label>
              <div className="space-y-1">
                {ROOM_AMENITIES.map((a) => (
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
          <AlertDialogHeader><AlertDialogTitle>Delete room</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
