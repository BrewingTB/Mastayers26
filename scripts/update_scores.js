const fs = require('fs');

async function updateData() {
    const apiKey = process.env.GOLF_API_KEY;

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

            scores[playerId] = {
                round: player.Rounds?.[0]?.Number ?? 1,
                holes: {}
            };

            // Loop through rounds
            if (!player.Rounds || !Array.isArray(player.Rounds)) continue;

            for (const round of player.Rounds) {
                if (!round.Holes || !Array.isArray(round.Holes)) continue;

                for (const hole of round.Holes) {
                    scores[playerId].holes[hole.Number] = {
                        strokes: hole.Score,
                        par: hole.Par
                    };
                }
            }
        }

        fs.writeFileSync('./data/scores.json', JSON.stringify(scores, null, 2));
        console.log("✅ Success! scores.json has been updated.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

updateData();
