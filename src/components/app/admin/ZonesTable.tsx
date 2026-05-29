import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMockData } from "../../../contexts/MockDataContext";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";

const ZONE_COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6"];

export function ZonesTable() {
  const { zones, floors, desks } = useMockData();
  const { addZone, updateZone, deleteZone } = useAdminData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [color, setColor] = useState(ZONE_COLORS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState("");

  const openAdd = () => { setEditId(null); setName(""); setFloorId(floors[0]?.id ?? ""); setColor(ZONE_COLORS[0]); setDialogOpen(true); };
  const openEdit = (z: typeof zones[0]) => { setEditId(z.id); setName(z.name); setFloorId(z.floorId); setColor(z.color); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim() || !floorId) return;
    if (editId) { updateZone(editId, { name: name.trim(), floorId, color }); toast.success("Zone updated"); }
    else { addZone(name.trim(), floorId, color); toast.success("Zone added"); }
    setDialogOpen(false);
  };

  const tryDelete = (id: string) => {
    const count = desks.filter((d) => d.zoneId === id).length;
    if (count > 0) { setDeleteWarning(`This zone has ${count} desks — reassign them first`); setDeleteId(null); return; }
    setDeleteWarning(""); setDeleteId(id);
  };

  const handleDelete = () => { if (deleteId) { deleteZone(deleteId); toast.success("Zone deleted"); } setDeleteId(null); };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add zone</Button></div>
      {deleteWarning && <p className="text-sm text-destructive">{deleteWarning}</p>}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Desks</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z.id}>
                <TableCell><div className="h-4 w-4 rounded-full" style={{ backgroundColor: z.color }} /></TableCell>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{floors.find((f) => f.id === z.floorId)?.name}</TableCell>
                <TableCell>{desks.filter((d) => d.zoneId === z.id).length}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(z)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => tryDelete(z.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit zone" : "Add zone"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Floor</Label>
              <Select value={floorId} onValueChange={setFloorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{floors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {ZONE_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
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
          <AlertDialogHeader><AlertDialogTitle>Delete zone</AlertDialogTitle><AlertDialogDescription>Are you sure?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
