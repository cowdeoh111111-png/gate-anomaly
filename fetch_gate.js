const fs = require("fs");

const MODE = process.env.MODE || "fast";

// Gate API（永續合約）
const API =
  "https://api.gateio.ws/api/v4/futures/usdt/tickers";

async function run() {
  const res = await fetch(API);
  const data = await res.json();

  // 將所有幣轉成漲跌幅
  const all = data
    .map(t => {
      const last = Number(t.last);
      const prev = Number(t.prev_settle_price);
      if (!last || !prev) return null;

      const pct = ((last - prev) / prev) * 100;

      return {
        symbol: t.contract,
        direction: pct > 0 ? "long" : "short",
        score: Number(Math.abs(pct).toFixed(2)),
        price: last,
        category: "測試"
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // 只取前 5 名

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items: all
  };

  const file =
    MODE === "fast" ? "data_fast.json" : "data_slow.json";

  fs.writeFileSync(file, JSON.stringify(out, null, 2));
}

run();
