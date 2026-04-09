const fs = require('fs');
const path = require('path');

// Load data
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teams.json')));
const teamPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/team_players_fixed.json')));
const scores = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/scores.json')));

// Stableford scoring rules
function stableford(delta) {
    if (delta <= -3) return 8;   // Double eagle or better
    if (delta === -2) return 5;  // Eagle
    if (delta === -1) return 2;  // Birdie
    if (delta === 0) return 0;   // Par
    if (delta === 1) return -1;  // Bogey
    return -3;                   // Double bogey or worse
}

let dataset = [];

for (const teamName of Object.keys(teamPlayers)) {
    let players = teamPlayers[teamName];

    // Normalize players list
    if (players && typeof players === 'object' && !Array.isArray(players)) {
        players = Object.values(players);
    }
    if (typeof players === 'string') {
        players = players.split(',').map(x => x.trim());
    }
    if (!Array.isArray(players)) continue;

    for (const playerId of players) {
        const playerScore = scores[playerId];
        if (!playerScore) continue;

        const round = playerScore.round;
        const holes = playerScore.holes;

        for (let hole = 1; hole <= 18; hole++) {
            const holeData = holes[hole];
            if (!holeData) continue;

            const { strokes, par } = holeData;
            const delta = strokes - par;
            const sf = stableford(delta);

            dataset.push({
                team: teamName,
                playerId,
                playerName: playerScore.name || playerId, // optional if you add names
                hole,
                round,
                strokes,
                par,
                stableford: sf
            });
        }
    }
}

// Save dataset
fs.writeFileSync(
    path.join(__dirname, '../data/dataset.json'),
    JSON.stringify(dataset, null, 2)
);

console.log('✔ dataset.json created');
