import fs from "fs";
import https from "https";

const API_KEY = process.env.SPORTSDATA_KEY; // store your key in GitHub Secrets
const url = `https://api.sportsdata.io/golf/v2/json/Players?key=${API_KEY}`;

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const players = JSON.parse(data);

      fs.writeFileSync("./data/players.json", JSON.stringify(players, null, 2));
      console.log("✔ Player profiles updated: data/players.json");
    } catch (err) {
      console.error("Error parsing player data:", err);
    }
  });
}).on("error", (err) => {
  console.error("Request error:", err);
});
