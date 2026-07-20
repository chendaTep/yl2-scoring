import React, { useState, useEffect } from "react";
import {
  Mic,
  Image as ImageIcon,
  PersonStanding,
  Users,
  Star,
  Printer,
  Save,
  Trash2,
  Pencil,
  History,
  Plus,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Rubric configuration — single source of truth for scoring categories
// ---------------------------------------------------------------------------
const RUBRIC = [
  {
    key: "speaking",
    label: "Speaking Skill",
    max: 3,
    icon: Mic,
    color: "sky",
    criteria: ["Clear voice", "Pronunciation", "Confidence", "Fluency"],
  },
  {
    key: "poster",
    label: "Poster / Visual Aid",
    max: 2,
    icon: ImageIcon,
    color: "emerald",
    criteria: ["Creativity", "Neatness", "Relevant pictures", "Easy to read"],
  },
  {
    key: "body",
    label: "Body Language & Gesture",
    max: 2,
    icon: PersonStanding,
    color: "teal",
    criteria: ["Eye contact", "Good posture", "Facial expression", "Hand gestures"],
  },
  {
    key: "teamwork",
    label: "Teamwork",
    max: 3,
    icon: Users,
    color: "cyan",
    criteria: ["Sharing speaking parts", "Helping teammates", "Supporting each other", "Smooth presentation"],
  },
];

const MAX_TOTAL = RUBRIC.reduce((sum, r) => sum + r.max, 0); // 10

const LEVELS = [
  { min: 9, label: "Excellent", ring: "ring-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  { min: 7, label: "Good", ring: "ring-sky-400", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  { min: 5, label: "Developing", ring: "ring-amber-400", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  { min: 0, label: "Needs Improvement", ring: "ring-rose-400", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
];

function getLevel(total) {
  return LEVELS.find((l) => total >= l.min);
}

const emptyForm = () => ({
  id: null,
  studentName: "",
  groupName: "",
  topic: "",
  date: new Date().toISOString().slice(0, 10),
  scores: { speaking: null, poster: null, body: null, teamwork: null },
  strengths: "",
  suggestions: "",
});

// Color classes kept static (not built dynamically) so Tailwind's core
// stylesheet includes them.
const COLOR_CLASSES = {
  sky: { chip: "bg-sky-100 text-sky-700", active: "bg-sky-500 text-white border-sky-500", ring: "focus-visible:ring-sky-400" },
  emerald: { chip: "bg-emerald-100 text-emerald-700", active: "bg-emerald-500 text-white border-emerald-500", ring: "focus-visible:ring-emerald-400" },
  teal: { chip: "bg-teal-100 text-teal-700", active: "bg-teal-500 text-white border-teal-500", ring: "focus-visible:ring-teal-400" },
  cyan: { chip: "bg-cyan-100 text-cyan-700", active: "bg-cyan-500 text-white border-cyan-500", ring: "focus-visible:ring-cyan-400" },
};

// ---------------------------------------------------------------------------
// StudentForm
// ---------------------------------------------------------------------------
function StudentForm({ form, onChange }) {
  const field = (key, label, type = "text") => (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => onChange({ ...form, [key]: e.target.value })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        placeholder={label}
      />
    </label>
  );

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Student / Group Info</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field("studentName", "Student name")}
        {field("groupName", "Group name")}
        {field("topic", "Presentation topic")}
        {field("date", "Date", "date")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreSelector — the 0..max button row
// ---------------------------------------------------------------------------
function ScoreSelector({ max, value, onSelect, color }) {
  const c = COLOR_CLASSES[color];
  const options = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex gap-2">
      {options.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={
              "h-10 w-10 rounded-xl border text-sm font-bold transition-all " +
              (active
                ? c.active + " shadow-sm scale-105"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300")
            }
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RubricCard
// ---------------------------------------------------------------------------
function RubricCard({ category, value, onSelect }) {
  const Icon = category.icon;
  const c = COLOR_CLASSES[category.color];
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={"flex h-9 w-9 items-center justify-center rounded-full " + c.chip}>
            <Icon size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-700">{category.label}</p>
            <p className="text-xs text-slate-400">Max {category.max} pts</p>
          </div>
        </div>
        <span className="text-lg font-extrabold text-slate-700">
          {value === null ? "–" : value}
          <span className="text-xs font-medium text-slate-400">/{category.max}</span>
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {category.criteria.map((c2) => (
          <span key={c2} className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
            {c2}
          </span>
        ))}
      </div>
      <ScoreSelector max={category.max} value={value} onSelect={onSelect} color={category.color} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultCard
// ---------------------------------------------------------------------------
function ResultCard({ scores }) {
  const filled = RUBRIC.every((r) => scores[r.key] !== null);
  const total = RUBRIC.reduce((sum, r) => sum + (scores[r.key] || 0), 0);
  const level = getLevel(total);

  return (
    <div className={"rounded-3xl border border-slate-100 p-5 shadow-sm " + (filled ? level.bg : "bg-white")}>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Result</h2>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-extrabold text-slate-800">{total}</span>
        <span className="pb-1 text-lg font-semibold text-slate-400">/ {MAX_TOTAL}</span>
      </div>
      <div className={"mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold " + level.text}>
        <span className={"h-2 w-2 rounded-full " + level.dot} />
        {filled ? level.label : "Not scored yet"}
      </div>
      <div className="mt-4 space-y-1.5 border-t border-slate-200/70 pt-3">
        {RUBRIC.map((r) => (
          <div key={r.key} className="flex justify-between text-xs text-slate-500">
            <span>{r.label}</span>
            <span className="font-semibold text-slate-600">
              {scores[r.key] === null ? "–" : scores[r.key]}/{r.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssessmentHistory
// ---------------------------------------------------------------------------
function AssessmentHistory({ assessments, onEdit, onDelete }) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
        No saved assessments yet. Score a presentation and save it to see it here.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {assessments
        .slice()
        .reverse()
        .map((a) => {
          const total = RUBRIC.reduce((s, r) => s + (a.scores[r.key] || 0), 0);
          const level = getLevel(total);
          return (
            <div key={a.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {a.studentName || "Unnamed student"}{" "}
                  <span className="font-normal text-slate-400">· {a.groupName || "No group"}</span>
                </p>
                <p className="text-xs text-slate-400">{a.topic || "No topic"} · {a.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + level.bg + " " + level.text}>
                  {total}/{MAX_TOTAL} · {level.label}
                </span>
                <button onClick={() => onEdit(a)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-sky-600" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(a.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PrintReport — visible only in print media (used for "PDF export")
// ---------------------------------------------------------------------------
function PrintReport({ form }) {
  const total = RUBRIC.reduce((s, r) => s + (form.scores[r.key] || 0), 0);
  const level = getLevel(total);
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">YL2 Presentation Assessment</h1>
      <div className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
        <span className="font-semibold">Student:</span><span>{form.studentName}</span>
        <span className="font-semibold">Group:</span><span>{form.groupName}</span>
        <span className="font-semibold">Topic:</span><span>{form.topic}</span>
        <span className="font-semibold">Date:</span><span>{form.date}</span>
      </div>
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1">Category</th>
            <th className="py-1 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {RUBRIC.map((r) => (
            <tr key={r.key} className="border-b border-slate-300">
              <td className="py-1">{r.label}</td>
              <td className="py-1 text-right">{form.scores[r.key] ?? 0}/{r.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-base font-bold">Total Score: {total}/{MAX_TOTAL} — {level.label}</p>
      <div className="mt-6 text-sm">
        <p className="font-semibold">Strengths:</p>
        <p className="mb-3">{form.strengths || "—"}</p>
        <p className="font-semibold">Suggestions for improvement:</p>
        <p>{form.suggestions || "—"}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [view, setView] = useState("score"); // "score" | "history"
  const [saveNote, setSaveNote] = useState("");
  const [printMode, setPrintMode] = useState(false);

  // Load saved assessments on mount (from the browser's localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yl2-assessments");
      if (raw) setAssessments(JSON.parse(raw));
    } catch (e) {
      // no data saved yet — that's fine
    }
  }, []);

  // Show the printable report, trigger the browser print dialog, then
  // return to the normal scoring view once printing is done/cancelled.
  useEffect(() => {
    if (!printMode) return;
    const t = setTimeout(() => window.print(), 150);
    const restore = () => setPrintMode(false);
    window.addEventListener("afterprint", restore);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", restore);
    };
  }, [printMode]);

  const persist = (list) => {
    try {
      localStorage.setItem("yl2-assessments", JSON.stringify(list));
    } catch (e) {
      console.error("Could not save assessments", e);
    }
  };

  const handleScoreSelect = (key, n) => {
    setForm((f) => ({ ...f, scores: { ...f.scores, [key]: n } }));
  };

  const handleSave = () => {
    let next;
    if (form.id) {
      next = assessments.map((a) => (a.id === form.id ? form : a));
    } else {
      next = [...assessments, { ...form, id: crypto.randomUUID() }];
    }
    setAssessments(next);
    persist(next);
    setSaveNote(form.id ? "Assessment updated." : "Assessment saved.");
    setTimeout(() => setSaveNote(""), 2000);
    if (!form.id) setForm((f) => ({ ...f, id: next[next.length - 1].id }));
  };

  const handleNew = () => setForm(emptyForm());

  const handleEdit = (a) => {
    setForm(a);
    setView("score");
  };

  const handleDelete = (id) => {
    const next = assessments.filter((a) => a.id !== id);
    setAssessments(next);
    persist(next);
    if (form.id === id) handleNew();
  };

  const allScored = RUBRIC.every((r) => form.scores[r.key] !== null);

  if (printMode) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
        <PrintReport form={form} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="mx-auto max-w-5xl px-4 py-6" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 text-white shadow-sm">
              <Star size={22} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                YL2 Presentation Scoring
              </h1>
              <p className="text-xs text-slate-400">Quick, classroom-friendly assessment for young learners</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("score")}
              className={"rounded-xl px-3 py-2 text-sm font-semibold transition " + (view === "score" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200")}
            >
              Score
            </button>
            <button
              onClick={() => setView("history")}
              className={"flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition " + (view === "history" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200")}
            >
              <History size={15} /> History ({assessments.length})
            </button>
          </div>
        </header>

        {view === "history" ? (
          <AssessmentHistory assessments={assessments} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <StudentForm form={form} onChange={setForm} />
              {RUBRIC.map((cat) => (
                <RubricCard key={cat.key} category={cat} value={form.scores[cat.key]} onSelect={(n) => handleScoreSelect(cat.key, n)} />
              ))}

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Teacher Feedback</h2>
                <label className="mb-3 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400">Strengths</span>
                  <textarea
                    value={form.strengths}
                    onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    rows={2}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    placeholder="What the student/group did well..."
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400">Suggestions for improvement</span>
                  <textarea
                    value={form.suggestions}
                    onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                    rows={2}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    placeholder="What to work on next time..."
                  />
                </label>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <ResultCard scores={form.scores} />
              <div className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <button
                  onClick={handleSave}
                  disabled={!allScored}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Save size={16} /> {form.id ? "Update Assessment" : "Save Assessment"}
                </button>
                <button
                  onClick={() => setPrintMode(true)}
                  disabled={!allScored}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <Printer size={16} /> Export Report (PDF)
                </button>
                <button
                  onClick={handleNew}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition hover:text-slate-600"
                >
                  <Plus size={15} /> New assessment
                </button>
                {saveNote && (
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={14} /> {saveNote}
                  </p>
                )}
                {!allScored && (
                  <p className="text-center text-xs text-slate-400">Score all 4 categories to save or export.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Performance levels</h3>
                <div className="space-y-1.5">
                  {LEVELS.map((l) => (
                    <div key={l.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className={"h-1.5 w-1.5 rounded-full " + l.dot} /> {l.label}
                      </span>
                      <span className="font-semibold text-slate-400">
                        {l.min === 9 ? "9–10" : l.min === 0 ? "0–4" : `${l.min}–${l.min + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
