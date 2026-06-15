// Data fetch and export engine for TradingView indexes (SPX, NDX, SXXP) with trend analysis and CSV output.
// https://www.tradingview.com/screener/sJpmfOgn/

import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
    retries: 5,

    retryDelay: (retryCount) => {
        const delay = retryCount * 2000;

        console.log(
            `⚠️ Retry #${retryCount} in ${delay}ms`
        );

        return delay;
    },

    retryCondition: (error) => {
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.response?.status === 429 ||
            error.response?.status >= 500
        );
    }
});

// =====================
// CONFIG: INDEX MAP
// =====================
const INDEX_CONFIG = {
    SPX: {
        symbols: {
            symbolset: ["SYML:SP;SPX"]
        },
        endpoint: "america",
        range: [0, 500],
    },
    NDX: {
        symbols: {
            symbolset: ["SYML:NASDAQ;NDX"],
        },
        endpoint: "america",
        range: [0, 500],
    },
    SXXP: {
        symbols: {
            symbolset: ["SYML:TVC;SXXP"],
        },
        endpoint: "global",
        range: [0, 500],
    },
    CUSTOM: {
        symbols: {
            symbolset: ["SYML:NASDAQ;SOX", "SYML:SP;SPX", "SYML:NASDAQ;NDX", "SYML:TVC;SXXP"],
        },
        endpoint: "global",
        range: [0, 1000],
        filter: [
            {
                left: "market_cap_basic",
                operation: "egreater",
                right: 6000000000
            },
            {
                left: "is_blacklisted",
                operation: "equal",
                right: false
            }
        ]

    }
};

// =====================
// CLEANING / FORMATTING
// =====================
function clean(text) {
    if (text === null || text === undefined) return '';
    return String(text).replace(/−/g, '-').trim();
}

function formatNumber(value) {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (!isNaN(num)) {
        return num.toFixed(2);
    }
    return value || '';
}

function escapeCSV(value) {
    if (value === null || value === undefined) return '';

    let str = String(value);
    if (str.includes('"')) {
        str = str.replace(/"/g, '""');
    }
    if (
        str.includes(',') ||
        str.includes('"') ||
        str.includes('\n')
    ) {
        str = `"${str}"`;
    }
    return str;
}

function getTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getWeekOfYear(date = new Date()) {
    // Copy date so original is not modified
    const d = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));

    // ISO week date weeks start on Monday
    // Get current day number (1 = Monday, 7 = Sunday)
    const dayNum = d.getUTCDay() || 7;

    // Set date to nearest Thursday
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    // First day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    // Calculate full weeks
    const weekNo = Math.ceil(
        (((d - yearStart) / 86400000) + 1) / 7
    );

    return weekNo;
}

function getYearWeek() {
    const now = new Date();
    const week = getWeekOfYear(now);
    return `${now.getFullYear()}-${week}`;
}

// =====================
// COLUMNS
// =====================
const COLUMNS = [
    "ticker-view",
    "name",
    "description",
    "exchange",

    "close",
    "type",
    "typespecs",
    "pricescale",
    "minmov",
    "fractional",
    "minmove2",
    "currency",
    "change",
    "volume",
    "relative_volume_10d_calc",
    "market_cap_basic",
    "fundamental_currency_code",
    "price_earnings_ttm",
    "earnings_per_share_diluted_ttm",
    "earnings_per_share_diluted_yoy_growth_ttm",
    "dividends_yield_current",
    "sector.tr",
    "market",
    "sector",
    "AnalystRating",
    "AnalystRating.tr",


    "change",
    "Perf.W",
    "Perf.1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.YTD",
    "Perf.Y",
    "Perf.5Y",
    "Perf.10Y",
    "Perf.All",
    "Volatility.W",
    "Volatility.M",


    "TechRating_1D",
    "TechRating_1D.tr",
    "MARating_1D",
    "MARating_1D.tr",
    "OsRating_1D",
    "OsRating_1D.tr",
    "RSI",
    "Mom",
    // "pricescale",
    // "minmov",
    // "fractional",
    // "minmove2",
    "AO",
    "CCI20",
    "Stoch.K",
    "Stoch.D",
    "candlestick_patterns_1D",


    "premarket_close",
    // "type",
    // "typespecs",
    // "pricescale",
    // "minmov",
    // "fractional",
    // "minmove2",
    // "currency",
    "premarket_change",
    "premarket_gap",
    "premarket_volume",
    // "close",
    // "change",
    "gap",
    "volume",
    "volume_change",
    "postmarket_close",
    "postmarket_change",
    "postmarket_volume",

    // "market_cap_basic",
    // "type",
    // "typespecs",
    // "fundamental_currency_code",
    "Perf.1Y.MarketCap",
    "price_earnings_ttm",
    "price_earnings_growth_ttm",
    "price_sales_current",
    "price_book_fq",
    "price_to_cash_f_operating_activities_ttm",
    "price_free_cash_flow_ttm",
    "price_to_cash_ratio",
    "enterprise_value_current",
    "enterprise_value_to_revenue_ttm",
    "enterprise_value_to_ebit_ttm",
    "enterprise_value_ebitda_ttm",

    "SMA10",
    "SMA30",
    "SMA50",
    "SMA100",
    "SMA200",
    // "RSI"
];

const EXTRA_COLUMNS = [
    "trend_score",
    "trend_label",
    "rsi_state"
];

// =====================
// API FETCH (PRO)
// =====================
async function fetchData(config) {
    const url = `https://scanner.tradingview.com/${config.endpoint}/scan`;

    const payload = {
        symbols: config.symbols || {},
        sort: {
            sortBy: "market_cap_basic",
            sortOrder: "desc"
        },
        columns: COLUMNS,
        range: config.range || [0, 500],
    filter: config.filter || config.filters || []
    };

    let res;

    try {

        res = await axios.post(url, payload, {
            timeout: 30000,
            headers: {
                'content-type': 'application/json',
                'origin': 'https://www.tradingview.com',
                'referer': 'https://www.tradingview.com/'
            }
        });

    } catch (error) {

        if (error?.response?.status === 400) {

            console.error('❌ TradingView scanner returned HTTP 400');
            console.error(`URL: ${url}`);
            console.error('Payload:', JSON.stringify(payload, null, 2));
            console.error('Response:', JSON.stringify(error.response?.data, null, 2));
        }

        throw error;
    }

    return res.data;
}

// =====================
// TREND ENGINE
// =====================
function calculateTrendScore(row) {
    const [
        tickerView,
        name,
        description,
        exchange,
        close,
        currency,
        change,
        perfW,
        perf1M,
        perf3M,
        perf6M,
        perfYTD,
        perfY,
        perf5Y,
        perf10Y,
        perfAll,
        volW,
        volM,
        sma10,
        sma30,
        sma50,
        sma100,
        sma200,
        rsi
    ] = row;

    const c = Number(close);
    const s10 = Number(sma10);
    const s50 = Number(sma50);
    const s100 = Number(sma100);
    const s200 = Number(sma200);
    const r = Number(rsi);

    let score = 0;

    // trend structure
    if (s10 > s50) score++;
    if (s50 > s100) score++;
    if (s100 > s200) score++;

    // price confirmation
    if (c > s10) score++;
    if (c > s50) score++;
    if (c > s200) score++;

    // RSI quality filter
    if (r > 40 && r < 70) score++;

    return score;
}

function getTrendLabel(score) {
    if (score >= 6) return "STRONG_UP";
    if (score >= 4) return "UP";
    if (score >= 2) return "SIDEWAYS";

    return "DOWN";
}

function getRSIState(rsi) {
    const r = Number(rsi);

    if (isNaN(r)) return "";

    if (r >= 70) return "OVERBOUGHT";
    if (r <= 30) return "OVERSOLD";

    return "NEUTRAL";
}

// =====================
// CSV BUILDER
// =====================
function toCSV(response) {
    const rows = response.data;

    if (!rows || !Array.isArray(rows)) {
        throw new Error("Invalid API response: missing data array");
    }

    // rows.sort((a, b) => {
    //     const scoreA = calculateTrendScore(a.d);
    //     const scoreB = calculateTrendScore(b.d);

    //     return scoreB - scoreA;
    // });

    // const header = [...COLUMNS, ...EXTRA_COLUMNS]
    //     .map(escapeCSV)
    //     .join(',');
    const header = [...COLUMNS]
        .map(escapeCSV)
        .join(',');

    const csvRows = rows.map((row) => {
        if (!row.d) return '';

        // const trendScore = calculateTrendScore(row.d);

        const cleaned = row.d.map((cell) =>
            formatNumber(clean(cell))
        );
        // const trendLabel = getTrendLabel(trendScore);
        // const rsiState = getRSIState(
        //     cleaned[cleaned.length - 1]
        // );

        return [
            ...cleaned,
            // trendScore,
            // trendLabel,
            // rsiState
        ]
            .map(escapeCSV)
            .join(',');
    });

    return [header, ...csvRows].join('\n');
}

async function ensureDirectoryExists(filename) {
    const dir = path.dirname(filename);

    await fs.mkdir(dir, {
        recursive: true
    });
}

async function saveJsonToFile(data, filename) {
    await ensureDirectoryExists(filename);

    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filename, json, 'utf-8');
    console.log(`✅ JSON saved: ${filename}`);
}


async function saveCSVToFile(data, filename) {
    await ensureDirectoryExists(filename);

    await fs.writeFile(
        filename,
        '\uFEFF' + data,
        'utf-8'
    );

    console.log(`✅ CSV saved: ${filename}`);
}



// =====================
// EXPORT ENGINE
// =====================
async function exportIndex(indexKey) {
    const config = INDEX_CONFIG[indexKey];

    if (!config) {
        throw new Error(`Unknown index: ${indexKey}`);
    }

    console.log(`📡 Fetching ${indexKey} via ${config.endpoint}...`);

    const data = await fetchData(config);

    const csv = toCSV(data);

    const filenameJSON = `./storage/tradingview_${indexKey}_${getYearWeek()}.json`;

    await saveJsonToFile(data, filenameJSON);

    const filename = `./storage/tradingview_${indexKey}_${getYearWeek()}.csv`;

    await saveCSVToFile(csv, filename);

    console.log(`✅ Done: ${filename}`);
    console.log(`📊 Rows (${indexKey}):`, data.data?.length || 0);
}

// =====================
// MAIN
// =====================
(async () => {
    try {
        for (const indexKey of Object.keys(INDEX_CONFIG)) {
            await exportIndex(indexKey);
        }

    } catch (err) {
        console.error("❌ Error:", err.message, err.stack);
    }
})();