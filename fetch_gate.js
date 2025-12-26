// fetch_gate.js
// Wei 版 Gate 異常監控（短週期｜相對異常）

import fs from "fs";

const MODE = process.env.MODE || "fast";

// === 你可以之後微調的參數 ===
const LOOKBACK_MINUTES = 15;     // 看近 15 分鐘
const MIN_ABS_CHANGE = 0.25;     // 最少變動 0.25%
const TOP_N = 15;                // 最多顯示幾個

async function run() {
  const res = await fetch("https://api.gateio.ws/api/v4/futures/usdt/tickers");
  const data = await res.json();

  const now = new Date();

  const items = [];

  for (const t of data) {
    try {
      const change = parseFloat(t.change_percentage);
      if (Math.abs(change) < MIN_ABS_CHANGE) continue;

      const score = Math.round(Math.abs(change) * 100);

      items.push({
        symbol: t.contract,
        direction: change > 0 ? "long" : "short",
        change: change,
        price: Number(t.last),
        score: score
      });
    } catch (e) {}
  }

  items.sort((a, b) => b.score - a.score);

  const out = {
    updated: now.toLocaleString("zh-TW"),
    items: items.slice(0, TOP_N)
  };

  fs.writeFileSync(
    MODE === "fast" ? "data_fast.json" : "data_slow.json",
    JSON.stringify(out, null, 2)
  );
}

run();
