const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { getLatestBlogPosts } = require('../../scripts/generate-hallucinations.js');

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
