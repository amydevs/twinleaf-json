import * as ptcgApiUtils from "./sources/ptcg-api/utils";
import * as tcgdexUtils from "./sources/tcgdex/utils";
import * as util from "node:util";
import * as fs from "node:fs";
import * as path from "node:path";
import remoteManifest from "twinleaf-json-remote/manifest.json";

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

  const sourceDescriptions: Record<string, {
    variants: Record<string, {
      filePath: string,
      extract: () => Promise<Record<string, string>>,
    }>
  }> = {
    "TCGDex (English + Japanese Cards, Canary)": {
      variants: {
        "Hi-Res Images": {
          filePath: "tcgdex/large.json",
          extract: () => tcgdexUtils.extract({ imageSize: "large" })
        },
        "Low-Res Images": {
          filePath: "tcgdex/small.json",
          extract: () => tcgdexUtils.extract({ imageSize: "small" })
        }
      }
    },
    "Pokemon TCG API (English Cards Only, Stable)": {
      variants: {
        "Hi-Res Images": {
          filePath: "ptcgapi/large.json",
          extract: () => ptcgApiUtils.extract({ imageSize: "large" })
        },
        "Low-Res Images": {
          filePath: "ptcgapi/small.json",
          extract: () => ptcgApiUtils.extract({ imageSize: "small" })
        }
      }
    },
  };

  for (const [, desc] of Object.entries(sourceDescriptions)) {
    for (const [, variant] of Object.entries(desc.variants)) {
      const images = await variant.extract();
      const filePath = path.join(publicFolder, variant.filePath);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(
        path.join(publicFolder, variant.filePath),
        JSON.stringify(images, Object.keys(images).sort(), 2),
      );
    }
  }

  for (const [, desc] of Object.entries(remoteManifest)) {
    for (const [, variant] of Object.entries(desc.variants)) {
      const images = await import(`twinleaf-json-remote/${variant.filePath}`);
      const filePath = path.join(publicFolder, variant.filePath);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(
        path.join(publicFolder, variant.filePath),
        JSON.stringify(images, Object.keys(images).sort(), 2),
      );
    }
  }

  await fs.promises.writeFile(
    path.join(publicFolder, "manifest.json"),
    JSON.stringify(
      { ...sourceDescriptions, ...remoteManifest },
      null,
      2
    ),
  );
}

await main(process.argv);
