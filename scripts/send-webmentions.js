const fs = require('fs').promises;
const path = require('path');

const raindropFilePath = path.join(__dirname, '../src/_data/raindrop.json');
const cacheDir = path.join(__dirname, '../.cache');
const sentWebmentionsPath = path.join(cacheDir, 'sent-webmentions.json');
const sourceUrl = 'https://sanjaynair.me/reads';

const USER_AGENT = 'sanjaynair.me-webmention/1.0 (+https://sanjaynair.me)';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 1_048_576;

function splitLinkHeader(header) {
  const entries = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < header.length; i++) {
    const c = header[i];
    if (c === '<') depth++;
    else if (c === '>') depth--;
    else if (c === ',' && depth === 0) {
      entries.push(header.slice(start, i));
      start = i + 1;
    }
  }
  entries.push(header.slice(start));
  return entries;
}

function findWebmentionInLinkHeader(header) {
  for (const entry of splitLinkHeader(header)) {
    const urlMatch = entry.match(/<([^>]*)>/);
    if (!urlMatch) continue;
    const params = entry.slice(urlMatch[0].length);
    const relMatch = params.match(/;\s*rel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;,\s]+))/i);
    if (!relMatch) continue;
    const rel = (relMatch[1] || relMatch[2] || relMatch[3] || '').toLowerCase();
    if (rel.split(/\s+/).includes('webmention')) return urlMatch[1].trim();
  }
  return null;
}

function findWebmentionInHtml(html) {
  const re = /<(?:link|a)\b([^>]*?)\/?>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const relMatch = attrs.match(/\srel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!relMatch) continue;
    const rel = (relMatch[1] || relMatch[2] || relMatch[3] || '').toLowerCase();
    if (!rel.split(/\s+/).includes('webmention')) continue;
    const hrefMatch = attrs.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!hrefMatch) continue;
    const href =
      hrefMatch[1] !== undefined
        ? hrefMatch[1]
        : hrefMatch[2] !== undefined
          ? hrefMatch[2]
          : hrefMatch[3];
    return href;
  }
  return null;
}

async function readCappedText(response, maxBytes) {
  if (!response.body) return await response.text();
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let received = 0;
  let out = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    received += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (received >= maxBytes) {
      try {
        await reader.cancel();
      } catch {}
      break;
    }
  }
  out += decoder.decode();
  return out;
}

async function discoverWebmentionEndpoint(targetUrl) {
  const res = await fetch(targetUrl, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html, */*;q=0.8' },
  });

  const baseUrl = res.url || targetUrl;

  const linkHeader = res.headers.get('link');
  if (linkHeader) {
    const found = findWebmentionInLinkHeader(linkHeader);
    if (found !== null) {
      try {
        await res.body?.cancel();
      } catch {}
      return new URL(found, baseUrl).toString();
    }
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    try {
      await res.body?.cancel();
    } catch {}
    return null;
  }

  const html = await readCappedText(res, MAX_HTML_BYTES);
  const found = findWebmentionInHtml(html);
  if (found === null) return null;
  return new URL(found, baseUrl).toString();
}

async function sendWebmention(source, target) {
  let endpoint;
  try {
    endpoint = await discoverWebmentionEndpoint(target);
  } catch (err) {
    return { success: false, error: `discovery failed: ${err.message}` };
  }
  if (!endpoint) return { success: false, error: 'no webmention endpoint found' };

  const parsed = new URL(endpoint);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { success: false, endpoint, error: `unsupported endpoint scheme: ${parsed.protocol}` };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
      body: new URLSearchParams({ source, target }),
    });
    try {
      await res.body?.cancel();
    } catch {}
    if (res.ok) return { success: true, status: res.status, endpoint };
    return { success: false, status: res.status, endpoint, error: `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, endpoint, error: err.message };
  }
}

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });

  let sentWebmentions = {};
  try {
    const data = await fs.readFile(sentWebmentionsPath, 'utf8');
    sentWebmentions = JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading sent webmentions cache:', error);
      return;
    }
  }

  const raindropData = await fs.readFile(raindropFilePath, 'utf8');
  const items = JSON.parse(raindropData);

  for (const item of items) {
    const targetUrl = item.url;
    if (!sentWebmentions[targetUrl]) {
      console.log(`Sending webmention from ${sourceUrl} to ${targetUrl}`);
      try {
        const result = await sendWebmention(sourceUrl, targetUrl);
        if (result.success) {
          console.log(`Successfully sent webmention for: ${targetUrl}`);
          sentWebmentions[targetUrl] = new Date().toISOString();
        } else {
          console.error(`Failed to send webmention for ${targetUrl}:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending webmention for ${targetUrl}:`, error);
      }
    }
  }

  await fs.writeFile(sentWebmentionsPath, JSON.stringify(sentWebmentions, null, 2));
  console.log('Finished sending webmentions.');
}

if (require.main === module) {
  main();
}

module.exports = {
  sendWebmention,
  discoverWebmentionEndpoint,
  splitLinkHeader,
  findWebmentionInLinkHeader,
  findWebmentionInHtml,
};
