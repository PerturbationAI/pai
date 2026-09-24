import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The identifier of the build this server is running.
 *
 * Next writes `.next/BUILD_ID` at build time and a new build always means a new
 * process, so the value is read once and kept. It exists to answer one
 * question a client cannot otherwise ask: "has the server I loaded from been
 * rebuilt since?" `/api/app-update` does not answer it — that one asks npm
 * whether a newer pi-web has been *published*, which is a different thing.
 */
export const dynamic = "force-dynamic";

let cached: string | undefined;

export async function GET() {
  if (cached === undefined) {
    try {
      cached = (await readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8")).trim();
    } catch {
      cached = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
    }
  }
  return Response.json({ buildId: cached }, { headers: { "Cache-Control": "no-store" } });
}
