import * as utils from '../../utils';
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
    const sets = await fetch("https://www.jpn-cards.com/v2/set/").then(p => p.json()) as SetsResponse;

    // throttled fetch
    const size = Math.ceil(sets.length / 10);
    const splitSets: Array<SetsResponse> = Array.from({ length: 2 }, (_, i) =>
        sets.slice(i * size, i * size + size)
    );

    console.log(`${splitSets.length} requests are set to be run simultaneously`);

    const proms = splitSets.map(async (e) => {
        const result: Record<string, string> = {};
        for (const set of e) {
            let page = 1;
            while (true) {
                console.log(`Completed set ${set.set_code}`);
                const cardsText = await fetch(`https://www.jpn-cards.com/v2/card/set_id=${set.id}&page=${page}`).then((e) => e.text());
                let cards: CardsResponse;
                try {
                    cards = JSON.parse(cardsText) as CardsResponse;
                }
                catch {
                    throw new Error(`Could not parse: https://www.jpn-cards.com/v2/card/set_id=${set.id}&page=${page}`);
                } 
                for (const card of cards.data) {
                    result[`${set.set_code} ${card.printedNumber}`] = card.imageUrl;
                }
                if (cards.page * cards.pageSize >= cards.totalCount) {
                    break;
                }
                page++;
            }
        }
        return result;
    });
    
    return Object.assign({}, ...(await Promise.all(proms)));
}