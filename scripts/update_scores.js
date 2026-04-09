const fs = require('fs');

async function updateData() {
    const apiKey = process.env.GOLF_API_KEY;

    // Hole-by-hole endpoint for the Masters
    const url = `https://api.sportsdata.io/golf/v2/json/PlayerTournamentHoleScores/688?key=${apiKey}`;

    try {
        console.log("Connecting to SportsDataIO...");
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API rejected the request with status ${response.status}`);
        }

        const data = await response.json();

        console.log("DEBUG: Players returned:", data.length);
        console.log("DEBUG: Sample player:", data[0]);

        let scores = {};

        for (const player of data) {
            const playerId = player.PlayerID;

            // Determine the current round:
            // Find the first round that has at least one non-null score
            let round = 1;
            if (player.Rounds && Array.isArray(player.Rounds)) {
                for (const r of player.Rounds) {
                    if (r.Holes && r.Holes.some(h => h.Score !== null)) {
                        round = r.Number;   // THIS is the round number
                        break;
                    }
                }
            }

            scores[playerId] = {
                round,
                holes: {}
            };

            // Extract hole-by-hole scoring
            if (player.Rounds && Array.isArray(player.Rounds)) {
                for (const r of player.Rounds) {
                    if (!r.Holes || !Array.isArray(r.Holes)) continue;

                    for (const hole of r.Holes) {
                        if (hole.Score === null) continue; // skip holes not yet played

                        scores[playerId].holes[hole.Number] = {
                            strokes: hole.Score,
                            par: hole.Par
                        };
                    }
                }
            }
        }

        // Save transformed file
        fs.writeFileSync('./data/scores.json', JSON.stringify(scores, null, 2));
        console.log("✅ Success! scores.json has been updated.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

updateData();
