const fs = require('fs');

async function updateData() {
    // This pulls your key from the GitHub 'Secret' we named GOLF_API_KEY
    const apiKey = process.env.GOLF_API_KEY;
    
    // This is your exact URL from the SportsDataIO site
    const url = `https://api.sportsdata.io/golf/v2/json/PlayerTournamentHoleScoresFinal/628?key=c05b515fffad4140a71e641f8ada1ac6`;

    try {
        console.log("Connecting to SportsDataIO...");
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API rejected the request with status ${response.status}`);
        }

        const data = await response.json();
        
        // This saves the data into a file named data.json in your repo
        fs.writeFileSync('./data/players.json', JSON.stringify(data, null, 2));
        console.log("✅ Success! data.json has been updated.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1); 
    }
}

updateData();
