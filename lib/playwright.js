
import TurndownService from 'turndown';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Helper to determine if we are running on Vercel/Lambda
const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

/**
 * Launch the browser depending on the environment.
 */
async function launchBrowser() {
    if (isProduction) {
        // Production (Vercel/AWS Lambda): Use playwright-core + @sparticuz/chromium
        console.log('[Playwright] Launching in Production mode (sparticuz/chromium)...');
        const chromium = require('@sparticuz/chromium');
        const { chromium: playwrightChromium } = require('playwright-core');

        // Verify/set font support if needed (optional for basic text)
        // await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

        return await playwrightChromium.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local Development: Use full playwright package
        console.log('[Playwright] Launching in Local mode...');
        const { chromium } = require('playwright');
        return await chromium.launch({
            headless: true
        });
    }
}

/**
 * Scrape a single URL using Playwright.
 * @param {string} url 
 * @returns {Promise<Object>} The cleaned scrape result.
 */
export const scrapeUrl = async (url) => {
    let browser = null;
    try {
        browser = await launchBrowser();
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            },
            ignoreHTTPSErrors: true
        });
        const page = await context.newPage();

        let attempts = 0;
        const maxRetries = 2;
        let success = false;

        while (attempts <= maxRetries && !success) {
            try {
                if (attempts > 0) console.log(`[Playwright] Retrying ${url} (Attempt ${attempts + 1}/${maxRetries + 1})...`);

                // 1. Navigate
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(1000); // Initial load wait

                // 2. Scroll to bottom to load lazy content
                await autoScroll(page);
                await page.waitForTimeout(1500); // Post-scroll hydration

                success = true;
                console.log(`[Playwright] Successfully loaded ${url}`);

            } catch (e) {
                console.warn(`[Playwright] Error on attempt ${attempts + 1}:`, e.message);
                attempts++;
                if (attempts <= maxRetries) await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!success) {
            throw new Error(`[Playwright] Failed to load ${url} after retries.`);
        }

        // 3. Extract Data independently
        // Get raw HTML
        const rawHtml = await page.content();

        // Get Title
        const title = await page.title();

        // Get Description
        const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');

        // Get Metadata (OpenGraph)
        const ogUrl = await page.$eval('meta[property="og:url"]', el => el.content).catch(() => url);

        // Get Links (raw <a> tags) - limited to 150
        const links = await page.$$eval('a', (anchors) => {
            return anchors
                .map(a => a.href)
                .filter(href => href.startsWith('http'))
                .slice(0, 150);
        });

        // Get Screenshot (Buffer)
        const screenshotBuffer = await page.screenshot({ quality: 60, type: 'jpeg' });
        const screenshot = `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;


        // 4. Video Detection (Ported from FireCrawl logic)
        // We can do this more robustly in Playwright context, but reusing logic ensures consistency.
        const videoMatches = [];

        // 4.1 HTML5 Video
        const videoElements = await page.$$eval('video', (els) => els.map(v => ({
            outerHTML: v.outerHTML,
            attributes: Array.from(v.attributes).map(a => `${a.name}="${a.value}"`).join(' ')
        })));

        for (const v of videoElements) {
            const attrs = v.attributes.toLowerCase();
            const isBackground = attrs.includes('autoplay') && attrs.includes('muted') && !attrs.includes('controls');
            videoMatches.push({
                type: 'html5',
                tag: v.outerHTML.substring(0, 200),
                context: isBackground ? "Background Video (Autoplay)" : "Interactive Video (User Controls)",
                attributes: attrs
            });
        }

        // 4.2 IFrames (YouTube/Vimeo)
        const frameSrcs = await page.$$eval('iframe', (frames) => frames.map(f => ({
            src: f.src,
            outerHTML: f.outerHTML
        })));

        const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'wistia.com', 'shopify.com/videos'];
        for (const f of frameSrcs) {
            if (videoDomains.some(d => f.src.includes(d))) {
                videoMatches.push({
                    type: 'iframe',
                    source: f.src,
                    tag: f.outerHTML,
                    context: "Third-party Video Embed"
                });
            }
        }


        // 5. Clean HTML & Convert to Markdown
        let cleanedHtml = rawHtml;

        // Remove scripts, styles, comments (Regex approach still fast for text processing)
        cleanedHtml = cleanedHtml
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/<link\b[^>]*>/gim, "")
            .replace(/ style="[^"]*"/gim, "")
            .replace(/blocked by extension/gim, "")
            .replace(/b\.id/gim, "")
            .replace(/An error occurred/gim, "");

        // Convert to Markdown
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
        // Remove irrelevant tags from markdown
        turndownService.remove(['script', 'style', 'iframe', 'svg', 'noscript']);

        const markdown = turndownService.turndown(cleanedHtml);

        await browser.close();

        return {
            markdown: markdown,
            html: cleanedHtml.substring(0, 30000), // Truncate as per previous logic
            metadata: {
                title,
                description,
                language: 'en', // default
                url: ogUrl
            },
            links: links,
            screenshot: screenshot,
            videos: videoMatches
        };

    } catch (error) {
        if (browser) await browser.close();
        console.error(`[Playwright] Scrape error for ${url}:`, error);
        throw error;
    }
};

/**
 * Helper: Scroll to bottom of page
 */
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const maxScrolls = 200; // Limit to ~20000px or 20 seconds
            let scrolls = 0;

            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;

                // Stop if we reached bottom OR hit max scrolls
                if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
