import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { searchBibleVideos } from "@/lib/youtube.functions";
import { extractPassages, type Passage } from "@/lib/bible-books";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "성경 → 유튜브 링크 변환기" },
      {
        name: "description",
        content:
          "성경 구절을 입력하면 유튜브 채널에서 영상을 자동으로 찾아드립니다.",
      },
      { property: "og:title", content: "성경 → 유튜브 링크 변환기" },
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
      setError("성경 구절을 입력해 주세요!");
      return;
    }
    const found = extractPassages(trimmed);
    if (found.length === 0) {
      setError("성경 구절 형식을 찾을 수 없어요. (예: 수2장, 시123-125편, 마10장)");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-2xl">

        {/* 헤더 */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            📖
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            성경 → 유튜브 링크
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            성경 구절을 입력하면 유튜브 영상 링크를 자동으로 찾아드려요
          </p>
        </header>

        {/* 메인 입력 카드 */}
        <div className="rounded-2xl bg-white/5 p-5 shadow-xl backdrop-blur-sm ring-1 ring-white/10 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              구절 입력
            </label>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/20 active:scale-95"
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
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            placeholder="예: 수2장, 시123-125편, 사62장, 마10장"
          />

          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "🔍 검색 중..." : "🔎 유튜브에서 찾기"}
            </button>
            {text && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/10 active:scale-[0.98]"
              >
                지우기
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="mt-4 rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
            <p className="text-xs font-medium text-slate-400">
              유튜브 채널에서 영상을 검색하고 있어요...
            </p>
          </div>
        )}

        {/* 검색 결과 */}
        {results.length > 0 && (
          <div className="mt-5 space-y-3">
            {/* 요약 바 */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <span className="text-xs font-semibold text-slate-300">
                🎥 결과 {foundCount}/{results.length}개
              </span>
              {foundCount > 0 && (
                <button
                  type="button"
                  onClick={copyAllLinks}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-500 active:scale-95"
                >
                  {copiedAll ? "✅ 복사됨!" : "📋 전체 링크 복사"}
                </button>
              )}
            </div>

            {/* 카드 목록 */}
            <div className="space-y-3">
              {passages.map((p, i) => {
                const r = results[i];
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
                  >
                    {/* 구절명 + 복사 버튼 */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-violet-600/20 px-2 py-0.5 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
                          {p.bookAbbr}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {p.display}
                        </span>
                      </div>
                      {r?.found && r.url && (
                        <button
                          type="button"
                          onClick={() => copySingleLink(i, `${p.display} ${r.url}`)}
                          className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-white/20 active:scale-95"
                        >
                          {copiedItemIdx === i ? "✅ 복사됨" : "링크 복사"}
                        </button>
                      )}
                    </div>

                    {r?.found ? (
                      <div className="mt-3 space-y-2.5">
                        {/* 링크 */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all font-medium text-violet-400 hover:text-violet-300 hover:underline"
                          >
                            🔗 {r.url}
                          </a>
                          {typeof r.candidateCount === "number" && r.candidateCount > 1 && (
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                              🏆 {r.candidateCount}개 중 조회수 1위 ({r.viewCount?.toLocaleString()}회)
                            </span>
                          )}
                        </div>

                        {/* 유튜브 플레이어 */}
                        {r.embedUrl && (
                          <div className="relative overflow-hidden rounded-xl bg-black pb-[56.25%] ring-1 ring-white/10">
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
                      <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-500">
                        😢 영상을 찾지 못했어요
                        <div className="mt-0.5 text-[11px] text-slate-600">
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
