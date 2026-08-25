export const BIBLE_BOOKS: Record<string, string> = {
  창: "창세기", 출: "출애굽기", 레: "레위기", 민: "민수기", 신: "신명기",
  수: "여호수아", 삿: "사사기", 룻: "룻기", 삼상: "사무엘상", 삼하: "사무엘하",
  왕상: "열왕기상", 왕하: "열왕기하", 대상: "역대기상", 대하: "역대기하",
  스: "에스라", 느: "느헤미야", 에: "에스더", 욥: "욥기", 시: "시편",
  잠: "잠언", 전: "전도서", 아: "아가", 사: "이사야", 렘: "예레미야",
  애: "예레미야애가", 겔: "에스겔", 단: "다니엘", 호: "호세아", 욜: "요엘",
  암: "아모스", 옵: "오바댜", 욘: "요나", 미: "미가", 나: "나훔",
  합: "하박국", 습: "스바냐", 학: "학개", 슥: "스가랴", 말: "말라기",
  마: "마태복음", 막: "마가복음", 눅: "누가복음", 요: "요한복음", 행: "사도행전",
  롬: "로마서", 고전: "고린도전서", 고후: "고린도후서", 갈: "갈라디아서",
  엡: "에베소서", 빌: "빌립보서", 골: "골로새서", 살전: "데살로니가전서",
  살후: "데살로니가후서", 딤전: "디모데전서", 딤후: "디모데후서", 딛: "디도서",
  몬: "빌레몬서", 히: "히브리서", 약: "야고보서", 벧전: "베드로전서",
  벧후: "베드로후서", 요일: "요한일서", 요이: "요한이서", 요삼: "요한삼서",
  유: "유다서", 계: "요한계시록",
};

export type Passage = {
  book: string;
  bookAbbr: string;
  chapter: string;
  verses: string;
  display: string;
  searchQuery: string;
};

export function extractPassages(text: string): Passage[] {
  const passages: Passage[] = [];
  const readLineMatch = text.match(/읽을 말씀\s*[│|:]\s*(.+)/);
  if (!readLineMatch) return passages;

  const parts = readLineMatch[1].split(",").map((p) => p.trim());
  for (const part of parts) {
    const match = part.match(
      /^([가-힣a-zA-Z]+)\s*(\d+)\s*(?:[-~–—]\s*(\d+))?\s*[장편]?\s*(?::?\s*([\d]+(?:\s*[-~–—]\s*\d+)?))?/,
    );
    if (!match) continue;
    const bookAbbr = match[1];
    const startChapter = parseInt(match[2], 10);
    const endChapter = match[3] ? parseInt(match[3], 10) : startChapter;
    const verses = match[4] ? match[4].replace(/\s*[~–—]\s*/g, "-") : "";
    const bookFull = BIBLE_BOOKS[bookAbbr] || bookAbbr;

    const unit = bookFull === "시편" ? "편" : "장";
    for (let c = startChapter; c <= endChapter && c - startChapter < 50; c++) {
      const chapter = String(c);
      // 절 범위는 단일 장일 때만 의미가 있음
      const v = startChapter === endChapter ? verses : "";
      let display = `${bookFull} ${chapter}${unit}`;
      if (v) display += ` ${v}절`;
      passages.push({
        book: bookFull,
        bookAbbr,
        chapter,
        verses: v,
        display,
        searchQuery: `${bookFull} ${chapter}${unit}${v ? " " + v + "절" : ""}`,
      });
    }
  }
  return passages.slice(0, 20);
}

