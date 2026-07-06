import ring from '../ring.json' with { type: 'json' };

// Reduce a URL (or bare host) to a lowercase host with no scheme, no path,
// no leading "www.", so "https://www.Example.com/blog" and "example.com"
// match the same member. Uses the URL parser (linear) rather than regex
// slicing so an attacker-supplied `from` can't trigger catastrophic
// backtracking.
function normalizeHost(value) {
  if (!value) return '';
  let candidate = value.trim();
  // Accept bare hosts ("example.com") as well as full URLs.
  if (!candidate.includes('://')) candidate = `https://${candidate}`;
  let host;
  try {
    host = new URL(candidate).hostname.toLowerCase();
  } catch {
    return '';
  }
  return host.startsWith('www.') ? host.slice(4) : host;
}

// Index of the member the request is coming *from*, or -1 if unknown.
function currentIndex(from) {
  const host = normalizeHost(from);
  if (!host) return -1;
  return ring.findIndex((member) => normalizeHost(member.url) === host);
}

function redirect(url) {
  return Response.redirect(url, 302);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const n = ring.length;

    if (n === 0) {
      return new Response('The webring has no members yet.', { status: 503 });
    }

    switch (url.pathname) {
      case '/next': {
        const i = currentIndex(from);
        // Unknown / missing `from` sends you to the first member.
        return redirect(i === -1 ? ring[0].url : ring[(i + 1) % n].url);
      }
      case '/prev': {
        const i = currentIndex(from);
        // Unknown / missing `from` sends you to the last member.
        return redirect(i === -1 ? ring[n - 1].url : ring[(i - 1 + n) % n].url);
      }
      case '/random': {
        return redirect(ring[Math.floor(Math.random() * n)].url);
      }
      case '/members': {
        return Response.json(ring);
      }
      case '/':
      case '': {
        const body = [
          'Webring host.',
          '',
          'Routes:',
          '  /next?from=<your-site>   → 302 to the next member',
          '  /prev?from=<your-site>   → 302 to the previous member',
          '  /random                  → 302 to a random member',
          '  /members                 → JSON list of members',
          '',
          `${n} member(s) in the ring.`,
        ].join('\n');
        return new Response(body, {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }
      default:
        return new Response('Not found', { status: 404 });
    }
  },
};
