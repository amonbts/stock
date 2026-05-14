import axios from 'axios';
import fs from 'node:fs';

// =====================
// CONFIG: INDEX MAP
// =====================
const INDEX_CONFIG = {
    SPX: {
        symbolset: "SYML:SP;SPX",
        endpoint: "america"
    },
    NDX: {
        symbolset: "SYML:NASDAQ;NDX",
        endpoint: "america"
    },
    SXXP: {
        symbolset: "SYML:TVC;SXXP",
        endpoint: "global"
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

// =====================
// COLUMNS
// =====================
const COLUMNS = [
    "name",
    "description",
    "exchange",
    "close",
    "currency",
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

    "SMA10",
    "SMA30",
    "SMA50",
    "SMA100",
    "SMA200",
    "RSI"
];

const EXTRA_COLUMNS = [
    "trend_score",
    "trend_label",
    "rsi_state"
];

// =====================
// API FETCH (PRO)
// =====================
async function fetchData(symbolset, endpoint) {
    const url = `https://scanner.tradingview.com/${endpoint}/scan`;

    const payload = {
        symbols: {
            symbolset: [symbolset]
        },
        sort: {
            sortBy: "market_cap_basic",
            sortOrder: "desc"
        },
        columns: COLUMNS,
        range: [0, 500]
    };

    const res = await axios.post(url, payload, {
        headers: {
            'content-type': 'application/json',
            'origin': 'https://www.tradingview.com',
            'referer': 'https://www.tradingview.com/'
        }
    });

    return res.data;
}

// =====================
// TREND ENGINE
// =====================
function calculateTrendScore(row) {
    const [
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

    rows.sort((a, b) => {
        const scoreA = calculateTrendScore(a.d);
        const scoreB = calculateTrendScore(b.d);

        return scoreB - scoreA;
    });

    const header = [...COLUMNS, ...EXTRA_COLUMNS]
        .map(escapeCSV)
        .join(',');

    const csvRows = rows.map((row) => {
        if (!row.d) return '';

        const cleaned = row.d.map((cell) =>
            formatNumber(clean(cell))
        );

        const trendScore = calculateTrendScore(cleaned);
        const trendLabel = getTrendLabel(trendScore);
        const rsiState = getRSIState(
            cleaned[cleaned.length - 1]
        );

        return [
            ...cleaned,
            trendScore,
            trendLabel,
            rsiState
        ]
            .map(escapeCSV)
            .join(',');
    });

    return [header, ...csvRows].join('\n');
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

    const data = await fetchData(
        config.symbolset,
        config.endpoint
    );

    const csv = toCSV(data);

    const filename =
        `./generated/tradingview_${indexKey}_${getTimestamp()}.csv`;

    fs.writeFileSync(
        filename,
        '\uFEFF' + csv,
        'utf-8'
    );

    console.log(`✅ Done: ${filename}`);
    console.log(`📊 Rows (${indexKey}):`, data.data?.length || 0);
}

// =====================
// MAIN
// =====================
(async () => {
    try {
        const INDEXES = [
            "SPX",
            "NDX",
            "SXXP"
        ];

        for (const idx of INDEXES) {
            await exportIndex(idx);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
})();