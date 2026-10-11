import { encode, formatSyl, parseReading, type Syl } from "./engine.ts";

export type Reading = Syl & { ch: string };

export type Prompt = {
  id: string;
  chars: Reading[];
};

export type Lesson = {
  id: string;
  no: string;
  title: string;
  kicker: string;
  summary: string;
  rules: string[];
  prompts: Prompt[];
};

function line(id: string, text: string, specs: string[]): Prompt {
  const chars = [...text];
  if (chars.length !== specs.length) {
    throw new Error(`${id}:「${text}」與讀音數量不符`);
  }
  return {
    id,
    chars: chars.map((ch, i) => parseReading(ch, specs[i]!)),
  };
}

export const LESSONS: Lesson[] = [
  {
    id: "tones",
    no: "01",
    title: "先學會送調",
    kicker: "每個音都要收尾",
    summary: "注音打完要送調。空白是一聲，F 二聲，J 三聲，K 四聲，D 輕聲。",
    rules: [
      "忘形沒有聲調符號鍵以外的選擇：音節一定用這五個鍵之一收尾。",
      "這一課先用不會分身的ㄅ、ㄚ、ㄧ。聲調鍵此刻只負責收尾。",
      "輕聲的點寫在前面，鍵仍是最後一下 D。",
    ],
    prompts: [
      line("t1", "八", ["ㄅㄚ"]),
      line("t2", "拔", ["ㄅㄚˊ"]),
      line("t3", "把", ["ㄅㄚˇ"]),
      line("t4", "爸", ["ㄅㄚˋ"]),
      line("t5", "吧", ["˙ㄅㄚ"]),
      line("t6", "衣", ["ㄧ"]),
      line("t7", "移", ["ㄧˊ"]),
      line("t8", "以", ["ㄧˇ"]),
      line("t9", "意", ["ㄧˋ"]),
      line("t10", "媽", ["ㄇㄚ"]),
      line("t11", "麻", ["ㄇㄚˊ"]),
      line("t12", "馬", ["ㄇㄚˇ"]),
      line("t13", "罵", ["ㄇㄚˋ"]),
      line("t14", "嗎", ["˙ㄇㄚ"]),
    ],
  },
  {
    id: "solo",
    no: "02",
    title: "獨佔鍵",
    kicker: "一鍵一音",
    summary: "這些符號不跟別人擠同一鍵。看到就按，再送調。",
    rules: [
      "A ㄚ、O ㄛ、R ㄜ、I ㄞ、Z ㄠ，各是一個韻。",
      "E ㄧ、X ㄨ、U ㄩ 是介音，可以單獨成音，也可以再接韻。",
      "Y ㄔ、B ㄅ、S ㄙ 沒有分身。",
    ],
    prompts: [
      line("s1", "阿", ["ㄚ"]),
      line("s2", "喔", ["ㄛ"]),
      line("s3", "鵝", ["ㄜˊ"]),
      line("s4", "餓", ["ㄜˋ"]),
      line("s5", "哀", ["ㄞ"]),
      line("s6", "愛", ["ㄞˋ"]),
      line("s7", "凹", ["ㄠ"]),
      line("s8", "一", ["ㄧ"]),
      line("s9", "屋", ["ㄨ"]),
      line("s10", "五", ["ㄨˇ"]),
      line("s11", "魚", ["ㄩˊ"]),
      line("s12", "鴨", ["ㄧㄚ"]),
      line("s13", "窩", ["ㄨㄛ"]),
      line("s14", "我", ["ㄨㄛˇ"]),
      line("s15", "挖", ["ㄨㄚ"]),
      line("s16", "歪", ["ㄨㄞ"]),
      line("s17", "腰", ["ㄧㄠ"]),
      line("s18", "吃", ["ㄔ"]),
      line("s19", "思", ["ㄙ"]),
      line("s20", "巴", ["ㄅㄚ"]),
    ],
  },
  {
    id: "initials",
    no: "03",
    title: "聲母走位",
    kicker: "先聲後韻",
    summary: "聲母打在最前面。這一課挑還沒有跟韻母搶鍵的音，把手指走順。",
    rules: [
      "順序永遠是聲母、介音、韻母、聲調。",
      "佛的第二下 F 已經不是ㄈ，而是二聲。音節裡有東西之後，F J K D 就變聲調。",
      "ㄍㄎㄏ在這一課先只配ㄜ、ㄨ，還沒碰到會改判的ㄧ、ㄩ。",
    ],
    prompts: [
      line("i1", "波", ["ㄅㄛ"]),
      line("i2", "不", ["ㄅㄨˋ"]),
      line("i3", "坡", ["ㄆㄛ"]),
      line("i4", "婆", ["ㄆㄛˊ"]),
      line("i5", "摸", ["ㄇㄛ"]),
      line("i6", "母", ["ㄇㄨˇ"]),
      line("i7", "夫", ["ㄈㄨ"]),
      line("i8", "佛", ["ㄈㄛˊ"]),
      line("i9", "大", ["ㄉㄚˋ"]),
      line("i10", "讀", ["ㄉㄨˊ"]),
      line("i11", "他", ["ㄊㄚ"]),
      line("i12", "圖", ["ㄊㄨˊ"]),
      line("i13", "拿", ["ㄋㄚˊ"]),
      line("i14", "奴", ["ㄋㄨˊ"]),
      line("i15", "拉", ["ㄌㄚ"]),
      line("i16", "路", ["ㄌㄨˋ"]),
      line("i17", "哥", ["ㄍㄜ"]),
      line("i18", "古", ["ㄍㄨˇ"]),
      line("i19", "可", ["ㄎㄜˇ"]),
      line("i20", "哭", ["ㄎㄨ"]),
      line("i21", "喝", ["ㄏㄜ"]),
      line("i22", "呼", ["ㄏㄨ"]),
    ],
  },
  {
    id: "split",
    no: "04",
    title: "三組分身",
    kicker: "忘形的核心",
    summary: "G 是ㄐ也是ㄓ，C 是ㄒ也是ㄕ，V 是ㄍ也是ㄑ。後面接什麼，決定它是誰。",
    rules: [
      "G 先落下ㄐ。接著若是ㄧ或ㄩ，維持ㄐ；若是ㄨ、其他韻，或直接送調，改判ㄓ。",
      "C 先落下ㄒ，規則和 G 一樣：ㄧㄩ留ㄒ，其餘改ㄕ。",
      "V 先落下ㄍ。接著若是ㄧ或ㄩ，改判ㄑ；若是ㄨ或ㄜ、ㄠ，維持ㄍ。",
    ],
    prompts: [
      line("p1", "基", ["ㄐㄧ"]),
      line("p2", "居", ["ㄐㄩ"]),
      line("p3", "家", ["ㄐㄧㄚ"]),
      line("p4", "金", ["ㄐㄧㄣ"]),
      line("p5", "京", ["ㄐㄧㄥ"]),
      line("p6", "知", ["ㄓ"]),
      line("p7", "朱", ["ㄓㄨ"]),
      line("p8", "中", ["ㄓㄨㄥ"]),
      line("p9", "張", ["ㄓㄤ"]),
      line("p10", "真", ["ㄓㄣ"]),
      line("p11", "西", ["ㄒㄧ"]),
      line("p12", "需", ["ㄒㄩ"]),
      line("p13", "下", ["ㄒㄧㄚˋ"]),
      line("p14", "心", ["ㄒㄧㄣ"]),
      line("p15", "星", ["ㄒㄧㄥ"]),
      line("p16", "詩", ["ㄕ"]),
      line("p17", "書", ["ㄕㄨ"]),
      line("p18", "沙", ["ㄕㄚ"]),
      line("p19", "山", ["ㄕㄢ"]),
      line("p20", "生", ["ㄕㄥ"]),
      line("p21", "期", ["ㄑㄧˊ"]),
      line("p22", "去", ["ㄑㄩˋ"]),
      line("p23", "全", ["ㄑㄩㄢˊ"]),
      line("p24", "請", ["ㄑㄧㄥˇ"]),
      line("p25", "光", ["ㄍㄨㄤ"]),
      line("p26", "工", ["ㄍㄨㄥ"]),
      line("p27", "高", ["ㄍㄠ"]),
      line("p28", "國", ["ㄍㄨㄛˊ"]),
    ],
  },
  {
    id: "shared",
    no: "05",
    title: "聲韻同鍵",
    kicker: "連按與改判",
    summary: "八個鍵身兼聲母和韻母。開頭當聲母；前面已有注音就當韻母。只有韻、沒有聲母時，送調才改判。",
    rules: [
      "P ㄆ／ㄡ、M ㄇ／ㄢ、T ㄊ／ㄤ、N ㄋ／ㄣ、L ㄌ／ㄥ、H ㄏ／ㄦ、Q ㄗ／ㄟ、W ㄘ／ㄝ。",
      "歐、安、恩、湯的韻、冷的韻、二：只按那一鍵再送調，送出時才從聲母改成韻母。",
      "聲母和韻母剛好同一鍵時要連按：剖 PP、慢 MM、湯 TT、嫩 NN、冷 LL、賊 QQ。",
      "ㄟ、ㄝ 出現在介音或聲母後面才直接是韻。也是 EW，月是 UW，誰是 CQ。",
    ],
    prompts: [
      line("h1", "歐", ["ㄡ"]),
      line("h2", "剖", ["ㄆㄡ"]),
      line("h3", "有", ["ㄧㄡˇ"]),
      line("h4", "安", ["ㄢ"]),
      line("h5", "慢", ["ㄇㄢˋ"]),
      line("h6", "天", ["ㄊㄧㄢ"]),
      line("h7", "湯", ["ㄊㄤ"]),
      line("h8", "恩", ["ㄣ"]),
      line("h9", "門", ["ㄇㄣˊ"]),
      line("h10", "嫩", ["ㄋㄣˋ"]),
      line("h11", "人", ["ㄖㄣˊ"]),
      line("h12", "冷", ["ㄌㄥˇ"]),
      line("h13", "能", ["ㄋㄥˊ"]),
      line("h14", "二", ["ㄦˋ"]),
      line("h15", "河", ["ㄏㄜˊ"]),
      line("h16", "誰", ["ㄕㄟˊ"]),
      line("h17", "飛", ["ㄈㄟ"]),
      line("h18", "威", ["ㄨㄟ"]),
      line("h19", "賊", ["ㄗㄟˊ"]),
      line("h20", "也", ["ㄧㄝˇ"]),
      line("h21", "月", ["ㄩㄝˋ"]),
      line("h22", "詞", ["ㄘˊ"]),
      line("h23", "測", ["ㄘㄜˋ"]),
      line("h24", "三", ["ㄙㄢ"]),
    ],
  },
  {
    id: "dual",
    no: "06",
    title: "聲調兼職",
    kicker: "同一鍵，兩種身分",
    summary: "F D J K 既是聲母也是聲調。音節是空的當聲母，已經有注音就當聲調。",
    rules: [
      "佛：F 是ㄈ，O 是ㄛ，最後的 F 才是二聲。",
      "客：K 是ㄎ，R 是ㄜ，最後的 K 是四聲。",
      "的：D 是ㄉ，R 是ㄜ，最後的 D 是輕聲。",
      "日：第一下 J 是ㄖ，第二下若直接送四聲要用 K，不是再按 J。乳的最後一 J 才是三聲。",
    ],
    prompts: [
      line("d1", "法", ["ㄈㄚˇ"]),
      line("d2", "佛", ["ㄈㄛˊ"]),
      line("d3", "日", ["ㄖˋ"]),
      line("d4", "乳", ["ㄖㄨˇ"]),
      line("d5", "可", ["ㄎㄜˇ"]),
      line("d6", "客", ["ㄎㄜˋ"]),
      line("d7", "大", ["ㄉㄚˋ"]),
      line("d8", "的", ["˙ㄉㄜ"]),
      line("d9", "四", ["ㄙˋ"]),
      line("d10", "十", ["ㄕˊ"]),
      line("d11", "是", ["ㄕˋ"]),
      line("d12", "子", ["ㄗˇ"]),
      line("d13", "次", ["ㄘˋ"]),
      line("d14", "熱", ["ㄖㄜˋ"]),
    ],
  },
  {
    id: "frequent",
    no: "07",
    title: "高頻字",
    kicker: "把規則用出來",
    summary: "二十四個天天會碰到的字。預設只給注音，鍵位自己找。",
    rules: [
      "還不確定就打開「提示」，鍵盤會標出下一鍵。",
      "打錯不會清掉已經對的音，退格可以拆掉最後一下。",
      "這一課練的是鍵序，不是從候選字裡選字。",
    ],
    prompts: [
      line("f1", "人", ["ㄖㄣˊ"]),
      line("f2", "中", ["ㄓㄨㄥ"]),
      line("f3", "文", ["ㄨㄣˊ"]),
      line("f4", "我", ["ㄨㄛˇ"]),
      line("f5", "你", ["ㄋㄧˇ"]),
      line("f6", "他", ["ㄊㄚ"]),
      line("f7", "是", ["ㄕˋ"]),
      line("f8", "不", ["ㄅㄨˋ"]),
      line("f9", "在", ["ㄗㄞˋ"]),
      line("f10", "有", ["ㄧㄡˇ"]),
      line("f11", "來", ["ㄌㄞˊ"]),
      line("f12", "到", ["ㄉㄠˋ"]),
      line("f13", "說", ["ㄕㄨㄛ"]),
      line("f14", "要", ["ㄧㄠˋ"]),
      line("f15", "會", ["ㄏㄨㄟˋ"]),
      line("f16", "這", ["ㄓㄜˋ"]),
      line("f17", "個", ["ㄍㄜˋ"]),
      line("f18", "好", ["ㄏㄠˇ"]),
      line("f19", "上", ["ㄕㄤˋ"]),
      line("f20", "下", ["ㄒㄧㄚˋ"]),
      line("f21", "國", ["ㄍㄨㄛˊ"]),
      line("f22", "時", ["ㄕˊ"]),
      line("f23", "看", ["ㄎㄢˋ"]),
      line("f24", "學", ["ㄒㄩㄝˊ"]),
    ],
  },
  {
    id: "words",
    no: "08",
    title: "詞語連打",
    kicker: "一個詞，不停手",
    summary: "字與字之間不用空格分開，每個字送調之後自動進下一個字。",
    rules: [
      "送出一聲的空白只屬於那個字，不會變成字與字的間隔。",
      "看著整詞，但只打發亮的那一個字。",
      "多音字這一課標的是詞裡的讀音。",
    ],
    prompts: [
      line("w1", "中文", ["ㄓㄨㄥ", "ㄨㄣˊ"]),
      line("w2", "台灣", ["ㄊㄞˊ", "ㄨㄢ"]),
      line("w3", "忘記", ["ㄨㄤˋ", "ㄐㄧˋ"]),
      line("w4", "練習", ["ㄌㄧㄢˋ", "ㄒㄧˊ"]),
      line("w5", "鍵盤", ["ㄐㄧㄢˋ", "ㄆㄢˊ"]),
      line("w6", "輸入法", ["ㄕㄨ", "ㄖㄨˋ", "ㄈㄚˇ"]),
      line("w7", "謝謝", ["ㄒㄧㄝˋ", "ㄒㄧㄝˋ"]),
      line("w8", "再見", ["ㄗㄞˋ", "ㄐㄧㄢˋ"]),
      line("w9", "你好", ["ㄋㄧˇ", "ㄏㄠˇ"]),
      line("w10", "可以", ["ㄎㄜˇ", "ㄧˇ"]),
      line("w11", "時間", ["ㄕˊ", "ㄐㄧㄢ"]),
      line("w12", "學生", ["ㄒㄩㄝˊ", "ㄕㄥ"]),
      line("w13", "老師", ["ㄌㄠˇ", "ㄕ"]),
      line("w14", "朋友", ["ㄆㄥˊ", "ㄧㄡˇ"]),
      line("w15", "電腦", ["ㄉㄧㄢˋ", "ㄋㄠˇ"]),
      line("w16", "開心", ["ㄎㄞ", "ㄒㄧㄣ"]),
      line("w17", "水果", ["ㄕㄨㄟˇ", "ㄍㄨㄛˇ"]),
      line("w18", "東西", ["ㄉㄨㄥ", "ㄒㄧ"]),
    ],
  },
  {
    id: "sentences",
    no: "09",
    title: "短句",
    kicker: "照實際讀音",
    summary: "短句裡的「一」和「不」用臺灣國語的變調，不照單字本調。",
    rules: [
      "「一」後面若是四聲，讀成二聲；後面是其他聲調，讀成四聲。",
      "「不」後面若是四聲，讀成二聲，其餘維持四聲。",
      "慢慢打完即可。盲打模式會把注音也收起來。",
    ],
    prompts: [
      line("n1", "我要練習忘形", ["ㄨㄛˇ", "ㄧㄠˋ", "ㄌㄧㄢˋ", "ㄒㄧˊ", "ㄨㄤˋ", "ㄒㄧㄥˊ"]),
      line("n2", "今天天氣很好", ["ㄐㄧㄣ", "ㄊㄧㄢ", "ㄊㄧㄢ", "ㄑㄧˋ", "ㄏㄣˇ", "ㄏㄠˇ"]),
      line("n3", "我會打忘形", ["ㄨㄛˇ", "ㄏㄨㄟˋ", "ㄉㄚˇ", "ㄨㄤˋ", "ㄒㄧㄥˊ"]),
      line("n4", "請問這是什麼", ["ㄑㄧㄥˇ", "ㄨㄣˋ", "ㄓㄜˋ", "ㄕˋ", "ㄕㄣˊ", "˙ㄇㄜ"]),
      line("n5", "對不起", ["ㄉㄨㄟˋ", "ㄅㄨˋ", "ㄑㄧˇ"]),
      line("n6", "沒問題", ["ㄇㄟˊ", "ㄨㄣˋ", "ㄊㄧˊ"]),
      line("n7", "不客氣", ["ㄅㄨˊ", "ㄎㄜˋ", "ㄑㄧˋ"]),
      line("n8", "加油再試一次", ["ㄐㄧㄚ", "ㄧㄡˊ", "ㄗㄞˋ", "ㄕˋ", "ㄧˊ", "ㄘˋ"]),
      line("n9", "請把鍵盤打開", ["ㄑㄧㄥˇ", "ㄅㄚˇ", "ㄐㄧㄢˋ", "ㄆㄢˊ", "ㄉㄚˇ", "ㄎㄞ"]),
    ],
  },
];

export function examplesUsing(keyId: string, limit = 5): Reading[] {
  const out: Reading[] = [];
  const seen = new Set<string>();
  for (const lesson of LESSONS) {
    for (const prompt of lesson.prompts) {
      for (const ch of prompt.chars) {
        const id = `${ch.ch}${formatSyl(ch)}`;
        if (seen.has(id)) continue;
        if (!encode(ch).includes(keyId)) continue;
        seen.add(id);
        out.push(ch);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function charCount(lesson: Lesson): number {
  return lesson.prompts.reduce((n, p) => n + p.chars.length, 0);
}

export const DEFAULT_HINT: Record<string, "full" | "bpmf" | "blind"> = {
  tones: "full",
  solo: "full",
  initials: "full",
  split: "full",
  shared: "full",
  dual: "full",
  frequent: "bpmf",
  words: "bpmf",
  sentences: "bpmf",
};
