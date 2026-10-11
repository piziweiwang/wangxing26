import { LESSONS } from "./curriculum.ts";
import { encode, formatSyl, replay, sameSyl, parseReading } from "./engine.ts";

const cases: Array<[string, string]> = [
  ["ㄅㄚ", "ba "],
  ["ㄅㄚˊ", "baf"],
  ["ㄅㄚˇ", "baj"],
  ["ㄅㄚˋ", "bak"],
  ["˙ㄅㄚ", "bad"],
  ["ㄓ", "g "],
  ["ㄓㄨㄥ", "gxl "],
  ["ㄐㄧ", "ge "],
  ["ㄐㄧㄤ", "get "],
  ["ㄕ", "c "],
  ["ㄒㄧ", "ce "],
  ["ㄕㄨㄚ", "cxa "],
  ["ㄍㄨㄥ", "vxl "],
  ["ㄑㄩㄥˊ", "vulf"],
  ["ㄡ", "p "],
  ["ㄆㄡ", "pp "],
  ["ㄢˋ", "mk"],
  ["ㄇㄢˋ", "mmk"],
  ["ㄦˋ", "hk"],
  ["ㄏㄜˊ", "hrf"],
  ["˙ㄉㄜ", "drd"],
  ["ㄈㄛˊ", "fof"],
  ["ㄎㄜˋ", "krk"],
  ["ㄖˇ", "jj"],
  ["ㄖˋ", "jk"],
  ["ㄕㄟˊ", "cqf"],
  ["ㄨㄟˊ", "xqf"],
  ["ㄗㄟˊ", "qqf"],
  ["ㄧㄝˇ", "ewj"],
  ["ㄩㄝˋ", "uwk"],
  ["ㄌㄧㄡˋ", "lepk"],
  ["ㄋㄥˊ", "nlf"],
  ["ㄌㄥˇ", "llj"],
  ["ㄊㄧㄢ", "tem "],
  ["ㄕㄤˋ", "ctk"],
  ["ㄍㄨㄤ", "vxt "],
  ["ㄘˋ", "wk"],
  ["ㄙㄢ", "sm "],
  ["ㄐㄧㄣ", "gen "],
  ["ㄒㄧㄝˋ", "cewk"],
  ["ㄕㄨㄟˇ", "cxqj"],
  ["ㄍㄨㄛˊ", "vxof"],
];

let failed = 0;
for (const [spec, keys] of cases) {
  const target = parseReading("測", spec);
  const got = encode(target);
  const parsed = replay(got);
  const ok =
    got === keys &&
    parsed.committed &&
    !parsed.rejected &&
    sameSyl({ i: parsed.state.i, m: parsed.state.m, r: parsed.state.r, t: parsed.state.t ?? 1 }, target);
  if (!ok) {
    failed++;
    console.log("FAIL", spec, "encode", JSON.stringify(got), "expect", JSON.stringify(keys), "parsed", formatSyl({ ...parsed.state, t: parsed.state.t ?? 1 }), parsed);
  }
}

for (const lesson of LESSONS) {
  for (const prompt of lesson.prompts) {
    for (const ch of prompt.chars) {
      const keys = encode(ch);
      const parsed = replay(keys);
      const syl = { i: parsed.state.i, m: parsed.state.m, r: parsed.state.r, t: parsed.state.t ?? 1 };
      if (!parsed.committed || parsed.rejected || !sameSyl(syl, ch)) {
        failed++;
        console.log(
          "LESSON",
          lesson.id,
          ch.ch,
          formatSyl(ch),
          JSON.stringify(keys),
          formatSyl(syl),
          parsed,
        );
      }
    }
  }
}

if (failed) {
  console.error(failed, "failures");
  process.exit(1);
}
console.log("ok", cases.length, "cases +", LESSONS.reduce((n, l) => n + l.prompts.reduce((m, p) => m + p.chars.length, 0), 0), "lesson chars");
