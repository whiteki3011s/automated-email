export const FLAW_EXTRACTION_PROMPT = `
You are an expert UI/UX Auditor & Full-Stack Tech Lead.
Analyze the following website content scraped from target domain: "{domain}".

Website Content:
"""
{content}
"""

Identify 2 to 4 concrete design, performance, or conversion flaws on their site. Focus on:
1. Outdated visual layout or typography
2. Poor hero section messaging or missing call-to-action
3. Sluggish performance or mobile responsiveness defects

Output strictly valid JSON with key "flaws" mapping to an array of flaw strings. Do not include markdown code block formatting.
`;

export const COLD_PITCH_PROMPT = `
You are a top 1% B2B Sales Specialist crafting highly personalized cold outreach emails.
You pitch UI/UX design and web development services.

Target Domain: {domain}
Observed Flaws: {flaws}
My Service Context: "{serviceContext}"

Instruction:
Draft a personalized cold email targeting the owner/founder of {domain}.
Requirements:
1. Subject line must be punchy and reference a specific flaw observed on their site.
2. The body MUST BE STRICTLY PLAIN TEXT. NO HTML, NO MARKDOWN BOLD/ITALICS (*, **), NO IMAGES, NO LINKS.
3. Keep the body short (under 120 words).
4. Reference the specific flaws found on their site and suggest a quick 15-min chat.

Output strictly valid JSON with keys "subject" and "bodyText". Do not include markdown code block formatting.
`;
