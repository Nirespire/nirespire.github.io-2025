const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize the Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- Caching Mechanism ---
// Load blog content once when the function is initialized (cold start)
// and cache it in a global variable for subsequent (warm) invocations.
let blogContentCache = null;

function getBlogContent() {
    if (blogContentCache === null) {
        console.log("Reading and caching blog content...");
        try {
            const blogDir = path.join(__dirname, '../../src/blog');
            blogContentCache = fs.readdirSync(blogDir)
                .filter(file => file.endsWith('.md'))
                .map(file => fs.readFileSync(path.join(blogDir, file), 'utf-8'))
                .join('\\n\\n---\\n\\n'); // Join posts with a separator
        } catch (error) {
            console.error("Failed to read blog content:", error);
            blogContentCache = ""; // Set to empty string on error to prevent retries
        }
    }
    return blogContentCache;
}

// Immediately invoke to pre-load the cache on cold start
getBlogContent();

exports.handler = async function (event, context) {
    // --- Handle Conversational History ---
    // Destructure the conversationHistory array from the request body
    const { conversationHistory } = JSON.parse(event.body);

    // Basic validation
    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request: conversationHistory is required.' }),
        };
    }

    try {
        const completion = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            // The system prompt now uses the cached blog content
            system: `You are an AI assistant that is a virtual representation of Sanjay Nair. Your goal is to provide responses and have discussions about the content on the website. You should be grounded in the content of the website, including all the blog posts. Here is the content of the blog posts:\\n${getBlogContent()}`,
            // Pass the entire conversation history to the model
            messages: conversationHistory,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: completion.content[0].text }),
        };
    } catch (error) {
        console.error("Error from Anthropic API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get response from AI' }),
        };
    }
};
