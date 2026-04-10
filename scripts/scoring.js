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

// Detect the CURRENT round from scores.json
function detectRound(player) {
    return player.round || 1;
}

// Build leaderboard
let leaderboard = {};

for (const teamName of Object.keys(teamPlayers)) {
    leaderboard[teamName] = {
        total: 0,
        holes: {}
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

    // Loop through holes 1–18
    for (let hole = 1; hole <= 18; hole++) {
        let holeScores = [];

        for (const playerId of players) {
            const player = scores[playerId];
            if (!player) continue;

            const currentRound = detectRound(player);

            // Look for key like "2-7"
            const key = `${currentRound}-${hole}`;
            const holeData = player.holes[key];

            if (!holeData) continue;

            const { strokes, par } = holeData;
            const sf = scoreHole(strokes, par);

            if (sf !== null) holeScores.push(sf);
        }

        let holeTotal = 0;

        if (holeScores.length > 0) {
            // Determine round from first player
            let round = detectRound(scores[players[0]]);

            // R1–R2: sum all 4 players
            // R3–R4: best 2 players
            if (round <= 2) {
                holeTotal = holeScores.reduce((a, b) => a + b, 0);
            } else {
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

console.log('✔ fantasy.json updated');
