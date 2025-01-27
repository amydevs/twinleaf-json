import * as cheerio from "cheerio";

export async function extractDescription(): Promise<string | undefined> {
  const homeHtml = await fetch("https://limitlesstcg.com/").then((e) =>
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

export async function extract(): Promise<Record<string, string>> {
  const regions = ["jp", ""] as const;
  const results: Record<string, string> = {};

  for (const region of regions) {
    const setsHtml = await fetch(
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
    const setCodes: string[] = [];
    $("table.sets-table > tbody > tr").each((_, e) => {
      const setCodeElement = $($(e).children()[0]);
      if (setCodeElement[0]!.name === "th") {
        return;
      }
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
      setCodes.push(setCode);
    });

    const proms = setCodes.map(async (setCode) => {
      const results: Record<string, string> = {};
      const cardsHtml = await fetch(
        `https://limitlesstcg.com/cards/${region === "" ? setCode : `${region}/${setCode}`}?display=classic`,
      ).then((p) => p.text());
      const $ = cheerio.load(cardsHtml);
      $(".card-classic").each((_, e) => {
        const cardElement = $(e);
        const cardImgSrc = cardElement.find("img.card").attr("src");
        const cardSetNumber = cardElement
          .find(".card-set-info")
          .text()
          .split("#", 2)[1]
          ?.trim();
        if (cardImgSrc == null || cardSetNumber == null) {
          return;
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
