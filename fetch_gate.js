// fetch_gate.js
// Gate 公開行情異常監控（不用 API Key）

const fs = require("fs");

const MODE = process.env.MODE || "fast";

// 你可以先固定幾個常見幣，確保一定有資料
const SYMBOLS = [
  "BTC_USDT",
  "ETH_USDT",
  "SOL_USDT"
];

// Gate 永續合約 ticker（公開 API）
const API =
  "https://api.gateio.ws/api/v4/futures/usdt/tickers";

async function run() {
  let items = [];

  try {
    const res = await fetch(API);
    const data = await res.json();

    for (const t of data) {
      if (!SYMBOLS.includes(t.contract)) continue;

      const last = parseFloat(t.last);
      const change = parseFloat(t.change_percentage); // 24h %
      if (!last || !change) continue;

      items.push({
        symbol: t.contract,
        direction: change >= 0 ? "long" : "short",
        change: Number(change.toFixed(2)),
        price: Math.round(last),
        score: Math.abs(Math.round(change * 100)) // 簡單異常分
      });
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items
  };

  fs.writeFileSync(
    MODE === "fast" ? "data_fast.json" : "data_slow.json",
    JSON.stringify(out, null, 2)
  );

  console.log("Saved", out.items.length, "items");
}

run();
