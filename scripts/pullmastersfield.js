import fs from "fs";
import https from "https";

const API_KEY = process.env.GOLF_API_KEY;
const url = `https://api.sportsdata.io/golf/v2/json/Leaderboard/688?key=${API_KEY}`;

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);

  res.on("end", () => {
    try {
      const json = JSON.parse(data);

      if (!json.Players) {
        console.error("❌ No Players array found in API response");
        console.log(json);
        return;
      }

      const field = json.Players.map(p => ({
        PlayerID: p.PlayerID,
        FullName: p.Name
      }));

      fs.writeFileSync("./data/masters_players.json", JSON.stringify(field, null, 2));
      console.log("✓ Masters field saved to data/masters_players.json");
    } catch (err) {
      console.error("Error parsing Masters field:", err);
    }
  });
});
