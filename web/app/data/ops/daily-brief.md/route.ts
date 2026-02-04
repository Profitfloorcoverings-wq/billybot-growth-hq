import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "..", "ops", "daily-brief.md");
  const data = await readFile(filePath, "utf8");
  return new Response(data, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
