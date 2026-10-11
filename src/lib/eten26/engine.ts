/** 倚天忘形 26 鍵（ETen26），鍵序與 libchewing `Et26` 對齊。 */

export type Tone = 1 | 2 | 3 | 4 | 5;

export type Initial =
  | "ㄅ" | "ㄆ" | "ㄇ" | "ㄈ" | "ㄉ" | "ㄊ" | "ㄋ" | "ㄌ"
  | "ㄍ" | "ㄎ" | "ㄏ" | "ㄐ" | "ㄑ" | "ㄒ"
  | "ㄓ" | "ㄔ" | "ㄕ" | "ㄖ" | "ㄗ" | "ㄘ" | "ㄙ";

export type Medial = "ㄧ" | "ㄨ" | "ㄩ";

export type Rime =
  | "ㄚ" | "ㄛ" | "ㄜ" | "ㄝ" | "ㄞ" | "ㄟ" | "ㄠ" | "ㄡ"
  | "ㄢ" | "ㄣ" | "ㄤ" | "ㄥ" | "ㄦ";

export type Phone = Initial | Medial | Rime;

export type Syl = {
  i?: Initial;
  m?: Medial;
  r?: Rime;
  t: Tone;
};

type State = {
  i?: Initial;
  m?: Medial;
  r?: Rime;
  t?: Tone;
};

const INITIALS = new Set<string>([
  "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ",
  "ㄍ", "ㄎ", "ㄏ", "ㄐ", "ㄑ", "ㄒ",
  "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ",
]);
const MEDIALS = new Set<string>(["ㄧ", "ㄨ", "ㄩ"]);
const RIMES = new Set<string>([
  "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ",
  "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ",
]);

export function isInitial(p: string): p is Initial {
  return INITIALS.has(p);
}
export function isMedial(p: string): p is Medial {
  return MEDIALS.has(p);
}
export function isRime(p: string): p is Rime {
  return RIMES.has(p);
}

const INITIAL_KEY: Record<Initial, string> = {
  ㄅ: "b", ㄆ: "p", ㄇ: "m", ㄈ: "f", ㄉ: "d", ㄊ: "t", ㄋ: "n", ㄌ: "l",
  ㄍ: "v", ㄎ: "k", ㄏ: "h", ㄐ: "g", ㄑ: "v", ㄒ: "c",
  ㄓ: "g", ㄔ: "y", ㄕ: "c", ㄖ: "j", ㄗ: "q", ㄘ: "w", ㄙ: "s",
};

const MEDIAL_KEY: Record<Medial, string> = { ㄧ: "e", ㄨ: "x", ㄩ: "u" };

const RIME_KEY: Record<Rime, string> = {
  ㄚ: "a", ㄛ: "o", ㄜ: "r", ㄝ: "w", ㄞ: "i", ㄟ: "q", ㄠ: "z", ㄡ: "p",
  ㄢ: "m", ㄣ: "n", ㄤ: "t", ㄥ: "l", ㄦ: "h",
};

const TONE_KEY: Record<Tone, string> = { 1: " ", 2: "f", 3: "j", 4: "k", 5: "d" };

/** 無聲母、無介音時，這些韻要靠「先當聲母、送調時改判」。 */
const SOLO_RIME_KEY: Partial<Record<Rime, string>> = {
  ㄡ: "p", ㄢ: "m", ㄣ: "n", ㄤ: "t", ㄥ: "l", ㄦ: "h",
};

export type KeyInfo = {
  id: string;
  letter: string;
  top: string;
  bottom?: string;
  blurb: string;
};

export const KEY_ROWS: KeyInfo[][] = [
  [
    { id: "q", letter: "Q", top: "ㄗ", bottom: "ㄟ", blurb: "音節開頭是ㄗ；前面已有聲母或介音時是ㄟ。賊是 QQ。" },
    { id: "w", letter: "W", top: "ㄘ", bottom: "ㄝ", blurb: "音節開頭是ㄘ；前面已有聲母或介音時是ㄝ。也、月的韻用它。" },
    { id: "e", letter: "E", top: "ㄧ", blurb: "介音ㄧ，不跟別人共用。一、鴨、天都從它走。" },
    { id: "r", letter: "R", top: "ㄜ", blurb: "韻母ㄜ。鵝、可、的的韻都是它，跟ㄦ不是同一鍵。" },
    { id: "t", letter: "T", top: "ㄊ", bottom: "ㄤ", blurb: "開頭是ㄊ，已有聲母或介音時是ㄤ。湯要連按兩次。" },
    { id: "y", letter: "Y", top: "ㄔ", blurb: "只有ㄔ。吃、茶、春的聲母。" },
    { id: "u", letter: "U", top: "ㄩ", blurb: "介音ㄩ。魚、去、月。它也會讓前面的ㄍ改判成ㄑ。" },
    { id: "i", letter: "I", top: "ㄞ", blurb: "韻母ㄞ。愛、來、台。" },
    { id: "o", letter: "O", top: "ㄛ", blurb: "韻母ㄛ。喔、我、波、國。" },
    { id: "p", letter: "P", top: "ㄆ", bottom: "ㄡ", blurb: "開頭是ㄆ，已有聲母或介音時是ㄡ。單獨的歐，按 P 再送調。" },
  ],
  [
    { id: "a", letter: "A", top: "ㄚ", blurb: "韻母ㄚ。阿、八、大、家。" },
    { id: "s", letter: "S", top: "ㄙ", blurb: "只有ㄙ。思、四、三。" },
    { id: "d", letter: "D", top: "ㄉ", bottom: "˙", blurb: "音節還沒開始是ㄉ；已經有注音時是輕聲。的要按兩次 D。" },
    { id: "f", letter: "F", top: "ㄈ", bottom: "ˊ", blurb: "音節還沒開始是ㄈ；已經有注音時是二聲。佛的第二下 F 是聲調。" },
    { id: "g", letter: "G", top: "ㄐ", bottom: "ㄓ", blurb: "先落成ㄐ。若接著是ㄨ、韻母，或直接送調，就改判ㄓ。基是 GE，知是 G。" },
    { id: "h", letter: "H", top: "ㄏ", bottom: "ㄦ", blurb: "開頭是ㄏ，已有聲母或介音時是ㄦ。單獨的二，按 H 再送調。" },
    { id: "j", letter: "J", top: "ㄖ", bottom: "ˇ", blurb: "音節還沒開始是ㄖ；已經有注音時是三聲。日是 J 再加去聲。" },
    { id: "k", letter: "K", top: "ㄎ", bottom: "ˋ", blurb: "音節還沒開始是ㄎ；已經有注音時是四聲。客的尾音就是再按一次 K。" },
    { id: "l", letter: "L", top: "ㄌ", bottom: "ㄥ", blurb: "開頭是ㄌ，已有聲母或介音時是ㄥ。冷是 LL，能是 NL。" },
  ],
  [
    { id: "z", letter: "Z", top: "ㄠ", blurb: "韻母ㄠ。凹、高、好、要。" },
    { id: "x", letter: "X", top: "ㄨ", blurb: "介音ㄨ。它會把前面的ㄐ改成ㄓ、ㄒ改成ㄕ。中、書、國都經過它。" },
    { id: "c", letter: "C", top: "ㄒ", bottom: "ㄕ", blurb: "先落成ㄒ。若接著是ㄨ、韻母，或直接送調，就改判ㄕ。西是 CE，詩是 C。" },
    { id: "v", letter: "V", top: "ㄍ", bottom: "ㄑ", blurb: "先落成ㄍ。接著若是ㄧ或ㄩ，就改判ㄑ。哥是 VR，氣是 VE。" },
    { id: "b", letter: "B", top: "ㄅ", blurb: "只有ㄅ。八、不、白。" },
    { id: "n", letter: "N", top: "ㄋ", bottom: "ㄣ", blurb: "開頭是ㄋ，已有聲母或介音時是ㄣ。恩是 N 送調，嫩是 NN。" },
    { id: "m", letter: "M", top: "ㄇ", bottom: "ㄢ", blurb: "開頭是ㄇ，已有聲母或介音時是ㄢ。安是 M 送調，慢是 MM。" },
  ],
];

export const KEY_BY_ID: Record<string, KeyInfo> = Object.fromEntries(
  KEY_ROWS.flat().map((k) => [k.id, k]),
);

export function keyLabel(key: string): string {
  if (key === " ") return "空白";
  return key.toUpperCase();
}

export function toneMark(t: Tone | undefined): string {
  if (t === 2) return "ˊ";
  if (t === 3) return "ˇ";
  if (t === 4) return "ˋ";
  if (t === 5) return "˙";
  return "";
}

export function toneName(t: Tone | undefined): string {
  if (t === 2) return "二聲";
  if (t === 3) return "三聲";
  if (t === 4) return "四聲";
  if (t === 5) return "輕聲";
  return "一聲";
}

export function formatBody(s: State | Syl): string {
  return `${s.i ?? ""}${s.m ?? ""}${s.r ?? ""}`;
}

export function formatSyl(s: Syl | (State & { t?: Tone }), partial = false): string {
  const body = formatBody(s);
  if (partial || s.t == null) return body || "·";
  if (s.t === 5) return `˙${body}`;
  const mark = toneMark(s.t);
  return mark ? `${body}${mark}` : body;
}

function blank(): State {
  return {};
}

function isEmpty(s: State): boolean {
  return !s.i && !s.m && !s.r;
}

function mapPhone(s: State, key: string): Phone | null {
  switch (key) {
    case "a": return "ㄚ";
    case "b": return "ㄅ";
    case "c": return "ㄒ";
    case "d": return "ㄉ";
    case "e": return "ㄧ";
    case "f": return "ㄈ";
    case "g": return "ㄐ";
    case "h": return isEmpty(s) ? "ㄏ" : s.i || s.m ? "ㄦ" : "ㄏ";
    case "i": return "ㄞ";
    case "j": return "ㄖ";
    case "k": return "ㄎ";
    case "l": return s.i || s.m ? "ㄥ" : "ㄌ";
    case "m": return s.i || s.m ? "ㄢ" : "ㄇ";
    case "n": return s.i || s.m ? "ㄣ" : "ㄋ";
    case "o": return "ㄛ";
    case "p": return s.i || s.m ? "ㄡ" : "ㄆ";
    case "q": return s.i || s.m ? "ㄟ" : "ㄗ";
    case "r": return "ㄜ";
    case "s": return "ㄙ";
    case "t": return s.i || s.m ? "ㄤ" : "ㄊ";
    case "u": return "ㄩ";
    case "v": return "ㄍ";
    case "w": return s.i || s.m ? "ㄝ" : "ㄘ";
    case "x": return "ㄨ";
    case "y": return "ㄔ";
    case "z": return "ㄠ";
    default: return null;
  }
}

function put(s: State, phone: Phone) {
  if (isInitial(phone)) s.i = phone;
  else if (isMedial(phone)) s.m = phone;
  else s.r = phone;
}

/** 單鍵結果。commit 表示這個鍵把音節送出。 */
export function applyKey(state: State, raw: string): "absorb" | "commit" | "reject" {
  const key = raw === " " ? " " : raw.toLowerCase();
  const end = key === "d" || key === "f" || key === "j" || key === "k" || key === " ";
  if (end && !isEmpty(state)) {
    if (!state.m && !state.r) {
      if (state.i === "ㄐ") state.i = "ㄓ";
      else if (state.i === "ㄒ") state.i = "ㄕ";
      else if (state.i === "ㄆ") { state.i = undefined; state.r = "ㄡ"; }
      else if (state.i === "ㄇ") { state.i = undefined; state.r = "ㄢ"; }
      else if (state.i === "ㄋ") { state.i = undefined; state.r = "ㄣ"; }
      else if (state.i === "ㄊ") { state.i = undefined; state.r = "ㄤ"; }
      else if (state.i === "ㄌ") { state.i = undefined; state.r = "ㄥ"; }
      else if (state.i === "ㄏ") { state.i = undefined; state.r = "ㄦ"; }
    }
    if (key === "f") state.t = 2;
    else if (key === "j") state.t = 3;
    else if (key === "k") state.t = 4;
    else if (key === "d") state.t = 5;
    else state.t = 1;
    return "commit";
  }

  const phone = mapPhone(state, key);
  if (!phone) return "reject";
  if (isMedial(phone)) {
    if (phone === "ㄨ") {
      if (state.i === "ㄐ") state.i = "ㄓ";
      else if (state.i === "ㄒ") state.i = "ㄕ";
    } else if (state.i === "ㄍ") {
      state.i = "ㄑ";
    }
  } else if (isRime(phone) && !state.m) {
    if (state.i === "ㄐ") state.i = "ㄓ";
    else if (state.i === "ㄒ") state.i = "ㄕ";
  }
  put(state, phone);
  return "absorb";
}

export function replay(keys: string): { state: State; committed: boolean; rejected: boolean } {
  const state = blank();
  let committed = false;
  for (const ch of keys) {
    const act = applyKey(state, ch);
    if (act === "reject") return { state, committed: false, rejected: true };
    if (act === "commit") committed = true;
  }
  return { state, committed, rejected: false };
}

export function encode(s: Syl): string {
  const keys: string[] = [];
  if (!s.i && !s.m && s.r && SOLO_RIME_KEY[s.r]) {
    keys.push(SOLO_RIME_KEY[s.r]!);
  } else {
    if (s.i) keys.push(INITIAL_KEY[s.i]);
    if (s.m) keys.push(MEDIAL_KEY[s.m]);
    if (s.r) keys.push(RIME_KEY[s.r]);
  }
  keys.push(TONE_KEY[s.t]);
  return keys.join("");
}

export function sameSyl(a: Syl, b: Syl): boolean {
  return a.i === b.i && a.m === b.m && a.r === b.r && a.t === b.t;
}

export function parseReading(ch: string, spec: string): Syl & { ch: string } {
  let tone: Tone = 1;
  let body = spec.trim();
  if (body.startsWith("˙")) {
    tone = 5;
    body = body.slice(1);
  }
  const end = body.slice(-1);
  if (end === "ˊ") { tone = 2; body = body.slice(0, -1); }
  else if (end === "ˇ") { tone = 3; body = body.slice(0, -1); }
  else if (end === "ˋ") { tone = 4; body = body.slice(0, -1); }
  const syl: Syl & { ch: string } = { ch, t: tone };
  for (const c of body) {
    if (isInitial(c)) {
      if (syl.i) throw new Error(`雙聲母 ${spec}`);
      syl.i = c;
    } else if (isMedial(c)) {
      if (syl.m) throw new Error(`雙介音 ${spec}`);
      syl.m = c;
    } else if (isRime(c)) {
      if (syl.r) throw new Error(`雙韻母 ${spec}`);
      syl.r = c;
    } else {
      throw new Error(`無法辨認「${c}」於 ${spec}`);
    }
  }
  if (!syl.i && !syl.m && !syl.r) throw new Error(`空讀音 ${ch} ${spec}`);
  return syl;
}

export type PressPreview = {
  action: "absorb" | "commit" | "reject";
  before: string;
  after: string;
  note: string;
};

export function previewPress(beforeKeys: string, key: string): PressPreview {
  const beforeState = replay(beforeKeys).state;
  const beforeBody = formatBody(beforeState);
  const next = replay(beforeKeys).state;
  const action = applyKey(next, key);
  if (action === "reject") {
    return { action, before: beforeBody, after: beforeBody, note: `${keyLabel(key)} 不是忘形鍵` };
  }
  const afterBody = formatBody(next);
  if (action === "commit") {
    const spoken = formatSyl({ ...next, t: next.t ?? 1 });
    if (beforeBody && beforeBody !== afterBody) {
      return {
        action,
        before: beforeBody,
        after: spoken,
        note: `${keyLabel(key)} 送出${toneName(next.t)}，並把 ${beforeBody} 改判成 ${spoken}`,
      };
    }
    return {
      action,
      before: beforeBody,
      after: spoken,
      note: `${keyLabel(key)} 是${toneName(next.t)}，送出 ${spoken}`,
    };
  }
  if (beforeState.i && next.i && beforeState.i !== next.i) {
    return {
      action,
      before: beforeBody,
      after: afterBody,
      note: `${keyLabel(key)} 讓 ${beforeState.i} 改判成 ${next.i}，現在是 ${afterBody}`,
    };
  }
  const added = isMedial(mapPhone(beforeState, key.toLowerCase()) ?? "")
    ? next.m
    : isRime(mapPhone(beforeState, key.toLowerCase()) ?? "")
      ? next.r
      : next.i;
  return {
    action,
    before: beforeBody,
    after: afterBody,
    note: `${keyLabel(key)} 是${added ?? afterBody}`,
  };
}

export function coachMismatch(beforeKeys: string, expected: string, got: string): string {
  const want = previewPress(beforeKeys, expected);
  const have = previewPress(beforeKeys, got);
  if (have.action === "reject") {
    return `這一拍要 ${want.note}。${keyLabel(got)} 沒有對應的注音。`;
  }
  return `這一拍要 ${want.note}。你按了 ${keyLabel(got)}：${have.note}。`;
}

export function codeToKey(code: string): string | null {
  if (code === "Space") return " ";
  if (code === "Backspace") return "Backspace";
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  return null;
}
