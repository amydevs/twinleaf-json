import sets from "../../deps/ptcg-api-data/sets/en.json" with { type: "json" };
import simpleGit from "simple-git";
import * as utils from "../../utils";
import * as url from "node:url";
import * as path from "node:path";

export async function extractDescription(): Promise<string | undefined> {
  // const repoPath = path.dirname(url.fileURLToPath(import.meta.resolve("../../../../")));
  const gitFilePath = url.fileURLToPath(
    import.meta.resolve("../../deps/ptcg-api-data/.git"),
  );
  const repoDirectory = path.dirname(gitFilePath);
  // const gitFile = await fs.promises.readFile(gitFilePath).then((e) => e.toString());
  // const gitDir = path.resolve(path.join(repoDirectory, gitFile.substring(8)));
  const logs = await simpleGit({ baseDir: repoDirectory }).log();
  return logs.latest != null ? `Updates: ${logs.latest.message}` : undefined;
}

export async function extract({
  imageSize = "large",
}: {
  imageSize?: "large" | "small";
} = {}): Promise<Record<string, string>> {
  const proms = [];

  for (const { id, ptcgoCode } of sets) {
    if (ptcgoCode == null) {
      continue;
    }
    let setAbbreviation = ptcgoCode;
    // no cards yet with CEL Collections, figure this out later
    if (id === "cel25c") {
      continue;
    }
    // black and white promos are just BWP
    else if (id === "bwp") {
      setAbbreviation = `BWP`;
    }
    // Nintendo Black Star Promos is just NP
    else if (id === "np") {
      setAbbreviation = "NP";
    } else if (id === "dpp") {
      setAbbreviation = "DPP";
    } else if (id === "swshp") {
      setAbbreviation = "SWSH";
    } else if (ptcgoCode.startsWith("PR-")) {
      setAbbreviation = `${ptcgoCode.substring(3)}P`;
    }

    proms.push(
      (async () => {
        const cards = (
          (await import(`../../deps/ptcg-api-data/cards/en/${id}.json`, {
            with: { type: "json" },
          })) as {
            default: {
              number: string;
              images: {
                large?: string;
                small?: string;
              };
            }[];
          }
        ).default;
        const output: Record<string, string> = {};
        for (const card of cards) {
          const [setWord, setDigits] = utils.extractFromSetNumber(
            card.number,
            true,
          );
          let key;
          // shining fates shiny vault does not use leading zeroes on the SV number
          if (["swshp", "bwp", "xyp"].includes(id)) {
            key = `${setAbbreviation} ${setDigits}`;
          } else {
            key = `${setAbbreviation} ${setWord ?? ""}${setDigits}`;
          }
          const imageUrl =
            card.images[imageSize] ?? card.images.large ?? card.images.small;
          if (imageUrl == null) {
            continue;
          }
          output[key] = imageUrl;
        }
        return output;
      })(),
    );
  }

  return Object.assign({}, ...(await Promise.all(proms))) as Record<
    string,
    string
  >;
}
