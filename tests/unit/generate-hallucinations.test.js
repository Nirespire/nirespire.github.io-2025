const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  getLatestBlogPosts,
  sanitizeHallucination,
  isValidHallucination,
  stripLeadingLabel,
  MAX_LENGTH,
  MAX_SENTENCES,
} = require('../../scripts/generate-hallucinations.js');

async function writePost(dir, filename, frontmatter, body = 'body text') {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : v}`)
    .join('\n');
  await fs.writeFile(path.join(dir, filename), `---\n${fm}\n---\n${body}\n`, 'utf-8');
}

async function makeFixtureDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'hallucinations-test-'));
}

test('getLatestBlogPosts returns posts sorted newest-first', async () => {
  const dir = await makeFixtureDir();
  try {
    await writePost(dir, 'old.md', { title: 'Old', date: '2020-01-01' });
    await writePost(dir, 'middle.md', { title: 'Middle', date: '2022-06-15' });
    await writePost(dir, 'new.md', { title: 'New', date: '2024-12-31' });

    const posts = await getLatestBlogPosts(dir, 10);
    assert.deepEqual(
      posts.map((p) => p.title),
      ['New', 'Middle', 'Old']
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('getLatestBlogPosts respects the limit argument', async () => {
  const dir = await makeFixtureDir();
  try {
    for (let i = 0; i < 7; i++) {
      await writePost(dir, `post-${i}.md`, {
        title: `Post ${i}`,
        date: `2024-0${i + 1}-01`.slice(0, 10),
      });
    }

    const posts = await getLatestBlogPosts(dir, 3);
    assert.equal(posts.length, 3);
    assert.deepEqual(
      posts.map((p) => p.title),
      ['Post 6', 'Post 5', 'Post 4']
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('getLatestBlogPosts ignores non-markdown files', async () => {
  const dir = await makeFixtureDir();
  try {
    await writePost(dir, 'real.md', { title: 'Real', date: '2024-01-01' });
    await fs.writeFile(path.join(dir, 'draft.txt'), 'not a post');
    await fs.writeFile(path.join(dir, '.DS_Store'), '');

    const posts = await getLatestBlogPosts(dir, 10);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].title, 'Real');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('getLatestBlogPosts parses frontmatter into title/date/content', async () => {
  const dir = await makeFixtureDir();
  try {
    await writePost(dir, 'one.md', { title: 'Hello', date: '2024-05-01' }, 'post body here');

    const [post] = await getLatestBlogPosts(dir, 10);
    assert.equal(post.title, 'Hello');
    assert.equal(post.date, '2024-05-01');
    assert.match(post.content, /post body here/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('getLatestBlogPosts returns [] for an empty directory', async () => {
  const dir = await makeFixtureDir();
  try {
    const posts = await getLatestBlogPosts(dir, 5);
    assert.deepEqual(posts, []);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('getLatestBlogPosts includes url derived from filename', async () => {
  const dir = await makeFixtureDir();
  try {
    await writePost(dir, '2024-03-15-my-cool-post.md', {
      title: 'My Cool Post',
      date: '2024-03-15',
    });

    const [post] = await getLatestBlogPosts(dir, 10);
    assert.equal(post.url, '/blog/2024-03-15-my-cool-post/');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('hallucinations.json integrity: every url matches an actual blog file', async () => {
  const root = path.join(__dirname, '..', '..');
  const dataFile = path.join(root, 'src', '_data', 'hallucinations.json');
  const blogDir = path.join(root, 'src', 'blog');

  const hallucinations = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
  const blogFiles = await fs.readdir(blogDir);
  const blogSlugs = new Set(
    blogFiles.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
  );

  for (const entry of hallucinations) {
    assert.ok(entry.url, `Entry "${entry.title}" is missing a url field`);
    const slug = entry.url.replace(/^\/blog\//, '').replace(/\/$/, '');
    assert.ok(blogSlugs.has(slug), `url "${entry.url}" does not match any blog file in src/blog/`);
  }
});

test('stripLeadingLabel removes a bolded "Absurd Summary:" label', () => {
  assert.equal(
    stripLeadingLabel('**Absurd Summary:** The raccoons did it.'),
    'The raccoons did it.'
  );
  assert.equal(stripLeadingLabel('Summary: The raccoons did it.'), 'The raccoons did it.');
  assert.equal(stripLeadingLabel('__Hallucinated Summary:__ Kevin quit.'), 'Kevin quit.');
});

test('stripLeadingLabel leaves ordinary prose alone', () => {
  const prose = 'Sanjay trained a raccoon: it did not go well.';
  assert.equal(stripLeadingLabel(prose), prose);
});

test('isValidHallucination accepts short absurd prose', () => {
  assert.ok(
    isValidHallucination(
      'Sanjay replaced his entire test suite with a magic 8-ball. It has a 50% pass rate and excellent vibes.'
    )
  );
});

test('isValidHallucination rejects agent tool-call transcripts', () => {
  assert.equal(
    isValidHallucination('Let me check the existing format.\n\n**Tool: bash**\n\nParameters:'),
    false
  );
  assert.equal(isValidHallucination('Looking now.\n\n```json\n{"command":"cat file"}\n```'), false);
});

test('isValidHallucination rejects absolute filesystem paths', () => {
  assert.equal(
    isValidHallucination('Checking /home/runner/.claude/projects/some-repo/memory/MEMORY.md now.'),
    false
  );
  assert.equal(isValidHallucination('Reading /Users/sanjay/notes.txt for context.'), false);
});

test('isValidHallucination rejects empty and over-long output', () => {
  assert.equal(isValidHallucination(''), false);
  assert.equal(isValidHallucination('   '), false);
  assert.equal(isValidHallucination(null), false);
  assert.equal(isValidHallucination('Word. '.repeat(MAX_LENGTH)), false);
  assert.equal(
    isValidHallucination(
      Array(MAX_SENTENCES + 2)
        .fill('A raccoon did it.')
        .join(' ')
    ),
    false
  );
});

test('sanitizeHallucination strips a label and returns null for garbage', () => {
  assert.equal(
    sanitizeHallucination('**Absurd Summary:** Kevin the agent quit.'),
    'Kevin the agent quit.'
  );
  assert.equal(sanitizeHallucination('**Tool: bash**\n\nParameters:\n- command: ls'), null);
  assert.equal(sanitizeHallucination(undefined), null);
});

test('hallucinations.json contains only publishable prose', async () => {
  const dataFile = path.join(__dirname, '..', '..', 'src', '_data', 'hallucinations.json');
  const hallucinations = JSON.parse(await fs.readFile(dataFile, 'utf-8'));

  assert.ok(hallucinations.length > 0, 'hallucinations.json should not be empty');

  for (const entry of hallucinations) {
    assert.equal(
      typeof entry.hallucination,
      'string',
      `Entry "${entry.title}" is missing a hallucination string`
    );
    assert.ok(
      isValidHallucination(entry.hallucination),
      `Entry "${entry.title}" is not publishable prose — it is empty, too long, or contains ` +
        `tool-call markers, code fences, or an absolute filesystem path: ${entry.hallucination}`
    );
    assert.equal(
      stripLeadingLabel(entry.hallucination),
      entry.hallucination,
      `Entry "${entry.title}" still carries a "Summary:"-style label`
    );
  }
});
