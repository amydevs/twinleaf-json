import * as utils from '../utils';
type SetsResponse = {
    id: number;
    set_code: string;
}[];

type CardsResponse = {
    data: {
        id: number,
        sequenceNumber: number,
        printedNumber: string,
        imageUrl: string,
    }[],
    page: number,
    pageSize: number,
    count: number,
    totalCount: number
};

export async function extract(): Promise<Record<string, string>> {
    const sets = await utils.cachedFetch("https://www.jpn-cards.com/v2/set/").then(p => p.json()) as SetsResponse;
    const setProms = sets.map(async (set) => {
        let page = 1;
        let result: Record<string, string> = {}
        while (true) {
            const cards = await utils.cachedFetch(`https://www.jpn-cards.com/v2/card/set_id=${set.id}&page=${page}`).then(p => p.json()) as CardsResponse;
            await utils.saveCache();
            for (const card of cards.data) {
                result[`${set.set_code} ${card.printedNumber}`] = card.imageUrl;
            }
            if (cards.page * cards.pageSize >= cards.totalCount) {
                break;
            }
        }
        return result;
    });
    return Object.assign({}, ...(await Promise.all(setProms)));
}