import fs from 'fs/promises';

const inputPath =
    './data/dashboard.json';

const outputPath =
    './generated/dashboard.json';

const premarketOutputPath =
    './generated/premarket.json';

const SCANNER_ENDPOINTS = [
    'america',
    'global',
    'crypto'
];

const titleCache =
    new Map();

const US_EXCHANGES =
    new Set([
        'NASDAQ',
        'NYSE',
        'AMEX',
        'ARCA',
        'BATS',
        'CBOE'
    ]);

function isUsSymbol(symbolCode) {

    const exchange =
        (symbolCode || '').split(':')[0];

    return US_EXCHANGES.has(exchange);
}

function chunkArray(items, size) {

    const chunks = [];

    for (let i = 0; i < items.length; i += size) {

        chunks.push(items.slice(i, i + size));
    }

    return chunks;
}

async function fetchPremarketRows(symbols) {

    const response =
        await fetch(
            'https://scanner.tradingview.com/america/scan',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'origin': 'https://www.tradingview.com',
                    'referer': 'https://www.tradingview.com/'
                },
                body: JSON.stringify({
                    symbols: {
                        tickers: symbols,
                        query: {
                            types: []
                        }
                    },
                    columns: [
                        'name',
                        'description',
                        'logoid',
                        'close',
                        'premarket_close',
                        'premarket_change',
                        'premarket_change_abs',
                        'postmarket_close',
                        'postmarket_change',
                        'postmarket_change_abs'
                    ]
                })
            }
        );

    if (!response.ok) {

        throw new Error(`Premarket scan failed: HTTP ${response.status}`);
    }

    const payload =
        await response.json();

    return payload?.data || [];
}

async function buildPremarketSnapshot(widgets) {

    const symbols =
        [...new Set(
            widgets
                .map((widget) => widget.symbol)
                .filter(isUsSymbol)
        )];

    if (symbols.length === 0) {

        return {
            generatedAt: new Date().toISOString(),
            rows: []
        };
    }

    const chunks =
        chunkArray(symbols, 50);

    const rows = [];

    for (const chunk of chunks) {

        try {

            const partialRows =
                await fetchPremarketRows(chunk);

            rows.push(...partialRows);

        } catch (error) {

            console.error(
                `Premarket chunk failed for ${chunk.length} symbols`
            );
        }
    }

    return {
        generatedAt: new Date().toISOString(),
        rows: rows.map((row) => ({
            symbol: row?.s,
            ticker: row?.d?.[0],
            title: row?.d?.[1],
            logoid: row?.d?.[2],
            close: row?.d?.[3],
            premarketClose: row?.d?.[4],
            premarketChangePct: row?.d?.[5],
            premarketChangeAbs: row?.d?.[6],
            postmarketClose: row?.d?.[7],
            postmarketChangePct: row?.d?.[8],
            postmarketChangeAbs: row?.d?.[9]
        }))
    };
}

async function getTitleFromScanner(symbolCode) {

    if (titleCache.has(symbolCode)) {

        return titleCache.get(symbolCode);
    }

    const ticker =
        symbolCode.split(':')[1] || symbolCode;

    for (const endpoint of SCANNER_ENDPOINTS) {

        try {

            const response =
                await fetch(
                    `https://scanner.tradingview.com/${endpoint}/scan`,
                    {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            'origin': 'https://www.tradingview.com',
                            'referer': 'https://www.tradingview.com/'
                        },
                        body: JSON.stringify({
                            symbols: {
                                tickers: [symbolCode],
                                query: {
                                    types: []
                                }
                            },
                            columns: [
                                'name',
                                'description'
                            ]
                        })
                    }
                );

            if (!response.ok) {

                continue;
            }

            const data =
                await response.json();

            const row =
                data?.data?.[0];

            if (!row) {

                continue;
            }

            const title =
                row?.d?.[1] || row?.d?.[0] || ticker;

            titleCache.set(symbolCode, title);

            return title;

        } catch {

            // Try next endpoint.
        }
    }

    titleCache.set(symbolCode, ticker);

    return ticker;
}

async function enrich() {

    const raw =
        await fs.readFile(
            inputPath,
            'utf-8'
        );

    const config =
        JSON.parse(raw);

    const widgets =
        await Promise.all(

            config.widgets.map(
                async (widget) => {

                    const symbol =
                        widget.symbol
                            .split(':')[1];

                    try {

                        const scannerTitle =
                            await getTitleFromScanner(widget.symbol);

                        return {

                            ...widget,

                            title: widget.title || scannerTitle || symbol,
                            height: widget.height || 550,
                            interval: widget.interval || "D",

                        };

                    } catch (err) {

                        console.error(
                            `Failed: ${symbol}`
                        );

                        return {

                            ...widget,

                            title: widget.title || symbol,
                            height: widget.height || 550,
                            interval: widget.interval || "D",
                        };
                    }
                }
            )
        );

    const output = {

        ...config,

        widgets
    };

    await fs.mkdir(
        './generated',
        { recursive: true }
    );

    await fs.writeFile(
        outputPath,
        JSON.stringify(
            output,
            null,
            2
        )
    );

    const premarketSnapshot =
        await buildPremarketSnapshot(widgets);

    await fs.writeFile(
        premarketOutputPath,
        JSON.stringify(
            premarketSnapshot,
            null,
            2
        )
    );

    console.log(
        'Generated dashboard.json and premarket.json'
    );
}

enrich();