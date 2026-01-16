const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/prompts.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log("Analyzing backticks in lib/prompts.js...");

let inString = false;
let backtickCount = 0;
let lineNum = 1;

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let col = 0;

    // Simple parser: iterate chars
    for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '`') {
            // Check for escape
            let isEscaped = false;
            if (j > 0 && line[j - 1] === '\\') {
                // Check if backslash itself is escaped? (Simple check)
                if (j > 1 && line[j - 2] === '\\') {
                    // Double backslash means backslash is escaped, so backtick is NOT escaped?
                    // Case: \\` -> Backslash then Backtick. Backtick is NOT escaped.
                    // Case: \` -> Backtick IS escaped.
                    isEscaped = false;
                } else {
                    isEscaped = true;
                }
            }

            if (!isEscaped) {
                console.log(`Line ${i + 1}: Found UNESCAPED backtick at col ${j + 1}`);
                console.log(`   > ${line.trim()}`);
                backtickCount++;
                inString = !inString;
            }
        }
    }
}

console.log(`Total Unescaped Backticks: ${backtickCount}`);
if (backtickCount % 2 !== 0) {
    console.error("ERROR: Odd number of backticks! String is not closed properly.");
} else {
    console.log("Backtick count is even. Wrapping looks consistent (globally).");
}
