import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Plus, Trash2, Upload, Pencil } from "lucide-react";
import type { Student } from "@/lib/types";
import { SUBJECTS } from "@/lib/types";
import { downloadTemplate, parseExcel } from "@/lib/excel";

const empty: Student = {
  roll_no: "",
  student_name: "",
  father_name: "",
  dob: "",
  physics_max: 100,
  physics_obtained: 0,
  chemistry_max: 100,
  chemistry_obtained: 0,
  biology_max: 100,
  biology_obtained: 0,
  math_max: 100,
  math_obtained: 0,
};

export function StudentsTab({
  students,
  setStudents,
}: {
  students: Student[];
  setStudents: (s: Student[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student>(empty);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const handleFile = async (f: File) => {
    try {
      const rows = await parseExcel(f);
      setStudents([...students, ...rows]);
      toast.success(`Imported ${rows.length} students`);
    } catch (e) {
      toast.error("Failed to parse Excel file");
      console.error(e);
    }
  };

  const save = () => {
    if (!editing.student_name.trim() || !editing.roll_no.trim()) {
      toast.error("Roll No and Name are required");
      return;
    }
    if (editIdx === null) setStudents([...students, editing]);
    else {
      const copy = [...students];
      copy[editIdx] = editing;
      setStudents(copy);
    }
    setOpen(false);
    setEditing(empty);
    setEditIdx(null);
  };

  const startEdit = (s: Student, i: number) => {
    setEditing(s);
    setEditIdx(i);
    setOpen(true);
  };

  const startAdd = () => {
    setEditing({
      ...empty,
      roll_no: `AV${String(students.length + 1).padStart(3, "0")}`,
    });
    setEditIdx(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Import Excel
        </Button>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" /> Download Template
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" onClick={startAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editIdx === null ? "Add" : "Edit"} Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["roll_no", "Roll No"],
                ["student_name", "Student Name"],
                ["father_name", "Father's Name"],
                ["dob", "Date of Birth (DD/MM/YYYY)"],
              ].map(([key, label]) => (
                <div key={key} className="sm:col-span-1">
                  <Label>{label}</Label>
                  <Input
                    value={(editing as any)[key]}
                    onChange={(e) =>
                      setEditing({ ...editing, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
              {SUBJECTS.map(({ key, label }) => (
                <div key={key} className="sm:col-span-2 grid grid-cols-2 gap-2 rounded border p-2">
                  <div className="col-span-2 text-sm font-semibold">{label}</div>
                  <div>
                    <Label className="text-xs">Max</Label>
                    <Input
                      type="number"
                      value={(editing as any)[`${key}_max`]}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [`${key}_max`]: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Obtained</Label>
                    <Input
                      type="number"
                      value={(editing as any)[`${key}_obtained`]}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [`${key}_obtained`]: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {students.length > 0 && (
          <Button
            variant="ghost"
            className="ml-auto text-destructive"
            onClick={() => {
              if (confirm("Remove all students?")) setStudents([]);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No students yet. Import an Excel file or add manually.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead className="text-center">Phy</TableHead>
                <TableHead className="text-center">Chem</TableHead>
                <TableHead className="text-center">Bio</TableHead>
                <TableHead className="text-center">Math</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono">{s.roll_no}</TableCell>
                  <TableCell>{s.student_name}</TableCell>
                  <TableCell>{s.father_name}</TableCell>
                  <TableCell>{s.dob}</TableCell>
                  <TableCell className="text-center">{s.physics_obtained}/{s.physics_max}</TableCell>
                  <TableCell className="text-center">{s.chemistry_obtained}/{s.chemistry_max}</TableCell>
                  <TableCell className="text-center">{s.biology_obtained}/{s.biology_max}</TableCell>
                  <TableCell className="text-center">{s.math_obtained}/{s.math_max}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(s, i)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setStudents(students.filter((_, j) => j !== i))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Total students: <strong>{students.length}</strong> · Data auto-saved in your browser.
      </p>
    </div>
  );
}
