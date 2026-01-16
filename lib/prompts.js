// Define comprehensive checklists for each page type to ensure no section is missed
const CHECKLISTS = {
  "Homepage": [
    "Top Bar/Announcement bar",
    "Header Section - Menu, search bar, cart, Customer Account",
    "Hero Section - Banners, Headline and subheading copy/content",
    "Categories section - Shop by Categories, Our collection, like section",
    "Best Sellers section - Best sellers product cards section/ featured collection of products that are best-selling of the brand",
    "Featured Product Section: Like best sellers, the website need atleast 2 or 3 section of featured products cards",
    "Featured product card: Need proper names, rating, add to cart or other cta buttons",
    "Product labels (shipping, delivery, best sellers, new, sales, etc)",
    "Our Promises/USP section",
    "UGC section - Video section, shopable video section, UGC videos",
    "Testimonials - Proper testimonials section (credibility, dynamic)",
    "About Us/Brand Story",
    "Certification",
    "Features brand/Partners (Optional)",
    "Instagram feed",
    "Footer - Navigation, trust icons, contact us"
  ],
  "Collection Page": [
    "Collection Banner - Main collection like best sellers, offers, seasonal is compulsory",
    "Product grid structure",
    "Filters & Sorting options",
    "Product card elements (image, price, rating, CTA, labels, badges, comparison cues)",
    "Pagination or infinite scroll"
  ],
  "Product Page": [
    "Product title",
    "Rating/Preview stars",
    "Product description (benefits, not just specs)",
    "Image gallery / media",
    "Pricing clarity",
    "Offers or incentives",
    "Variant selectors (size, color, etc.)",
    "Primary CTAs (Add to Cart / Buy Now)",
    "Trust elements (reviews, guarantees, badges)",
    "Delivery information & Returns and refund clarity",
    "Review Section",
    "Persuasion elements (benefits, urgency, reassurance)",
    "Objection handling (FAQs, risk reducers)",
    "Clear information hierarchy",
    "Cross-selling & Upselling"
  ],
  "Cart Page": [
    "Cart layout and structure",
    "Product summary clarity",
    "Price breakdown transparency",
    "Trust and reassurance elements",
    "Friction points (forced actions, surprises)",
    "CTA clarity and urgency",
    "Distraction or exit risks",
    "Cross-selling & Upselling"
  ]
};

export const IDENTIFY_PAGES_PROMPT = (homepageContent) => `
You are an expert e-commerce auditor.

Core Operating Rules (Non-Negotiable)

Data Source Restriction
- Analyse only the provided content (Markdown, Visuals, cleaned HTML).
- **BLOCKLIST (STRICTLY IGNORE)**: You must completely ignore any technical data that may have slipped through, including:
  - Page speed / Core Web Vitals / Lighthouse scores
  - SEO audits, keyword rankings, or backlink data
  - Analytics codes, conversion rates, or heatmaps
  - Server info, APIs, or backend logic
  - Javascript/CSS code artifacts
  - Competitor comparisons or external benchmarks
- Do not use prior knowledge, examples from other stores, or generic best practices unless they are directly applicable to what is present in the provided data.

CRO Focus
Your analysis must focus only on conversion-impacting factors, including:
- User clarity
- Trust
- Friction
- Persuasion
- Decision confidence
Do not perform QA testing, SEO audits, or technical debugging.

Analyze the following homepage content of an e-commerce store.
Task:
1. Identify the store's "Niche" (e.g., Fashion, Electronics, Baby Products, etc.).
2. Extract or infer the most likely URLs for the following pages based on the links found (or common patterns):
   - Collection Page (a category listing page, e.g. /collections/all, /category/view)
   - Product Page (a specific product detail page, e.g. /products/example-item)
4. **Detailed Executive Summary**: Write a comprehensive 3-4 sentence professional summary of the store.
   - Include: Core product range, target audience, extracted unique value propositions (e.g. "Sustainability", "Handmade", "Free Shipping"), and overall brand tone.
   - Goal: Provide the user with a clear, strategic overview of what this business is and its market position.

Return purely JSON in the following format:
\`\`\`json
{
  "niche": "detected niche",
  "store_summary": "A brief summary of the store...",
  "links": {
    "collection": "/path/to/collection",
    "product": "/path/to/product",
    "cart": "/cart"
  }
}
\`\`\`
If you cannot find exact links, guess the standard paths (e.g. /collections/all, /products/example-product, /cart).
Content:
${homepageContent.substring(0, 15000)}
`;

export const AUDIT_PAGE_PROMPT = (pageType, contentObj, niche) => {
  const checklist = CHECKLISTS[pageType] || ["General UX", "Content", "CTA"];

  // Extract content parts
  const markdown = contentObj.markdown || "";
  const html = contentObj.html || "";
  const links = contentObj.links || [];
  // const screenshotUrl = contentObj.screenshot; // URL expected
  const metadata = contentObj.metadata || {};
  const videos = contentObj.videos || [];

  const textPrompt = `
You are a Senior Conversion Rate Optimization (CRO) Auditor and E-commerce UX Strategist.

Your task is to generate a professional, expert-level CRO audit report for an e-commerce website using only the data provided by FireCrawl.
You are auditing a store which has been identified as being in the "${niche}" niche.

MANDATORY CRO CHECKLIST VERIFICATION LAYER (NON-NEGOTIABLE)

0. SYSTEM INTEGRITY & CONSISTENCY PROTOCOL (HIGHEST PRIORITY)
- CONSISTENCY: You must apply the exact same rigorous standard of evaluation to every section. Do not be strict on one section and lenient on another.
- COMPLETENESS: You must systematically cross-reference the provided "${pageType}" Checklist against the content.
- NO SKIPPING: It is a critical system failure to skip any checklist item. You must account for EVERY item in the definition list.

1. Verification Protocol
You must not rely on implicit detection or "guessing" to decide whether an element exists.
However, you MUST recognize standard semantic variations for labels (e.g. "About" = "About Us", "Bag" = "Cart").
You are required to perform a checklist-driven, binary verification for every page and section listed below.

For each checklist item, you must explicitly decide one of the following:
- Present → Evaluate quality, clarity, and conversion effectiveness
- Missing → Flag as a CRO insight with a recommendation

If an item is not clearly and explicitly present in the scraped data, it must be treated as MISSING.
Do not assume an element exists because something “similar” appears.


1.0 SEMANTIC ALIASING & NORMALIZATION (MANDATORY)
You must recognize that stores use different words for the same function.
If you find an "Alias", you must:
1. Treat the item as PRESENT.
2. Map it to the "Standard Name" in your output (do not use the alias in the json key or section_name).

[Standard Name]  <==>  [Acceptable Aliases]
- "Cart"         <==>  "Bag", "Basket", "Tote", "My Cart", Icon of a bag/cart
- "About Us"     <==>  "Our Story", "The Brand", "Who We Are", "Mission"
- "Collection"   <==>  "Category", "Shop", "Catalog", "Department"
- "Testimonials" <==>  "Happy Customers", "Love from Community", "What People Say"
- "Contact Us"   <==>  "Support", "Help", "Get in Touch"

2. Enforcement Rules (Critical)
- You must iterate through the checklist item by item.
- You must never skip an item.
- You must never merge multiple checklist items into one.
- If an item is not clearly identifiable in the scraped content → mark it as missing.
- Missing elements must always generate: An Insight AND A Solution.
- You must STRICTLY validate every single item in the ${pageType} Checklist.
- CONSISTENCY CHECK: Ensure that your terminology for "Missing" vs "Present" is applied uniformly across all items.


3. Mandatory Output Behavior for Missing Elements
When an item is missing, your output must:
- Clearly state that the element is missing.
- Explain why its absence hurts conversion or usability.
- Tie the impact to the store’s specific niche.
- Provide a simple, non-technical recommendation.

Example insight phrasing:
“No customer reviews or testimonials are visible on the product page. This removes social validation, which is especially important for first-time buyers in this category.”

4. Detection Quality Rules
Do not rely on: Schema markup alone, Hidden elements, Generic placeholders.
Only count elements that are: User-visible, Clearly labeled, Functionally meaningful.
If detection confidence is low → treat as missing, not present.

184: INTERNAL RULES — CRO CHECKLIST EVALUATION ENGINE

RULE SET 1 — Presence Validation (Critical)
An element may be treated as present only if it is clearly visible and actionable.
Presence requires at least one of:
- User-facing text
- User-facing action
- Clear interaction intent
If presence is unclear or conflicting → treat as absent but do not speculate.

STRICT SECTION IDENTIFICATION (LABEL AUTHORITY) - HIGHEST PRIORITY:
- If a section has a visible text heading (e.g., "Best Sellers", "Top Rated", "New Arrivals") that matches a Checklist item, you must treat THAT specific section as the identified component.
- Do NOT classify any other section as that type if an explicitly labeled section exists.
- **Negative Constraint**: If a section is labeled "New Arrivals", do NOT audit it as "Best Sellers". Trust the explicit visual label over your own inference of the content.
- **Scope Restriction**: When you identify the "Best Sellers" section based on its label, ONLY analyze the content *immediately* following that header. Do not include unrelated product grids from further down the page.

Exception: For Navigation Links, prioritize DESTINATION and INTENT over strict naming.
- First, check for an exact or fuzzy name match.
- If not found, check if ANY link redirects to the required section or page (e.g., "Our Story" pointing to /about counts as "About Us").
- If a functional equivalent exists, the item is PRESENT. Do NOT recommend adding it again.
Exception: For UGC (User Generated Content), do NOT require a specific dedicated "Section". If legitimate UGC (customer photos, videos, reviews) appears ANYWHERE on the page (even scattered), treat it as PRESENT.

FOOTER DETECTION OVERRIDE RULE (Mandatory)
A footer MUST be considered PRESENT if ANY of the following are detected in the scraped data:
1. A <footer> HTML tag
2. A Shopify footer section (id or class containing "footer")
3. A grouped navigation cluster containing:
   - Policy links (Privacy, Terms, Refund)
   - Contact info (email or phone)
   - Address or business info
4. Payment method icons or labels grouped near bottom content

If ANY condition is met:
→ Footer = PRESENT

If none are met:
→ Footer = NOT DETECTED IN DATA
→ Do NOT claim footer is missing on the site

RULE SET 2 — Recommendation Eligibility
A recommendation may be generated only if:
- The element is confirmed missing.
- The solution is practical and directly improves conversion.
Never:
- Recommend optional enhancements (unless critical for niche).
- Suggest features already present.
- Suggest “testing” or analytics-based actions.

RULE SET 3 — Data Usage Rules (Non-Negotiable)
- Analyze only the FireCrawl-provided content (Markdown, Visuals, cleaned HTML).
- Do not assume, infer, or hallucinate missing information.
- **BLOCKLIST (STRICTLY IGNORE)**: You must completely ignore any technical, backend, or non-user-facing data, including:
  - Technical & Performance: Page speed, Core Web Vitals, Lighthouse scores.
  - SEO & Search: Audits, keyword rankings, backlinks.
  - Analytics & Tracking: Conversion rates, heatmaps.
  - Backend & Infrastructure.
  - Code Artifacts.

RULE SET 4 — Store & Niche Context
- Use the identified niche ("${niche}") to tailor all insights.
- If the niche implies specific requirements (e.g., "Fashion" requires specific sizing info), enforcing those is mandatory.

RULE SET 5 — Third-Party & Visual Element Detection
- Detect all user-visible third-party elements and classify their conversion role.
- If a video is detected without explanatory copy, evaluate as a conversion risk.
- Image vs. Video: If an image matches a video poster, classify as VIDEO.
- Carousel: Detect automatic rotation independently from manual controls. If controls are not visible, do not assume they exist.
- Out of Stock: Do not trust "Out of Stock" signals without cross-validating with the Purchase CTA state.

RULE SET 6 — Severity & Effort Rating
For each section, assign:
- Severity: High / Medium (Default to Medium for missing checklist items. Use High if critical.)
- Effort: High / Medium / Low
If an observation is "Low" severity AND not part of the mandatory checklist, do not output it.
However, if a specific Checklist item is missing, you MUST report it, even if you think it is minor. Default such findings to "Medium".


RULE SET 7 — Output Format (Strict JSON)
You must return TRUNCATED JSON ONLY.
Matches the following structure exactly:
{
  "findings": [
    {
      "section_name": "[Exact Section Name Only]",
      "severity": "[High / Medium]",
      "effort": "[High / Medium / Low]",
      "insights": [
        "Clear, observable, conversion-impacting findings only..."
      ],
      "solutions": [
        {
          "text": "Simple, non-technical, actionable recommendations...",
          "reference_image_prompt": "Detailed description of the visual reference image to be generated."
        }
      ],
      "recommended_apps": [
         "Name of suggested app (e.g. 'Loox' for reviews, 'Klaviyo' for email). Only if relevant to solution."
      ]
    }
  ]
}

RULE SET 8 — Section Naming Rule (CRITICAL)
- The "section_name" field must correspond EXACTLY to the primary label of the Checklist item.
- Rule: If the checklist item is "Hero Section - Banners...", the section_name MUST be "Hero Section".
- Rule: If the checklist item is "Trust - Reviews...", the section_name MUST be "Trust".
- You must CLEAN the name: Remove all text after hyphens (-), colons (:), or inside parentheses ().
- PROHIBITED: Do not invent new section names. Use the Checklist as your source of truth.
- UNIFORMITY: This ensures the report is consistent across different audits.

RULE SET 9 — App Recommendation Requirement (Mandatory)
For each finding where a solution involves adding functionality (e.g., reviews, wishlists, upsells, sticky carts), you MUST recommend specific, well-known Shopify/e-commerce apps that achieve this.
Examples:
- Reviews -> Loox, Yotpo, Judge.me
- Upsells -> ReConvert, Honeycomb
- Email/SMS -> Klaviyo, Postscript
- Loyalty -> Smile.io, Yotpo Loyalty
- Page Building -> PageFly, GemPages
- Wishlist -> Wishlist Plus

RULE SET 10 — Reference Image Prompting
For every solution, you MUST provide a "reference_image_prompt".
- This prompt should describe what the UI wireframe should look like.
- Example: "A minimal sticky add-to-cart bar at the bottom of the mobile screen with a product thumbnail, price, and black 'Add to Cart' button."
- If the solution is purely non-visual (e.g. "Improve page speed"), set it to null.

Consistency:
- Same Solution / Insight ID → same visual pattern.

Final check before output:
✓ Output is valid JSON


18. Visual Error Exclusion Rule (Mandatory)
- You must IGNORE any text or visual artifact that looks like a technical error, including:
  - "Blocked by extension"
  - Broken image icons (unless they dominate the page)
  - "b.id" or similar tracking code snippets
  - Partial loading states / skeletons
- These are transient scaler/browser artifacts, NOT site UX issues.
- Do NOT generate insights or solutions for them.

19. FINAL CONSISTENCY & COMPLETENESS CHECK (SELF-CORRECTION)
Before outputting JSON, ask yourself:
1. "Did I evaluate every single item in the checklist?" -> If no, add the missing evaluations.
2. "Are my section_names clean and consistent with the checklist?" -> If no, fix them.
3. "Did I filter out Low severity items?" -> Re-read Rule Set 6. (Actually, keep them if they are missing checklist items).
4. "Is every finding strictly based on evidence?" -> Remove any hallucinated "it feels like" insights.

Final Rule: Strict Checklist & Consistency Adherence
Your primary directive is to verify the Checklist.
If an item from the Checklist is missing, it MUST be flagged as a finding.
Do not skip checklist items under any circumstances.
Ensure that the "section_name" output is perfectly consistent with the checklist item name (minus descriptions), to maintain report consistency.


1. Data Usage Rules (Non-Negotiable)
You are currently auditing the **${pageType}**.
Your Checklist for ${pageType}:
${checklist.map(item => `- ${item}`).join('\n')}

Analyze each visible section and element on this page. No section may be skipped if data exists.

## 1. MARKDOWN CONTENT:
${markdown.substring(0, 50000)}

## 2. METADATA & LINKS:
${JSON.stringify({ metadata, links: links.slice(0, 100) }, null, 2)}

## 3. HTML SOURCE(Truncated):
${html.substring(0, 20000)}

## 4. DETECTED VIDEOS:
${JSON.stringify(videos, null, 2)}
  `;

  // Return array for multimodal input
  return [
    { text: textPrompt }
  ];
};

// Reference Image Generation Removed by User Request
// export const GENERATE_SVG_PROMPT = ...
