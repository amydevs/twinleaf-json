import * as fs from "node:fs";
import * as url from "node:url";
import * as path from "node:path";

async function main() {
    const jsonsFolder = path.dirname(url.fileURLToPath(import.meta.resolve('twinleaf-json/manifest.json')));
    await fs.promises.cp(jsonsFolder, "./public/image-jsons", { recursive: true, force: true });
    await fs.promises.cp(path.join(jsonsFolder, "ptcgapi/large.json"), "./public/images.json", { force: true });
}

await main();