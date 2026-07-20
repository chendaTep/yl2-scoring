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
  Settings as SettingsIcon,
  BookOpen,
  Award,
  Target,
  Heart,
  Zap,
  MessageCircle,
  Smile,
  PenTool,
  Clock,
  ThumbsUp,
  Lightbulb,
  Music,
  Camera,
  Globe,
  Trophy,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Icon + color libraries — pickers in Settings choose from these.
// Kept as static maps (not built dynamically) so Tailwind's core stylesheet
// includes every class we reference.
// ---------------------------------------------------------------------------
const ICONS = {
  mic: Mic,
  image: ImageIcon,
  person: PersonStanding,
  users: Users,
  star: Star,
  book: BookOpen,
  award: Award,
  target: Target,
  heart: Heart,
  zap: Zap,
  message: MessageCircle,
  smile: Smile,
  pen: PenTool,
  clock: Clock,
  thumbsUp: ThumbsUp,
  lightbulb: Lightbulb,
  music: Music,
  camera: Camera,
  globe: Globe,
  trophy: Trophy,
};

const COLORS = {
  sky: { chip: "bg-sky-100 text-sky-700", active: "bg-sky-500 text-white border-sky-500", swatch: "bg-sky-500" },
  emerald: { chip: "bg-emerald-100 text-emerald-700", active: "bg-emerald-500 text-white border-emerald-500", swatch: "bg-emerald-500" },
  teal: { chip: "bg-teal-100 text-teal-700", active: "bg-teal-500 text-white border-teal-500", swatch: "bg-teal-500" },
  cyan: { chip: "bg-cyan-100 text-cyan-700", active: "bg-cyan-500 text-white border-cyan-500", swatch: "bg-cyan-500" },
  indigo: { chip: "bg-indigo-100 text-indigo-700", active: "bg-indigo-500 text-white border-indigo-500", swatch: "bg-indigo-500" },
  violet: { chip: "bg-violet-100 text-violet-700", active: "bg-violet-500 text-white border-violet-500", swatch: "bg-violet-500" },
  fuchsia: { chip: "bg-fuchsia-100 text-fuchsia-700", active: "bg-fuchsia-500 text-white border-fuchsia-500", swatch: "bg-fuchsia-500" },
  rose: { chip: "bg-rose-100 text-rose-700", active: "bg-rose-500 text-white border-rose-500", swatch: "bg-rose-500" },
  amber: { chip: "bg-amber-100 text-amber-700", active: "bg-amber-500 text-white border-amber-500", swatch: "bg-amber-500" },
  orange: { chip: "bg-orange-100 text-orange-700", active: "bg-orange-500 text-white border-orange-500", swatch: "bg-orange-500" },
  lime: { chip: "bg-lime-100 text-lime-700", active: "bg-lime-500 text-white border-lime-500", swatch: "bg-lime-500" },
  pink: { chip: "bg-pink-100 text-pink-700", active: "bg-pink-500 text-white border-pink-500", swatch: "bg-pink-500" },
};

const COLOR_KEYS = Object.keys(COLORS);
const ICON_KEYS = Object.keys(ICONS);

// ---------------------------------------------------------------------------
// Default rubric — used the first time the app runs (nothing in storage yet)
// ---------------------------------------------------------------------------
const DEFAULT_CATEGORIES = [
  { id: "speaking", label: "Speaking Skill", max: 3, icon: "mic", color: "sky", criteria: ["Clear voice", "Pronunciation", "Confidence", "Fluency"] },
  { id: "poster", label: "Poster / Visual Aid", max: 2, icon: "image", color: "emerald", criteria: ["Creativity", "Neatness", "Relevant pictures", "Easy to read"] },
  { id: "body", label: "Body Language & Gesture", max: 2, icon: "person", color: "teal", criteria: ["Eye contact", "Good posture", "Facial expression", "Hand gestures"] },
  { id: "teamwork", label: "Teamwork", max: 3, icon: "users", color: "cyan", criteria: ["Sharing speaking parts", "Helping teammates", "Supporting each other", "Smooth presentation"] },
];

// Performance levels now scale by PERCENTAGE of max total, so they still
// make sense no matter how many categories or points are configured.
const LEVELS = [
  { minPct: 90, label: "Excellent", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  { minPct: 70, label: "Good", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  { minPct: 50, label: "Developing", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  { minPct: 0, label: "Needs Improvement", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
];

function getLevel(total, maxTotal) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  return LEVELS.find((l) => pct >= l.minPct);
}

function getMaxTotal(categories) {
  return categories.reduce((sum, c) => sum + c.max, 0);
}

function getTotal(scores, categories) {
  return categories.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
}

function emptyForm(categories) {
  const scores = {};
  categories.forEach((c) => (scores[c.id] = null));
  return {
    id: null,
    studentName: "",
    classLevel: "",
    groupName: "",
    teacherName: "",
    topic: "",
    date: new Date().toISOString().slice(0, 10),
    scores,
    strengths: "",
    suggestions: "",
  };
}

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
        {field("classLevel", "Class")}
        {field("groupName", "Group name")}
        {field("teacherName", "Teacher")}
        {field("topic", "Presentation topic")}
        {field("date", "Date", "date")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreSelector — the 0..max button row, automatically matches category.max
// ---------------------------------------------------------------------------
function ScoreSelector({ max, value, onSelect, color }) {
  const c = COLORS[color] || COLORS.sky;
  const options = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex flex-wrap gap-2">
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
  const Icon = ICONS[category.icon] || Star;
  const c = COLORS[category.color] || COLORS.sky;
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
          {value === null || value === undefined ? "–" : value}
          <span className="text-xs font-medium text-slate-400">/{category.max}</span>
        </span>
      </div>
      {category.criteria && category.criteria.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {category.criteria.map((c2) => (
            <span key={c2} className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
              {c2}
            </span>
          ))}
        </div>
      )}
      <ScoreSelector max={category.max} value={value ?? null} onSelect={onSelect} color={category.color} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultCard
// ---------------------------------------------------------------------------
function ResultCard({ scores, categories }) {
  const maxTotal = getMaxTotal(categories);
  const filled = categories.length > 0 && categories.every((c) => scores[c.id] !== null && scores[c.id] !== undefined);
  const total = getTotal(scores, categories);
  const level = getLevel(total, maxTotal);

  return (
    <div className={"rounded-3xl border border-slate-100 p-5 shadow-sm " + (filled ? level.bg : "bg-white")}>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Result</h2>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-extrabold text-slate-800">{total}</span>
        <span className="pb-1 text-lg font-semibold text-slate-400">/ {maxTotal}</span>
      </div>
      <div className={"mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold " + level.text}>
        <span className={"h-2 w-2 rounded-full " + level.dot} />
        {filled ? level.label : "Not scored yet"}
      </div>
      <div className="mt-4 space-y-1.5 border-t border-slate-200/70 pt-3">
        {categories.map((c) => (
          <div key={c.id} className="flex justify-between text-xs text-slate-500">
            <span>{c.label}</span>
            <span className="font-semibold text-slate-600">
              {scores[c.id] === null || scores[c.id] === undefined ? "–" : scores[c.id]}/{c.max}
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
function AssessmentHistory({ assessments, categories, onEdit, onDelete }) {
  const maxTotal = getMaxTotal(categories);
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
          const total = getTotal(a.scores, categories);
          const level = getLevel(total, maxTotal);
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
                  {total}/{maxTotal} · {level.label}
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
function PrintReport({ form, categories, schoolName }) {
  const maxTotal = getMaxTotal(categories);
  const total = getTotal(form.scores, categories);
  const level = getLevel(total, maxTotal);
  return (
    <div className="mx-auto max-w-2xl p-10" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* School header */}
      <div className="border-b-2 border-slate-800 pb-4 text-center">
        <p className="text-lg font-extrabold uppercase tracking-wide text-slate-800">{schoolName}</p>
        <p className="mt-1 text-base font-semibold text-slate-600">Presentation Assessment Report</p>
      </div>

      {/* Student info block */}
      <div className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
        <span className="font-semibold text-slate-600">Student:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.studentName || "\u00A0"}</span>

        <span className="font-semibold text-slate-600">Class:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.classLevel || "\u00A0"}</span>

        <span className="font-semibold text-slate-600">Group:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.groupName || "\u00A0"}</span>

        <span className="font-semibold text-slate-600">Teacher:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.teacherName || "\u00A0"}</span>

        <span className="font-semibold text-slate-600">Topic:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.topic || "\u00A0"}</span>

        <span className="font-semibold text-slate-600">Date:</span>
        <span className="border-b border-dotted border-slate-300 pb-0.5">{form.date || "\u00A0"}</span>
      </div>

      {/* Score table */}
      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left">
            <th className="py-2">Category</th>
            <th className="py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b border-slate-200">
              <td className="py-2">{c.label}</td>
              <td className="py-2 text-right">{form.scores[c.id] ?? 0}/{c.max}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-800">
            <td className="py-2 font-bold">TOTAL</td>
            <td className="py-2 text-right font-bold">{total}/{maxTotal}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-3 text-right text-sm font-semibold text-slate-700">
        Performance: <span>{level.label}</span>
      </p>

      {/* Feedback */}
      <div className="mt-8 space-y-4 text-sm">
        <div>
          <p className="mb-1 font-semibold text-slate-700">Strengths</p>
          <div className="min-h-[2.5rem] rounded-lg border border-slate-200 p-2 text-slate-600">
            {form.strengths || "\u00A0"}
          </div>
        </div>
        <div>
          <p className="mb-1 font-semibold text-slate-700">Suggestions for Improvement</p>
          <div className="min-h-[2.5rem] rounded-lg border border-slate-200 p-2 text-slate-600">
            {form.suggestions || "\u00A0"}
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
        <div>
          <div className="border-b border-slate-400 pb-8"></div>
          <p className="mt-1 text-center text-xs text-slate-500">Teacher Signature</p>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-8"></div>
          <p className="mt-1 text-center text-xs text-slate-500">Date</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategorySettings — add / rename / delete categories, edit max, icon, color
// ---------------------------------------------------------------------------
function CategorySettings({ categories, onChange, schoolName, onSchoolNameChange }) {
  const updateCategory = (id, patch) => {
    onChange(
      categories.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...patch };
        // Clamp max to a sane range
        if (patch.max !== undefined) {
          let m = parseInt(patch.max, 10);
          if (isNaN(m) || m < 1) m = 1;
          if (m > 20) m = 20;
          next.max = m;
        }
        return next;
      })
    );
  };

  const deleteCategory = (id) => {
    if (categories.length <= 1) return;
    onChange(categories.filter((c) => c.id !== id));
  };

  const addCategory = () => {
    const usedColors = new Set(categories.map((c) => c.color));
    const nextColor = COLOR_KEYS.find((k) => !usedColors.has(k)) || COLOR_KEYS[categories.length % COLOR_KEYS.length];
    const usedIcons = new Set(categories.map((c) => c.icon));
    const nextIcon = ICON_KEYS.find((k) => !usedIcons.has(k)) || ICON_KEYS[categories.length % ICON_KEYS.length];
    onChange([
      ...categories,
      {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : "cat-" + Date.now(),
        label: "New Category",
        max: 3,
        icon: nextIcon,
        color: nextColor,
        criteria: [],
      },
    ]);
  };

  const updateCriteria = (id, text) => {
    const list = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateCategory(id, { criteria: list });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Report Settings</h2>
        <p className="mt-1 text-xs text-slate-400">
          This name appears as the header on the printed / exported report.
        </p>
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">School / Center name</span>
          <input
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            placeholder="e.g. ABC English School"
          />
        </label>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Scoring Categories</h2>
        <p className="mt-1 text-xs text-slate-400">
          Add, rename, or remove categories. Set each category's max score, icon, and color — the score buttons and
          performance levels adjust automatically.
        </p>
      </div>

      {categories.map((c) => {
        const Icon = ICONS[c.icon] || Star;
        const col = COLORS[c.color] || COLORS.sky;
        return (
          <div key={c.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={"flex h-9 w-9 items-center justify-center rounded-full " + col.chip}>
                  <Icon size={18} />
                </span>
                <input
                  value={c.label}
                  onChange={(e) => updateCategory(c.id, { label: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  placeholder="Category name"
                />
              </div>
              <button
                onClick={() => deleteCategory(c.id)}
                disabled={categories.length <= 1}
                title={categories.length <= 1 ? "At least one category is required" : "Delete category"}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Max score</span>
              <input
                type="number"
                min={1}
                max={20}
                value={c.max}
                onChange={(e) => updateCategory(c.id, { max: e.target.value })}
                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              />
              <span className="text-xs text-slate-400">Buttons 0–{c.max} will show while scoring</span>
            </div>

            <div className="mb-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Icon</span>
              <div className="flex flex-wrap gap-1.5">
                {ICON_KEYS.map((key) => {
                  const OptIcon = ICONS[key];
                  const active = c.icon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateCategory(c.id, { icon: key })}
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-lg border transition " +
                        (active
                          ? col.active
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300")
                      }
                    >
                      <OptIcon size={15} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Color</span>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_KEYS.map((key) => {
                  const active = c.color === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateCategory(c.id, { color: key })}
                      className={
                        "h-7 w-7 rounded-full border-2 transition " +
                        COLORS[key].swatch +
                        " " +
                        (active ? "border-slate-700 scale-110" : "border-transparent hover:scale-105")
                      }
                      title={key}
                    />
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Criteria tags <span className="normal-case font-normal text-slate-400">(optional, comma separated)</span>
              </span>
              <input
                value={(c.criteria || []).join(", ")}
                onChange={(e) => updateCriteria(c.id, e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                placeholder="e.g. Eye contact, Posture, Confidence"
              />
            </label>
          </div>
        );
      })}

      <button
        onClick={addCategory}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-bold text-slate-500 transition hover:border-sky-300 hover:text-sky-600"
      >
        <Plus size={16} /> Add category
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState(() => emptyForm(DEFAULT_CATEGORIES));
  const [view, setView] = useState("score"); // "score" | "history" | "settings"
  const [saveNote, setSaveNote] = useState("");
  const [printMode, setPrintMode] = useState(false);
  const [schoolName, setSchoolName] = useState("Presentation Assessment");

  // Load saved categories + assessments on mount (from the browser's localStorage)
  useEffect(() => {
    try {
      const rawCats = localStorage.getItem("yl2-categories");
      if (rawCats) {
        const parsed = JSON.parse(rawCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setForm(emptyForm(parsed));
        }
      }
    } catch (e) {
      // no data saved yet — that's fine
    }
    try {
      const raw = localStorage.getItem("yl2-assessments");
      if (raw) setAssessments(JSON.parse(raw));
    } catch (e) {
      // no data saved yet — that's fine
    }
    try {
      const rawSchool = localStorage.getItem("yl2-school-name");
      if (rawSchool) setSchoolName(rawSchool);
    } catch (e) {
      // no data saved yet — that's fine
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist categories whenever they change, and clamp any current-form
  // scores that now exceed a lowered max.
  useEffect(() => {
    try {
      localStorage.setItem("yl2-categories", JSON.stringify(categories));
    } catch (e) {
      console.error("Could not save categories", e);
    }
    setForm((f) => {
      const validIds = new Set(categories.map((c) => c.id));
      const nextScores = {};
      categories.forEach((c) => {
        const v = f.scores[c.id];
        if (v === null || v === undefined) {
          nextScores[c.id] = null;
        } else {
          nextScores[c.id] = Math.min(v, c.max);
        }
      });
      // Drop scores for categories that no longer exist
      Object.keys(f.scores).forEach((k) => {
        if (!validIds.has(k)) return;
      });
      return { ...f, scores: nextScores };
    });
  }, [categories]);

  // Persist the school/center name whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem("yl2-school-name", schoolName);
    } catch (e) {
      console.error("Could not save school name", e);
    }
  }, [schoolName]);

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

  const persistAssessments = (list) => {
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
    persistAssessments(next);
    setSaveNote(form.id ? "Assessment updated." : "Assessment saved.");
    setTimeout(() => setSaveNote(""), 2000);
    if (!form.id) setForm((f) => ({ ...f, id: next[next.length - 1].id }));
  };

  const handleNew = () => setForm(emptyForm(categories));

  const handleEdit = (a) => {
    setForm(a);
    setView("score");
  };

  const handleDelete = (id) => {
    const next = assessments.filter((a) => a.id !== id);
    setAssessments(next);
    persistAssessments(next);
    if (form.id === id) handleNew();
  };

  const allScored = categories.length > 0 && categories.every((c) => form.scores[c.id] !== null && form.scores[c.id] !== undefined);
  const maxTotal = getMaxTotal(categories);

  if (printMode) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
        <PrintReport form={form} categories={categories} schoolName={schoolName} />
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
                Presentation Scoring
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
            <button
              onClick={() => setView("settings")}
              className={"flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition " + (view === "settings" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200")}
            >
              <SettingsIcon size={15} /> Settings
            </button>
          </div>
        </header>

        {view === "settings" && (
          <CategorySettings
            categories={categories}
            onChange={setCategories}
            schoolName={schoolName}
            onSchoolNameChange={setSchoolName}
          />
        )}

        {view === "history" && (
          <AssessmentHistory assessments={assessments} categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {view === "score" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <StudentForm form={form} onChange={setForm} />
              {categories.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                  No categories yet. Head to Settings to add one.
                </div>
              )}
              {categories.map((cat) => (
                <RubricCard key={cat.id} category={cat} value={form.scores[cat.id]} onSelect={(n) => handleScoreSelect(cat.id, n)} />
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
              <ResultCard scores={form.scores} categories={categories} />
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
                {!allScored && categories.length > 0 && (
                  <p className="text-center text-xs text-slate-400">Score all {categories.length} categories to save or export.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Performance levels</h3>
                <div className="space-y-1.5">
                  {LEVELS.map((l, i) => {
                    const nextMin = i > 0 ? LEVELS[i - 1].minPct : 100;
                    const lo = Math.ceil((l.minPct / 100) * maxTotal);
                    const hi = Math.ceil((nextMin / 100) * maxTotal) - (i === 0 ? 0 : 1);
                    const rangeLabel = i === 0 ? `${lo}–${maxTotal}` : `${lo}–${Math.max(lo, hi)}`;
                    return (
                      <div key={l.label} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span className={"h-1.5 w-1.5 rounded-full " + l.dot} /> {l.label}
                        </span>
                        <span className="font-semibold text-slate-400">{rangeLabel} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}