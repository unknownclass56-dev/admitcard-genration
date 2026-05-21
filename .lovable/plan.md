# Aspect Vision — Admit Card & Marksheet Generator

Ek single-page web app jisme admin Excel import kare ya manually students add kare, aur ek click me sabke **Admit Cards** aur **Marksheets** generate ho ke 2 alag ZIP files me download ho jaye.

## Pages / UI

Single page (`/`) with 3 tabs:

1. **Students** — Excel import + manual add/edit/delete table
2. **Exam Settings** — Centre, date, subject-wise timings, general instructions (editable)
3. **Generate** — Preview + 2 download buttons: "Download Admit Cards (ZIP)" aur "Download Marksheets (ZIP)"

Top header har page pe: **ASPECT VISION — BCECE TEST** with logo.

## Student Data Fields

Excel columns (template download button bhi denge):

- `roll_no` (auto-generate if missing)
- `student_name`
- `father_name`
- `dob` (DD/MM/YYYY)
- `physics_max`, `physics_obtained`
- `chemistry_max`, `chemistry_obtained`
- `biology_max`, `biology_obtained`
- `math_max`, `math_obtained`

Total, percentage, result (Pass/Fail — 33% per subject) auto-calculated.

## Exam Settings (admin editable, persisted in localStorage)

- Exam Centre: `Miracle Professional College, Rajendra Nagar, Patna` (default, editable)
- Exam Date: `24/05/2026` (default, editable)
- Subject-wise timings (default blank, admin fills):
  - Physics — time slot
  - Chemistry — time slot
  - Biology — time slot
  - Math — time slot
- General Instructions textarea (pre-filled with standard BCECE-style instructions, spell-checked, admin can edit)

## Admit Card Layout (A4)

- Header band: Aspect Vision logo + "ASPECT VISION" + subtitle "BCECE TEST — ADMIT CARD"
- Background: Aspect Vision logo as faded watermark (centered, ~15% opacity)
- Student details box: Roll No, Name, Father's Name, DOB
- Exam Centre box
- Subject-wise schedule table: Subject | Date | Timing
- General Instructions section (numbered list)
- Footer: signature line for "Controller of Examinations"

## Marksheet Layout (A4)

- Same header + watermark
- Title: "STATEMENT OF MARKS"
- Student details
- Marks table: Subject | Max Marks | Marks Obtained | Result
- Totals row + Percentage + Overall Result (PASS/FAIL)
- Footer signature line

## Generate / Download

- **Download Admit Cards ZIP** → `admit-cards.zip` containing `AdmitCard_<RollNo>_<Name>.pdf` per student
- **Download Marksheets ZIP** → `marksheets.zip` containing `Marksheet_<RollNo>_<Name>.pdf` per student
- Progress bar dikhega while generating
- Preview pane: pehle student ka live HTML preview (admit card + marksheet toggle)

## General Instructions (default text, spell-corrected)

```text
1. Candidates must reach the examination centre at least 30 minutes before the
   reporting time. Entry will not be allowed after the gate closing time.
2. This Admit Card must be produced at the examination centre along with one
   valid original photo identity proof (Aadhaar / Voter ID / Passport / PAN /
   Driving Licence). Photocopies will not be accepted.
3. Candidates must occupy the seat allotted to them as per their Roll Number.
4. Use of mobile phones, smart watches, calculators, Bluetooth devices,
   electronic gadgets, books, notes, paper or any other unauthorised material
   inside the examination hall is strictly prohibited.
5. Candidates must carry their own blue or black ball-point pen. Exchange of
   stationery during the examination is not permitted.
6. Any form of impersonation, malpractice or unfair means will lead to
   immediate disqualification and may attract legal action.
7. Maintain silence and discipline inside the examination hall. Do not leave
   your seat without the invigilator's permission.
8. Candidates are not allowed to leave the examination hall before the
   completion of the full duration of the paper.
9. The decision of the examination authority shall be final and binding in all
   matters relating to the conduct of the examination.
10. This Admit Card is provisional and is subject to fulfilment of eligibility
    criteria as laid down by Aspect Vision.
```

---

## Technical Details

**Stack:** TanStack Start + React + Tailwind + Shadcn. No backend needed — all client-side.

**Libraries to install:**
- `xlsx` — read/write Excel files
- `jspdf` + `html2canvas` — render HTML → PDF
- `jszip` — bundle PDFs into ZIP
- `file-saver` — trigger downloads

**State / persistence:**
- Students list + exam settings → `localStorage` (auto-restore on reload)
- No auth, no database

**Files:**
- `src/routes/index.tsx` — main page with tabs
- `src/components/StudentsTab.tsx` — Excel import, manual table (shadcn Table + Dialog for add/edit)
- `src/components/ExamSettingsTab.tsx` — settings form
- `src/components/GenerateTab.tsx` — preview + ZIP generation
- `src/components/AdmitCardTemplate.tsx` — printable HTML template (A4 sized div)
- `src/components/MarksheetTemplate.tsx` — printable HTML template
- `src/lib/excel.ts` — parse/export helpers (xlsx)
- `src/lib/pdf-gen.ts` — html-to-pdf + zip helpers
- `src/lib/store.ts` — localStorage hooks for students + settings
- `src/lib/instructions.ts` — default instruction text + result calculator
- `src/assets/logo.png` — uploaded Aspect Vision logo (also used as watermark)

**Design:** Clean academic / official document look. Navy + saffron accent (from logo). Serif headings (e.g. Playfair) for document titles, sans-serif body. Print-optimised CSS so each card prints cleanly on A4.

**PDF generation flow:** For each student → render template offscreen → `html2canvas` to image → embed in `jsPDF` A4 page → add to JSZip → after loop, save ZIP. Done in batches with progress UI to keep browser responsive.
