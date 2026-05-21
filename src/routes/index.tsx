import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { StudentsTab } from "@/components/StudentsTab";
import { ExamSettingsTab } from "@/components/ExamSettingsTab";
import { GenerateTab } from "@/components/GenerateTab";
import { useSettings, useStudents } from "@/lib/store";
import logo from "@/assets/logo.jpeg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Aspect Vision — Admit Card & Marksheet Generator" },
      {
        name: "description",
        content:
          "Generate BCECE test admit cards and marksheets in bulk from Excel. Aspect Vision.",
      },
    ],
  }),
});

function Index() {
  const [students, setStudents] = useStudents();
  const [settings, setSettings] = useSettings();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b-4 border-double border-[#0a2540] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <img src={logo} alt="Aspect Vision" className="h-14 w-14 object-contain" />
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-[#0a2540]">
              ASPECT VISION
            </h1>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#c0392b]">
              BCECE TEST · ADMIT CARD &amp; MARKSHEET GENERATOR
            </p>
          </div>
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            <div>Total Students</div>
            <div className="text-2xl font-bold text-[#0a2540]">{students.length}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="students">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="settings">Exam Settings</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-4">
            <StudentsTab students={students} setStudents={setStudents} />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <ExamSettingsTab settings={settings} setSettings={setSettings} />
          </TabsContent>
          <TabsContent value="generate" className="mt-4">
            <GenerateTab students={students} settings={settings} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aspect Vision · All data is stored locally in your browser.
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
