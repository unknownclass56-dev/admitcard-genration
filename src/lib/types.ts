export type Subject = "physics" | "chemistry" | "biology" | "math";

export const SUBJECTS: { key: Subject; label: string }[] = [
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
  { key: "math", label: "Mathematics" },
];

export interface Student {
  roll_no: string;
  student_name: string;
  father_name: string;
  dob: string;
  email: string;
  physics_max: number;
  physics_obtained: number;
  chemistry_max: number;
  chemistry_obtained: number;
  biology_max: number;
  biology_obtained: number;
  math_max: number;
  math_obtained: number;
}

export interface SubjectTiming {
  date: string;
  timing: string;
}

export interface ExamSettings {
  exam_centre: string;
  exam_date: string;
  timings: Record<Subject, SubjectTiming>;
  instructions: string;
  test_name: string;
  reporting_time?: string;
}

export function calcResult(s: Student) {
  const subjects = SUBJECTS.map(({ key, label }) => {
    const max = Number(s[`${key}_max` as keyof Student]) || 0;
    const obt = Number(s[`${key}_obtained` as keyof Student]) || 0;
    const passMark = max * 0.33;
    const pass = obt >= passMark && max > 0;
    return { key, label, max, obt, pass };
  });
  const totalMax = subjects.reduce((a, b) => a + b.max, 0);
  const totalObt = subjects.reduce((a, b) => a + b.obt, 0);
  const pct = totalMax ? (totalObt / totalMax) * 100 : 0;
  const overallPass = subjects.every((x) => x.pass);
  return { subjects, totalMax, totalObt, pct, overallPass };
}
