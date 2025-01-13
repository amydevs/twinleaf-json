import * as fs from "node:fs";
import * as url from "node:url";
import * as path from "node:path";
import { withCache } from "ultrafetch";

const cacheUrl = import.meta.resolve("../tmp/cache.json");
const cachePath =  url.fileURLToPath(cacheUrl);

const fetchMap: Map<string, string> = await (async () => {
    const initCache = await import(cacheUrl, { with: { type: "json" } }).catch(() => ({}));
    return new Map(Object.entries(initCache));
})();

export async function saveCache() {
    await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.promises.writeFile(cachePath, JSON.stringify(Object.fromEntries(fetchMap.entries())));
}

export const cachedFetch = withCache(fetch, { cache: fetchMap })