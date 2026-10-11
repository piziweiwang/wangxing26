import { KEY_ROWS, keyLabel, type KeyInfo } from "@/lib/eten26/engine";

type BoardProps = {
  nextKey?: string;
  wrongKey?: string;
  lit?: boolean;
  onKey: (key: string) => void;
};

function glyph(info: KeyInfo, emphasize: boolean) {
  return (
    <span className="flex items-baseline justify-center gap-0.5 font-serif leading-none">
      <span className={emphasize ? "text-base sm:text-lg" : "text-sm sm:text-base"}>{info.top}</span>
      {info.bottom ? (
        <span className={emphasize ? "text-sm text-seal-ink/80 sm:text-base" : "text-xs text-muted sm:text-sm"}>
          {info.bottom}
        </span>
      ) : null}
    </span>
  );
}

function KeyCap({
  info,
  next,
  wrong,
  lit,
  onKey,
}: {
  info: KeyInfo;
  next: boolean;
  wrong: boolean;
  lit: boolean;
  onKey: (key: string) => void;
}) {
  const hot = lit && next;
  return (
    <button
      type="button"
      onClick={() => onKey(info.id)}
      aria-label={`${info.letter} ${info.top}${info.bottom ? ` 或 ${info.bottom}` : ""}`}
      className={
        "flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 transition-colors select-none touch-manipulation sm:h-16 " +
        (wrong
          ? "border-seal bg-seal text-seal-ink"
          : hot
            ? "border-seal bg-ink text-seal-ink"
            : "border-line bg-sheet text-ink hover:border-ink")
      }
    >
      {glyph(info, wrong || hot)}
      <span className={"text-xs tracking-wide " + (wrong || hot ? "text-seal-ink/80" : "text-muted")}>
        {info.letter}
      </span>
    </button>
  );
}

export function Board({ nextKey, wrongKey, lit = true, onKey }: BoardProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 select-none">
      <div className="grid grid-cols-10 gap-1">
        {KEY_ROWS[0]!.map((info) => (
          <KeyCap
            key={info.id}
            info={info}
            next={nextKey === info.id}
            wrong={wrongKey === info.id}
            lit={lit}
            onKey={onKey}
          />
        ))}
      </div>
      <div className="px-3 sm:px-5">
        <div className="grid grid-cols-9 gap-1">
          {KEY_ROWS[1]!.map((info) => (
            <KeyCap
              key={info.id}
              info={info}
              next={nextKey === info.id}
              wrong={wrongKey === info.id}
              lit={lit}
              onKey={onKey}
            />
          ))}
        </div>
      </div>
      <div className="px-8 sm:px-14">
        <div className="grid grid-cols-7 gap-1">
          {KEY_ROWS[2]!.map((info) => (
            <KeyCap
              key={info.id}
              info={info}
              next={nextKey === info.id}
              wrong={wrongKey === info.id}
              lit={lit}
              onKey={onKey}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-10 gap-1">
        <button
          type="button"
          onClick={() => onKey("Backspace")}
          className="col-span-2 h-12 rounded-lg border border-line bg-sheet text-sm text-ink touch-manipulation sm:h-14"
        >
          退格
        </button>
        <button
          type="button"
          onClick={() => onKey(" ")}
          aria-label="空白，一聲"
          className={
            "col-span-8 h-12 rounded-lg border text-sm touch-manipulation sm:h-14 " +
            (wrongKey === " "
              ? "border-seal bg-seal text-seal-ink"
              : lit && nextKey === " "
                ? "border-seal bg-ink text-seal-ink"
                : "border-line bg-sheet text-ink hover:border-ink")
          }
        >
          {keyLabel(" ")} · 一聲
        </button>
      </div>
    </div>
  );
}
