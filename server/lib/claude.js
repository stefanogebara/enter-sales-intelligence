import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Call Claude with web_search tool enabled.
 * Limits: max 4 web searches, 75s timeout, 4096 max tokens.
 */
export async function callClaude(systemPrompt, userMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75000);

  try {
    const response = await client.messages.create(
      {
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 4,
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal }
    );

    // Extract text from response blocks
    const textBlocks = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text);

    return textBlocks.join('\n\n');
  } finally {
    clearTimeout(timeout);
  }
}
