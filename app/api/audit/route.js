import { NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/playwright';
import { analyzeContent } from '@/lib/gemini';
import { IDENTIFY_PAGES_PROMPT, AUDIT_PAGE_PROMPT } from '@/lib/prompts';

export const maxDuration = 300; // Allow 5 minutes for execution (Vercel Pro/Local)

function cleanJson(text) {
    try {
        // Extract JSON substring
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error("No JSON structure found in response");
        }

        const clean = text.substring(start, end + 1);
        return JSON.parse(clean);

    } catch {
        console.error("Failed to parse JSON:", text.substring(0, 500) + "..."); // Log first 500 chars
        return null;
    }
}

function resolveUrl(baseUrl, relativeUrl) {
    try {
        return new URL(relativeUrl, baseUrl).toString();
    } catch {
        return relativeUrl;
    }
}

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape Homepage
        console.log(`Scraping Homepage: ${url}`);
        const homeScrapeResult = await scrapeUrl(url);
        const homeContent = homeScrapeResult.markdown || "";

        // 2. Identify Niche and Links
        console.log("Identifying Niche and Pages...");
        const identificationPrompt = IDENTIFY_PAGES_PROMPT(homeContent);
        const idResultRaw = await analyzeContent(identificationPrompt);
        const idResult = cleanJson(idResultRaw);

        if (!idResult) {
            return NextResponse.json({ error: 'Failed to analyze homepage' }, { status: 500 });
        }

        const { niche, links, store_summary } = idResult;
        console.log("Identified:", idResult);

        // 3. Scrape Other Pages (Parallel)
        const pagesToScrape = [
            { type: 'Homepage', url: url, content: homeScrapeResult }, // Already scraped
            { type: 'Collection Page', url: resolveUrl(url, links.collection) },
            { type: 'Product Page', url: resolveUrl(url, links.product) },
            { type: 'Cart Page', url: resolveUrl(url, links.cart) }
        ];

        console.log("Pages to scrape:", pagesToScrape.map(p => p.url));

        const scrapePromises = pagesToScrape.slice(1).map(async (page) => {
            console.log(`[Audit] Processing ${page.type} URL: '${page.url}'`);
            if (!page.url || page.url === "undefined" || page.url.includes("undefined")) {
                console.log(`[Audit] Skipping invalid URL for ${page.type}`);
                return { ...page, content: null, error: "URL not found" };
            }
            try {
                const content = await scrapeUrl(page.url);
                return { ...page, content };
            } catch (e) {
                return { ...page, content: null, error: e.message };
            }
        });

        const scrapedPages = [pagesToScrape[0], ...await Promise.all(scrapePromises)];

        // 4. Audit Pages (Parallel)
        console.log("Auditing pages...");
        const auditPromises = scrapedPages.map(async (page) => {
            if (!page.content) return { type: page.type, error: "Could not scrape page" };

            // AUDIT_PAGE_PROMPT now returns an array [{ text: ... }]
            const promptParts = AUDIT_PAGE_PROMPT(page.type, page.content, niche);

            // Fetch and attach screenshot if available
            if (page.content.screenshot) {
                try {
                    let base64Image;

                    if (page.content.screenshot.startsWith('data:')) {
                        // It's already a Data URI (from Playwright)
                        base64Image = page.content.screenshot.split(',')[1];
                        console.log(`[Audit] Used cached screenshot for ${page.url}`);
                    } else {
                        // It's a URL (from FireCrawl legacy or S3)
                        console.log(`[Audit] Fetching screenshot for ${page.url}...`);
                        const imageResp = await fetch(page.content.screenshot);
                        if (imageResp.ok) {
                            const arrayBuffer = await imageResp.arrayBuffer();
                            base64Image = Buffer.from(arrayBuffer).toString('base64');
                        } else {
                            console.warn(`[Audit] Failed to fetch screenshot: ${imageResp.statusText}`);
                        }
                    }

                    if (base64Image) {
                        promptParts.push({
                            inlineData: {
                                data: base64Image,
                                mimeType: "image/png"
                            }
                        });
                        console.log(`[Audit] Attached screenshot for ${page.url}`);
                    }
                } catch (imgErr) {
                    console.error(`[Audit] Error processing screenshot for ${page.url}:`, imgErr);
                }
            }

            const resultRaw = await analyzeContent(promptParts);
            console.log(`[Audit DEBUG] Raw output for ${page.type}:`, resultRaw.substring(0, 500)); // Log start of output
            const findings = cleanJson(resultRaw);

            if (!findings) {
                console.error(`[Audit ERROR] Failed to parse JSON for ${page.type}. Raw length: ${resultRaw.length}`);
            } else if (!findings.findings || findings.findings.length === 0) {
                console.warn(`[Audit WARNING] Parsed JSON has empty findings for ${page.type}`);
            }

            // Filter out Low severity findings explicitly (Double safety)
            // REMOVED at user request ("Follow the checklist strictly") - we trust the prompt to only output relevant findings
            // and we don't want to swallow "Low" severity checklist items if the model ignores the "Mark as Medium" instruction.
            const filteredFindings = (findings?.findings || []);

            return {
                type: page.type,
                url: page.url,
                findings: filteredFindings
            };
        });

        const auditResults = await Promise.all(auditPromises);

        return NextResponse.json({
            niche,
            store_summary,
            results: auditResults
        });

    } catch (error) {
        console.error("Audit API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
