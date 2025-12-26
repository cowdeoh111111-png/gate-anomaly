const fs = require("fs");
const https = require("https");

const MODE = process.env.MODE || "fast";
const OUTPUT_FILE = MODE === "fast" ? "data_fast.json" : "data_slow.json";

// ===== 你的習慣分類 =====
const MAJOR = ["BTC_USDT", "ETH_USDT"];
const MEME  = ["WIF_USDT", "PEPE_USDT", "DOGE_USDT"];

function categoryOf(symbol) {
  if (MAJOR.includes(symbol)) return "主流";
  if (MEME.includes(symbol)) return "瘋狗";
  return "山寨";
}

// ===== 抓 Gate 公開行情 =====
function fetchGate() {
  return new Promise((resolve, reject) => {
    https.get(
      "https://api.gateio.ws/api/v4/futures/usdt/tickers",
      res => {
        let raw = "";
        res.on("data", d => raw += d);
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on("error", reject);
  });
}

async function run() {
  const data = await fetchGate();
  const items = [];

  for (const t of data) {
    const symbol = t.contract;
    const change = Number(t.change_percentage);

    if (!symbol.endsWith("_USDT")) continue;
    if (Math.abs(change) < 0.8) continue; // C：異常門檻

    items.push({
      symbol,
      direction: change > 0 ? "long" : "short",
      change,
      price: Number(t.last),
      score: Math.round(Math.abs(change) * 100),
      category: categoryOf(symbol)
    });
  }

  // 分類排序（你熟的邏輯）
  items.sort((a, b) => {
    const order = { "主流": 0, "山寨": 1, "瘋狗": 2 };
    return order[a.category] - order[b.category] || b.score - a.score;
  });

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log("✅ updated:", items.length);
}

run();
