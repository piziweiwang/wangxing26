export type HintMode = "full" | "bpmf" | "blind";

export type LessonStat = {
  stars: number;
  accuracy: number;
  seconds: number;
  clears: number;
};

export type Progress = {
  lessons: Record<string, LessonStat>;
  misses: Record<string, number>;
  chars: number;
  good: number;
  bad: number;
};

const KEY = "wangxing26.v1";

export const EMPTY_PROGRESS: Progress = {
  lessons: {},
  misses: {},
  chars: 0,
  good: 0,
  bad: 0,
};

export function loadProgress(): Progress {
  if (typeof localStorage === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      lessons: parsed.lessons ?? {},
      misses: parsed.misses ?? {},
      chars: parsed.chars ?? 0,
      good: parsed.good ?? 0,
      bad: parsed.bad ?? 0,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function starsFor(accuracy: number): number {
  if (accuracy >= 0.98) return 3;
  if (accuracy >= 0.9) return 2;
  return 1;
}

function write(mutator: (p: Progress) => void): Progress {
  const next = loadProgress();
  mutator(next);
  saveProgress(next);
  return next;
}

export function noteGood(): Progress {
  return write((p) => {
    p.good += 1;
  });
}

export function noteMiss(key: string): Progress {
  return write((p) => {
    p.bad += 1;
    p.misses[key] = (p.misses[key] ?? 0) + 1;
  });
}

export function noteChar(): Progress {
  return write((p) => {
    p.chars += 1;
  });
}

export function noteClear(lessonId: string, accuracy: number, seconds: number): Progress {
  return write((p) => {
    const stars = starsFor(accuracy);
    const old = p.lessons[lessonId];
    if (!old) {
      p.lessons[lessonId] = { stars, accuracy, seconds, clears: 1 };
      return;
    }
    p.lessons[lessonId] = {
      stars: Math.max(old.stars, stars),
      accuracy: Math.max(old.accuracy, accuracy),
      seconds: accuracy >= old.accuracy ? Math.min(old.seconds, seconds) : old.seconds,
      clears: old.clears + 1,
    };
  });
}
