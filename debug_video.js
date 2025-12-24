
import { scrapeUrl } from './lib/firecrawl.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function run() {
    const url = "https://binfarash.com/?srsltid=AfmBOoo0eIDJDCCrb3VGbip86NgqGIG3g2IIL9sgyybl8BRnqbfx4nSq";
    console.log("Scraping " + url);
    try {
        const result = await scrapeUrl(url);

        console.log("--- DETECTED VIDEOS ---");
        console.log(JSON.stringify(result.videos, null, 2));

        console.log("--- SEARCHING FOR 'Shop the Fragrance' SECTION HTML ---");
        const html = result.html;
        const sectionIndex = html.indexOf("Shop the Fragrance");
        if (sectionIndex !== -1) {
            console.log(html.substring(sectionIndex, sectionIndex + 2000));
        } else {
            console.log("Section 'Shop the Fragrance' not found in text match. Dumping first 2000 chars of HTML to check structure.");
            console.log(html.substring(0, 2000));
        }

    } catch (e) {
        console.error(e);
    }
}

run();
