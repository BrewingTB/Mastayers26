const fs = require('fs');
const path = require('path');

// Load team + player mappings
const teamPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/team_players_fixed.json')));
const scores = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/scores.json')));

// Stableford scoring rules
function stableford(delta) {
    if (delta <= -3) return 8;
    if (delta === -2) return 5;
    if (delta === -1) return 2;
    if (delta === 0) return 0;
    if (delta === 1) return -1;
    return -3;
}

function scoreHole(strokes, par) {
    if (!strokes || strokes === 0) return null;
    const delta = strokes - par;
    return stableford(delta);
}

// Build leaderboard with full multi-round structure
let leaderboard = {};

for (const teamName of Object.keys(teamPlayers)) {
    leaderboard[teamName] = {
        rounds: { "1": {}, "2": {}, "3": {}, "4": {} },
        roundTotals: { "1": 0, "2": 0, "3": 0, "4": 0 },
        total: 0
    };

    let players = teamPlayers[teamName];

    // Normalize players list
    if (players && typeof players === 'object' && !Array.isArray(players)) {
        players = Object.values(players);
    }
    if (typeof players === 'string') {
        players = players.split(',').map(x => x.trim());
    }
    if (!Array.isArray(players)) continue;

    // Loop through rounds 1–4
    for (let round = 1; round <= 4; round++) {

        // Loop through holes 1–18
        for (let hole = 1; hole <= 18; hole++) {
            let holeScores = [];

            for (const playerId of players) {
                const player = scores[playerId];
                if (!player) continue;

                // Look for key like "2-7"
                const key = `${round}-${hole}`;
                const holeData = player.holes[key];
                if (!holeData) continue;

                const { strokes, par } = holeData;
                const sf = scoreHole(strokes, par);

                if (sf !== null) holeScores.push(sf);
            }

            let holeTotal = 0;

            if (holeScores.length > 0) {
                // R1–R2: sum all 4 players
                // R3–R4: best 2 players
                if (round <= 2) {
                    holeTotal = holeScores.reduce((a, b) => a + b, 0);
                } else {
                    holeScores.sort((a, b) => b - a);
                    holeTotal = holeScores.slice(0, 2).reduce((a, b) => a + b, 0);
                }
            }

            leaderboard[teamName].rounds[round][hole] = holeTotal;
            leaderboard[teamName].roundTotals[round] += holeTotal;
        }
    }

    // Total across all rounds
    leaderboard[teamName].total =
        leaderboard[teamName].roundTotals[1] +
        leaderboard[teamName].roundTotals[2] +
        leaderboard[teamName].roundTotals[3] +
        leaderboard[teamName].roundTotals[4];
}

// Save leaderboard
fs.writeFileSync(
    path.join(__dirname, '../data/fantasy.json'),
    JSON.stringify(leaderboard, null, 2)
);

console.log('✔ fantasy.json updated with full multi-round scoring');
