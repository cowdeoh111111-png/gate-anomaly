// fetch_gate.js
import fs from "fs";

const MODE = process.env.MODE || "fast";

// Gate API（USDT 永續）
const URL =
  "https://api.gateio.ws/api/v4/futures/usdt/contracts";

async function run() {
  const res = await fetch(URL);
  const data = await res.json();

  const items = [];

  for (const t of data) {
    try {
      const last = Number(t.last);
      const prev = Number(t.prev_settle_price);

      if (!last || !prev) continue;

      // 單幣漲跌幅（百分比）
      const pct = ((last - prev) / prev) * 100;

      // 實戰門檻（偏鬆，但不亂）
      if (Math.abs(pct) < 0.8) continue;

      items.push({
        symbol: t.name,
        direction: pct > 0 ? "long" : "short",
        score: Number(Math.abs(pct).toFixed(2)),
        price: last,
        category: "主流"
      });
    } catch (e) {
      // ignore
    }
  }

  // 依「異常程度」排序
  items.sort((a, b) => b.score - a.score);

  // 保底：只取前 5～20 名
  const finalItems = items.slice(0, MODE === "fast" ? 10 : 20);

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items: finalItems
  };

  fs.writeFileSync(
    MODE === "fast" ? "data_fast.json" : "data_slow.json",
    JSON.stringify(out, null, 2)
  );
}

run();
