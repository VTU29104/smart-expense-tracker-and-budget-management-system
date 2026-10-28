const CLAUDE_AVAILABLE = !!process.env.ANTHROPIC_API_KEY;
const GEMINI_AVAILABLE = !!process.env.GEMINI_API_KEY;
const AI_AVAILABLE = CLAUDE_AVAILABLE || GEMINI_AVAILABLE;

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

// Google Gemini — free-tier vision + text model. Preferred provider when configured.
async function callGemini({ prompt, image, max_tokens = 500 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const parts = [{ text: prompt }];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mediaType, data: image.base64 } });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: max_tokens }
      }),
      signal: controller.signal
    }
    );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
} finally {
  clearTimeout(timeout);
}
}

// Anthropic Claude — original provider, kept as a fallback if ANTHROPIC_API_KEY is set.
async function callClaude({ messages, max_tokens = 500 }) {
  if (!CLAUDE_AVAILABLE) return null; // signals caller to use mock

const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      messages
    }),
    signal: controller.signal
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || null;
} finally {
  clearTimeout(timeout);
}
}

// Unified entry point used by routes/ai.js.
// Prefers Gemini (free tier) when GEMINI_API_KEY is set, falls back to Claude if
// ANTHROPIC_API_KEY is set instead, and returns null (triggering mock/demo mode)
// if neither key is configured.
async function callAI({ prompt, image, max_tokens = 500 }) {
  if (GEMINI_AVAILABLE) {
    return callGemini({ prompt, image, max_tokens });
  }

if (CLAUDE_AVAILABLE) {
  const content = image
  ? [
    { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
    { type: 'text', text: prompt }
    ]
    : prompt;

  return callClaude({ messages: [{ role: 'user', content }], max_tokens });
}

return null;
}

function parseJSONResponse(text) {
  // Strip markdown code fences if present
const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// Keyword-based mock categoriser for demo mode (enhanced with student keywords)
const KEYWORD_MAP = {
  food: ['canteen', 'mess', 'cafeteria', 'samosa', 'chai', 'maggi', 'snack', 'swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'grocery', 'tesco', 'pret'],
  transport: ['metro', 'bus', 'auto', 'rickshaw', 'rapido', 'ola', 'uber', 'bus pass', 'train', 'irctc', 'petrol', 'fuel', 'commute', 'bike', 'cab', 'flight'],
  housing: ['hostel', 'pg', 'paying guest', 'rent', 'room rent', 'flat share', 'deposit', 'maintenance', 'landlord', 'electricity bill'],
  utilities: ['recharge', 'jio', 'airtel', 'vi', 'wifi', 'wi-fi', 'broadband', 'mobile pack', 'phone bill', 'internet', 'electricity', 'water bill'],
  entertainment: ['movie', 'cinema', 'pvr', 'inox', 'netflix', 'spotify', 'prime', 'gaming', 'steam', 'game', 'hangout', 'party', 'concert', 'outing'],
  healthcare: ['pharmacy', 'medicine', 'apollo', 'medical', 'doctor', 'clinic', 'tablet', 'vitamin', 'gym', 'health'],
  shopping: ['stationery', 'notebook', 'record', 'pen', 'printout', 'xerox', 'amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'backpack', 'bag', 'zara', 'h&m'],
  education: ['tuition', 'college fee', 'sem fee', 'exam fee', 'book', 'textbook', 'coursera', 'udemy', 'notes', 'course', 'workshop', 'lab', 'library', 'certification'],
  travel: ['trip', 'home visit', 'vacation', 'flight', 'irctc tatkal', 'bus ticket', 'redbus', 'hotel', 'resort', 'weekend trip'],
  subscriptions: ['chatgpt', 'github', 'copilot', 'spotify student', 'notion', 'youtube premium', 'medium', 'icloud', 'google one', 'ott', 'subscription']
};

const CATEGORY_REASONS = {
  food: 'Matches student canteen, mess, or dining keywords.',
  transport: 'Matches campus transit, metro, bus, or commute keywords.',
  housing: 'Matches hostel, PG, or student rent keywords.',
  utilities: 'Matches mobile recharge, campus Wi-Fi, or utility keywords.',
  entertainment: 'Matches movies, student outings, or streaming keywords.',
  healthcare: 'Matches medical, pharmacy, or student wellness keywords.',
  shopping: 'Matches college stationery, supplies, or shopping keywords.',
  education: 'Matches tuition, semester fees, textbooks, or exam keywords.',
  travel: 'Matches holiday travel, train booking, or home visit keywords.',
  subscriptions: 'Matches EdTech tools, software, or media subscriptions.',
  other: 'No specific keyword matched; classified as other student expense.'
};

function mockCategorise(description) {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { category, confidence: 0.85, reasoning: CATEGORY_REASONS[category] };
    }
  }
  return { category: 'other', confidence: 0.3, reasoning: CATEGORY_REASONS.other };
}

module.exports = { callAI, parseJSONResponse, AI_AVAILABLE, mockCategorise };
