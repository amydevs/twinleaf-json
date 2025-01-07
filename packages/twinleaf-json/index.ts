import * as ptcgApiUtils from "./ptcg-api/utils";
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
    "Pokemon TCG API (English Cards Only)": {
      fileName: "ptcgapi_large.json",
      extract: ptcgApiUtils.extract
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
}

await main(process.argv);
