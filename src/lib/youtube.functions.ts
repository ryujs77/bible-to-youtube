import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function getApiKey(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    process.env.VITE_YOUTUBE_API_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_YOUTUBE_API_KEY as string) : undefined)
  );
}

function getChannelId(): string {
  return (
    process.env.YOUTUBE_CHANNEL_ID ||
    process.env.VITE_YOUTUBE_CHANNEL_ID ||
    (typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string) : undefined) ||
    "UCISl2wEDnzYeg-k_kElfN4Q"
  );
}

const MAX_PAGES = 60; // 50 items per page

type VideoItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount?: number;
};

// 구절별 검색 결과 캐시 (30분)
const queryCache = new Map<string, { result: VideoItem | null; candidateCount: number; at: number }>();
const CACHE_MS = 30 * 60 * 1000;

function normalize(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

function isExcludedTitle(title: string): boolean {
  const t = normalize(title);
  return (
    t.includes("드라마바이블") ||
    t.includes("dramabible") ||
    t.includes("개역개정")
  );
}

function matchesPassage(title: string, book: string, chapter: string): boolean {
  const t = normalize(title);
  const b = normalize(book);
  const patterns = [`${b}${chapter}장`, `${b}${chapter}편`, `${b}${chapter}`];

  for (const p of patterns) {
    if (t.includes(p)) {
      const idx = t.indexOf(p);
      const next = t[idx + p.length];
      if (!(next && /\d/.test(next))) {
        return true;
      }
    }
  }
  return false;
}

async function fetchVideoViewCounts(
  videoIds: string[],
  apiKey: string,
): Promise<Record<string, number>> {
  if (videoIds.length === 0) return {};
  const viewCounts: Record<string, number> = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk.join(",")}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        items?: Array<{ id: string; statistics?: { viewCount?: string } }>;
      };
      for (const item of json.items ?? []) {
        viewCounts[item.id] = parseInt(item.statistics?.viewCount ?? "0", 10);
      }
    } catch (e) {
      console.error("Failed to fetch video viewCounts:", e);
    }
  }
  return viewCounts;
}

async function searchPassage(
  book: string,
  chapter: string,
  apiKey: string,
  channelId: string,
): Promise<{ best: VideoItem | null; candidateCount: number }> {
  const unit = book === "시편" ? "편" : "장";
  const cacheKey = `${channelId}:${book}:${chapter}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return { best: cached.result, candidateCount: cached.candidateCount };
  }

  // 1. YouTube Search API로 채널 내 검색 (8,000개 이상 영상 전체 대상)
  const searchQuery = `${book} ${chapter}${unit}`;
  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}` +
    `&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=15&key=${apiKey}`;

  let items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      thumbnails?: { medium?: { url: string }; default?: { url: string } };
    };
  }> = [];

  try {
    const res = await fetch(searchUrl);
    if (res.ok) {
      const json = (await res.json()) as {
        items?: typeof items;
      };
      items = json.items ?? [];
    }
  } catch (e) {
    console.error(`Search API error for ${searchQuery}:`, e);
  }

  // 2. 검색 결과 중 제외 대상 필터링 및 구절 매칭
  const validCandidates: VideoItem[] = [];
  const candidateMap = new Map<string, VideoItem>();

  for (const it of items) {
    const videoId = it.id?.videoId;
    const title = it.snippet?.title ?? "";
    if (!videoId || isExcludedTitle(title)) continue;
    if (matchesPassage(title, book, chapter)) {
      const video: VideoItem = {
        videoId,
        title,
        thumbnail:
          it.snippet.thumbnails?.medium?.url ??
          it.snippet.thumbnails?.default?.url ??
          "",
      };
      if (!candidateMap.has(videoId)) {
        candidateMap.set(videoId, video);
        validCandidates.push(video);
      }
    }
  }

  // 3. 후보 영상 조회수 확인 및 정렬 (가장 높은 조회수 우선)
  if (validCandidates.length > 0) {
    const videoIds = validCandidates.map((v) => v.videoId);
    const viewCounts = await fetchVideoViewCounts(videoIds, apiKey);
    for (const v of validCandidates) {
      v.viewCount = viewCounts[v.videoId] ?? 0;
    }
    if (validCandidates.length > 1) {
      validCandidates.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }
  }

  const best = validCandidates.length > 0 ? validCandidates[0] : null;
  const candidateCount = validCandidates.length;

  queryCache.set(cacheKey, { result: best, candidateCount, at: Date.now() });
  return { best, candidateCount };
}

export const searchBibleVideos = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        queries: z
          .array(z.object({ book: z.string(), chapter: z.string(), display: z.string() }))
          .min(1)
          .max(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { error: "YOUTUBE_API_KEY is not configured.", results: [] };
    }

    const channelId = getChannelId();

    try {
      const results = await Promise.all(
        data.queries.map(async (p) => {
          const unit = p.book === "시편" ? "편" : "장";
          const query = `${p.book} ${p.chapter}${unit}`;
          const { best, candidateCount } = await searchPassage(
            p.book,
            p.chapter,
            apiKey,
            channelId,
          );

          if (!best) {
            return { display: p.display, query, found: false as const };
          }

          return {
            display: p.display,
            query,
            found: true as const,
            videoId: best.videoId,
            url: `https://www.youtube.com/watch?v=${best.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${best.videoId}`,
            title: best.title,
            thumbnail: best.thumbnail,
            viewCount: best.viewCount,
            candidateCount,
          };
        }),
      );

      return { error: null, results };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "동영상 검색 중 오류가 발생했습니다.",
        results: [],
      };
    }
  });
