require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const consumer_key = process.env.POCKET_CONSUMER_KEY;
const access_token = process.env.POCKET_ACCESS_TOKEN;

(async () => {
    const res = await fetch('https://getpocket.com/v3/get', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Accept': 'application/json'
        },
        body: JSON.stringify({
            consumer_key,
            access_token,
            tag: 'to-share',
            sort: 'newest',
            count: 5,
            detailType: 'complete'
        })
    });

    if (!res.ok) {
        console.error("Failed to fetch Pocket items:", await res.text());
        process.exit(1);
    }

    const json = await res.json();
    const articles = Object.values(json.list).map(item => ({
        title: item.resolved_title || item.given_title,
        url: item.resolved_url || item.given_url,
        excerpt: item.excerpt,
        dateAdded: new Date(parseInt(item.time_added) * 1000).toISOString()
    }));

    const outputPath = path.join(__dirname, '..', 'src', '_data', 'pocket.json');
    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
    console.log(`Saved ${articles.length} items to ${outputPath}`);
})();