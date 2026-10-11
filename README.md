# 忘形26 練習教練

倚天忘形二十六鍵（ETen26）的注音鍵序練習。不代選字，鍵序對齊新酷音／libchewing 的倚天26。

## 課程

1. 送調：空白一聲、F 二聲、J 三聲、K 四聲、D 輕聲
2. 獨佔鍵
3. 聲母走位
4. 三組分身：G ㄐ／ㄓ、C ㄒ／ㄕ、V ㄍ／ㄑ
5. 聲韻同鍵：歐、剖、安、慢、湯、冷、二
6. 聲調兼職：佛、客、的
7. 高頻字、詞語、短句（「一」「不」用實際變調）

可切換提示、注音、盲打。成績存在瀏覽器本機。

## 開發

```bash
npm install
npm run dev
```

自檢鍵序：

```bash
node --experimental-strip-types src/lib/eten26/engine.selfcheck.ts
```
