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
        console.log("Players returned:", data.length);
        console.log("Sample player:", data[0]);

        // Transform API response into scores.json format
        let scores = {};

        for (const player of data) {
            const playerId = player.PlayerID;

            scores[playerId] = {
                round: player.RoundID,
                holes: {}
            };

            for (const hole of player.Holes) {
                scores[playerId].holes[hole.HoleNumber] = {
                    strokes: hole.Strokes,
                    par: hole.Par
                };
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
