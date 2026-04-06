const fs = require('fs');

async function fetchData() {
  const apiKey = process.env.GOLF_API_KEY;
  // Using the 2025 Masters Final Results link you provided
  const url = `https://sportsdata.io{apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // Save the raw data to data.json
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('Successfully saved data.json');
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

fetchData();
