import { buildLlmsTxt } from "../lib/llms";

// /llms.txt: resumen en Markdown para asistentes de IA (https://llmstxt.org).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
