const fs = require('fs');
const path = require('path');

// Load team + player mappings
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teams.json')));
const teamPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/team_players_fixed.json')));

// Load hole-by-hole scoring (already cleaned by update_scores.js)
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

// Detect round from Rounds array
function detectRound(player) {
    if (!player || !player.Rounds) return 1;

    for (const r of player.Rounds) {
        if (r.Holes && r.Holes.some(h => h.Score !== null)) {
            return r.Number;
        }
    }

    return 1;
}

// Build leaderboard
let leaderboard = {};

for (const teamName of Object.keys(teamPlayers)) {
    leaderboard[teamName] = {
        total: 0,
        holes: {}
    };

    let players = teamPlayers[teamName];

    if (players && typeof players === 'object' && !Array.isArray(players)) {
        players = Object.values(players);
    }
    if (typeof players === 'string') {
        players = players.split(',').map(x => x.trim());
    }
    if (!Array.isArray(players)) continue;

    for (let hole = 1; hole <= 18; hole++) {
        let holeScores = [];

        for (const playerId of players) {
            const player = scores[playerId];
            if (!player) continue;

            const holeData = player.holes[hole];
            if (!holeData) continue;

            const { strokes, par } = holeData;
            const sf = scoreHole(strokes, par);

            if (sf !== null) holeScores.push(sf);
        }

        let holeTotal = 0;

        if (holeScores.length > 0) {
            let round = 1;

            for (const pid of players) {
                const p = scores[pid];
                if (!p) continue;

                round = detectRound(p);
                break;
            }

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

fs.writeFileSync(
    path.join(__dirname, '../data/fantasy.json'),
    JSON.stringify(leaderboard, null, 2)
);

console.log('✔ fantasy.json updated');
