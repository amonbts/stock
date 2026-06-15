import fs from 'fs/promises';

const inputPath =
    './data/dashboard.json';

const outputPath =
    './generated/dashboard.json';

const SCANNER_ENDPOINTS = [
    'america',
    'global',
    'crypto'
];

const titleCache =
    new Map();

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

    console.log(
        'Generated dashboard.json'
    );
}

enrich();