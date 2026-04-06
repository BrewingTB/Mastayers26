const fs = require('fs');

async function fetchData() {
  const apiKey = process.env.GOLF_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: Your API Key 'GOLF_API_KEY' is missing from GitHub Secrets.");
    process.exit(1);
  }

  // Your specific URL for the 2025 Masters
  const url = `https://sportsdata.io{apiKey}`;

  try {
    console.log("Connecting to SportsDataIO...");
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API ERROR: The server said ${response.status}. Your key might be inactive.`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    // Save the file
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('✅ SUCCESS: Data saved to data.json');
  } catch (error) {
    console.error('❌ CRASHED:', error.message);
    process.exit(1);
  }
}

fetchData();
