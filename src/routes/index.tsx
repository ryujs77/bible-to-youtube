import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { searchBibleVideos } from "@/lib/youtube.functions";
import { extractPassages, type Passage } from "@/lib/bible-books";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "말씀 → 유튜브 링크 변환기" },
      {
        name: "description",
        content:
          "'읽을 말씀' 텍스트를 입력하면 유튜브 채널에서 성경 구절 영상을 자동으로 찾아드립니다.",
      },
      { property: "og:title", content: "말씀 → 유튜브 링크 변환기" },
      {
        property: "og:description",
        content: "성경 구절 유튜브 영상을 자동으로 찾아드려요.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type SearchResult = {
  display: string;
  query: string;
  found: boolean;
  videoId?: string;
  url?: string;
  embedUrl?: string;
  title?: string;
  thumbnail?: string;
  viewCount?: number;
  candidateCount?: number;
  error?: string;
};

function Index() {
  const search = useServerFn(searchBibleVideos);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedItemIdx, setCopiedItemIdx] = useState<number | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);

  async function handlePasteFromClipboard() {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setError(null);
      }
    } catch {
      // 클립보드 접근 권한이 없거나 지원하지 않는 경우 조용히 무시
    }
  }

  async function handleSearch() {
    setError(null);
    setResults([]);
    setPassages([]);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("성경 구절 텍스트를 입력해 주세요!");
      return;
    }
    const found = extractPassages(trimmed);
    if (found.length === 0) {
      setError('"읽을 말씀" 또는 성경 구절 형식을 찾을 수 없어요. (예: 수2장, 시123-125편, 마10장)');
      return;
    }
    setPassages(found);
    setLoading(true);
    try {
      const res = await search({
        data: {
          queries: found.map((p) => ({
            book: p.book,
            chapter: p.chapter,
            display: p.display,
          })),
        },
      });
      if (res.error) setError(res.error);
      const rs = (res.results ?? []) as SearchResult[];
      setResults(rs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setText("");
    setResults([]);
    setPassages([]);
    setError(null);
  }

  async function copyAllLinks() {
    const linkText = results
      .filter((r) => r.found && r.url)
      .map((r) => `${r.display} ${r.url}`)
      .join("\n");
    if (!linkText) return;
    await navigator.clipboard.writeText(linkText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  async function copySingleLink(idx: number, textToCopy: string) {
    await navigator.clipboard.writeText(textToCopy);
    setCopiedItemIdx(idx);
    setTimeout(() => setCopiedItemIdx(null), 2000);
  }

  const foundCount = results.filter((r) => r.found).length;

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        {/* 모바일 최적화 헤더 */}
        <header className="mb-4 text-center sm:mb-6">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl">📖</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              말씀 → 유튜브 링크
            </h1>
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              @PRS
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-zinc-400">
            '읽을 말씀' 텍스트를 붙여넣으면 유튜브 영상을 바로 찾아드려요
          </p>
        </header>

        {/* 메인 입력 카드 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              📝 텍스트 입력
            </label>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              📋 붙여넣기
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void handleSearch();
              }
            }}
            rows={4}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-red-500"
            placeholder="예: 6/30(화) 읽을 말씀 │ 수2장, 시123-125편, 사62장, 마10장"
          />

          {/* 모바일 풀사이즈 터치 액션 버튼 */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "🔍 검색 중..." : "🔎 유튜브 검색하기"}
            </button>
            {text && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                지우기
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-2.5 h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-red-600 dark:border-zinc-700 dark:border-t-red-500" />
            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              유튜브 채널에서 영상을 검색하고 있어요...
            </p>
          </div>
        )}

        {/* 검색 결과 영역 */}
        {results.length > 0 && (
          <div className="mt-4 space-y-3">
            {/* 상단 요약 및 전체 복사 바 */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                🎥 검색 결과 ({foundCount}/{results.length})
              </span>
              {foundCount > 0 && (
                <button
                  type="button"
                  onClick={copyAllLinks}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95"
                >
                  {copiedAll ? "✅ 전체 복사됨!" : "📋 전체 링크 복사"}
                </button>
              )}
            </div>

            {/* 구절 카드 목록 */}
            <div className="space-y-3">
              {passages.map((p, i) => {
                const r = results[i];
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* 상단 구절명 및 링크 복사 */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        <span className="mr-1.5 text-red-600">📖</span>
                        {p.display}
                      </div>

                      {r && r.found && r.url && (
                        <button
                          type="button"
                          onClick={() => copySingleLink(i, `${p.display} ${r.url}`)}
                          className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          {copiedItemIdx === i ? "✅ 복사됨" : "링크 복사"}
                        </button>
                      )}
                    </div>

                    {r && r.found ? (
                      <div className="mt-2.5 space-y-2">
                        {/* 유튜브 링크 & 배지 */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            🔗 {r.url}
                          </a>
                          {typeof r.candidateCount === "number" && r.candidateCount > 1 && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              🏆 후보 {r.candidateCount}개 중 조회수 1위 ({r.viewCount?.toLocaleString()}회)
                            </span>
                          )}
                        </div>

                        {/* 모바일 16:9 반응형 유튜브 플레이어 */}
                        {r.embedUrl && (
                          <div className="relative mt-2 overflow-hidden rounded-xl bg-black pb-[56.25%]">
                            <iframe
                              src={r.embedUrl}
                              title={r.title ?? p.display}
                              className="absolute inset-0 h-full w-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500 dark:bg-zinc-950/60 dark:text-zinc-400">
                        😢 영상을 찾지 못했어요
                        <div className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
                          검색어: "{r?.query ?? p.searchQuery}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
