import type {
    Serie as TCGDexSerie,
    Set as TCGDexSet,
  } from "../../deps/tcgdex-data/interfaces";
  import * as fs from "node:fs";
  import * as url from "node:url";
  import * as path from "node:path";
  import * as utils from "../../utils";
  import * as tcgdexUtils from "./utils";
  
  export async function extract({
    imageSize = "large",
  }: {
    imageSize?: "large" | "small"
  } = {}): Promise<Record<string, string>> {
    const imgs: Record<string, string> = {};
  
    const dataFolders = ["data", "data-asia"] as const;
  
    for (const dataFolder of dataFolders) {
      const seriesFiles = await fs.promises.readdir(
        path.dirname(
          url.fileURLToPath(
            import.meta.resolve(`../../deps/tcgdex-data/${dataFolder}/`),
          ),
        ),
        {
          withFileTypes: true,
        },
      );
      for (const seriesFile of seriesFiles) {
        if (!seriesFile.name.endsWith(".ts")) {
          continue;
        }
        const seriesInfo: TCGDexSerie = (
          await import(
            url
              .pathToFileURL(path.join(seriesFile.parentPath, seriesFile.name))
              .toString()
          )
        ).default;
        // ignore TCG Pocket
        if (seriesInfo.id === "tcgp") {
          continue;
        }
        const setFiles = await fs.promises.readdir(
          path.join(seriesFile.parentPath, seriesFile.name.slice(0, -3)),
          {
            withFileTypes: true,
          },
        );
        for (const setFile of setFiles) {
          if (!setFile.name.endsWith(".ts")) {
            continue;
          }
          const setInfo: TCGDexSet = (
            await import(
              url
                .pathToFileURL(path.join(setFile.parentPath, setFile.name))
                .toString()
            )
          ).default;
          let setAbbreviation: string | undefined;
  
          if (dataFolder === "data-asia") {
            setAbbreviation = setInfo.id;
          } else {
            setAbbreviation =
              setInfo.tcgOnline ?? setInfo.abbreviations?.official;
          }
  
          // sword and shield promos are listed as SWSH
          if (setInfo.id === "swshp") {
            setAbbreviation = "SWSH";
          }
          // Hidden Fates Shiny Vault has code HIF
          else if (setInfo.id === "sma") {
            setAbbreviation = "HIF";
          }
          // Scarlet and Violet is actually SVI
          else if (setInfo.id === "sv01") {
            setAbbreviation = "SVI";
          }
          // Stellar Crown
          else if (setInfo.id === "sv07") {
            setAbbreviation = "SCR";
          }
          else if (setAbbreviation?.startsWith("PR-")) {
            setAbbreviation = setInfo.abbreviations?.official ?? setAbbreviation.substring(3);
          }
          
          if (setAbbreviation == null) {
            // console.warn(
            //   `No official set abbreviation found for set id ${setInfo.id}, skipping...`,
            // );
            continue;
          }        
  
          const cardFilesDir = path.join(
            setFile.parentPath,
            setFile.name.slice(0, -3),
          );
          if (!fs.existsSync(cardFilesDir)) {
            // console.warn(`No cards found for set id ${setInfo.id}, skipping...`);
            continue;
          }
          const cardFiles = await fs.promises.readdir(cardFilesDir, {
            withFileTypes: true,
          });
          for (const cardFile of cardFiles) {
            if (!cardFile.name.endsWith(".ts")) {
              continue;
            }
            const setNumber = cardFile.name.slice(0, -3);
            const [setWord, setDigits] = utils.extractFromSetNumber(
              setNumber,
              true,
            );
            let key: string;
            if (["swshp", "bwp", "xyp"].includes(setInfo.id)) {
              key = `${setAbbreviation} ${setDigits}`;
            } else {
              key = `${setAbbreviation} ${setWord ?? ""}${setDigits}`;
            }
  
            if (key in imgs) {
              continue;
            }
            imgs[key] = tcgdexUtils.generateImageUrl(
              seriesInfo.id,
              setInfo.id,
              setNumber,
              {
                quality: imageSize === "large" ? "high" : "low"
              }
            );
          }
        }
      }
    }
    return imgs;
  }
  
  export function generateImageUrl(
    seriesId: string,
    setId: string,
    setNumber: string,
    {
      quality = "high",
      extension = "webp",
    }: {
      quality?: "high" | "low";
      extension?: "png" | "webp" | "jpg";
    } = {}
  ) {
    return `https://assets.tcgdex.net/en/${seriesId}/${setId}/${setNumber}/${quality}.${extension}`;
  }