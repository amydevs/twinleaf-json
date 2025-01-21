import * as cheerio from 'cheerio';
import * as utils from "../../utils";

type CardPageResult = {
    cardSearchResultHtml: string;
    totalCardCount: number;
}

export async function extract(): Promise<Record<string, string>> {
    const sets = await fetch("https://www.tcgcollector.com/sets/partials/set-search-result/intl?setMode=anyCardVariant&releaseDateOrder=newToOld&displayAs=list").then(p => p.json()) as { setSearchResultHtml: string };
    const $ = cheerio.load(sets.setSearchResultHtml);
    const setNameMap: Record<string, string> = {
        "Yellow A Alternate": "HIF",
        "SWSH Black Star Promos": "SWSH",
    };
    $(".set-list-item.set-has-code.set-has-cards.set-has-symbol").each((_, e) => {
        const element = $(e);
        setNameMap[element.find(".set-symbol").attr("alt")!.trim()] = element.find(".set-list-item-set-code").html()!.trim();
    });

    const pageSize = 120;

    const firstPageResult = await fetch(`https://www.tcgcollector.com/cards/partials/card-search-result/intl?releaseDateOrder=newToOld&displayAs=list&cardsPerPage=30&page=1`).then((p) => p.json()) as CardPageResult;

    const proms = Array.from({ length: Math.ceil(firstPageResult.totalCardCount / pageSize) })
        .fill(null)
        .map(async (_, i) => {
            const result = await fetch(`https://www.tcgcollector.com/cards/partials/card-search-result/intl?releaseDateOrder=newToOld&displayAs=images&cardsPerPage=${pageSize}&page=${i + 1}`).then((p) => p.json()) as CardPageResult;
            const $ = cheerio.load(result.cardSearchResultHtml);
            const results: Record<string, string> = {};
            $(".card-image-grid-item.has-image").each((_, e) => {
                const element = $(e);
                const textParts = element.find(".card-image-grid-item-info-overlay-text-part");
                const [setPrefix, setNumber] = utils.extractFromSetNumber(textParts.html()!.trim().split("/")[0], true);
                const imageSrc = element.find(".card-image-grid-item-image").attr("src")!;
                const setSymbolSrc = element.find(".set-symbol").attr("alt");
                let setCode = setNameMap[setSymbolSrc as any] ?? textParts.next().html()?.trim();
                if (setCode == null) {
                    return;
                }
                if (["SWSH", "BWP", "XYP"].includes(setCode)) {
                    results[`${setCode} ${setNumber}`] = imageSrc; 
                }
                else {
                    results[`${setCode} ${setPrefix ?? ''}${setNumber}`] = imageSrc;
                }
            });
            return results;
        });
    return Object.assign({}, ...(await Promise.all(proms)));
}