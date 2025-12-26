// fetch_gate.js（CommonJS 版，GitHub Actions 可直接跑）
const fs = require("fs");

const MODE = process.env.MODE || "fast";

// Gate USDT 永續合約
const URL = "https://api.gateio.ws/api/v4/futures/usdt/contracts";

async function run() {
  const res = await fetch(URL);
  const data = await res.json();

  const items = [];

  for (const t of data) {
    try {
      const last = Number(t.last);
      const prev = Number(t.prev_settle_price);

      if (!last || !prev) continue;

      const pct = ((last - prev) / prev) * 100;

      // 異常門檻（夠鬆，一定會有）
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

  // 依異常程度排序
  items.sort((a, b) => b.score - a.score);

  // 保底顯示
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
