import FirecrawlApp from '@mendable/firecrawl-js';

/**
 * Scrape a single URL.
 * @param {string} url 
 * @returns {Promise<string>} The markdown content of the page.
 */
export const scrapeUrl = async (url) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        throw new Error("FIRECRAWL_API_KEY is not set");
    }

    // Lazy initialization to avoid build time errors
    const app = new FirecrawlApp({ apiKey });

    try {
        console.log(`[FireCrawl] Scraping: ${url}`);
        const scrapeResult = await app.scrape(url, { formats: ['markdown'] });
        console.log(`[FireCrawl] Success for ${url}: ${scrapeResult.success}`);

        // STRICT ERROR HANDLING: Only throw if we have NO content.
        // specific edge case: Firecrawl sometimes returns success:false but valid markdown.
        if (!scrapeResult.success) {
            console.warn(`[FireCrawl] Warning for ${url}: Success=false. Error: ${scrapeResult.error}`);

            if (scrapeResult.markdown && scrapeResult.markdown.length > 100) {
                console.log(`[FireCrawl] Recovered content for ${url} despite error flag.`);
                return scrapeResult.markdown;
            }

            console.error(`[FireCrawl] FAILED for ${url}. Result Keys:`, Object.keys(scrapeResult));
            throw new Error(scrapeResult.error || "Unknown error during scrape (and no content returned)");
        }

        return scrapeResult.markdown;
    } catch (error) {
        console.error(`Firecrawl scrape error for ${url}:`, error);
        throw error;
    }
};
