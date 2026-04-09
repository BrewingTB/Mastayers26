const fs = require('fs');
const path = require('path');

// Load dataset.json
const dataset = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/dataset.json'))
);

// CSV header
const headers = [
    "team",
    "playerId",
    "playerName",
    "hole",
    "round",
    "strokes",
    "par",
    "stableford"
];

// Convert to CSV rows
const rows = dataset.map(row =>
    headers.map(h => row[h]).join(',')
);

// Build CSV string
const csv = [headers.join(','), ...rows].join('\n');

// Save CSV
fs.writeFileSync(
    path.join(__dirname, '../data/dataset.csv'),
    csv
);

console.log("✔ dataset.csv created");
