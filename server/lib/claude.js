/**
 * AI client via OpenRouter.
 *
 * Model routing:
 *  - Qualification (needs web search): perplexity/sonar-pro (built-in internet)
 *  - Discovery + Pitch (text generation): anthropic/claude-sonnet-4-6
 *
 * Perplexity Sonar has native web search — no tool config needed.
 * Claude via OpenRouter is best at Portuguese creative writing.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = {
  search: 'perplexity/sonar-pro',          // built-in web search, cites sources
  generate: 'anthropic/claude-sonnet-4-6',  // best Portuguese text generation
};

async function callOpenRouter(model, systemPrompt, userMessage, timeoutMs = 75000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://enter-sales-intelligence.local',
        'X-Title': 'Enter Sales Intelligence',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenRouter ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new Error('Empty response from model');
    }

    // Log model used and cost
    const usage = data.usage || {};
    console.log(`[${model}] ${usage.prompt_tokens || '?'}→${usage.completion_tokens || '?'} tokens`);

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Qualification: uses Perplexity Sonar Pro (built-in web search).
 * Returns text with citations.
 */
export async function callWithSearch(systemPrompt, userMessage) {
  return callOpenRouter(MODELS.search, systemPrompt, userMessage, 90000);
}

/**
 * Discovery + Pitch: uses Claude Sonnet via OpenRouter.
 * Pure text generation, no web search needed.
 */
export async function callGenerate(systemPrompt, userMessage) {
  return callOpenRouter(MODELS.generate, systemPrompt, userMessage, 60000);
}

// Backwards compat
export async function callClaude(systemPrompt, userMessage) {
  return callWithSearch(systemPrompt, userMessage);
}
