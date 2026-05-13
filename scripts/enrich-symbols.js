import fs from 'fs/promises';

const API_KEY =
    process.env.FINNHUB_API_KEY;

const inputPath =
    './data/dashboard.json';

const outputPath =
    './generated/dashboard.json';

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

                        const response =
                            await fetch(
                                `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
                            );

                        const data =
                            await response.json();

                        return {

                            ...widget,

                            title : data.name|| symbol,
                            height: widget.height || 550,
                            interval: widget.interval || "D",

                        };

                    } catch (err) {

                        console.error(
                            `Failed: ${symbol}`
                        );

                        return {

                            ...widget,

                            title: symbol,
                             height: 550,
                             interval: "D",
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