import * as cheerio from "cheerio";
import { withCache } from "ultrafetch";

// This is REALLY jank, make a better way to define multiple source definitions later.
// This could crash CI memory if it is big enough lol.
const cachedFetch = withCache(fetch);

export async function extractDescription(): Promise<string | undefined> {
  const homeHtml = await cachedFetch("https://limitlesstcg.com/").then((e) =>
    e.text(),
  );
  const $ = cheerio.load(homeHtml);
  const updates: string[] = [];
  $(".site-news a").each((_, e) => {
    const element = $(e);
    if (element.attr("href")?.startsWith("/cards")) {
      updates.push(element.text().trim());
    }
  });
  if (updates.length === 0) {
    return;
  }
  return `Updates: ${updates.join(", ")}`;
}

export async function extract({
  imageSize = "large",
}: {
  imageSize?: "large" | "small";
} = {}): Promise<Record<string, string>> {
  const regions = [
    "jp",
    "",
  ] as const;
  const results: Record<string, string> = {};

  for (const region of regions) {
    const setsHtml = await cachedFetch(
      `https://limitlesstcg.com/cards/${region}`,
    ).then((p) => p.text());
    const $ = cheerio.load(setsHtml);
    const setCodeRewrites: Record<string, string> =
      region === ""
        ? {
            "WotC Promos": "PR",
            "Base Set 2": "B2",
            Expedition: "EX",
            "Best of Game": "BP",
            Aquapolis: "AQ",
            Skyridge: "SK",
            "Sword & Shield Promos": "SWSH",
          }
        : {};
    const setCodeUrlsMap: Record<string, string> = {};
    $("table.sets-table > tbody > tr").each((_, e) => {
      const setCodeElement = $($(e).children()[0]);
      if (setCodeElement[0]!.name === "th") {
        return;
      }
      const setUrl = `https://limitlesstcg.com${setCodeElement.find('a').attr('href')}`;
      let setName = setCodeElement
        .html()
        ?.match(/<img.*?set.*?>(.*?)<span/m)?.[1];
      setName =
        setName != null ? cheerio.load(setName).text().trim() : undefined;
      const setCode =
        setName != null && setName in setCodeRewrites
          ? setCodeRewrites[setName]
          : setCodeElement.find(".code").text()?.trim();
      if (setCode == null || setCode.length === 0) {
        console.warn(`${setName} could not be processed.`);
        return;
      }
      setCodeUrlsMap[setCode] = setUrl;
    });

    const proms = Object.entries(setCodeUrlsMap).map(async ([setCode, setUrlString]) => {
      const results: Record<string, string> = {};
      const setUrl = new URL(setUrlString);
      setUrl.searchParams.set("display", "classic");
      const cardsHtml = await cachedFetch(setUrl).then((p) => p.text());
      const $ = cheerio.load(cardsHtml);
      $(".card-classic").each((_, e) => {
        const cardElement = $(e);
        let cardImgSrc = cardElement.find("img.card").attr("src");
        const cardSetNumber = cardElement
          .find(".card-set-info")
          .text()
          .split("#", 2)[1]
          ?.trim();
        if (cardImgSrc == null || cardSetNumber == null) {
          return;
        }
        if (imageSize === "large") {
          const matchedSmall = /_XS(\..*?)$/.exec(cardImgSrc);
          if (matchedSmall?.index != null && matchedSmall[1] != null) {
            cardImgSrc = `${cardImgSrc.substring(0, matchedSmall.index)}${matchedSmall[1]}`;
          }
        }
        results[`${setCode} ${cardSetNumber}`] = cardImgSrc;
      });
      console.log(`Finished set ${setCode}`);
      return results;
    });

    Object.assign(results, ...(await Promise.all(proms)));
  }

  return results;
}
