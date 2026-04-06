const fs = require('fs');

async function fetchData() {
  const apiKey = process.env.GOLF_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: API Key is missing! Check your GitHub Secrets.");
    process.exit(1);
  }

  const url = `https://sportsdata.io{apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`❌ API REJECTED REQUEST: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('✅ SUCCESS: data.json has been saved!');
  } catch (error) {
    console.error('❌ CRASHED:', error.message);
    process.exit(1);
  }
}

fetchData();
