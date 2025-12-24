
// Mocking the scrapeUrl logic partially to test the cleaning regex
// We can't easily import scrapeUrl because it depends on FireCrawl API which needs a key/network.
// Instead, I will copy the EXACT cleaning logic I just wrote to verify strictly the Regex behavior.

function cleanHtml(html) {
    let cleanedHtml = html || "";

    // Copying logic from lib/firecrawl.js
    cleanedHtml = cleanedHtml
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<link\b[^>]*>/gim, "")
        .replace(/ style="[^"]*"/gim, "")
        // --- NOISE FILTERING ---
        .replace(/blocked by extension/gim, "")
        .replace(/b\.id/gim, "")
        .replace(/An error occurred/gim, "");

    return cleanedHtml;
}

const inputHtml = `
<html>
<body>
    <div id="content">Valid Content</div>
    <div id="error">This element was blocked by extension.</div>
    <script>console.log('b.id');</script>
    <span>An error occurred while loading content.</span>
</body>
</html>
`;

console.log("--- INPUT HTML ---");
console.log(inputHtml);

console.log("\n--- CLEANED HTML ---");
console.log(cleanHtml(inputHtml));
