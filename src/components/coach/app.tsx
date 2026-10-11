import { useEffect, useRef, useState } from "react";
import { Board } from "@/components/coach/keyboard";
import {
  charCount,
  DEFAULT_HINT,
  examplesUsing,
  LESSONS,
  type Lesson,
  type Prompt,
  type Reading,
} from "@/lib/eten26/curriculum";
import {
  codeToKey,
  coachMismatch,
  encode,
  formatSyl,
  KEY_BY_ID,
  keyLabel,
  previewPress,
  replay,
} from "@/lib/eten26/engine";
import {
  EMPTY_PROGRESS,
  loadProgress,
  noteChar,
  noteClear,
  noteGood,
  noteMiss,
  saveProgress,
  type HintMode,
  type Progress,
} from "@/lib/eten26/progress";

type View = "map" | "keys" | "stats" | "drill";

type Drill = {
  lessonId: string;
  no: string;
  title: string;
  summary: string;
  rules: string[];
  prompts: Prompt[];
  pi: number;
  ci: number;
  buffer: string;
  good: number;
  bad: number;
  started: number;
  done: boolean;
  hint: HintMode;
  coach: string;
  shake: number;
  wrongKey: string;
  missed: { ch: string; reading: string }[];
  ended?: number;
};

type StepResult = {
  drill: Drill;
  goods: number;
  missKey?: string;
  chars: number;
  justFinished: boolean;
};

function readingAt(d: Drill): Reading | null {
  return d.prompts[d.pi]?.chars[d.ci] ?? null;
}

function coachLine(hint: HintMode, reading: Reading, buffer: string, quiet: string): string {
  if (hint !== "full") return quiet;
  const next = encode(reading)[buffer.length];
  if (!next) return formatSyl(reading);
  return previewPress(buffer, next).note;
}

function step(d: Drill, key: string): StepResult {
  const reading = readingAt(d);
  if (!reading || d.done) return { drill: d, goods: 0, chars: 0, justFinished: false };
  const expect = encode(reading);

  if (key === "Backspace") {
    const buffer = d.buffer.slice(0, -1);
    return {
      drill: {
        ...d,
        buffer,
        wrongKey: "",
        coach: coachLine(d.hint, reading, buffer, "退了一鍵。"),
      },
      goods: 0,
      chars: 0,
      justFinished: false,
    };
  }

  const want = expect[d.buffer.length];
  if (!want || key !== want) {
    return {
      drill: {
        ...d,
        bad: d.bad + 1,
        shake: d.shake + 1,
        wrongKey: key,
        coach: want ? coachMismatch(d.buffer, want, key) : "先看著目前這個字。",
      },
      goods: 0,
      missKey: want,
      chars: 0,
      justFinished: false,
    };
  }

  const buffer = d.buffer + key;
  if (buffer.length < expect.length) {
    return {
      drill: {
        ...d,
        buffer,
        good: d.good + 1,
        wrongKey: "",
        coach: coachLine(d.hint, reading, buffer, "對了。"),
      },
      goods: 1,
      chars: 0,
      justFinished: false,
    };
  }

  const advance = (pi: number, ci: number, done: boolean): Drill => {
    const nr = d.prompts[pi]?.chars[ci];
    return {
      ...d,
      pi,
      ci,
      buffer: "",
      good: d.good + 1,
      wrongKey: "",
      done,
      coach: done || !nr ? "這一課打完了。" : coachLine(d.hint, nr, "", "下一字。"),
    };
  };

  if (d.ci + 1 < d.prompts[d.pi]!.chars.length) {
    return { drill: advance(d.pi, d.ci + 1, false), goods: 1, chars: 1, justFinished: false };
  }
  if (d.pi + 1 < d.prompts.length) {
    return { drill: advance(d.pi + 1, 0, false), goods: 1, chars: 1, justFinished: false };
  }
  return { drill: advance(d.pi, d.ci, true), goods: 1, chars: 1, justFinished: true };
}

function skipChar(d: Drill): StepResult {
  const reading = readingAt(d);
  if (!reading || d.done) return { drill: d, goods: 0, chars: 0, justFinished: false };
  const expect = encode(reading);
  const want = expect[d.buffer.length];
  const missed = [...d.missed, { ch: reading.ch, reading: formatSyl(reading) }];
  const base: Drill = { ...d, bad: d.bad + 1, missed, buffer: "", wrongKey: "", shake: d.shake };

  if (d.ci + 1 < d.prompts[d.pi]!.chars.length) {
    const nr = d.prompts[d.pi]!.chars[d.ci + 1]!;
    return {
      drill: { ...base, ci: d.ci + 1, coach: coachLine(d.hint, nr, "", "跳過了。下一字。") },
      goods: 0,
      missKey: want,
      chars: 0,
      justFinished: false,
    };
  }
  if (d.pi + 1 < d.prompts.length) {
    const nr = d.prompts[d.pi + 1]!.chars[0]!;
    return {
      drill: { ...base, pi: d.pi + 1, ci: 0, coach: coachLine(d.hint, nr, "", "跳過了。下一題。") },
      goods: 0,
      missKey: want,
      chars: 0,
      justFinished: false,
    };
  }
  return {
    drill: { ...base, done: true, coach: "這一課打完了。" },
    goods: 0,
    missKey: want,
    chars: 0,
    justFinished: true,
  };
}

function makeDrill(lesson: Lesson, prompts = lesson.prompts): Drill {
  const hint = DEFAULT_HINT[lesson.id] ?? "full";
  const first = prompts[0]?.chars[0];
  return {
    lessonId: lesson.id,
    no: lesson.no,
    title: lesson.title,
    summary: lesson.summary,
    rules: lesson.rules,
    prompts,
    pi: 0,
    ci: 0,
    buffer: "",
    good: 0,
    bad: 0,
    started: Date.now(),
    done: prompts.length === 0,
    hint,
    coach: first ? coachLine(hint, first, "", "開始。") : "這一課沒有題目。",
    shake: 0,
    wrongKey: "",
    missed: [],
  };
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r} 秒`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n} 顆星`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={"inline-block size-2.5 " + (i < n ? "bg-seal" : "bg-line")}
        />
      ))}
    </span>
  );
}

function HintSwitch({ value, onChange }: { value: HintMode; onChange: (h: HintMode) => void }) {
  const options: { id: HintMode; label: string }[] = [
    { id: "full", label: "提示" },
    { id: "bpmf", label: "注音" },
    { id: "blind", label: "盲打" },
  ];
  return (
    <div className="grid grid-cols-3 border border-line bg-sheet p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={
            "h-9 px-2 text-sm " + (value === o.id ? "bg-ink text-paper" : "text-muted")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function App() {
  const [view, setView] = useState<View>("map");
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [selected, setSelected] = useState("g");
  const [now, setNow] = useState(() => Date.now());
  const [armedClear, setArmedClear] = useState(false);
  const drillRef = useRef<Drill | null>(null);
  const pressRef = useRef<(key: string) => void>(() => {});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    drillRef.current = drill;
  }, [drill]);

  useEffect(() => {
    if (view !== "drill" || drill?.done) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [view, drill?.done]);

  useEffect(() => {
    if (!drill?.wrongKey) return;
    const id = window.setTimeout(() => {
      setDrill((d) => (d ? { ...d, wrongKey: "" } : d));
    }, 380);
    return () => window.clearTimeout(id);
  }, [drill?.shake]);

  function apply(result: StepResult) {
    const drillNext = result.justFinished ? { ...result.drill, ended: Date.now() } : result.drill;
    drillRef.current = drillNext;
    setDrill(drillNext);
    let latest: Progress | null = null;
    for (let i = 0; i < result.goods; i++) latest = noteGood();
    if (result.missKey) latest = noteMiss(result.missKey);
    for (let i = 0; i < result.chars; i++) latest = noteChar();
    if (result.justFinished && LESSONS.some((l) => l.id === result.drill.lessonId)) {
      const acc = result.drill.good / Math.max(1, result.drill.good + result.drill.bad);
      const seconds = (Date.now() - result.drill.started) / 1000;
      latest = noteClear(drillNext.lessonId, acc, seconds);
    }
    if (latest) setProgress(latest);
  }

  function press(key: string) {
    const d = drillRef.current;
    if (!d || d.done) return;
    apply(step(d, key));
  }
  pressRef.current = press;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== "drill") return;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = codeToKey(e.code);
      if (!key) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      pressRef.current(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  function openLesson(lesson: Lesson, prompts?: Prompt[]) {
    const next = makeDrill(
      prompts
        ? { ...lesson, prompts }
        : lesson,
    );
    drillRef.current = next;
    setDrill(next);
    setNow(Date.now());
    setView("drill");
  }

  function openKeyDrill(keyId: string) {
    const chars = examplesUsing(keyId, 8);
    const info = KEY_BY_ID[keyId];
    const lesson: Lesson = {
      id: `key:${keyId}`,
      no: info?.letter ?? "鍵",
      title: info ? `${info.letter} ${info.top}${info.bottom ? `／${info.bottom}` : ""}` : "單鍵",
      kicker: "單鍵",
      summary: info?.blurb ?? "",
      rules: info ? [info.blurb] : [],
      prompts: chars.map((ch, i) => ({ id: `k${i}`, chars: [ch] })),
    };
    openLesson(lesson);
  }

  const nextLesson =
    LESSONS.find((l) => (progress.lessons[l.id]?.stars ?? 0) < 3) ?? LESSONS[0]!;
  const weakest = Object.entries(progress.misses).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <button type="button" onClick={() => setView("map")} className="flex items-center gap-3">
            <span className="grid size-11 place-items-center bg-seal font-serif text-lg font-black leading-none text-seal-ink">
              26
            </span>
            <span className="text-left">
              <span className="block font-serif text-lg leading-none">忘形26</span>
              <span className="mt-1 block text-xs text-muted">輸入法練習教練</span>
            </span>
          </button>
          <nav className="ml-auto flex gap-1 text-sm">
            {(
              [
                ["map", "課程"],
                ["keys", "鍵位"],
                ["stats", "成績"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={
                  "h-10 px-3 " + (view === id ? "bg-ink text-paper" : "text-muted hover:text-ink")
                }
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {view === "map" ? (
          <Home
            progress={progress}
            nextLesson={nextLesson}
            weakest={weakest}
            onOpen={openLesson}
            onKey={openKeyDrill}
          />
        ) : null}
        {view === "keys" ? (
          <KeyGuide
            selected={selected}
            onSelect={setSelected}
            onDrill={openKeyDrill}
          />
        ) : null}
        {view === "stats" ? (
          <Stats
            progress={progress}
            armed={armedClear}
            onArm={() => setArmedClear(true)}
            onClear={() => {
              saveProgress(EMPTY_PROGRESS);
              setProgress(EMPTY_PROGRESS);
              setArmedClear(false);
            }}
          />
        ) : null}
        {view === "drill" && drill ? (
          <DrillView
            drill={drill}
            now={now}
            onPress={press}
            onSkip={() => {
              const d = drillRef.current;
              if (d) apply(skipChar(d));
            }}
            onHint={(hint) => {
              setDrill((d) => {
                if (!d) return d;
                const reading = readingAt(d);
                const next = {
                  ...d,
                  hint,
                  coach:
                    d.done || !reading
                      ? d.coach
                      : coachLine(hint, reading, d.buffer, d.hint === "full" ? "注音留著，鍵位自己找。" : d.coach),
                };
                drillRef.current = next;
                return next;
              });
            }}
            onRetry={() => {
              const lesson = LESSONS.find((l) => l.id === drill.lessonId);
              if (lesson) openLesson(lesson);
              else if (drill.lessonId.startsWith("key:")) openKeyDrill(drill.lessonId.slice(4));
              else openLesson({ ...LESSONS[0]!, id: drill.lessonId, title: drill.title, no: drill.no, summary: drill.summary, rules: drill.rules, kicker: "", prompts: drill.prompts });
            }}
            onNext={() => {
              const idx = LESSONS.findIndex((l) => l.id === drill.lessonId);
              const following = idx >= 0 ? LESSONS[idx + 1] : undefined;
              if (following) openLesson(following);
              else setView("map");
            }}
            onExit={() => setView("map")}
          />
        ) : null}
      </main>
    </div>
  );
}

function Home({
  progress,
  nextLesson,
  weakest,
  onOpen,
  onKey,
}: {
  progress: Progress;
  nextLesson: Lesson;
  weakest?: [string, number];
  onOpen: (lesson: Lesson) => void;
  onKey: (keyId: string) => void;
}) {
  const weakInfo = weakest ? KEY_BY_ID[weakest[0]] : undefined;
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <p className="text-xs tracking-widest text-seal">ETEN 26</p>
        <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
          把分身鍵練成反射
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          倚天忘形把注音塞進二十六個字母。有些鍵身兼兩職，靠它在音節裡的位置分辨。這裡不選字，只練那個判斷。鍵序對齊新酷音的倚天26。
        </p>
        <ol className="mt-8 border-t border-line">
          {LESSONS.map((lesson) => {
            const stat = progress.lessons[lesson.id];
            return (
              <li key={lesson.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => onOpen(lesson)}
                  className="flex w-full items-start gap-4 py-4 text-left"
                >
                  <span className="w-10 shrink-0 font-serif text-2xl text-seal">{lesson.no}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-serif text-xl">{lesson.title}</span>
                      <span className="text-xs text-muted">{lesson.kicker}</span>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{lesson.summary}</span>
                    <span className="mt-2 flex items-center gap-3 text-xs text-muted">
                      <span>{charCount(lesson)} 字</span>
                      {stat ? <span>最佳 {Math.round(stat.accuracy * 100)}%</span> : null}
                    </span>
                  </span>
                  <span className="pt-2">
                    <Stars n={stat?.stars ?? 0} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <aside className="h-fit border border-line bg-sheet p-5 lg:sticky lg:top-24">
        <p className="text-xs tracking-widest text-muted">接著打</p>
        <h2 className="mt-2 font-serif text-3xl">{nextLesson.title}</h2>
        <p className="mt-2 text-sm text-muted">{nextLesson.summary}</p>
        <button
          type="button"
          onClick={() => onOpen(nextLesson)}
          className="mt-5 h-12 w-full bg-seal text-seal-ink"
        >
          開始 {nextLesson.no}
        </button>
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-xs tracking-widest text-muted">失手最多</p>
          {weakest ? (
            <button
              type="button"
              onClick={() => {
                if (weakest[0] !== " ") onKey(weakest[0]);
              }}
              className="mt-3 w-full text-left"
            >
              <span className="font-serif text-3xl">{weakest[0] === " " ? "空白" : (weakInfo?.top ?? weakest[0])}</span>
              {weakInfo?.bottom ? <span className="ml-2 font-serif text-xl text-muted">{weakInfo.bottom}</span> : null}
              <span className="mt-1 block text-sm text-muted">
                {weakest[0] === " " ? "一聲" : `${weakInfo?.letter ?? ""} 鍵`} · {weakest[1]} 次
                {weakest[0] === " " ? "" : " · 點此加練"}
              </span>
            </button>
          ) : (
            <p className="mt-2 text-sm text-muted">打完一課就會記在這裡。</p>
          )}
        </div>
        <p className="mt-6 text-xs text-muted">
          已送出 {progress.chars} 字
          {progress.good + progress.bad > 0
            ? ` · 鍵準確率 ${Math.round((progress.good / (progress.good + progress.bad)) * 100)}%`
            : ""}
        </p>
      </aside>
    </div>
  );
}

function KeyGuide({
  selected,
  onSelect,
  onDrill,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onDrill: (id: string) => void;
}) {
  const info = selected === " " ? null : KEY_BY_ID[selected];
  const examples = examplesUsing(selected, 5);
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="text-xs tracking-widest text-seal">鍵位</p>
        <h1 className="mt-2 font-serif text-4xl">二十六鍵對照</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          上排是音節開頭時的符號，旁邊是它的另一個身分。點一顆鍵看規則。電腦鍵盤也可以直接按。
        </p>
        <div className="mt-6">
          <Board
            lit
            nextKey={selected}
            onKey={(key) => {
              if (key === "Backspace") return;
              onSelect(key);
            }}
          />
        </div>
      </div>
      <aside className="h-fit border border-line bg-sheet p-5 lg:sticky lg:top-24">
        {selected === " " ? (
          <>
            <p className="text-xs tracking-widest text-muted">空白</p>
            <h2 className="mt-2 font-serif text-5xl">一聲</h2>
            <p className="mt-3 text-sm text-muted">
              每個音節的收尾之一。已經有注音時，空白送出一聲，不是字與字之間的空格。音節還是空的，按它沒有作用。
            </p>
          </>
        ) : info ? (
          <>
            <p className="text-xs tracking-widest text-muted">{info.letter}</p>
            <h2 className="mt-2 font-serif text-5xl">
              {info.top}
              {info.bottom ? <span className="ml-3 text-3xl text-muted">{info.bottom}</span> : null}
            </h2>
            <p className="mt-3 text-sm text-muted">{info.blurb}</p>
          </>
        ) : null}
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {examples.map((ch) => (
            <li key={ch.ch + formatSyl(ch)} className="flex items-baseline justify-between gap-3 py-2">
              <span className="font-serif text-2xl">{ch.ch}</span>
              <span className="font-serif text-muted">{formatSyl(ch)}</span>
              <span className="text-xs tracking-wide text-ink">
                {[...encode(ch)].map((k) => keyLabel(k)).join(" ")}
              </span>
            </li>
          ))}
        </ul>
        {selected !== " " ? (
          <button
            type="button"
            onClick={() => onDrill(selected)}
            className="mt-5 h-12 w-full bg-seal text-seal-ink"
          >
            練這顆鍵
          </button>
        ) : null}
      </aside>
    </div>
  );
}

function Stats({
  progress,
  armed,
  onArm,
  onClear,
}: {
  progress: Progress;
  armed: boolean;
  onArm: () => void;
  onClear: () => void;
}) {
  const ranked = Object.entries(progress.misses).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const attempts = progress.good + progress.bad;
  return (
    <div>
      <p className="text-xs tracking-widest text-seal">成績</p>
      <h1 className="mt-2 font-serif text-4xl">練過的都留在這台裝置</h1>
      <p className="mt-3 text-sm text-muted">
        送出 {progress.chars} 字
        {attempts > 0 ? ` · 鍵準確率 ${Math.round((progress.good / attempts) * 100)}%` : ""}
        {attempts > 0 ? ` · ${progress.good} 對 ${progress.bad} 錯` : ""}
      </p>
      <div className="mt-8 border-t border-line">
        {LESSONS.map((lesson) => {
          const stat = progress.lessons[lesson.id];
          return (
            <div key={lesson.id} className="flex items-center gap-3 border-b border-line py-3">
              <span className="w-12 font-serif text-xl text-seal">{lesson.no}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg">{lesson.title}</span>
                <span className="mt-1 flex sm:hidden">
                  <Stars n={stat?.stars ?? 0} />
                </span>
              </span>
              <span className="hidden sm:block">
                <Stars n={stat?.stars ?? 0} />
              </span>
              <span className="w-28 text-right text-sm tabular-nums text-muted">
                {stat ? `${Math.round(stat.accuracy * 100)}% · ${clock(stat.seconds)}` : "尚未"}
              </span>
            </div>
          );
        })}
      </div>
      <h2 className="mt-10 font-serif text-2xl">常按錯的鍵</h2>
      {ranked.length === 0 ? (
        <p className="mt-2 text-sm text-muted">還沒有失手。去課程裡打一課就會出現。</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ranked.map(([key, n]) => {
            const info = KEY_BY_ID[key];
            return (
              <li key={key} className="flex items-baseline justify-between border border-line bg-sheet px-4 py-3">
                <span className="font-serif text-2xl">
                  {key === " " ? "空白" : info ? `${info.letter} ${info.top}` : key.toUpperCase()}
                </span>
                <span className="text-sm tabular-nums text-muted">{n} 次</span>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={armed ? onClear : onArm}
        className="mt-10 text-sm text-muted underline decoration-line underline-offset-4"
      >
        {armed ? "再按一次，清除這台裝置上的成績" : "清除成績"}
      </button>
    </div>
  );
}

function DrillView({
  drill,
  now,
  onPress,
  onSkip,
  onHint,
  onRetry,
  onNext,
  onExit,
}: {
  drill: Drill;
  now: number;
  onPress: (key: string) => void;
  onSkip: () => void;
  onHint: (h: HintMode) => void;
  onRetry: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const prompt = drill.prompts[drill.pi];
  const reading = prompt?.chars[drill.ci];
  const expect = reading ? encode(reading) : "";
  const accuracy = drill.good / Math.max(1, drill.good + drill.bad);
  const doneStat = drill.good / Math.max(1, drill.good + drill.bad);
  const elapsed = ((drill.ended ?? now) - drill.started) / 1000;

  if (drill.done) {
    const stars = doneStat >= 0.98 ? 3 : doneStat >= 0.9 ? 2 : 1;
    const real = LESSONS.some((l) => l.id === drill.lessonId);
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="-rotate-6 mx-auto grid size-24 place-items-center border-4 border-seal font-serif text-4xl font-black text-seal">
          {stars === 3 ? "準" : stars === 2 ? "熟" : "完"}
        </div>
        <h1 className="mt-6 font-serif text-4xl">{drill.title}</h1>
        <p className="mt-3 text-muted">
          準確率 {Math.round(doneStat * 100)}% · {clock(((drill.ended ?? Date.now()) - drill.started) / 1000)} · {drill.good} 對 {drill.bad} 錯
        </p>
        <div className="mt-4 flex justify-center">
          <Stars n={stars} />
        </div>
        {drill.missed.length > 0 ? (
          <div className="mt-8 border border-line bg-sheet p-4 text-left">
            <p className="text-xs tracking-widest text-muted">跳過或值得再看</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {drill.missed.map((m, i) => (
                <li key={`${m.ch}${i}`} className="font-serif text-xl">
                  {m.ch}
                  <span className="ml-1 text-base text-muted">{m.reading}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">沒有跳過的字。</p>
        )}
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onRetry} className="h-12 border border-line bg-sheet">
            再練一次
          </button>
          <button type="button" onClick={real ? onNext : onExit} className="h-12 bg-seal text-seal-ink">
            {real && LESSONS.findIndex((l) => l.id === drill.lessonId) < LESSONS.length - 1 ? "下一課" : "回課程"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onExit} className="h-10 px-2 text-sm text-muted">
          返回
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-widest text-seal">
            {drill.no} · {drill.pi + 1}/{drill.prompts.length}
          </p>
          <h1 className="font-serif text-2xl">{drill.title}</h1>
        </div>
        <p className="text-sm tabular-nums text-muted">
          {drill.bad === 0 && drill.good === 0 ? "—" : `${Math.round(accuracy * 100)}%`} · {clock(elapsed)}
        </p>
      </div>

      <div className="mt-4 max-w-sm">
        <HintSwitch value={drill.hint} onChange={onHint} />
      </div>

      <details className="mt-4 border border-line bg-sheet">
        <summary className="cursor-pointer px-4 py-3 text-sm">這一課在練什麼</summary>
        <div className="border-t border-line px-4 py-3 text-sm text-muted">
          <p>{drill.summary}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {drill.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </details>

      {prompt && reading ? (
        <div key={drill.shake} className={"mt-8 " + (drill.shake ? "wx-shake" : "")}>
          <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2">
            {prompt.chars.map((ch, i) => (
              <span
                key={`${ch.ch}${i}`}
                className={
                  "font-serif leading-none " +
                  (i === drill.ci
                    ? "text-6xl text-ink sm:text-8xl wx-pop"
                    : i < drill.ci
                      ? "text-3xl text-muted sm:text-4xl"
                      : "text-3xl text-muted sm:text-4xl")
                }
              >
                {ch.ch}
              </span>
            ))}
          </div>
          {drill.hint !== "blind" ? (
            <p className="mt-4 text-center font-serif text-2xl text-seal">{formatSyl(reading)}</p>
          ) : (
            <p className="mt-4 text-center text-sm text-muted">盲打 · 打錯才提示</p>
          )}
          {drill.hint === "full" ? (
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {[...expect].map((k, i) => (
                <span
                  key={`${k}${i}`}
                  className={
                    "grid h-9 min-w-9 place-items-center px-2 text-xs " +
                    (i < drill.buffer.length
                      ? "bg-ink text-paper"
                      : i === drill.buffer.length
                        ? "bg-seal text-seal-ink"
                        : "border border-line bg-sheet text-muted")
                  }
                >
                  {keyLabel(k)}
                </span>
              ))}
            </div>
          ) : null}
          {drill.hint !== "blind" ? (
            <p className="mt-3 text-center text-sm text-muted">
              組到{" "}
              <span className="font-serif text-base text-ink">{drill.buffer ? composed(drill.buffer) : "·"}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mx-auto mt-4 min-h-12 max-w-xl text-center text-sm text-ink" aria-live="polite">
        {drill.coach}
      </p>

      <Board
        lit={drill.hint === "full"}
        nextKey={reading ? expect[drill.buffer.length] : undefined}
        wrongKey={drill.wrongKey}
        onKey={onPress}
      />

      <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-3">
        <button type="button" onClick={onSkip} className="h-11 px-3 text-sm text-muted">
          跳過這個字
        </button>
        <p className="text-right text-xs text-muted">直接打鍵盤也可以。開著注音時，仍以按鍵位置為準。</p>
      </div>
    </div>
  );
}

function composed(keys: string): string {
  const { state, committed } = replay(keys);
  if (!state.i && !state.m && !state.r) return "·";
  return formatSyl({ i: state.i, m: state.m, r: state.r, t: state.t ?? 1 }, !committed);
}
