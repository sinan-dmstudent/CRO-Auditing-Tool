
const { scrapeUrl } = require('../lib/playwright');

async function test() {
    const url = 'https://example.com'; // Simple test
    console.log(`Testing scraper with ${url}...`);
    try {
        const result = await scrapeUrl(url);
        console.log("--- SCRAPE SUCCESS ---");
        console.log("Title:", result.metadata.title);
        console.log("Markdown Length:", result.markdown.length);
        console.log("HTML Length:", result.html.length);
        console.log("Links Found:", result.links.length);
        console.log("Screenshot present:", !!result.screenshot);
        if (result.screenshot) console.log("Screenshot start:", result.screenshot.substring(0, 50));
    } catch (error) {
        console.error("--- SCRAPE FAILED ---");
        console.error(error);
    }
}

test();
