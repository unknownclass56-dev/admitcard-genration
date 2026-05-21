import type { ExamSettings, Student } from "@/lib/types";
import { SUBJECTS, calcResult } from "@/lib/types";
import logo from "@/assets/logo.jpeg";

interface Props {
  student: Student;
  settings: ExamSettings;
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-4 border-b-4 border-double border-[#0a2540] pb-3">
      <img src={logo} alt="Aspect Vision" className="h-20 w-20 object-contain" />
      <div className="flex-1 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-[#0a2540]">
          ASPECT VISION
        </h1>
        <p className="text-sm font-semibold tracking-[0.3em] text-[#c0392b]">
          EXCELLENCE IN EDUCATION
        </p>
        <p className="mt-1 text-base font-bold uppercase text-[#0a2540]">{subtitle}</p>
      </div>
      <div className="h-20 w-20" />
    </div>
  );
}

function Watermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity: 0.07 }}
    >
      <img src={logo} alt="" className="h-[500px] w-[500px] object-contain" />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-dotted border-gray-400 py-1.5">
      <span className="w-44 text-sm font-semibold text-[#0a2540]">{label}</span>
      <span className="text-sm">: {value}</span>
    </div>
  );
}

export function AdmitCard({ student, settings }: Props) {
  return (
    <div
      className="relative mx-auto bg-white p-8 font-sans text-black"
      style={{ width: "794px", minHeight: "1123px" }}
    >
      <Watermark />
      <div className="relative z-10">
        <Header subtitle={`${settings.test_name} — ADMIT CARD`} />

        <div className="mt-4 rounded border-2 border-[#0a2540] bg-[#0a2540] py-1 text-center text-sm font-bold uppercase tracking-widest text-white">
          Candidate Admit Card
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-8">
          <Field label="Roll Number" value={student.roll_no} />
          <Field label="Date of Birth" value={student.dob} />
          <Field label="Candidate's Name" value={student.student_name} />
          <Field label="Father's Name" value={student.father_name} />
        </div>

        <div className="mt-5">
          <div className="bg-[#f4a300] px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
            Examination Centre
          </div>
          <div className="border border-t-0 border-gray-400 p-3 text-sm">
            {settings.exam_centre}
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-[#c0392b] px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
            Examination Schedule
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left">Subject</th>
                <th className="border border-gray-400 p-2 text-left">Date</th>
                <th className="border border-gray-400 p-2 text-left">Timing</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(({ key, label }) => (
                <tr key={key}>
                  <td className="border border-gray-400 p-2 font-medium">{label}</td>
                  <td className="border border-gray-400 p-2">
                    {settings.timings[key].date || settings.exam_date}
                  </td>
                  <td className="border border-gray-400 p-2">
                    {settings.timings[key].timing || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <div className="bg-[#0a2540] px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
            General Instructions
          </div>
          <div className="whitespace-pre-line border border-t-0 border-gray-400 p-3 text-xs leading-relaxed">
            {settings.instructions}
          </div>
        </div>

        <div className="mt-10 flex justify-between text-sm">
          <div className="text-center">
            <div className="h-12 w-40 border-b border-black" />
            <div className="mt-1 font-semibold">Candidate's Signature</div>
          </div>
          <div className="text-center">
            <div className="h-12 w-40 border-b border-black" />
            <div className="mt-1 font-semibold">Controller of Examinations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Marksheet({ student, settings }: Props) {
  const r = calcResult(student);
  return (
    <div
      className="relative mx-auto bg-white p-8 font-sans text-black"
      style={{ width: "794px", minHeight: "1123px" }}
    >
      <Watermark />
      <div className="relative z-10">
        <Header subtitle={`${settings.test_name} — STATEMENT OF MARKS`} />

        <div className="mt-4 rounded border-2 border-[#0a2540] bg-[#0a2540] py-1 text-center text-sm font-bold uppercase tracking-widest text-white">
          Statement of Marks
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-8">
          <Field label="Roll Number" value={student.roll_no} />
          <Field label="Date of Birth" value={student.dob} />
          <Field label="Candidate's Name" value={student.student_name} />
          <Field label="Father's Name" value={student.father_name} />
          <Field label="Examination Centre" value={settings.exam_centre} />
          <Field label="Examination Date" value={settings.exam_date} />
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#0a2540] text-white">
              <th className="border border-gray-500 p-2 text-left">Subject</th>
              <th className="border border-gray-500 p-2 text-center">Max Marks</th>
              <th className="border border-gray-500 p-2 text-center">Marks Obtained</th>
              <th className="border border-gray-500 p-2 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {r.subjects.map((s) => (
              <tr key={s.key}>
                <td className="border border-gray-400 p-2 font-medium">{s.label}</td>
                <td className="border border-gray-400 p-2 text-center">{s.max}</td>
                <td className="border border-gray-400 p-2 text-center font-bold">
                  {s.obt}
                </td>
                <td
                  className={`border border-gray-400 p-2 text-center font-semibold ${
                    s.pass ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {s.pass ? "PASS" : "FAIL"}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-400 p-2">TOTAL</td>
              <td className="border border-gray-400 p-2 text-center">{r.totalMax}</td>
              <td className="border border-gray-400 p-2 text-center">{r.totalObt}</td>
              <td className="border border-gray-400 p-2 text-center">
                {r.pct.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm">
            <div>
              <span className="font-semibold">Percentage:</span> {r.pct.toFixed(2)}%
            </div>
            <div className="mt-1">
              <span className="font-semibold">Overall Result:</span>{" "}
              <span
                className={`text-lg font-bold ${
                  r.overallPass ? "text-green-700" : "text-red-700"
                }`}
              >
                {r.overallPass ? "PASS" : "FAIL"}
              </span>
            </div>
          </div>
          <div
            className={`rounded-full border-4 px-6 py-3 text-2xl font-bold ${
              r.overallPass
                ? "border-green-700 text-green-700"
                : "border-red-700 text-red-700"
            }`}
            style={{ transform: "rotate(-8deg)" }}
          >
            {r.overallPass ? "PASS" : "FAIL"}
          </div>
        </div>

        <div className="mt-2 text-xs italic text-gray-600">
          Note: A candidate must secure at least 33% in each subject to be declared PASS.
        </div>

        <div className="mt-16 flex justify-between text-sm">
          <div className="text-center">
            <div className="h-12 w-40 border-b border-black" />
            <div className="mt-1 font-semibold">Checked By</div>
          </div>
          <div className="text-center">
            <div className="h-12 w-40 border-b border-black" />
            <div className="mt-1 font-semibold">Controller of Examinations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
