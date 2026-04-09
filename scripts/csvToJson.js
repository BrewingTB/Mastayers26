import fs from "fs";

function csvToJson(csvPath, jsonPath) {
  const csv = fs.readFileSync(csvPath, "utf8");
  const [header, ...rows] = csv.trim().split("\n");
  const keys = header.split(",");

  const json = rows.map(row => {
    const values = row.split(",");
    const obj = {};
    keys.forEach((key, i) => obj[key.trim()] = values[i].trim());
    return obj;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  console.log(`✔ Saved ${jsonPath}`);
}

csvToJson("./data/Teams.csv", "./data/teams.json");
csvToJson("./data/team_players.csv", "./data/team_players.json");
