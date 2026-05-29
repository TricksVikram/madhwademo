import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMockData } from "../../../contexts/MockDataContext";
import { useAdminData } from "../../../contexts/AdminDataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";

export function FloorsTable() {
  const { floors, zones, desks, rooms } = useMockData();
  const { addFloor, updateFloor, deleteFloor } = useAdminData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditId(null); setName(""); setLevel(floors.length + 1); setDialogOpen(true); };
  const openEdit = (f: typeof floors[0]) => { setEditId(f.id); setName(f.name); setLevel(f.level); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updateFloor(editId, { name: name.trim(), level });
      toast.success("Floor updated");
    } else {
      addFloor(name.trim(), level);
      toast.success("Floor added");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) { deleteFloor(deleteId); toast.success("Floor deleted"); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add floor</Button>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Zones</TableHead>
              <TableHead>Desks</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {floors.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>{f.level}</TableCell>
                <TableCell>{zones.filter((z) => z.floorId === f.id).length}</TableCell>
                <TableCell>{desks.filter((d) => d.floorId === f.id).length}</TableCell>
                <TableCell>{rooms.filter((r) => r.floorId === f.id).length}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(f)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit floor" : "Add floor"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Level</Label><Input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete floor</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
