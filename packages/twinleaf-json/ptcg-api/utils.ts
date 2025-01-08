import sets from "../deps/ptcg-api-data/sets/en.json" with { type: "json" };
import * as utils from "../utils";

export async function extract(): Promise<Record<string, string>> {
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
    }
    else if (id === "dpp"){
      setAbbreviation = "DPP";
    }
    else if (id === "swshp") {
      setAbbreviation = "SWSH";
    } else if (ptcgoCode.startsWith("PR-")) {
      setAbbreviation = `${ptcgoCode.substring(3)}P`;
    }

    proms.push(
      (async () => {
        const cards = (
          await import(`../deps/ptcg-api-data/cards/en/${id}.json`, {
            with: { type: "json" },
          })
        ).default;
        let output: Record<string, string> = {};
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
          output[key] = card.images.large ?? card.images.small;
        }
        return output;
      })(),
    );
  }

  return Object.assign({}, ...(await Promise.all(proms)));
}

function removeLeadingZeroes(input: string) {
  return input.match(/^(0*)(.*)/)![2];
}
