import fs from "fs";

// Load hole-by-hole data pulled by your GitHub Action
const holeData = JSON.parse(fs.readFileSync("./data/masters_holes.json"));

// Load your teams (you must create teams.json)
const teams = JSON.parse(fs.readFileSync("./teams.json"));

// YOUR scoring rules
function stableford(par, strokes) {
  const diff = strokes - par;

  if (diff === -2) return 5;   // eagle
  if (diff === -1) return 2;   // birdie
  if (diff === 0) return 0;    // par
  if (diff === 1) return 1;    // bogey
  return 2;                    // double bogey or worse
}

// Build player → team lookup
const playerToTeam = {};
for (const [team, players] of Object.entries(teams)) {
  players.forEach(p => playerToTeam[p] = team);
}

// Team scoring structure
const teamScores = {};
Object.keys(teams).forEach(team => {
  teamScores[team] = {
    rounds: { 1: {}, 2: {}, 3: {}, 4: {} },
    total: 0
  };
});

// Process each hole
holeData.forEach(h => {
  const team = playerToTeam[h.PlayerID];
  if (!team) return; // ignore players not on a team

  const points = stableford(h.Par, h.Score);

  if (!teamScores[team].rounds[h.Round][h.Hole]) {
    teamScores[team].rounds[h.Round][h.Hole] = [];
  }

  teamScores[team].rounds[h.Round][h.Hole].push(points);
});

// Apply round rules
for (const [team, data] of Object.entries(teamScores)) {
  for (let round = 1; round <= 4; round++) {
    for (let hole = 1; hole <= 18; hole++) {
      const scores = data.rounds[round][hole] || [];

      let holeScore = 0;

      if (round <= 2) {
        // Rounds 1–2: sum all 4 players
        holeScore = scores.reduce((a, b) => a + b, 0);
      } else {
        // Rounds 3–4: best 2 scores
        holeScore = scores
          .sort((a, b) => b - a)
          .slice(0, 2)
          .reduce((a, b) => a + b, 0);
      }

      data.total += holeScore;
      data.rounds[round][hole] = holeScore;
    }
  }
}

// Output final fantasy scoring file
fs.writeFileSync("./public/fantasy.json", JSON.stringify(teamScores, null, 2));
console.log("Masters fantasy scoring updated.");
