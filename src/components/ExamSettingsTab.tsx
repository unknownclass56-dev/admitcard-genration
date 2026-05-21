import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ExamSettings } from "@/lib/types";
import { SUBJECTS } from "@/lib/types";
import { defaultSettings } from "@/lib/store";
import { RotateCcw } from "lucide-react";

export function ExamSettingsTab({
  settings,
  setSettings,
}: {
  settings: ExamSettings;
  setSettings: (s: ExamSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Test Name</Label>
          <Input
            value={settings.test_name}
            onChange={(e) => setSettings({ ...settings, test_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Default Exam Date</Label>
          <Input
            value={settings.exam_date}
            onChange={(e) => setSettings({ ...settings, exam_date: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Exam Centre</Label>
          <Input
            value={settings.exam_centre}
            onChange={(e) =>
              setSettings({ ...settings, exam_centre: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Subject-wise Schedule</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-2 gap-2 rounded border p-3">
              <div className="col-span-2 text-sm font-semibold">{label}</div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  value={settings.timings[key].date}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timings: {
                        ...settings.timings,
                        [key]: { ...settings.timings[key], date: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Timing</Label>
                <Input
                  placeholder="e.g. 09:00 AM - 10:30 AM"
                  value={settings.timings[key].timing}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timings: {
                        ...settings.timings,
                        [key]: { ...settings.timings[key], timing: e.target.value },
                      },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>General Instructions</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSettings({ ...settings, instructions: defaultSettings.instructions });
              toast.success("Instructions reset to default");
            }}
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>
        <Textarea
          rows={14}
          value={settings.instructions}
          onChange={(e) =>
            setSettings({ ...settings, instructions: e.target.value })
          }
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
