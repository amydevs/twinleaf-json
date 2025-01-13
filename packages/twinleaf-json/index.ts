import * as ptcgApiUtils from "./ptcg-api/utils";
import * as jpnApiUtils from "./jpn-api/utils";
import * as utils from "./utils";
import * as util from "node:util";
import * as fs from "node:fs";
import * as path from "node:path";

async function main(args: string[]) {
  const parsedArgs = util.parseArgs({
    args,
    options: {
      clean: {
        type: 'boolean',
        default: false,
        short: 'c'
      }
    },
    allowPositionals: true,
  });
  if (parsedArgs.positionals[2] == null) {
    throw "Output path is missing";
  }
  const publicFolder = path.resolve(parsedArgs.positionals[2]);

  if (parsedArgs.values.clean) {
    await fs.promises.rm(publicFolder, { recursive: true, force: true });
  }

  await fs.promises.mkdir(publicFolder, { recursive: true });

  const sourceDescriptions: Record<string, { fileName: string, extract: () => Promise<Record<string, string>>  }> = {
    "Pokemon TCG API + JPN-Cards": {
      fileName: "ptcgapi_large.json",
      extract: async () => {
        const jpnApiPath = path.join(publicFolder, "jpnapi.json");
        const lastModifiedMs = await fs.promises.stat(jpnApiPath).then(p => p.mtimeMs, (() => 0));
        if (Date.now() - lastModifiedMs < 1000 * 60 * 60 * 24) {
          return await ptcgApiUtils.extract();
        }
        return Object.assign(
          {},
          ...(
            await Promise.all([
              ptcgApiUtils.extract(),
              jpnApiUtils.extract().then(async (p) => {
                await fs.promises.writeFile(jpnApiPath, JSON.stringify(p));
                return p;
              })
            ])
          )
        );       
      }
    },
  };

  for (const [, desc] of Object.entries(sourceDescriptions)) {
    const images = await desc.extract();
    await fs.promises.writeFile(
      path.join(publicFolder, desc.fileName),
      JSON.stringify(images, Object.keys(images).sort(), 2),
    );
  }

  await fs.promises.writeFile(
    path.join(publicFolder, "manifest.json"),
    JSON.stringify(
      Object.assign({}, ...Object.entries(sourceDescriptions).map(([source, desc]) => ({
        [source]: {
          fileName: desc.fileName,
        }
      }))),
      null,
      2
    ),
  );
  
  await utils.saveCache();
}

await main(process.argv);
