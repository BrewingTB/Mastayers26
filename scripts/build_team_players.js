const fs = require('fs');
const path = require('path');

// Load your current team_players.json (flat list)
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/team_players.json')));

// Build new structure
let teams = {};

for (const entry of raw) {
    const teamName = entry.TeamName;
    const playerId = Number(entry.PlayerID);

    if (!teams[teamName]) {
        teams[teamName] = [];
    }

    teams[teamName].push(playerId);
}

// Save the corrected structure
fs.writeFileSync(
    path.join(__dirname, '../data/team_players_fixed.json'),
    JSON.stringify(teams, null, 2)
);

console.log("✔ team_players_fixed.json created");
