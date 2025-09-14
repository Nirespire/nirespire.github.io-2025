const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateHallucination(title, content) {
  const prompt = `Given this blog post titled "${title}", create a humorous, 
    completely incorrect summary that's clearly wrong but entertaining. 
    Keep it under 2-3 sentences and make it sound absurd while staying family-friendly.
    The summary should be completely different from the actual content but maintain
    a connection to the topic.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-0',
    max_tokens: 150,
    temperature: 0.9,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

async function getLatestBlogPosts() {
  const blogDir = path.join(process.cwd(), 'src/blog');
  const files = await fs.readdir(blogDir);
  
  const posts = await Promise.all(
    files
      .filter(file => file.endsWith('.md'))
      .map(async file => {
        const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
        const { data, content: postContent } = matter(content);
        return {
          title: data.title,
          date: data.date,
          content: postContent
        };
      })
  );

  return posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
}

async function main() {
  try {
    const posts = await getLatestBlogPosts();
    const hallucinations = await Promise.all(
      posts.map(async post => ({
        title: post.title,
        date: post.date,
        hallucination: await generateHallucination(post.title, post.content)
      }))
    );

    const dataDir = path.join(process.cwd(), 'src/_data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      path.join(dataDir, 'hallucinations.json'),
      JSON.stringify(hallucinations, null, 2)
    );
    
    console.log('Successfully generated hallucinations for latest blog posts');
  } catch (error) {
    console.error('Error generating hallucinations:', error);
    process.exit(1);
  }
}

main();