import * as XLSX from "xlsx";
import type { Student } from "./types";

const COLUMNS: (keyof Student)[] = [
  "roll_no",
  "student_name",
  "father_name",
  "dob",
  "physics_max",
  "physics_obtained",
  "chemistry_max",
  "chemistry_obtained",
  "biology_max",
  "biology_obtained",
  "math_max",
  "math_obtained",
];

export function downloadTemplate() {
  const sample: Student = {
    roll_no: "AV001",
    student_name: "Rahul Kumar",
    father_name: "Suresh Kumar",
    dob: "15/08/2007",
    physics_max: 100,
    physics_obtained: 78,
    chemistry_max: 100,
    chemistry_obtained: 82,
    biology_max: 100,
    biology_obtained: 70,
    math_max: 100,
    math_obtained: 88,
  };
  const ws = XLSX.utils.json_to_sheet([sample], { header: COLUMNS as string[] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "aspect-vision-template.xlsx");
}

export async function parseExcel(file: File): Promise<Student[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  return rows.map((row, idx) => {
    const get = (k: string) => {
      // normalise keys (case/space insensitive)
      const found = Object.keys(row).find(
        (rk) => rk.toLowerCase().replace(/\s+/g, "_") === k
      );
      return found ? row[found] : "";
    };
    const num = (k: string) => Number(get(k)) || 0;
    return {
      roll_no: String(get("roll_no") || `AV${String(idx + 1).padStart(3, "0")}`),
      student_name: String(get("student_name") || ""),
      father_name: String(get("father_name") || ""),
      dob: String(get("dob") || ""),
      physics_max: num("physics_max"),
      physics_obtained: num("physics_obtained"),
      chemistry_max: num("chemistry_max"),
      chemistry_obtained: num("chemistry_obtained"),
      biology_max: num("biology_max"),
      biology_obtained: num("biology_obtained"),
      math_max: num("math_max"),
      math_obtained: num("math_obtained"),
    };
  });
}
