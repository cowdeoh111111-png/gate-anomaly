// Node.js 18+（GitHub Actions 內建 fetch）
const fs = require("fs");

const MODE = process.env.MODE || "fast";
const INTERVAL = MODE === "fast" ? "1m" : "5m";
const LIMIT = 50;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchTickers() {
  return fetchJSON("https://api.gateio.ws/api/v4/futures/usdt/tickers");
}

async function fetchCandles(symbol) {
  return fetchJSON(
    `https://api.gateio.ws/api/v4/futures/usdt/candlesticks?contract=${symbol}&interval=${INTERVAL}&limit=${LIMIT}`
  );
}

async function run() {
  const tickers = await fetchTickers();

  const top = tickers
    .filter(t => t.contract.endsWith("USDT"))
    .slice(0, 30); // 🔴 先少一點，保證穩

  const items = [];

  for (const t of top) {
    try {
      const candles = await fetchCandles(t.contract);
      if (!candles || candles.length < 10) continue;

      const last = candles[candles.length - 1];
      const prev = candles[candles.length - 2];

      const close = Number(last[2]);
      const prevClose = Number(prev[2]);
      if (!close || !prevClose) continue;

      const change = (close - prevClose) / prevClose;

      items.push({
        symbol: t.contract,
        direction: change > 0 ? "long" : "short",
        score: Math.round(Math.abs(change) * 10000),
        category: "主流"
      });
    } catch (e) {
      // ignore
    }
  }

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items
  };

  fs.writeFileSync(
    MODE === "fast" ? "data_fast.json" : "data_slow.json",
    JSON.stringify(out, null, 2)
  );
}

run();
