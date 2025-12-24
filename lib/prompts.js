// Define comprehensive checklists for each page type to ensure no section is missed
const CHECKLISTS = {
  "Homepage": [
    "Header & Navigation (clarity, sticky nav, search bar)",
    "Hero Section (headline, CTA, image quality, value proof)",
    "Value Proposition (clarity of offer, USPs)",
    "Featured Products/Collections (layout, relevance)",
    "Social Proof (reviews, testimonials, logos)",
    "Footer (links, contact info, trust badges)",
    "Mobile Responsiveness (implied from structure)",
    "Performance/Loading Signals (if textual hints exist)"
  ],
  "Collection Page": [
    "Filtering & Sorting (usability, options available)",
    "Product Grid Layout (spacing, card information)",
    "Product Cards (images, price, reviews, quick view)",
    "SEO & Headings (h1 clarity, descriptions)",
    "Pagination vs Infinite Scroll (usability)",
    "Empty State (if detected)"
  ],
  "Product Page": [
    "Product Imagery (quality, gallery, zoom)",
    "Buy Box (Pricing, CTA visibility, variants)",
    "Product Description (clarity, benefits vs features)",
    "Social Proof (reviews, ratings near CTA)",
    "Trust Signals (shipping, returns, guarantees)",
    "Cross-sells/Upsells (relevance, placement)",
    "Sticky add-to-cart (presence)"
  ],
  "Cart Page": [
    "Cart Summary (line items, total cost, editing)",
    "Trust Badges (payment icons, security assurance)",
    "Checkout CTA (visibility, wording)",
    "Shipping Information (thresholds, estimates)",
    "Promo Code Field (collapsed vs open)",
    "Abandonment Prevention (urgency/scarcity hints)"
  ]
};

export const IDENTIFY_PAGES_PROMPT = (homepageContent) => `
You are an expert e-commerce auditor.
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

export const AUDIT_PAGE_PROMPT = (pageType, content, niche) => {
  const checklist = CHECKLISTS[pageType] || ["General UX", "Content", "CTA"];

  return `
You are a Senior Conversion Rate Optimization (CRO) Auditor specializing in the ${niche} niche.
The user wants a "Deep Dive" audit of the **${pageType}**.
You must evaluate **every element within every section** of this page. Do not skip any section.

Your Checklist for ${pageType}:
${checklist.map(item => `- ${item}`).join('\n')}

**Process** (Perform these steps internally, do NOT output them):
1. **Scan & List**: First, mentally scan the entire content and identify every unique section (Header, Hero, Product List, Footer, etc.).
2. **Detailed Analysis**: For each identified section, rigorously evaluate it against the checklist and best practices for the ${niche} niche.
   - Look for: Friction, confusion, poor layout, lack of trust, missing information, generic copy.
   - *CRITICAL*: Do not be generic. If the "Add to Cart" button is hard to see, say exactly why (color contrast, size, position).
3. **Draft & Group Findings**:
   - **Group by Section**: Collating insights is critical. Group **ALL** insights and solutions for a specific UI component (e.g. "Announcement Bar", "Header", "Footer") into a **single dedicated finding object**.
   - **No Duplicates**: Do not create multiple separate findings for the same section name.
   - **Max Split**: If a section has an overwhelming number of insights, you may split it into a **maximum of two** entries.
   - **Granularity**: Analyze every single element, but report them within their parent Section's group.
   - For each finding group, evaluate:
     - **Section Name**: MANDATORY. (e.g. "Announcement Bar", "Hero", "Footer").
     - **Severity**: High (Revenue blocker), Medium (Friction), Low (Polish). Choose the highest severity present in the group.
     - **Effort**: High (Dev heavy), Medium (CSS/Content), Low (Quick fix).

**Output Format**:
Return the result as a JSON object.
Format:
\`\`\`json
{
  "findings": [
    {
      "section_name": "Announcement Bar",
      "severity": "Medium",
      "effort": "Low",
      "insights": [
        "First bullet point describing the issue...",
        "Second bullet point if applicable..."
      ],
      "solutions": [
        "First bullet point describing the solution...",
        "Second bullet point describing the solution..."
      ]
    },
    ...
  ]
}
\`\`\`

Content to Analyze:
${content.substring(0, 500000)}
`;
};
