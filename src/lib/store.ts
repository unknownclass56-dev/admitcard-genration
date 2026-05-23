import { useEffect, useState } from "react";
import type { ExamSettings, Student } from "./types";
import { DEFAULT_INSTRUCTIONS } from "./instructions";

const STUDENTS_KEY = "av_students_v1";
const SETTINGS_KEY = "av_settings_v1";

export const defaultSettings: ExamSettings = {
  test_name: "BCECE TEST",
  exam_centre: "Miracle Professional College, Rajendra Nagar, Patna",
  exam_date: "24/05/2026",
  reporting_time: "08:00 AM",
  timings: {
    physics: { date: "24/05/2026", timing: "09:00 AM - 10:30 AM" },
    chemistry: { date: "24/05/2026", timing: "11:00 AM - 12:30 PM" },
    biology: { date: "24/05/2026", timing: "01:30 PM - 03:00 PM" },
    math: { date: "24/05/2026", timing: "03:30 PM - 05:00 PM" },
  },
  instructions: DEFAULT_INSTRUCTIONS,
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDENTS_KEY);
      if (raw) setStudents(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }, [students, hydrated]);
  return [students, setStudents] as const;
}

export function useSettings() {
  const [settings, setSettings] = useState<ExamSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSettings(load(SETTINGS_KEY, defaultSettings));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);
  return [settings, setSettings] as const;
}
