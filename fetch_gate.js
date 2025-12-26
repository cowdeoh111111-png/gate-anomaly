const fs = require("fs");

function run() {
  const items = [
    {
      symbol: "BTC_USDT",
      direction: "long",
      score: 0.52,
      price: 43000
    },
    {
      symbol: "ETH_USDT",
      direction: "short",
      score: 0.41,
      price: 2200
    },
    {
      symbol: "SOL_USDT",
      direction: "long",
      score: 0.37,
      price: 98
    }
  ];

  const out = {
    updated: new Date().toLocaleString("zh-TW"),
    items
  };

  fs.writeFileSync(
    "data_fast.json",
    JSON.stringify(out, null, 2)
  );

  console.log("data_fast.json written");
}

run();
