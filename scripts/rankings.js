import fs from "fs";
import https from "https";

const API_KEY = process.env.GOLF_API_KEY;
const url = `https://api.sportsdata.io/golf/v2/json/Rankings/2026?key=${API_KEY}`;

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);

  res.on("end", () => {
    try {
      const json = JSON.parse(data);

      fs.writeFileSync("./data/rankings_2026.json", JSON.stringify(json, null, 2));
      console.log("✓ Rankings saved to data/rankings_2026.json");
    } catch (err) {
      console.error("Error parsing rankings:", err);
    }
  });
});
