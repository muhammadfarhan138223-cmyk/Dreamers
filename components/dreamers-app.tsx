"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import {
  LayoutDashboard,
  BookOpen,
  Orbit,
  Target,
  CalendarDays,
  Layers,
  Download,
  Settings,
  Search,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FlaskConical,
  Dna,
  Atom,
  Zap,
  Check,
  CheckCircle2,
  CloudOff,
  Wifi,
  Sun,
  Moon,
  Monitor,
  Trophy,
  Flag,
  Clock,
  Bookmark,
  StickyNote,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Menu,
  ShieldCheck,
  GraduationCap,
  Brain,
  Send,
  Lightbulb,
  RefreshCw,
  Trash2,
  FileDown,
  Star,
  HelpCircle,
  CheckCheck,
  Lock,
  Plus,
} from "lucide-react";
import { validateBackup } from "@/lib/backup.mjs";
import * as db from "@/lib/db";
import { summarize, dueAt } from "@/lib/progress.mjs";
import type {
  Pack,
  LearningEvent,
  Lesson,
  Question,
  RecordValue,
} from "@/lib/types";
const nav = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/learn", "My learning", BookOpen],
  ["/dreamverse", "Dreamverse", Orbit],
  ["/practice", "Practice arena", Target],
  ["/revision", "Revision", CalendarDays],
  ["/flashcards", "Flashcards", Layers],
  ["/downloads", "Downloads", Download],
] as const;
const subjects = [
  {
    id: "biology",
    name: "Biology",
    world: "Life World",
    icon: Dna,
    color: "green",
    caption: "Cells, systems & the science of life",
    count: "1 foundation chapter",
    available: true,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    world: "Atomic World",
    icon: FlaskConical,
    color: "purple",
    caption: "Discover the matter around you",
    count: "Curriculum preparation",
    available: false,
  },
  {
    id: "physics",
    name: "Physics",
    world: "Universe World",
    icon: Atom,
    color: "blue",
    caption: "Explore the rules of our universe",
    count: "Curriculum preparation",
    available: false,
  },
];
const languages = ["English", "Roman Urdu", "Urdu", "Hinglish", "Hindi"];
const modes = [
  "Friendly Teacher",
  "Complete Beginner",
  "Real-Life Examples",
  "Step-by-Step Explanation",
  "Board Examination Answer",
  "Quick Revision",
  "Socratic Learning",
  "I Still Don’t Understand",
];
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
function IconPlanet() {
  return (
    <div className="planet-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="planet">
        <div className="planet-grid" />
        <Dna size={94} strokeWidth={1} />
      </div>
      <span className="satellite sat-one">
        <Atom size={23} />
      </span>
      <span className="satellite sat-two">
        <FlaskConical size={20} />
      </span>
      <span className="little-star">✦</span>
      <span className="planet-dot" />
    </div>
  );
}
function CellDiagram() {
  const [selected, setSelected] = useState("Nucleus");
  const info: Record<string, string> = {
    Nucleus: "Contains most of the eukaryotic cell’s DNA.",
    Mitochondrion: "A major site of aerobic respiration and ATP production.",
    Membrane: "A selectively permeable boundary controlling exchange.",
    Cytoplasm: "An environment for many cellular chemical reactions.",
  };
  return (
    <div className="diagram">
      <div>
        <span className="eyebrow">EXPLORE THE CELL</span>
        <h3>Small parts. Extraordinary teamwork.</h3>
        <p>Tap a label to discover its role.</p>
        <div className="diagram-labels">
          {Object.keys(info).map((s) => (
            <button
              className={selected === s ? "chosen" : ""}
              onClick={() => setSelected(s)}
              key={s}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="diagram-info" aria-live="polite">
          <b>{selected}.</b> {info[selected]}
        </p>
      </div>
      <svg
        viewBox="0 0 320 230"
        role="img"
        aria-label="Simplified animal cell: membrane encloses cytoplasm, a nucleus and mitochondria"
      >
        <defs>
          <radialGradient id="cell">
            <stop stopColor="#366bba" stopOpacity=".5" />
            <stop offset="1" stopColor="#143970" stopOpacity=".2" />
          </radialGradient>
        </defs>
        <ellipse
          cx="160"
          cy="115"
          rx="144"
          ry="98"
          fill="url(#cell)"
          stroke={selected === "Membrane" ? "#fff" : "#5dd9ff"}
          strokeWidth="3"
        />
        <ellipse
          cx="153"
          cy="112"
          rx="47"
          ry="39"
          fill="#765bdd"
          stroke={selected === "Nucleus" ? "#fff" : "#b69bff"}
          strokeWidth="2"
        />
        <circle cx="160" cy="110" r="13" fill="#c9b6ff" />
        {[
          [70, 70],
          [231, 143],
          [84, 156],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 35})`}>
            <rect
              x="-20"
              y="-10"
              width="40"
              height="20"
              rx="10"
              fill="#27a393"
              stroke={selected === "Mitochondrion" ? "#fff" : "#71f1d8"}
              strokeWidth="2"
            />
            <path d="M-12 0l6-5 6 10 6-10 6 5" stroke="#a8fff2" fill="none" />
          </g>
        ))}
        {[
          [221, 62],
          [255, 91],
          [112, 49],
          [179, 177],
          [50, 115],
          [119, 180],
          [200, 54],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#56d8ff" />
        ))}
      </svg>
      <small>
        Simplified animal cell illustration; structures are not to scale.
      </small>
    </div>
  );
}
export default function DreamersApp() {
  const [path, setPath] = useState("/dashboard"),
    [pack, setPack] = useState<Pack | null>(null),
    [events, setEvents] = useState<LearningEvent[]>([]),
    [notes, setNotes] = useState<RecordValue[]>([]),
    [cards, setCards] = useState<RecordValue[]>([]),
    [prefs, setPrefs] = useState<RecordValue>({
      id: "profile",
      name: "Explorer",
      class: "XI",
      theme: "dark",
    }),
    [online, setOnline] = useState(true),
    [ready, setReady] = useState(false),
    [initPhase, setInitPhase] = useState("Preparing your learning universe…"),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [install, setInstall] = useState<InstallEvent | null>(null),
    [swReady, setSwReady] = useState(false),
    [update, setUpdate] = useState<ServiceWorker | null>(null),
    [query, setQuery] = useState(""),
    [searchText, setSearchText] = useState(""),
    [busy, setBusy] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [quizType, setQuizType] = useState("mcq"),
    [reviewOnly, setReviewOnly] = useState(false),
    [reviewIds, setReviewIds] = useState<string[]>([]),
    [written, setWritten] = useState(""),
    [reveal, setReveal] = useState(false),
    [shortAnswers, setShortAnswers] = useState<Record<string, string>>({}),
    [quizDone, setQuizDone] = useState(false);
  const [aiTopic, setAiTopic] = useState("cell-basics"),
    [language, setLanguage] = useState("English"),
    [mode, setMode] = useState(modes[0]),
    [aiInput, setAiInput] = useState(""),
    [chat, setChat] = useState<{ role: string; text: string }[]>([]),
    [aiBusy, setAiBusy] = useState(false),
    [aiConfigured, setAiConfigured] = useState(false),
    [noteText, setNoteText] = useState(""),
    [flipped, setFlipped] = useState(false),
    [flashIndex, setFlashIndex] = useState(0),
    [planDays, setPlanDays] = useState(14),
    [examDate, setExamDate] = useState(""),
    [plan, setPlan] = useState<RecordValue | null>(null),
    [storageBytes, setStorageBytes] = useState(0),
    [showDelete, setShowDelete] = useState(false),
    [speaking, setSpeaking] = useState(false),
    [voiceName, setVoiceName] = useState(""),
    [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const state = summarize(events);
  const say = useCallback((s: string) => {
    setToast(s);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }, []);
  const refresh = useCallback(async () => {
    const [p, e, n, c, s] = await Promise.all([
      db.list<Pack>("packs"),
      db.list<LearningEvent>("events"),
      db.list<RecordValue>("notes"),
      db.list<RecordValue>("cards"),
      db.list<RecordValue>("settings"),
    ]);
    setPack(p.find((p) => p.id === "cells-starter") || null);
    setEvents(e);
    setNotes(n);
    setCards(c);
    const profile = s.find((v) => v.id === "profile");
    if (profile) setPrefs(profile);
    setPlan(s.find((v) => v.id === "plan") || null);
    if (p.length)
      setStorageBytes(new TextEncoder().encode(JSON.stringify(p[0])).length);
  }, []);
  const navigate = useCallback((url: string) => {
    history.pushState({}, "", url);
    setPath(url.split("?")[0]);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    setQuizIndex(0);
    setChoice(null);
    setChecked(false);
    setQuizDone(false);
    setReveal(false);
    setWritten("");
    setReviewOnly(false);
  }, []);
  useEffect(() => {
    setPath(location.pathname === "/" ? "/dashboard" : location.pathname);
    setOnline(navigator.onLine);
    const sync = () => setOnline(navigator.onLine);
    const pop = () => {
      setPath(location.pathname === "/" ? "/dashboard" : location.pathname);
      setQuizIndex(0);
      setChecked(false);
      setChoice(null);
      setReveal(false);
      setQuizDone(false);
    };
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    window.addEventListener("popstate", pop);
    const installHandler = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", installHandler);
    (async () => {
      try {
        setInitPhase("Opening your device learning storage…");
        await refresh();
        setInitPhase("Preparing the starter learning pack…");
        if (
          !(await db.list<RecordValue>("settings")).some(
            (s) => s.id === "starter-initialized",
          )
        ) {
          await db.installPack();
          await db.put("settings", {
            id: "starter-initialized",
            at: Date.now(),
          });
        }
        await refresh();
        const settings = await db.list<RecordValue>("settings");
        setShortAnswers(
          Object.fromEntries(
            settings
              .filter((v) => v.id.startsWith("draft:"))
              .map((v) => [v.id.slice(6), String(v.text || "")]),
          ),
        );
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Offline storage is unavailable. Please enable browser storage.",
        );
      } finally {
        setReady(true);
      }
    })();
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          await navigator.serviceWorker.ready;
          setSwReady(true);
          if (reg.waiting) setUpdate(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (sw)
              sw.addEventListener("statechange", () => {
                if (
                  sw.state === "installed" &&
                  navigator.serviceWorker.controller
                )
                  setUpdate(sw);
              });
          });
        })
        .catch(() =>
          setError(
            "Offline app shell could not be prepared. Reconnect and reload before going offline.",
          ),
        );
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((v) => setAiConfigured(v.aiConfigured))
      .catch(() => {});
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("beforeinstallprompt", installHandler);
    };
  }, [refresh]);
  useEffect(() => {
    const value = String(prefs.theme || "dark");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        value === "system" ? (media.matches ? "dark" : "light") : value);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs.theme]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  const link = (url: string, label: ReactNode, cls = "") => (
    <a
      href={url}
      className={cls}
      aria-label={
        url === "/profile"
          ? "Open guest profile"
          : cls === "circle-button"
            ? "Open learning resource"
            : undefined
      }
      onClick={(e) => {
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          navigate(url);
        }
      }}
    >
      {label}
    </a>
  );
  async function safe(action: () => Promise<void>) {
    try {
      await action();
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This action could not be saved. Your previous work is preserved.",
      );
    }
  }
  async function complete(id: string) {
    await safe(async () => {
      await db.record({
        id: `lesson:${id}`,
        kind: "lesson",
        target: id,
        at: Date.now(),
      });
      await refresh();
      say(
        state.completed.includes(id)
          ? "Already in your discoveries. Review anytime!"
          : "Discovery saved. +25 XP for your first completion.",
      );
      if (pack) {
        const idx = pack.lessons.findIndex((l) => l.id === id);
        if (idx < pack.lessons.length - 1)
          navigate(`/learn/biology/cells/${pack.lessons[idx + 1].id}`);
        else navigate("/practice/biology");
      }
    });
  }
  async function downloadPack() {
    setBusy(true);
    await safe(async () => {
      const r = await db.installPack();
      await refresh();
      setStorageBytes(r.bytes);
      say("Chapter pack is ready for offline learning.");
      if (navigator.storage?.persist) await navigator.storage.persist();
    });
    setBusy(false);
  }
  async function savePrefs(next: RecordValue) {
    await safe(async () => {
      await db.put("settings", next);
      setPrefs(next);
      say("Preferences saved on this device.");
    });
  }
  const currentLesson = pack?.lessons.find((l) => path.endsWith("/" + l.id));
  const progress = Math.round((state.completed.length / 4) * 100);
  const continueLesson =
    pack?.lessons.find((l) => !state.completed.includes(l.id)) ||
    pack?.lessons[0];
  const lessonUrl = (l: Lesson) => `/learn/biology/cells/${l.id}`;
  const heading = (eyebrow: string, title: string, description?: string) => (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
  const emptyPack = (
    <div className="empty panel">
      <Download size={38} />
      <h2>Your next discovery is one download away.</h2>
      <p>
        Get the compact starter pack: 4 lessons, 12 MCQs and 3 written
        questions.
      </p>
      <button className="primary" onClick={downloadPack} disabled={busy}>
        {busy ? "Preparing…" : "Download starter pack"}
        <Download size={17} />
      </button>
    </div>
  );
  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      say(
        "Read-aloud is unavailable in this browser. All content is available as text.",
      );
      return;
    }
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const speech = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) speech.voice = voice;
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => {
      setSpeaking(false);
      say("Your browser could not play this voice.");
    };
    speechSynthesis.speak(speech);
    setSpeaking(true);
  }
  async function askAI(input = aiInput, selectedMode = mode) {
    if (!input.trim() || aiBusy) return;
    if (!online) {
      say(
        "Dreamers AI is offline. Your downloaded lessons and practice activities are still available.",
      );
      return;
    }
    setChat((c) => [...c, { role: "user", text: input }]);
    setAiInput("");
    setAiBusy(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          language,
          mode: selectedMode,
          topic: aiTopic,
          previous:
            chat
              .filter((c) => c.role === "assistant")
              .at(-1)
              ?.text.slice(0, 2000) || "",
        }),
      });
      const value = await r.json();
      if (!r.ok)
        throw new Error(value.error || "The AI teacher is unavailable.");
      setChat((c) => [...c, { role: "assistant", text: value.answer }]);
      await db.put("notes", {
        id: crypto.randomUUID(),
        kind: "ai",
        text: value.answer,
        title: input,
        at: Date.now(),
      });
      await refresh();
    } catch (e) {
      setChat((c) => [
        ...c,
        {
          role: "status",
          text:
            e instanceof Error
              ? e.message
              : "Connection failed. Please try again.",
        },
      ]);
    } finally {
      setAiBusy(false);
    }
  }
  const filteredQuestions =
    pack?.questions.filter((q) => !reviewOnly || reviewIds.includes(q.id)) ||
    [];
  const question = filteredQuestions[quizIndex];
  const wQuestions = pack?.written.filter((q) => q.type === quizType) || [];
  const wQuestion = wQuestions[quizIndex % Math.max(1, wQuestions.length)];
  async function checkAnswer() {
    if (choice === null || !question || checked) return;
    await safe(async () => {
      await db.record({
        id: crypto.randomUUID(),
        kind: "attempt",
        target: question.id,
        answer: choice,
        correct: choice === question.answer,
        at: Date.now(),
      });
      await refresh();
      setChecked(true);
    });
  }
  const nextQuestion = () => {
    if (quizIndex >= filteredQuestions.length - 1) {
      setQuizDone(true);
      return;
    }
    setQuizIndex((i) => i + 1);
    setChoice(null);
    setChecked(false);
  };
  const badge = (
    <span className="content-badge">
      <ShieldCheck size={13} /> Original • educator review pending
    </span>
  );
  let content: ReactNode;
  if (!ready)
    content = (
      <div className="empty">
        <div className="loading-orbit" />
        <h2>{initPhase}</h2>
      </div>
    );
  else if (path === "/dashboard" || path === "/")
    content = (
      <>
        <div className="greeting">
          <div>
            <span className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span>
            <h1>
              Your next discovery awaits<span className="blue">.</span>
            </h1>
            <p>Big dreams start with small steps. Let’s take one today.</p>
          </div>
          <span className="session-badge">
            <span /> Your own pace. Your own adventure.
          </span>
        </div>
        <div className="dashboard-top">
          <section className="hero panel">
            <div className="hero-content">
              <span className="hero-kicker">
                <span /> WELCOME TO YOUR LEARNING UNIVERSE
              </span>
              <h2>
                Don’t just study it.
                <br />
                <span>Understand it.</span>
              </h2>
              <p>
                Explore tiny cells. Ask big questions.
                <br />
                Turn “I don’t get it” into “I’ve got this.”
              </p>
              {link(
                continueLesson ? lessonUrl(continueLesson) : "/learn",
                <>
                  Let’s explore <ArrowRight size={17} />
                </>,
                "primary",
              )}
              <div className="hero-foot">
                <CloudOff size={15} />
                <span>Learn anywhere. Even without internet.</span>
              </div>
            </div>
            <IconPlanet />
            <div className="hero-coordinates">01 / LIFE WORLD</div>
          </section>
          <section className="mission panel">
            <div className="section-label">
              <span>
                <Flag size={16} /> YOUR NEXT MISSION
              </span>
              <span className="mini-icon">✦</span>
            </div>
            <div className="mission-art">
              <Target size={37} strokeWidth={1.4} />
            </div>
            <h3>
              {state.completed.length
                ? "Keep the curiosity going"
                : "Make your first discovery"}
            </h3>
            <p>
              {state.completed.length
                ? "Take the next lesson, then test what you remember."
                : "Meet the tiny building blocks that make life possible."}
            </p>
            <div className="mission-meta">
              <span>
                <Clock size={14} /> 4–6 min
              </span>
              <span className="xp">
                <Zap size={14} /> +25 XP first time
              </span>
            </div>
            {link(
              continueLesson ? lessonUrl(continueLesson) : "/learn",
              <>
                Start mission <ArrowRight size={16} />
              </>,
              "secondary full",
            )}
          </section>
        </div>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-icon blue-bg">
              <Zap size={20} />
            </span>
            <div>
              <strong>
                {state.xp}
                <small> XP</small>
              </strong>
              <span>Knowledge earned</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon green-bg">
              <BookOpen size={20} />
            </span>
            <div>
              <strong>
                {state.completed.length}
                <small> / 4</small>
              </strong>
              <span>Lessons discovered</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon purple-bg">
              <Target size={20} />
            </span>
            <div>
              <strong>
                {state.accuracy === null ? "—" : state.accuracy + "%"}
                <small>{state.attempts ? "" : " yet"}</small>
              </strong>
              <span>
                {state.attempts
                  ? `${state.attempts} practice attempts`
                  : "Your practice starts here"}
              </span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon amber-bg">
              <Trophy size={20} />
            </span>
            <div>
              <strong>{state.level}</strong>
              <span>Your explorer level</span>
            </div>
          </div>
        </div>
        <div className="section-heading">
          <div>
            <h2>Choose your world</h2>
            <p>Different subjects. Endless possibilities.</p>
          </div>
          {link(
            "/subjects",
            <>
              All subjects <ArrowRight size={15} />
            </>,
            "text-link",
          )}
        </div>
        <div className="subject-grid">
          {subjects.map((s) => (
            <a
              href={`/learn/${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/learn/${s.id}`);
              }}
              className={`subject-card ${s.color}`}
              key={s.id}
            >
              <div className="subject-top">
                <span className="subject-icon">
                  <s.icon size={27} strokeWidth={1.6} />
                </span>
                <span className="world-label">{s.world.toUpperCase()}</span>
                <ChevronRight size={17} />
              </div>
              <h3>{s.name}</h3>
              <p>{s.caption}</p>
              <div className="subject-footer">
                <span>{s.count}</span>
                <span className={s.available ? "available" : "planned"}>
                  {s.available ? "Explore now" : "Coming later"}
                </span>
              </div>
              <div className="subject-decoration">
                <s.icon size={112} strokeWidth={0.7} />
              </div>
            </a>
          ))}
        </div>
        <div className="dashboard-bottom">
          <section className="panel journey">
            <div className="section-heading">
              <div>
                <h2>Your first adventure</h2>
                <p>Cells & membranes · Biology foundations</p>
              </div>
              {link(
                "/learn/biology/cells",
                <ArrowRight size={19} />,
                "circle-button",
              )}
            </div>
            <div className="journey-track">
              {(pack?.lessons || []).map((l, i) => (
                <a
                  href={lessonUrl(l)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(lessonUrl(l));
                  }}
                  className={`journey-stop ${state.completed.includes(l.id) ? "done" : ""}`}
                  key={l.id}
                >
                  <span>
                    {state.completed.includes(l.id) ? (
                      <Check size={19} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <b>
                    {["Cell basics", "Organelles", "Membranes", "Osmosis"][i]}
                  </b>
                  <small>{l.minutes} min</small>
                </a>
              ))}
            </div>
            <div className="progress-line">
              <span style={{ width: progress + "%" }} />
            </div>
            <div className="between muted tiny">
              <span>{state.completed.length} of 4 lessons completed</span>
              <span>{progress}% explored</span>
            </div>
          </section>
          <section className="zero-card">
            <div className="zero-icon">
              <Sparkles size={23} />
            </div>
            <span className="eyebrow">A FRESH START</span>
            <h3>
              “I know nothing.”
              <br />
              That’s a great place to start.
            </h3>
            <p>No judgement. Just a small plan and your first step.</p>
            {link(
              "/exams",
              <>
                Start from zero <ArrowRight size={16} />
              </>,
              "text-link",
            )}
          </section>
        </div>
      </>
    );
  else if (path === "/learn" || path === "/subjects")
    content = (
      <>
        {heading(
          "YOUR LEARNING LIBRARY",
          "Find your next “aha!” moment.",
          "Begin with our original Biology foundation pack. Official Punjab editions will be added after verification.",
        )}
        <div className="subject-grid">
          {subjects.map((s) => (
            <div className={`subject-card ${s.color}`} key={s.id}>
              <s.icon size={32} />
              <h2>{s.name}</h2>
              <p>{s.caption}</p>
              {link(
                `/learn/${s.id}`,
                s.available ? "Explore chapter →" : "View curriculum status →",
                "text-link",
              )}
            </div>
          ))}
        </div>
        <div className="panel notice">
          <ShieldCheck />
          <div>
            <h3>Clarity before coverage.</h3>
            <p>
              This release teaches original foundation concepts. It does not
              claim to cover a verified textbook edition or all examination
              questions. Compulsory subjects and Class XI/XII textbook mapping
              are in the roadmap.
            </p>
          </div>
        </div>
      </>
    );
  else if (
    path.startsWith("/learn/chemistry") ||
    path.startsWith("/learn/physics")
  ) {
    const s = subjects.find((s) => path.includes(s.id))!;
    content = (
      <>
        {heading(
          s.world.toUpperCase(),
          `${s.name} is taking shape.`,
          "Content for this world has not been published yet.",
        )}
        <div className="panel empty">
          <s.icon size={56} />
          <h2>Good learning starts with accurate content.</h2>
          <p>
            Verified edition mapping, original lessons and reviewed practice are
            the next steps for this subject.
          </p>
          {link(
            "/learn/biology/cells",
            <>
              Explore the available Biology chapter <ArrowRight size={16} />
            </>,
            "primary",
          )}
        </div>
      </>
    );
  } else if (currentLesson)
    content = (
      <>
        {link(
          "/learn/biology/cells",
          <>
            <ArrowLeft size={15} /> Chapter map
          </>,
          "text-link back",
        )}
        {heading(
          "BIOLOGY / CELLS & MEMBRANES",
          currentLesson.title,
          currentLesson.subtitle,
        )}
        <div className="lesson-layout">
          <article className="panel lesson">
            <div className="between">
              {badge}
              <button
                className="icon-text"
                onClick={() => speak(currentLesson.paragraphs.join(" "))}
              >
                {speaking ? <VolumeX size={17} /> : <Volume2 size={17} />}{" "}
                {speaking ? "Stop" : "Read aloud"}
              </button>
            </div>
            <div className="objective">
              <Lightbulb size={19} />
              <p>
                <b>Your discovery goal</b>
                <br />
                {currentLesson.objective}
              </p>
            </div>
            {currentLesson.paragraphs.map((p, i) => (
              <p className="lesson-p" key={i}>
                {p}
              </p>
            ))}
            <div className="example">
              <span className="eyebrow">MAKE IT REAL</span>
              <p>{currentLesson.example}</p>
            </div>
            <details>
              <summary>Explain in simple Roman Urdu</summary>
              <p>{currentLesson.simple}</p>
            </details>
            {currentLesson.id === "organelles" && <CellDiagram />}
            {currentLesson.id === "osmosis" && <OsmosisLab />}
            <h3>Take these with you</h3>
            <ul className="takeaways">
              {currentLesson.takeaways.map((t) => (
                <li key={t}>
                  <CheckCircle2 size={17} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="recall">
              <Brain size={23} />
              <div>
                <b>Close your notes. Try to explain.</b>
                <p>{currentLesson.check}</p>
                <small>
                  This is a self-reflection prompt, not an automatically graded
                  answer.
                </small>
              </div>
            </div>
            <button
              className="primary"
              onClick={() => complete(currentLesson.id)}
            >
              {state.completed.includes(currentLesson.id)
                ? "Review complete"
                : "I explored this lesson"}{" "}
              <Check size={17} />
            </button>
          </article>
          <aside className="lesson-aside">
            <div className="panel">
              <h3>Your chapter path</h3>
              {pack?.lessons.map((l, i) =>
                link(
                  lessonUrl(l),
                  <>
                    <span className="lesson-number">
                      {state.completed.includes(l.id) ? (
                        <Check size={14} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span>{l.subtitle}</span>
                  </>,
                  `lesson-nav ${l.id === currentLesson.id ? "selected" : ""}`,
                ),
              )}
            </div>
            <div className="panel help-card">
              <Sparkles />
              <h3>A question is a good thing.</h3>
              <p>Try a different explanation, one step at a time.</p>
              <button
                className="secondary full"
                onClick={() => {
                  setAiTopic(currentLesson.id);
                  setAiInput(`Help me understand ${currentLesson.subtitle}.`);
                  navigate("/ai-tutor");
                }}
              >
                Ask Dreamers AI <ArrowRight size={15} />
              </button>
              <small>
                {online
                  ? aiConfigured
                    ? "Online AI configured"
                    : "Owner AI setup required"
                  : "Remote AI unavailable offline"}
              </small>
            </div>
            <button
              className="secondary full"
              onClick={() =>
                safe(async () => {
                  await db.put("notes", {
                    id: `bookmark:${currentLesson.id}`,
                    kind: "bookmark",
                    title: currentLesson.title,
                    href: lessonUrl(currentLesson),
                    at: Date.now(),
                  });
                  await refresh();
                  say("Lesson bookmarked.");
                })
              }
            >
              <Bookmark size={16} /> Bookmark lesson
            </button>
          </aside>
        </div>
      </>
    );
  else if (path.startsWith("/learn/biology"))
    content = (
      <>
        {heading(
          "LIFE WORLD · ORIGINAL FOUNDATION CHAPTER",
          "Small cells. Big discoveries.",
          pack?.description,
        )}
        {!pack ? (
          emptyPack
        ) : (
          <>
            <div className="chapter-hero panel">
              <CellDiagram />
              <div className="chapter-meta">
                <span>
                  <BookOpen size={16} /> 4 lessons
                </span>
                <span>
                  <Clock size={16} /> About 20 minutes
                </span>
                <span>
                  <Target size={16} /> 15 questions
                </span>
                {badge}
              </div>
            </div>
            <div className="lesson-list">
              {pack.lessons.map((l, i) => (
                <div className="panel lesson-row" key={l.id}>
                  <span
                    className={`lesson-step ${state.completed.includes(l.id) ? "complete" : ""}`}
                  >
                    {state.completed.includes(l.id) ? (
                      <Check />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <small className="eyebrow">DISCOVERY {i + 1}</small>
                    <h3>{l.title}</h3>
                    <p>
                      {l.subtitle} · {l.minutes} min
                    </p>
                  </div>
                  {link(
                    lessonUrl(l),
                    <>
                      {state.completed.includes(l.id) ? "Revisit" : "Explore"}{" "}
                      <ArrowRight size={16} />
                    </>,
                    "secondary",
                  )}
                </div>
              ))}
            </div>
            <div className="panel between">
              <div>
                <h3>Ready for the chapter challenge?</h3>
                <p className="muted">
                  Practice 12 concepts with immediate explanations.
                </p>
              </div>
              {link(
                "/practice/biology",
                <>
                  Enter practice arena <Target size={17} />
                </>,
                "primary",
              )}
            </div>
            <p className="fineprint">
              {pack.edition}. {pack.board}. Questions are original, not official
              past-paper items.
            </p>
          </>
        )}
      </>
    );
  else if (path.startsWith("/practice"))
    content = (
      <>
        {heading(
          "PRACTICE ARENA",
          "A little challenge. A lot of learning.",
          "Try, reflect, try again. Every answer is a chance to understand.",
        )}
        <div className="tabs">
          {[
            ["mcq", "MCQs"],
            ["short", "Short answers"],
            ["long", "Long answers"],
          ].map(([id, label]) => (
            <button
              className={quizType === id ? "active" : ""}
              onClick={() => {
                setQuizType(id);
                setQuizIndex(0);
                setChoice(null);
                setChecked(false);
                setReveal(false);
                setWritten("");
                setQuizDone(false);
              }}
              key={id}
            >
              {label}
            </button>
          ))}
          <button
            className={reviewOnly ? "active" : ""}
            onClick={() => {
              setReviewIds(state.mistakes);
              setReviewOnly(!reviewOnly);
              setQuizIndex(0);
              setChoice(null);
              setChecked(false);
              setQuizDone(false);
              setQuizType("mcq");
            }}
          >
            <RotateCcw size={15} /> Mistake review ({state.mistakes.length})
          </button>
        </div>
        {!pack ? (
          emptyPack
        ) : quizType === "mcq" ? (
          quizDone ? (
            <div className="panel quiz-result empty">
              <Trophy size={58} />
              <span className="eyebrow">CHALLENGE COMPLETE</span>
              <h2>You showed up. You learned.</h2>
              <p>
                Your attempts are saved. Use mistake review to revisit concepts
                that need another look.
              </p>
              <div className="stat-row">
                <div>
                  <strong>{state.correct.length}/12</strong>
                  <p>Questions answered correctly at least once</p>
                </div>
                <div>
                  <strong>{state.xp} XP</strong>
                  <p>Lifetime discovery points</p>
                </div>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setQuizDone(false);
                  setQuizIndex(0);
                  setChoice(null);
                  setChecked(false);
                }}
              >
                Practice again <RotateCcw size={17} />
              </button>
              {link("/progress", "See your learning evidence →", "text-link")}
            </div>
          ) : question ? (
            <section className="panel quiz">
              <div className="between">
                <span className="eyebrow">
                  {reviewOnly ? "MISTAKE DETECTIVE" : "CONCEPT CHALLENGE"}
                </span>
                <span className="muted tiny">
                  {quizIndex + 1} / {filteredQuestions.length}
                </span>
              </div>
              <div className="progress-line">
                <span
                  style={{
                    width:
                      ((quizIndex + 1) / filteredQuestions.length) * 100 + "%",
                  }}
                />
              </div>
              <div className="question-meta">
                <span>{question.difficulty}</span>
                <span>{question.marks} mark</span>
                <span>Original practice</span>
              </div>
              <h2>{question.prompt}</h2>
              <div className="answer-options">
                {question.options.map((o, i) => (
                  <button
                    disabled={checked}
                    className={`answer ${choice === i ? "picked" : ""} ${checked && i === question.answer ? "correct" : ""} ${checked && choice === i && i !== question.answer ? "incorrect" : ""}`}
                    onClick={() => setChoice(i)}
                    key={o}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {o}
                    {checked && i === question.answer && (
                      <CheckCircle2 size={20} />
                    )}
                  </button>
                ))}
              </div>
              {checked && (
                <div
                  className={`feedback ${choice === question.answer ? "positive" : ""}`}
                  role="status"
                >
                  <h3>
                    {choice === question.answer
                      ? "You’ve got it!"
                      : "Let’s investigate this together."}
                  </h3>
                  <p>{question.explanation}</p>
                  {choice !== question.answer && (
                    <>
                      <p>
                        <b>Try asking yourself:</b> which part of the definition
                        rules out your selected answer? One wrong answer alone
                        cannot tell us why you chose it.
                      </p>
                      {link(
                        `/learn/biology/cells/${question.topic}`,
                        <>
                          Revisit the concept <ArrowRight size={15} />
                        </>,
                        "text-link",
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="between quiz-actions">
                <span className="muted tiny">
                  {checked
                    ? "Attempt saved on this device"
                    : "Choose the best answer"}
                </span>
                {checked ? (
                  <button className="primary" onClick={nextQuestion}>
                    {quizIndex === filteredQuestions.length - 1
                      ? "See results"
                      : "Next discovery"}{" "}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="primary"
                    disabled={choice === null}
                    onClick={checkAnswer}
                  >
                    Check answer <Check size={16} />
                  </button>
                )}
              </div>
            </section>
          ) : (
            <div className="panel empty">
              <CheckCheck size={43} />
              <h2>No unresolved mistakes yet.</h2>
              <p>
                Complete some practice. Your latest incorrect answers will
                appear here.
              </p>
              <button className="primary" onClick={() => setReviewOnly(false)}>
                Practice all questions
              </button>
            </div>
          )
        ) : wQuestion ? (
          <section className="panel quiz">
            <div className="between">
              {badge}
              <span className="muted">
                {wQuestion.marks} marks · self-check
              </span>
            </div>
            <h2>{wQuestion.prompt}</h2>
            <label className="field">
              Your answer
              <textarea
                value={shortAnswers[wQuestion.id] ?? written}
                onChange={(e) => {
                  setWritten(e.target.value);
                  setShortAnswers((s) => ({
                    ...s,
                    [wQuestion.id]: e.target.value,
                  }));
                }}
                placeholder="Explain it in your own words…"
                rows={6}
              />
            </label>
            <div className="between">
              <button
                className="secondary"
                onClick={() =>
                  safe(async () => {
                    await db.put("settings", {
                      id: `draft:${wQuestion.id}`,
                      text: shortAnswers[wQuestion.id] ?? written,
                    });
                    say("Your written answer was saved.");
                  })
                }
              >
                Save draft <StickyNote size={15} />
              </button>
              <button className="primary" onClick={() => setReveal(!reveal)}>
                {reveal ? "Hide" : "Show"} self-check answer
              </button>
            </div>
            {reveal && (
              <div className="feedback positive">
                <h3>Compare your reasoning</h3>
                <p>{wQuestion.answer}</p>
                <ul>
                  {wQuestion.keyPoints.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
                <small>
                  Suggested original answer, awaiting educator review. Offline
                  written answers are not automatically graded.
                </small>
              </div>
            )}
            <button
              className="text-link"
              onClick={() => {
                setQuizIndex((i) => i + 1);
                setReveal(false);
                setWritten("");
              }}
            >
              Next written question <ArrowRight size={15} />
            </button>
          </section>
        ) : (
          emptyPack
        )}
      </>
    );
  else if (path === "/dreamverse" || path === "/achievements")
    content = (
      <>
        {heading(
          "THE DREAMVERSE",
          "Every discovery takes you further.",
          "Progress comes from understanding, not racing other learners.",
        )}
        <div className="world-banner panel">
          <IconPlanet />
          <div>
            <span className="eyebrow">LIFE WORLD</span>
            <h2>You are a {state.level}.</h2>
            <p>
              {state.xp} XP earned from {state.completed.length} lessons and{" "}
              {state.correct.length} different questions answered correctly.
            </p>
            <div className="progress-line">
              <span
                style={{ width: Math.min(100, (state.xp / 270) * 100) + "%" }}
              />
            </div>
            <small>
              Starter chapter maximum: 270 XP. Repeats are welcome; rewards are
              not duplicated.
            </small>
          </div>
        </div>
        <div className="panel map">
          <span className="eyebrow">YOUR EXPEDITION / CELLS & MEMBRANES</span>
          <div className="map-path">
            {pack?.lessons.map((l, i) => (
              <div
                className={`map-node node-${i} ${state.completed.includes(l.id) ? "done" : ""}`}
                key={l.id}
              >
                {link(
                  lessonUrl(l),
                  <>
                    <span>
                      {state.completed.includes(l.id) ? (
                        <Check size={25} />
                      ) : (
                        <BookOpen size={24} />
                      )}
                    </span>
                    <b>{l.subtitle}</b>
                    <small>Discovery {i + 1} · 25 XP</small>
                  </>,
                )}
              </div>
            ))}
            <div className="map-node boss">
              {link(
                "/practice/biology",
                <>
                  <span>
                    <Trophy size={27} />
                  </span>
                  <b>The cell challenge</b>
                  <small>12 questions · practice anytime</small>
                </>,
              )}
            </div>
          </div>
        </div>
        <div className="section-heading">
          <h2>Your achievements</h2>
          <span className="muted">{state.achievements.length} / 3 earned</span>
        </div>
        <div className="subject-grid">
          {[
            ["First discovery", "Complete your first lesson", BookOpen],
            ["Cell explorer", "Explore all four lessons", Dna],
            ["Curious mind", "Answer 10 different MCQs correctly", Brain],
          ].map(([title, desc, Icon]) => {
            const earned = state.achievements.includes(String(title));
            const I = Icon as typeof Brain;
            return (
              <div
                className={`panel achievement ${earned ? "earned" : ""}`}
                key={String(title)}
              >
                <I size={35} />
                <h3>{String(title)}</h3>
                <p>{String(desc)}</p>
                <span>
                  {earned
                    ? "Earned — well explored!"
                    : "A discovery waiting for you"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="fineprint">
          Explorer unlocks at 100 XP; Thinker at 200 XP. Higher ranks will
          follow reviewed advanced challenges.
        </p>
      </>
    );
  else if (path === "/downloads")
    content = (
      <>
        {heading(
          "LEARN WITHOUT LIMITING YOUR LOCATION",
          "Your knowledge. Ready to go.",
          "Small downloads, useful learning. You decide what stays on this device.",
        )}
        <div className="panel download-status">
          <span className={`status-orb ${swReady ? "ok" : ""}`}>
            <CloudOff size={25} />
          </span>
          <div>
            <h3>
              {swReady
                ? "Your app shell is ready offline"
                : "Preparing offline app shell"}
            </h3>
            <p>
              {swReady
                ? "Open this app again without internet. Downloaded content and your progress stay available."
                : "Keep this page online until the service worker is ready."}
            </p>
          </div>
          <span className="pill">{swReady ? "Ready" : "Preparing"}</span>
        </div>
        <section className="panel download-pack">
          <div className="download-cover">
            <Dna size={54} />
            <span>LIFE WORLD</span>
          </div>
          <div>
            <span className="eyebrow">COMPACT STARTER PACK · VERSION 1</span>
            <h2>Cells & membranes</h2>
            <p>
              4 original lessons · 12 MCQs · 2 short questions · 1 long question
              · interactive cell diagram
            </p>
            <div className="pack-tags">
              <span>
                {storageBytes
                  ? `${(storageBytes / 1024).toFixed(1)} KB`
                  : "Under 30 KB"}
              </span>
              <span>English + Roman Urdu summaries</span>
              <span>{pack ? "Downloaded on this device" : "Available"}</span>
            </div>
            <div className="actions">
              <button
                className="primary"
                disabled={busy}
                onClick={downloadPack}
              >
                {busy
                  ? "Preparing…"
                  : pack
                    ? "Check / refresh pack"
                    : "Download pack"}
                <Download size={16} />
              </button>
              {pack && (
                <button
                  className="secondary"
                  onClick={() =>
                    safe(async () => {
                      await db.remove("packs", "cells-starter");
                      await refresh();
                      say(
                        "Learning pack removed. Your progress and notes were preserved.",
                      );
                    })
                  }
                >
                  Remove content <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </section>
        <div className="two-col">
          <div className="panel">
            <h3>Install Dreamers</h3>
            <p>
              Use the install button when your browser offers it. On Android
              Chrome, look for “Install app” in the browser menu. On iOS Safari,
              use Share → Add to Home Screen.
            </p>
            <button
              className="secondary"
              onClick={async () => {
                if (install) {
                  await install.prompt();
                  const c = await install.userChoice;
                  if (c.outcome === "accepted") setInstall(null);
                } else
                  say(
                    "Use your browser menu to install. Availability depends on browser and device support.",
                  );
              }}
            >
              <Download size={16} />{" "}
              {install ? "Install app" : "Installation guidance"}
            </button>
            <p className="fineprint">
              A shortcut alone does not establish offline support. Check the app
              shell status above.
            </p>
          </div>
          <div className="panel">
            <h3>Your progress stays yours.</h3>
            <p>
              Guest progress is saved on this device. Cloud synchronization is
              not enabled in this release; pending records are retained for
              account migration.
            </p>
            <button className="secondary" onClick={() => navigate("/settings")}>
              <FileDown size={16} /> Export a backup
            </button>
            <p className="fineprint">
              Browser storage may be cleared by your browser or device. Export
              important work.
            </p>
          </div>
        </div>
      </>
    );
  else if (path === "/ai-tutor")
    content = (
      <>
        {heading(
          "YOUR PERSONAL LEARNING COMPANION",
          "Big questions are welcome here.",
          "Ask in your own words. Explore a concept from another angle.",
        )}
        <div className="ai-layout">
          <section className="panel ai-workspace">
            <div className={`notice ${!online ? "offline-notice" : ""}`}>
              <Sparkles size={19} />
              <p>
                {!online
                  ? "Dreamers AI is offline. Your downloaded lessons and practice activities are still available."
                  : aiConfigured
                    ? "Online AI explanations can make mistakes. Check them against reviewed learning resources."
                    : "AI teacher is awaiting owner configuration. Your lessons and saved explanations are available now."}
              </p>
            </div>
            <div className="chat-log" aria-live="polite">
              {!chat.length ? (
                <div className="ai-welcome">
                  <span className="ai-orb">
                    <Sparkles size={36} />
                  </span>
                  <h2>Understanding starts with a question.</h2>
                  <p>What would you like to figure out today?</p>
                  <div className="suggestions">
                    {[
                      "Why do plant cells need mitochondria?",
                      "Explain osmosis with a real-life example",
                      "What happens at dynamic equilibrium?",
                    ].map((s) => (
                      <button onClick={() => setAiInput(s)} key={s}>
                        {s}
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chat.map((c, i) => (
                  <div className={`chat-message ${c.role}`} key={i}>
                    <small>
                      {c.role === "assistant"
                        ? "DREAMERS AI · GENERATED"
                        : c.role === "user"
                          ? "YOU"
                          : "SERVICE STATUS"}
                    </small>
                    <p>{c.text}</p>
                    {c.role === "assistant" && (
                      <button
                        className="icon-text"
                        onClick={() => speak(c.text)}
                      >
                        <Volume2 size={14} /> Read aloud
                      </button>
                    )}
                  </div>
                ))
              )}
              {aiBusy && (
                <p className="muted">Finding a clearer way to explain…</p>
              )}
            </div>
            <form
              className="ai-composer"
              onSubmit={(e) => {
                e.preventDefault();
                askAI();
              }}
            >
              <textarea
                aria-label="Ask your question"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="No question is too small…"
                maxLength={1500}
                rows={2}
              />
              <button
                className="primary"
                aria-label="Send question"
                disabled={aiBusy || !online || !aiInput.trim()}
              >
                <Send size={19} />
              </button>
            </form>
            <button
              className="understand-button"
              disabled={aiBusy || !chat.some((c) => c.role === "assistant")}
              onClick={() => {
                setMode("I Still Don’t Understand");
                askAI(
                  "I still do not understand the last explanation. Diagnose missing prerequisites and try a simpler, different example.",
                  "I Still Don’t Understand",
                );
              }}
            >
              <HelpCircle size={16} /> I still don’t understand
            </button>
          </section>
          <aside className="panel ai-options">
            <h3>Teach it my way</h3>
            <label className="field">
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Explanation mode
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {modes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <span className="eyebrow">YOUR CURRENT CONTEXT</span>
            <label className="field">
              Biology topic
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              >
                {pack?.lessons.map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.subtitle}
                  </option>
                ))}
              </select>
            </label>
            <p>
              Biology · Cells & membranes
              <br />
              Class {String(prefs.class)} foundations
            </p>
            <hr />
            <h4>Offline alternatives</h4>
            <p>
              Search downloaded lessons or revisit your saved AI explanations.
            </p>
            {link(
              "/search",
              <>
                Search learning pack <Search size={15} />
              </>,
              "text-link",
            )}
            {link(
              "/notes",
              <>
                Saved explanations <Bookmark size={15} />
              </>,
              "text-link",
            )}
          </aside>
        </div>
      </>
    );
  else if (path === "/search") {
    const search = searchText.toLowerCase().trim();
    const synonyms: Record<string, string> = {
      "plants use to make food": "photosynthesis",
      powerhouse: "mitochondria",
      "protein factory": "ribosomes",
      "water movement": "osmosis",
    };
    const normalized =
      Object.entries(synonyms).find(([key]) => search.includes(key))?.[1] ||
      search;
    const results =
      pack?.lessons.filter((l) =>
        [l.title, l.subtitle, ...l.paragraphs, l.simple]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      ) || [];
    content = (
      <>
        {heading(
          "FIND YOUR NEXT CONNECTION",
          "What are you curious about?",
          "Search your downloaded learning content. This release uses local text search with a small synonym dictionary.",
        )}
        <form
          className="big-search panel"
          onSubmit={(e) => {
            e.preventDefault();
            setSearchText(query);
          }}
        >
          <Search size={24} />
          <input
            aria-label="Search downloaded content"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchText(e.target.value);
            }}
            placeholder="Try “water movement” or “ribosomes”…"
          />
          <span className="pill">Local search</span>
        </form>
        <p className="muted tiny">
          {online ? "Online" : "Offline"} · downloaded content only · semantic
          AI search is planned
        </p>
        <div className="lesson-list">
          {(search ? results : pack?.lessons || []).map((l) => (
            <div className="panel search-result" key={l.id}>
              <div>
                <span className="eyebrow">
                  BIOLOGY / {l.subtitle.toUpperCase()}
                </span>
                <h3>{l.title}</h3>
                <p>{l.objective}</p>
              </div>
              {link(lessonUrl(l), <ArrowRight size={20} />, "circle-button")}
            </div>
          ))}
          {search && !results.length && (
            <div className="panel empty">
              <Search size={34} />
              <h3>No downloaded lesson matched that phrase.</h3>
              <p>
                Try a shorter keyword, such as “water”, “cell”, “diffusion” or
                “protein”.
              </p>
            </div>
          )}
        </div>
      </>
    );
  } else if (path === "/progress")
    content = (
      <>
        {heading(
          "YOUR LEARNING EVIDENCE",
          "Look how far your curiosity goes.",
          "These numbers come from activities saved on this device.",
        )}
        <div className="stat-row panel">
          <div className="stat">
            <Zap />
            <div>
              <strong>{state.xp} XP</strong>
              <span>Earned, never invented</span>
            </div>
          </div>
          <div className="stat">
            <BookOpen />
            <div>
              <strong>{state.completed.length}/4</strong>
              <span>Lessons explored</span>
            </div>
          </div>
          <div className="stat">
            <Target />
            <div>
              <strong>
                {state.accuracy === null ? "No evidence" : `${state.accuracy}%`}
              </strong>
              <span>Across {state.attempts} attempts</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <h2>Topic evidence</h2>
          <p className="muted">
            A first correct answer is a starting point. Retention needs later
            assessment.
          </p>
          {pack?.lessons.map((l) => {
            const qs = pack.questions.filter((q) => q.topic === l.id);
            const attempted = events.filter(
              (e) => e.kind === "attempt" && qs.some((q) => q.id === e.target),
            );
            const correct = qs.filter((q) =>
              state.correct.includes(q.id),
            ).length;
            return (
              <div className="evidence-row" key={l.id}>
                <div>
                  <b>{l.subtitle}</b>
                  <p>
                    {attempted.length} attempts · {correct}/{qs.length}{" "}
                    questions correct at least once
                  </p>
                </div>
                <span className="pill">
                  {!attempted.length
                    ? "Not assessed"
                    : correct === qs.length
                      ? "Initial coverage complete"
                      : "More practice useful"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="panel notice">
          <Brain />
          <div>
            <h3>Exam readiness: insufficient evidence</h3>
            <p>
              The demo does not cover an official subject syllabus, and delayed
              retention has not been established. A subject readiness percentage
              would be misleading.
            </p>
          </div>
        </div>
        <section className="panel">
          <h3>Recent learning history</h3>
          {events.length ? (
            [...events]
              .sort((a, b) => b.at - a.at)
              .slice(0, 15)
              .map((e) => (
                <div className="history-row" key={e.id}>
                  <span>
                    {e.kind === "lesson"
                      ? "Lesson explored"
                      : e.correct
                        ? "Correct practice answer"
                        : "Practice to revisit"}
                  </span>
                  <span className="muted">
                    {e.target} · {new Date(e.at).toLocaleDateString()}
                  </span>
                </div>
              ))
          ) : (
            <p className="muted">
              Your first completed activity will appear here.
            </p>
          )}
        </section>
      </>
    );
  else if (path === "/revision")
    content = (
      <>
        {heading(
          "MAKE YOUR KNOWLEDGE STICK",
          "A second look makes a difference.",
          "Use active recall, review mistakes and revisit earlier discoveries.",
        )}
        <div className="two-col">
          <div className="panel">
            <RotateCcw size={29} />
            <h2>Mistake detective</h2>
            <p>
              {state.mistakes.length} question
              {state.mistakes.length === 1 ? "" : "s"} with a latest incorrect
              answer. Revisit the reasoning, then try a related concept.
            </p>
            <button
              className="primary"
              onClick={() => {
                navigate("/practice/biology");
                setReviewIds(state.mistakes);
                setReviewOnly(true);
                setQuizType("mcq");
              }}
            >
              Review mistakes <ArrowRight size={16} />
            </button>
          </div>
          <div className="panel">
            <Layers size={29} />
            <h2>Little cards. Lasting understanding.</h2>
            <p>
              Self-rate your recall. “Again” brings a card back soon; successful
              reviews space it further apart.
            </p>
            {link(
              "/flashcards",
              <>
                Review flashcards <ArrowRight size={16} />
              </>,
              "primary",
            )}
          </div>
        </div>
        <div className="panel">
          <h3>Revisit a discovery</h3>
          {pack?.lessons.map((l) => (
            <div className="evidence-row" key={l.id}>
              <div>
                <b>{l.subtitle}</b>
                <p>{l.check}</p>
              </div>
              {link(lessonUrl(l), <ArrowRight size={18} />, "circle-button")}
            </div>
          ))}
        </div>
      </>
    );
  else if (path === "/flashcards") {
    const deck = (
      pack?.lessons.flatMap((l) =>
        l.takeaways.map((t, i) => ({
          id: `${l.id}:${i}`,
          front: (
            {
              "cell-basics": [
                "What makes a cell a basic unit of life?",
                "How are cells, tissues and organs related?",
                "Do prokaryotes have a membrane-bound nucleus?",
              ],
              organelles: [
                "Which structures assemble proteins?",
                "Do plant cells contain mitochondria?",
                "How do a cell wall and membrane differ?",
              ],
              membranes: [
                "Which direction is net diffusion?",
                "Does diffusion directly require ATP?",
                "Do particles stop at dynamic equilibrium?",
              ],
              osmosis: [
                "What substance moves during osmosis?",
                "What helps stop a plant cell from bursting?",
                "What does active transport require?",
              ],
            } as Record<string, string[]>
          )[l.id][i],
          back: t,
        })),
      ) || []
    ).sort((a, b) => {
      const ca = cards.find((c) => c.id === a.id),
        cb = cards.find((c) => c.id === b.id);
      return Number(ca?.due || 0) - Number(cb?.due || 0);
    });
    const card = deck[flashIndex % Math.max(deck.length, 1)];
    const stored = cards.find((c) => c.id === card?.id);
    content = (
      <>
        {heading(
          "ACTIVE RECALL / FLASHCARDS",
          "Give your memory a little workout.",
          "Try recalling before you flip. Rate your own recall to schedule a review.",
        )}
        <div className="between muted tiny">
          <span>
            {deck.length} original cards ·{" "}
            {cards.filter((c) => Number(c.due) <= Date.now()).length} saved
            cards due
          </span>
          <span>
            {card ? (flashIndex % deck.length) + 1 : 0} / {deck.length}
          </span>
        </div>
        {card ? (
          <>
            <button
              className={`flashcard panel ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped(!flipped)}
            >
              <span className="eyebrow">
                {flipped ? "THE KEY IDEA" : "THINK BEFORE YOU FLIP"}
              </span>
              <Layers size={32} />
              <h2>{flipped ? card.back : card.front}</h2>
              <span className="muted tiny">
                Tap to {flipped ? "see prompt" : "reveal"}{" "}
                <RotateCcw size={14} />
              </span>
            </button>
            <div className="flash-controls">
              <button
                className="secondary"
                onClick={() => {
                  setFlashIndex((i) => (i + deck.length - 1) % deck.length);
                  setFlipped(false);
                }}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              {["again", "hard", "good"].map((q) => (
                <button
                  disabled={!flipped}
                  className={q === "good" ? "primary" : "secondary"}
                  key={q}
                  onClick={() =>
                    safe(async () => {
                      const next = dueAt(Number(stored?.interval) || 0, q);
                      await db.put("cards", {
                        id: card.id,
                        ...next,
                        at: Date.now(),
                      });
                      await refresh();
                      setFlashIndex((i) => (i + 1) % deck.length);
                      setFlipped(false);
                      say(
                        `Review scheduled: ${q === "again" ? "in about 15 minutes" : new Date(next.due).toLocaleDateString()}.`,
                      );
                    })
                  }
                >
                  {q === "again" ? "Again" : q === "hard" ? "Hard" : "Got it"}
                </button>
              ))}
            </div>
            <p className="fineprint">
              Self-reported recall supports revision; it is not an independently
              graded mastery score.{" "}
              {stored
                ? `This card is due ${new Date(Number(stored.due)).toLocaleString()}.`
                : ""}
            </p>
          </>
        ) : (
          emptyPack
        )}
      </>
    );
  } else if (path === "/notes" || path === "/bookmarks")
    content = (
      <>
        {heading(
          "YOUR PERSONAL KNOWLEDGE SPACE",
          path === "/notes"
            ? "Keep your “aha!” moments."
            : "Your discoveries, bookmarked.",
          "Saved on this device and available offline.",
        )}{" "}
        {path === "/notes" && (
          <div className="panel">
            <label className="field">
              A thought worth keeping
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                placeholder="Write a note in your own words…"
                maxLength={10000}
              />
            </label>
            <button
              className="primary"
              disabled={!noteText.trim()}
              onClick={() =>
                safe(async () => {
                  await db.put("notes", {
                    id: crypto.randomUUID(),
                    kind: "note",
                    title: "My learning note",
                    text: noteText,
                    at: Date.now(),
                  });
                  setNoteText("");
                  await refresh();
                  say("Note saved.");
                })
              }
            >
              Save note <Plus size={16} />
            </button>
          </div>
        )}
        <div className="notes-list">
          {notes
            .filter((n) =>
              path === "/bookmarks"
                ? n.kind === "bookmark"
                : n.kind !== "bookmark",
            )
            .map((n) => (
              <div className="panel saved-note" key={n.id}>
                <div className="between">
                  <span className="eyebrow">
                    {n.kind === "ai"
                      ? "AI-GENERATED · CHECK FOR ACCURACY"
                      : n.kind === "bookmark"
                        ? "BOOKMARK"
                        : "PERSONAL NOTE"}
                  </span>
                  <button
                    className="circle-button"
                    aria-label="Delete saved note"
                    onClick={() =>
                      safe(async () => {
                        await db.remove("notes", n.id);
                        await refresh();
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3>{String(n.title)}</h3>
                {n.href ? (
                  link(String(n.href), "Open lesson →", "text-link")
                ) : (
                  <p>{String(n.text)}</p>
                )}
              </div>
            ))}
        </div>
        {!notes.filter((n) =>
          path === "/bookmarks" ? n.kind === "bookmark" : n.kind !== "bookmark",
        ).length && (
          <div className="panel empty">
            <Bookmark size={35} />
            <h3>Your next good idea belongs here.</h3>
            <p>
              {path === "/bookmarks"
                ? "Bookmark any lesson to find it quickly."
                : "Add a note above. Online AI answers will also be saved here when configured."}
            </p>
          </div>
        )}
      </>
    );
  else if (path === "/exams")
    content = (
      <>
        {heading(
          "START FROM ZERO",
          "You don’t need to know everything to begin.",
          "Create a realistic plan for this foundation chapter. Full syllabus planning will follow verified curriculum coverage.",
        )}
        <div className="two-col">
          <section className="panel">
            <h2>Your starting point</h2>
            <label className="field">
              Class
              <select
                value={String(prefs.class)}
                onChange={(e) => savePrefs({ ...prefs, class: e.target.value })}
              >
                <option>XI</option>
                <option>XII</option>
              </select>
            </label>
            <label className="field">
              Available study days
              <input
                type="number"
                min="1"
                max="180"
                value={planDays}
                onChange={(e) =>
                  setPlanDays(
                    Math.max(1, Math.min(180, Number(e.target.value) || 1)),
                  )
                }
              />
            </label>
            <label className="field">
              Exam date (optional)
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </label>
            <p className="muted">
              Subject: Biology · Chapter: Cells & membranes
            </p>
            <button
              className="primary"
              onClick={() =>
                safe(async () => {
                  const value = {
                    id: "plan",
                    days: planDays,
                    examDate,
                    createdAt: Date.now(),
                  };
                  await db.put("settings", value);
                  setPlan(value);
                  say("Your chapter study plan is saved.");
                })
              }
            >
              Build my first steps <ArrowRight size={16} />
            </button>
          </section>
          <section className="panel">
            <Brain size={33} />
            <h2>A small diagnostic first.</h2>
            <p>
              Try the chapter MCQs. Your answers will show which concepts
              deserve another explanation. You can start with no preparation.
            </p>
            {link(
              "/practice/biology",
              <>
                Try the diagnostic practice <Target size={16} />
              </>,
              "secondary",
            )}
            <p className="fineprint">
              This is chapter practice, not a validated diagnostic or prediction
              of examination results.
            </p>
            {plan && (
              <>
                <hr />
                <h3>Your {String(plan.days)}-day chapter plan</h3>
                <ol className="study-plan">
                  <li>
                    Explore 4 short lessons over the first{" "}
                    {Math.max(1, Math.ceil(Number(plan.days) / 2))} days.
                  </li>
                  <li>Complete 12 MCQs and compare 3 written answers.</li>
                  <li>Review mistakes and recall flashcards on later days.</li>
                  <li>Repeat the assessment after a gap to check retention.</li>
                </ol>
                {Boolean(plan.examDate) && (
                  <p>
                    Exam date: {String(plan.examDate)}. This pack covers
                    foundations only.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </>
    );
  else if (path === "/settings" || path === "/profile")
    content = (
      <>
        {heading(
          "MAKE THIS SPACE YOURS",
          "Your learning, your way.",
          "Guest mode works without an account. Preferences and progress stay on this device.",
        )}
        <div className="two-col">
          <section className="panel">
            <h3>Explorer profile</h3>
            <label className="field">
              Display name (optional)
              <input
                maxLength={40}
                value={String(prefs.name)}
                onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
              />
            </label>
            <label className="field">
              Class
              <select
                value={String(prefs.class)}
                onChange={(e) => setPrefs({ ...prefs, class: e.target.value })}
              >
                <option>XI</option>
                <option>XII</option>
              </select>
            </label>
            <label className="field">
              Theme
              <select
                value={String(prefs.theme)}
                onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}
              >
                <option value="dark">Dark universe</option>
                <option value="light">Light sky</option>
                <option value="system">Follow device</option>
              </select>
            </label>
            <label className="field">
              Available read-aloud voice
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              >
                <option value="">Browser default</option>
                {voices.map((v) => (
                  <option value={v.name} key={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
            <p className="fineprint">
              Voices depend on your browser and operating system. Some voices
              require internet.
            </p>
            <button className="primary" onClick={() => savePrefs(prefs)}>
              Save preferences <Check size={16} />
            </button>
          </section>
          <section className="panel">
            <h3>Your data belongs to you.</h3>
            <p>
              No email, real name, location or birthday is needed for guest
              learning. No public leaderboard or messaging is enabled.
            </p>
            <button
              className="secondary full"
              onClick={() =>
                safe(async () => {
                  const data = await db.exportData();
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  a.download = "dreamers-learning-backup.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                  say("Learning backup exported.");
                })
              }
            >
              <FileDown size={16} /> Export all local learning data
            </button>
            <label className="field">
              Restore a Dreamers backup (merge with this device)
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  safe(async () => {
                    if (file.size > 5 * 1024 * 1024)
                      throw new Error(
                        "Choose a Dreamers JSON backup smaller than 5 MB.",
                      );
                    const records = validateBackup(
                      JSON.parse(await file.text()),
                    );
                    await db.restoreData(records);
                    await refresh();
                    const drafts = await db.list<RecordValue>("settings");
                    setShortAnswers(
                      Object.fromEntries(
                        drafts
                          .filter((v) => v.id.startsWith("draft:"))
                          .map((v) => [v.id.slice(6), String(v.text || "")]),
                      ),
                    );
                    say(
                      "Backup merged. Newer local notes and unique activity records were preserved.",
                    );
                  });
                  e.target.value = "";
                }}
              />
            </label>
            <p className="fineprint">
              Backups are processed locally. Existing newer records are
              preserved, and imported activities do not duplicate XP. Learning
              packs are downloaded from the app separately.
            </p>
            <hr />
            <h3>Delete device learning data</h3>
            <p>
              This removes progress, notes, downloaded lessons, review schedules
              and preferences from this browser.
            </p>
            {showDelete ? (
              <div className="actions">
                <button
                  className="danger"
                  onClick={() =>
                    safe(async () => {
                      await db.clearData();
                      await db.put("settings", {
                        id: "starter-initialized",
                        at: Date.now(),
                      });
                      setShortAnswers({});
                      setWritten("");
                      setStorageBytes(0);
                      setPrefs({
                        id: "profile",
                        name: "Explorer",
                        class: "XI",
                        theme: "dark",
                      });
                      await refresh();
                      setShowDelete(false);
                      say("Device learning data deleted.");
                      navigate("/downloads");
                    })
                  }
                >
                  Delete my data
                </button>
                <button
                  className="secondary"
                  onClick={() => setShowDelete(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className="secondary" onClick={() => setShowDelete(true)}>
                <Trash2 size={16} /> Review deletion
              </button>
            )}
            <p className="fineprint">
              No cloud account exists in this release. Export backups separately
              if you want to keep them.
            </p>
          </section>
        </div>
      </>
    );
  else if (path === "/login" || path === "/signup")
    content = (
      <>
        {heading(
          "ACCOUNT STATUS",
          "Learn now. Connect later.",
          "Accounts and cloud sync are awaiting a dedicated Supabase configuration.",
        )}
        <div className="panel empty">
          <ShieldCheck size={44} />
          <h2>Your guest learning is ready.</h2>
          <p>
            No account is required to learn, practice or save progress on this
            device.
          </p>
          {link(
            "/dashboard",
            <>
              Continue as guest <ArrowRight size={16} />
            </>,
            "primary",
          )}
        </div>
      </>
    );
  else if (path.startsWith("/admin"))
    content = (
      <>
        {heading(
          "RESTRICTED WORKSPACE",
          "Administration is not enabled.",
          "No administrative data or operations are exposed in this release.",
        )}
        <div className="panel empty">
          <Lock size={40} />
          <p>
            Role-based administration must be configured and verified before
            content management is enabled.
          </p>
          {link("/dashboard", "Return to learning →", "primary")}
        </div>
      </>
    );
  else if (["/about", "/features", "/how-it-works"].includes(path))
    content = (
      <>
        {heading(
          "LEARN. PLAY. UNDERSTAND. ACHIEVE.",
          "Where learning becomes an adventure.",
          "DREAMERS helps students build understanding one discovery at a time.",
        )}
        <div className="panel prose">
          <h2>A small, working beginning.</h2>
          <p>
            This first release includes an original Biology foundation chapter,
            question practice, offline storage, flashcards, notes and learning
            evidence. Read a lesson, recall what you understood, practice, then
            revisit mistakes.
          </p>
          <h3>What is available today?</h3>
          <p>
            Guest learning, offline starter pack, first-completion XP, local
            search, self-checked written answers, revision scheduling and
            lightweight interactive science illustrations.
          </p>
          <h3>What needs further setup?</h3>
          <p>
            Online AI needs owner credentials and a durable quota service. Cloud
            accounts, verified Punjab textbook mapping, additional subjects,
            administration and semantic search are not yet active.
          </p>
          <h3>Learning responsibly</h3>
          <p>
            Explanations and questions are original and await educator review.
            They are not official board papers or a complete examination
            syllabus. AI explanations can be inaccurate. The app does not
            guarantee marks or passing.
          </p>
          {link(
            "/learn/biology/cells",
            <>
              Take your first discovery <ArrowRight size={16} />
            </>,
            "primary",
          )}
        </div>
      </>
    );
  else
    content = (
      <>
        {heading(
          "A TURN IN THE TRAIL",
          "This page hasn’t been built yet.",
          "Let’s get you back to an available discovery.",
        )}
        <div className="panel empty">
          {link("/dashboard", "Back to your universe →", "primary")}
        </div>
      </>
    );
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to learning
      </a>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate("/dashboard");
          }}
          className="brand"
        >
          <img src="/brand/icon.svg" alt="" />
          <div>
            DREAMERS<span>MAKE ROOM FOR POSSIBILITY</span>
          </div>
        </a>
        <div className="workspace-label">YOUR LEARNING SPACE</div>
        <nav>
          {nav.map(([url, title, Icon]) =>
            link(
              url,
              <>
                <Icon size={19} strokeWidth={1.7} />
                <span>{title}</span>
                {url === "/dreamverse" && (
                  <span className="new-label">EXPLORE</span>
                )}
              </>,
              `nav-item ${path === url || (url === "/learn" && path.startsWith("/learn/")) || (url === "/practice" && path.startsWith("/practice/")) ? "active" : ""}`,
            ),
          )}
        </nav>
        <div className="sidebar-separator" />
        <div className="workspace-label">YOUR TOOLKIT</div>
        <nav>
          {link(
            "/ai-tutor",
            <>
              <Sparkles size={19} />
              <span>AI teacher</span>
              <span className="tiny-dot" />
            </>,
            "nav-item " + (path === "/ai-tutor" ? "active" : ""),
          )}
          {link(
            "/notes",
            <>
              <StickyNote size={19} />
              <span>My notes</span>
            </>,
            "nav-item " + (path === "/notes" ? "active" : ""),
          )}
          {link(
            "/bookmarks",
            <>
              <Bookmark size={19} />
              <span>Bookmarks</span>
            </>,
            "nav-item " + (path === "/bookmarks" ? "active" : ""),
          )}
          {link(
            "/progress",
            <>
              <Trophy size={19} />
              <span>My progress</span>
            </>,
            "nav-item " + (path === "/progress" ? "active" : ""),
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="offline-card">
            <span className={swReady ? "online-dot" : "pending-dot"} />
            <div>
              <b>
                {swReady ? "Adventure, unplugged." : "Preparing offline mode"}
              </b>
              <small>
                {pack && swReady
                  ? "Starter pack ready offline"
                  : "Download once. Learn anywhere."}
              </small>
            </div>
          </div>
          {link(
            "/settings",
            <>
              <Settings size={18} />
              <span>Settings & preferences</span>
            </>,
            "nav-item",
          )}
          <div className="profile">
            <div className="avatar">
              {String(prefs.name || "E")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <b>{String(prefs.name || "Explorer")}</b>
              <small>Class {String(prefs.class)} · Guest explorer</small>
            </div>
            {link("/profile", <ChevronRight size={17} />, "profile-arrow")}
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="mobile-menu circle-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Your universe</span>
            <ChevronRight size={13} />
            <b>
              {nav.find((n) => path === n[0])?.[1] ||
                (path.startsWith("/learn/")
                  ? "Learning"
                  : path.startsWith("/practice/")
                    ? "Practice"
                    : path === "/ai-tutor"
                      ? "AI teacher"
                      : "Explore")}
            </b>
          </div>
          <form
            className="top-search"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchText(query);
              navigate("/search");
            }}
          >
            <Search size={17} />
            <input
              aria-label="Search topics, questions and more"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, questions and more…"
            />
            <span>↵</span>
          </form>
          <div className="top-actions">
            <span className="connection">
              <span className={online ? "online-dot" : "pending-dot"} />
              {online ? "Online" : "Offline"}
            </span>
            <button
              className="circle-button"
              aria-label="Toggle light or dark theme"
              onClick={() =>
                savePrefs({
                  ...prefs,
                  theme:
                    document.documentElement.dataset.theme === "dark"
                      ? "light"
                      : "dark",
                })
              }
            >
              {prefs.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="top-avatar" aria-label="Guest profile">
              {String(prefs.name || "E")
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>
        <main id="main" className="main">
          {error && (
            <div role="alert" className="error-banner">
              <p>{error}</p>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}
          {!online && (
            <div className="offline-banner">
              <CloudOff size={17} />
              <span>
                You’re offline. Downloaded learning and device progress are
                available.
              </span>
            </div>
          )}
          {update && (
            <div className="update-banner">
              <RefreshCw size={17} />
              <span>
                A fresh version is ready. Your saved work stays on this device.
              </span>
              <button
                onClick={() => {
                  navigator.serviceWorker.addEventListener(
                    "controllerchange",
                    () => location.reload(),
                    { once: true },
                  );
                  update.postMessage({ type: "SKIP_WAITING" });
                }}
              >
                Update now
              </button>
            </div>
          )}
          {content}
          <footer className="footer">
            <span>
              <img src="/brand/icon.svg" alt="" /> A little more curious. A
              little more capable.
            </span>
            <div>
              {link("/about", "About Dreamers")}
              {link("/features", "Release status")}
              <span>v0.1.1 · Foundation release</span>
            </div>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav">
        {[
          ["/dashboard", "Home", LayoutDashboard],
          ["/learn", "Learn", BookOpen],
          ["/practice", "Practice", Target],
          ["/dreamverse", "Worlds", Orbit],
          ["/downloads", "Offline", Download],
        ].map(([url, title, Icon]) => {
          const I = Icon as typeof Brain;
          return link(
            String(url),
            <>
              <I size={20} />
              <span>{String(title)}</span>
            </>,
            path === url ? "active" : "",
          );
        })}
      </nav>
      {path !== "/ai-tutor" && (
        <button
          className="floating-ai"
          onClick={() => {
            if (currentLesson) setAiTopic(currentLesson.id);
            navigate("/ai-tutor");
          }}
          aria-label="Open Dreamers AI teacher"
        >
          <Sparkles size={21} />
          <span>Ask Dreamers</span>
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
function OsmosisLab() {
  const [concentration, setConcentration] = useState(65);
  return (
    <div className="osmosis-lab">
      <span className="eyebrow">THE WATER LAB / SIMPLIFIED MODEL</span>
      <h3>Which way will the water go?</h3>
      <p>
        Equal pressure. A membrane lets water through, but not the dissolved
        solute.
      </p>
      <div className="water-tank">
        <div className="water-side">
          <span>Left: 30% relative solute</span>
          <div className="solute-dots">● ● ●</div>
        </div>
        <div className="membrane-divider" />
        <div className="water-arrow">
          {concentration > 30 ? "→" : concentration < 30 ? "←" : "↔"}
          <small>net water movement</small>
        </div>
        <div className="water-side">
          <span>Right: {concentration}% relative solute</span>
          <div className="solute-dots">
            {"● ".repeat(Math.ceil(concentration / 10))}
          </div>
        </div>
      </div>
      <label className="field">
        Right-side relative solute concentration
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          value={concentration}
          onChange={(e) => setConcentration(Number(e.target.value))}
        />
      </label>
      <p className="diagram-info" aria-live="polite">
        {concentration > 30
          ? "Water tends to move toward the more concentrated right side."
          : concentration < 30
            ? "Water tends to move toward the more concentrated left side."
            : "Equal concentrations: no net water movement in this simplified model. Molecules still move."}
      </p>
      <small>
        Qualitative illustration, not a quantitative water-potential
        calculation.
      </small>
    </div>
  );
}
