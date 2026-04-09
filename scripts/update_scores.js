const fs = require('fs');

async function updateData() {
    const apiKey = process.env.GOLF_API_KEY;

    // Masters hole-by-hole endpoint
    const url = `https://api.sportsdata.io/golf/v2/json/PlayerTournamentHoleScores/688?key=${apiKey}`;

    try {
        console.log("Connecting to SportsDataIO...");
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API rejected the request with status ${response.status}`);
        }

        const data = await response.json();
        let scores = {};

        for (const player of data) {
            const playerId = player.PlayerID;

            // Determine the current round:
            // Find the first round that has at least one non-null result flag
            let round = 1;
            if (player.Rounds && Array.isArray(player.Rounds)) {
                for (const r of player.Rounds) {
                    if (
                        r.Holes &&
                        r.Holes.some(h =>
                            h.IsPar ||
                            h.Birdie ||
                            h.Eagle ||
                            h.DoubleEagle ||
                            h.Bogey ||
                            h.DoubleBogey ||
                            h.WorseThanDoubleBogey
                        )
                    ) {
                        round = r.Number;
                        break;
                    }
                }
            }

            scores[playerId] = {
                name: player.Name,
                round,
                holes: {}
            };

            // Extract hole-by-hole scoring using ONLY reliable flags
            if (player.Rounds && Array.isArray(player.Rounds)) {
                for (const r of player.Rounds) {
                    if (!r.Holes || !Array.isArray(r.Holes)) continue;

                    for (const hole of r.Holes) {
                        // Skip holes with no result flags (not played yet)
                        const hasResult =
                            hole.IsPar ||
                            hole.Birdie ||
                            hole.Eagle ||
                            hole.DoubleEagle ||
                            hole.Bogey ||
                            hole.DoubleBogey ||
                            hole.WorseThanDoubleBogey;

                        if (!hasResult) continue;

                        // Determine delta from flags
                        let delta = 0;

                        if (hole.DoubleEagle) delta = -3;
                        else if (hole.Eagle) delta = -2;
                        else if (hole.Birdie) delta = -1;
                        else if (hole.IsPar) delta = 0;
                        else if (hole.Bogey) delta = 1;
                        else if (hole.DoubleBogey) delta = 2;
                        else if (hole.WorseThanDoubleBogey) delta = 3;

                        const strokes = hole.Par + delta;

                        scores[playerId].holes[hole.Number] = {
                            strokes,
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
