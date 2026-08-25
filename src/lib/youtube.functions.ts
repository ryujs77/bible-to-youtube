import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getApiKey, getChannelId, searchPassage } from "./youtube.server";

export const searchBibleVideos = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
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
