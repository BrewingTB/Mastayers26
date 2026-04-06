const fs = require('fs');

// This matches the "Secret" you will set up in Step 5
const apiKey = process.env.GOLF_API_KEY; 
const tournamentId = '628'; // Testing with 2025 Masters
const url = `https://sportsdata.io{tournamentId}?key=${apiKey}`;

async function updateData() {
    try {
        console.log("Fetching data from SportsDataIO...");
        const response = await fetch(url);
        const players = await response.json();

        // --- SIMPLE MATH TEST ---
        // Let's calculate a basic Stableford score for the first player
        // Rule: Birdie (score < par) = 2pts, Par = 1pt, Bogey = 0pts
        const testPlayer = players[0];
        const round1Holes = testPlayer.Rounds[0].Holes;
        
        let totalPoints = 0;
        round1Holes.forEach(hole => {
            if (hole.Score < hole.Par) totalPoints += 2; // Birdie or better
            else if (hole.Score === hole.Par) totalPoints += 1; // Par
        });

        // Create a small "Results" object to save
        const results = {
            lastUpdated: new Date().toISOString(),
            featuredPlayer: testPlayer.Name,
            testStablefordPoints: totalPoints,
            totalPlayersFetched: players.length
        };

        // --- SAVE TO FILE ---
        // This creates 'data.json' in your GitHub folder
        fs.writeFileSync('data.json', JSON.stringify(results, null, 2));
        console.log("Success! data.json has been updated.");

    } catch (error) {
        console.error("Error during update:", error);
        process.exit(1); // Tells GitHub the action failed
    }
}

updateData();
