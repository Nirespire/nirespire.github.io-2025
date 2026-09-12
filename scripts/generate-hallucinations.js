const { spawnSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config();

// A published hallucination is meant to be 2-3 sentences of absurd prose and
// nothing else. The CLI can also emit preamble, a "**Summary:**"-style label,
// or a whole tool-call transcript -- and whatever it returns is written
// straight into src/_data/hallucinations.json and rendered on /hallucination/.
// These bounds are the contract: anything outside them is rejected rather than
// published (see tests/unit/generate-hallucinations.test.js).
const MAX_LENGTH = 600;
const MAX_SENTENCES = 4;

const REJECT_PATTERNS = [
  // Tool-call transcripts.
  /\*\*\s*Tool\s*:/i,
  /^\s*```/m, // fenced code blocks (the CLI wraps tool parameters in them)
  /^\s*Parameters\s*:/im,
  /"(?:command|description)"\s*:/i,

  // Markdown scaffolding. Prose carries no blockquote markers and no inline
  // code -- a joke summary never has cause to name a symbol or a file.
  /^\s*>/m,
  /`/,

  // References to the repo the generator happens to be running in: absolute
  // filesystem paths, repo-relative paths, and data/template filenames.
  /(?:^|[\s("'`])\/(?:home|Users|root|var|tmp|etc|opt|private)\//,
  /\b(?:src|scripts|tests|node_modules)\//i,
  /\b[\w-]+\.(?:json|njk|ya?ml)\b/i,

  // Conversational preamble: the model describing the task instead of doing it
  // ("This looks like a request for...", "Here's one:"). The trailing colon
  // followed by a blank line is the seam where that preamble hands off to the
  // actual summary.
  /^\s*(?:sure|certainly|okay|ok|let me|i'?ll|i can|i'?ve|here'?s|this (?:looks like|appears to be|is for))\b/i,
  /:\s*\n\s*\n/,
];

// A short bolded or bare label ending in a colon, e.g. "**Absurd Summary:**".
const LEADING_LABEL = /^\s*(?:\*\*|__)?\s*(?:[A-Za-z]+ ){0,3}summary\s*:\s*(?:\*\*|__)?\s*/i;

function stripLeadingLabel(text) {
  return text.replace(LEADING_LABEL, '');
}

function countSentences(text) {
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
  return matches ? matches.filter((s) => s.trim().length > 0).length : 0;
}

function isValidHallucination(text) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > MAX_LENGTH) return false;
  if (countSentences(trimmed) > MAX_SENTENCES) return false;
  return !REJECT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Normalise raw CLI output into something publishable, or return null when the
 * output cannot be salvaged. Callers fall back to the previous good value.
 */
function sanitizeHallucination(raw) {
  if (typeof raw !== 'string') return null;
  const cleaned = stripLeadingLabel(raw.trim()).trim();
  return isValidHallucination(cleaned) ? cleaned : null;
}

async function generateHallucination(title, _content, { previous, attempts = 2 } = {}) {
  const prompt = `Given this blog post titled "${title}", create a humorous, 
    completely incorrect summary that's clearly wrong but entertaining. 
    Keep it under 2-3 sentences and make it sound absurd while staying family-friendly.
    The summary should be completely different from the actual content but maintain
    a connection to the topic.
    Respond with the summary text only: no preamble, no label or heading, no
    code blocks, no file paths, and no explanation of what you are doing.`;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    let raw;
    try {
      const result = spawnSync(
        'npx',
        ['claude', '-p', prompt, '--model', 'sonnet', '--tools', ''],
        {
          encoding: 'utf-8',
          env: { ...process.env },
        }
      );

      if (result.status !== 0) {
        throw new Error(result.stderr || 'Claude CLI exited with non-zero status');
      }

      raw = result.stdout;
    } catch (error) {
      console.error(`Error generating hallucination for "${title}":`, error.message);
      continue;
    }

    const cleaned = sanitizeHallucination(raw);
    if (cleaned) return cleaned;

    console.error(
      `Discarding non-conforming hallucination for "${title}" (attempt ${attempt}/${attempts})`
    );
  }

  if (previous) {
    console.error(`Keeping the previous hallucination for "${title}"`);
    return previous;
  }

  throw new Error(`Could not generate a usable hallucination for "${title}"`);
}

async function getLatestBlogPosts(blogDir = path.join(process.cwd(), 'src/blog'), limit = 5) {
  const files = await fs.readdir(blogDir);

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
        const { data, content: postContent } = matter(content);
        return {
          title: data.title,
          date: data.date,
          content: postContent,
          url: `/blog/${path.basename(file, '.md')}/`,
        };
      })
  );

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

async function readExistingHallucinations(dataFile) {
  try {
    const existing = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    return new Map(
      existing
        .filter((entry) => entry && entry.url && isValidHallucination(entry.hallucination))
        .map((entry) => [entry.url, entry.hallucination])
    );
  } catch {
    return new Map();
  }
}

async function main() {
  try {
    const dataDir = path.join(process.cwd(), 'src/_data');
    const dataFile = path.join(dataDir, 'hallucinations.json');
    const previousByUrl = await readExistingHallucinations(dataFile);

    const posts = await getLatestBlogPosts();
    const hallucinations = await Promise.all(
      posts.map(async (post) => ({
        title: post.title,
        date: post.date,
        url: post.url,
        hallucination: await generateHallucination(post.title, post.content, {
          previous: previousByUrl.get(post.url),
        }),
      }))
    );

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(hallucinations, null, 2));

    console.log('Successfully generated hallucinations for latest blog posts');
  } catch (error) {
    console.error('Error generating hallucinations:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getLatestBlogPosts,
  generateHallucination,
  sanitizeHallucination,
  isValidHallucination,
  stripLeadingLabel,
  countSentences,
  MAX_LENGTH,
  MAX_SENTENCES,
};
