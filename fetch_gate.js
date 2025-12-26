// fetch_gate.js
// Gate 異常監控（排序 + 強度分數版）
// 不需要 API KEY（使用公開行情）

const fs = require("fs");

const API =
  "https://api.gateio.ws/api/v4/spot/tickers";

const TOP_N = 10;          // 最多顯示幾個
const MIN_PERCENT = 0.3;   // 低於這個 % 視為不夠異常

async function run() {
  const res = await fetch(API, {
    headers: { Accept: "application/json" },
  });

  const data = await res.json();

  const items = [];

  for (const t of data) {
    const symbol = t.currency_pair;
    if (!symbol.endsWith("_USDT")) continue;

    const change = parseFloat(t.change_percentage);
    const last = parseFloat(t.last);

    if (!isFinite(change) || !isFinite(last)) continue;
    if (Math.abs(change) < MIN_PERCENT) continue;

    const direction = change > 0 ? "LONG" : "SHORT";

    // 異常強度分數（你之後可以自己調）
    const score = Math.round(
      Math.abs(change) * 100 + Math.log10(last + 1) * 10
    );

    items.push({
      symbol,
      direction,
      change: change.toFixed(2),
      price: Math.round(last),
      score,
    });
  }

  // 依異常分數排序（最瘋的在最上面）
  items.sort((a, b) => b.score - a.score);

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items: items.slice(0, TOP_N),
  };

  fs.writeFileSync("data_fast.json", JSON.stringify(out, null, 2));
}

run();
