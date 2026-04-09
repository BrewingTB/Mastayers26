const fs = require('fs');
const path = require('path');

// Load team + player mappings
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teams.json')));
const teamPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/team_players.json')));

// Load SportsDataIO hole-by-hole scoring
// This file should contain all players with their hole-by-hole scores
// Example: data/scores.json
const scores = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/scores.json')));

// Stableford scoring rules
function stableford(pointsRelativeToPar) {
    if (pointsRelativeToPar <= -2) return 5;   // Eagle or better
    if (pointsRelativeToPar === -1) return 2;  // Birdie
    if (pointsRelativeToPar === 0) return 0;   // Par
    if (pointsRelativeToPar === 1) return 1;   // Bogey
    return 2;                                  // Double bogey or worse
}

// Calculate Stableford for a single hole
function scoreHole(strokes, par) {
    if (!strokes || strokes === 0) return null; // No score yet
    return stableford(strokes - par);
}

// Build leaderboard
let leaderboard = {};

for (const teamName of Object.keys(teamPlayers)) {
    leaderboard[teamName] = {
        total: 0,
        holes: {} // hole → score
    };

    const players = teamPlayers[teamName];

    // Loop through all 18 holes
    for (let hole = 1; hole <= 18; hole++) {
        let holeScores = [];

        // Loop through all 4 players on the team
        for (const playerId of players) {
            const player = scores[playerId];
            if (!player) continue;

            const holeData = player.holes[hole];
            if (!holeData) continue;

            const { strokes, par } = holeData;
            const sf = scoreHole(strokes, par);

            if (sf !== null) {
                holeScores.push(sf);
            }
        }

        // Rounds 1–2: sum all 4 players
        // Rounds 3–4: best 2 scores
        let holeTotal = 0;

        if (holeScores.length > 0) {
            if (player.round <= 2) {
                // Sum all scores
                holeTotal = holeScores.reduce((a, b) => a + b, 0);
            } else {
                // Best 2 scores
                holeScores.sort((a, b) => b - a);
                holeTotal = holeScores.slice(0, 2).reduce((a, b) => a + b, 0);
            }
        }

        leaderboard[teamName].holes[hole] = holeTotal;
        leaderboard[teamName].total += holeTotal;
    }
}

// Save leaderboard
fs.writeFileSync(
    path.join(__dirname, '../data/fantasy.json'),
    JSON.stringify(leaderboard, null, 2)
);

console.log('✔ fantasy.json updated'
