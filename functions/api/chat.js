import blogContent from './blog-content.json';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Please send a POST request', { status: 405 });
    }

    try {
      const { message, conversationHistory } = await request.json();

      const systemPrompt = `You are a virtual representation of Sanjay Nair, the author of the blog. Your goal is to provide responses and have discussions about the content on the site. You should be grounded in the provided content, which includes all the blog posts. When answering, be friendly, helpful, and embody the persona of the author. Do not make up information. If the answer is not in the provided content, say so. Here is the blog content: ${blogContent}`;

      // Re-construct the message history for the API
      const messages = [
        ...conversationHistory,
        {
          role: 'user',
          content: message,
        },
      ];

      // This is a placeholder for the actual Anthropic API call.
      // In a real scenario, you would use env.ANTHROPIC_API_KEY
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: messages,
          system: systemPrompt,
          // stream: true, // Streaming responses requires a different handling logic
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(`API error: ${errorText}`, { status: response.status });
      }

      const responseData = await response.json();
      const aiMessage = responseData.content[0].text;

      return new Response(JSON.stringify({ message: aiMessage }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(`Error processing your request: ${error.message}`, { status: 500 });
    }
  },
};
