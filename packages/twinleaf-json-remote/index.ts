// import * as jpnApiUtils from "./sources/jpn-api/utils";
// import * as tcgCollectorUtils from "./sources/tcg-collector/utils";
import type * as common from "twinleaf-json-common";
import * as limitlessTcgUtils from "./sources/limitless-tcg/utils";
import * as util from "node:util";
import * as fs from "node:fs";
import * as path from "node:path";

async function main(args: string[]) {
  const parsedArgs = util.parseArgs({
    args,
    options: {
      clean: {
        type: "boolean",
        default: false,
        short: "c",
      },
    },
    allowPositionals: true,
  });
  if (parsedArgs.positionals[2] == null) {
    throw new Error("Output path is missing");
  }
  const publicFolder = path.resolve(parsedArgs.positionals[2]);

  if (parsedArgs.values.clean) {
    await fs.promises.rm(publicFolder, { recursive: true, force: true });
  }

  await fs.promises.mkdir(publicFolder, { recursive: true });

  const sourceDescriptions: common.Sources = {
    // "JPN Cards API": {
    //   hidden: true,
    //   variants: {
    //     "Images": {
    //       filePath: "jpnapi/images.json",
    //       extract: () => jpnApiUtils.extract()
    //     },
    //   }
    // },
    "Limitless TCG (English + Japanese Cards, Canary)": {
      description: await limitlessTcgUtils.extractDescription(),
      variants: {
        Images: {
          filePath: "limitlesstcg/images.json",
          extract: () => limitlessTcgUtils.extract(),
        },
      },
    },
  };

  for (const [srcName, desc] of Object.entries(sourceDescriptions)) {
    for (const [variantName, variant] of Object.entries(desc.variants)) {
      const images = await variant.extract();
      const filePath = path.join(publicFolder, variant.filePath);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(
        path.join(publicFolder, variant.filePath),
        JSON.stringify(images, Object.keys(images).sort(), 2),
      );
      console.log(`Finished ${srcName} ${variantName}`);
    }
  }

  await fs.promises.writeFile(
    path.join(publicFolder, "manifest.json"),
    JSON.stringify(sourceDescriptions, null, 2),
  );
}

await main(process.argv);
