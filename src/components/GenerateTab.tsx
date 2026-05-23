import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, FileText, GraduationCap } from "lucide-react";
import type { ExamSettings, Student } from "@/lib/types";
import { AdmitCard, Marksheet } from "./DocTemplates";
import { nodeToPdfBlob, safeFileName, zipAndDownload } from "@/lib/pdf-gen";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Input } from "@/components/ui/input";
import { sendAdmitCardEmail } from "@/lib/email-server";

type Kind = "admit" | "marks";

async function renderStudentToPdf(
  kind: Kind,
  student: Student,
  settings: ExamSettings
): Promise<Blob> {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;background:#ffffff;color:#000000;" +
    "--background:#ffffff;--foreground:#000000;--card:#ffffff;--card-foreground:#000000;" +
    "--popover:#ffffff;--popover-foreground:#000000;--primary:#0a2540;--primary-foreground:#ffffff;" +
    "--secondary:#f1f5f9;--secondary-foreground:#0a2540;--muted:#f1f5f9;--muted-foreground:#64748b;" +
    "--accent:#f1f5f9;--accent-foreground:#0a2540;--destructive:#dc2626;--destructive-foreground:#ffffff;" +
    "--border:#d1d5db;--input:#d1d5db;--ring:#94a3b8;";
  document.body.appendChild(host);
  const root = createRoot(host);
  flushSync(() => {
    root.render(
      kind === "admit" ? (
        <AdmitCard student={student} settings={settings} />
      ) : (
        <Marksheet student={student} settings={settings} />
      )
    );
  });
  // wait for images
  await new Promise((r) => setTimeout(r, 250));
  const blob = await nodeToPdfBlob(host.firstChild as HTMLElement);
  root.unmount();
  host.remove();
  return blob;
}

export function GenerateTab({
  students,
  settings,
}: {
  students: Student[];
  settings: ExamSettings;
}) {
  const [busy, setBusy] = useState<Kind | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewIdx, setPreviewIdx] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const [sendEmails, setSendEmails] = useState(false);
  const [ccEmail, setCcEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generate = async (kind: Kind) => {
    if (students.length === 0) {
      toast.error("Add students first");
      return;
    }
    setBusy(kind);
    setProgress(0);
    setEmailStatus(null);
    try {
      const files: { name: string; blob: Blob }[] = [];
      let emailsSent = 0;
      let emailsFailed = 0;
      let emailsSkipped = 0;

      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const blob = await renderStudentToPdf(kind, s, settings);
        const prefix = kind === "admit" ? "AdmitCard" : "Marksheet";
        const fileName = `${prefix}_${safeFileName(s.roll_no)}_${safeFileName(s.student_name)}.pdf`;
        files.push({
          name: fileName,
          blob,
        });

        if (kind === "admit" && sendEmails) {
          if (s.email && s.email.trim()) {
            try {
              setEmailStatus(`Sending email to ${s.student_name}...`);
              const pdfBase64 = await blobToBase64(blob);
              await sendAdmitCardEmail({
                data: {
                  to: s.email.trim(),
                  cc: ccEmail.trim() || undefined,
                  studentName: s.student_name,
                  rollNo: s.roll_no,
                  pdfBase64,
                  fileName,
                  testName: settings.test_name,
                },
              });
              emailsSent++;
            } catch (err) {
              console.error(`Failed to send email to ${s.student_name}:`, err);
              emailsFailed++;
            }
          } else {
            emailsSkipped++;
          }
        }

        setProgress(Math.round(((i + 1) / students.length) * 100));
      }
      setEmailStatus(null);
      const zipName = kind === "admit" ? "admit-cards.zip" : "marksheets.zip";
      await zipAndDownload(files, zipName);
      
      if (kind === "admit" && sendEmails) {
        toast.success(`Generated ${files.length} PDFs. Emails sent: ${emailsSent}, Failed: ${emailsFailed}, Skipped (no email): ${emailsSkipped}`);
      } else {
        toast.success(`Generated ${files.length} PDFs → ${zipName}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Generation failed. Check console.");
    } finally {
      setBusy(null);
      setProgress(0);
      setEmailStatus(null);
    }
  };

  const preview = students[previewIdx];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0a2540]" />
              <h3 className="font-semibold">Admit Cards</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate admit cards for all {students.length} students and download as ZIP.
            </p>

            <div className="mb-4 rounded border p-3 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="send-emails-check"
                  type="checkbox"
                  checked={sendEmails}
                  onChange={(e) => setSendEmails(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="send-emails-check"
                  className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                >
                  Email PDF Admit Cards directly to students
                </label>
              </div>

              {sendEmails && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    CC Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. cc@aspectvision.com"
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Button
              onClick={() => generate("admit")}
              disabled={busy !== null}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {busy === "admit"
                ? sendEmails
                  ? `Sending Emails… ${progress}%`
                  : `Generating… ${progress}%`
                : "Download & Send Admit Cards"}
            </Button>
            {busy === "admit" && <Progress value={progress} className="mt-2" />}
            {emailStatus && (
              <p className="mt-2 text-center text-xs font-medium text-amber-600 animate-pulse">
                {emailStatus}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#c0392b]" />
            <h3 className="font-semibold">Marksheets</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Generate marksheets for all {students.length} students and download as ZIP.
          </p>
          <Button
            onClick={() => generate("marks")}
            disabled={busy !== null}
            variant="secondary"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {busy === "marks" ? `Generating… ${progress}%` : "Download Marksheets ZIP"}
          </Button>
          {busy === "marks" && <Progress value={progress} className="mt-2" />}
        </div>
      </div>

      {preview && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Live Preview</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={previewIdx === 0}
                onClick={() => setPreviewIdx(previewIdx - 1)}
              >
                ←
              </Button>
              <span className="text-xs text-muted-foreground">
                {previewIdx + 1} / {students.length} — {preview.student_name}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={previewIdx >= students.length - 1}
                onClick={() => setPreviewIdx(previewIdx + 1)}
              >
                →
              </Button>
            </div>
          </div>
          <Tabs defaultValue="admit">
            <TabsList>
              <TabsTrigger value="admit">Admit Card</TabsTrigger>
              <TabsTrigger value="marks">Marksheet</TabsTrigger>
            </TabsList>
            <TabsContent value="admit">
              <div
                ref={previewRef}
                className="overflow-auto rounded-lg border bg-gray-100 p-4"
              >
                <div style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "fit-content" }}>
                  <AdmitCard student={preview} settings={settings} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="marks">
              <div className="overflow-auto rounded-lg border bg-gray-100 p-4">
                <div style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "fit-content" }}>
                  <Marksheet student={preview} settings={settings} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
