
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn("Could not load .env.local");
}

const { generateVisual } = require('../lib/gemini');
const { GENERATE_SVG_PROMPT } = require('../lib/prompts');

async function testSvgGen() {
    console.log("Testing SVG Generation...");
    const solutionText = "Add a sticky 'Add to Cart' bar for mobile users.";
    const description = "A modern sticky add-to-cart bar at the bottom of the mobile screen with a product thumbnail, price, and black 'Add to Cart' button.";
    const niche = "Luxury Fashion";

    try {
        const prompt = GENERATE_SVG_PROMPT(solutionText, description, niche);
        console.log("Prompt created.");

        const start = Date.now();
        const result = await generateVisual(prompt);
        console.log(`Generation took ${(Date.now() - start) / 1000}s`);

        console.log("\n--- RAW RESULT START ---");
        console.log(result);
        console.log("--- RAW RESULT END ---\n");

        // Test cleaning logic from route.js
        let cleanSvg = result
            .replace(/```xml/g, '')
            .replace(/```svg/g, '')
            .replace(/```/g, '')
            .trim();

        const startIndex = cleanSvg.indexOf('<svg');
        const endIndex = cleanSvg.lastIndexOf('</svg>');

        if (startIndex !== -1 && endIndex !== -1) {
            cleanSvg = cleanSvg.substring(startIndex, endIndex + 6);
            console.log("Valid SVG extracted!");
        } else {
            console.error("FAILED to extract valid SVG.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSvgGen();
