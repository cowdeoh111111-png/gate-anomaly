const fs = require("fs");

// ===== 設定 =====
const MODE = process.env.MODE || "fast";
const OUTPUT_FILE = MODE === "fast" ? "data_fast.json" : "data_slow.json";

// ===== 測試用假資料（先確定整條管線是通的）=====
function getTestData() {
  return [
    {
      symbol: "BTC_USDT",
      direction: "short",
      change: -1.1,
      price: 87223,
      score: 110
    },
    {
      symbol: "ETH_USDT",
      direction: "short",
      change: -1.07,
      price: 2921,
      score: 107
    },
    {
      symbol: "SOL_USDT",
      direction: "short",
      change: -1.47,
      price: 122,
      score: 147
    }
  ];
}

// ===== 主程式 =====
function run() {
  const items = getTestData();

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(out, null, 2),
    "utf8"
  );

  console.log("✅ write file:", OUTPUT_FILE);
  console.log("items:", items.length);
}

run();
