document.addEventListener('DOMContentLoaded', function() {
    const rssPrompt = document.getElementById('rss-prompt');
    const dismissButton = document.getElementById('rss-dismiss-btn');
    const copyButton = document.getElementById('rss-copy-btn');
    const shareButton = document.getElementById('rss-share-btn');
    const rssFeedUrl = 'https://sanjaynair.me/feed.xml';
    const cookieName = 'rss_prompt_dismissed';

    if (!rssPrompt) {
        return;
    }

    // Check if the prompt has been dismissed
    if (document.cookie.includes(`${cookieName}=true`)) {
        return;
    }

    // Check if user is on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        copyButton.style.display = 'none';
        shareButton.style.display = 'inline-flex';
    } else {
        copyButton.style.display = 'inline-flex';
        shareButton.style.display = 'none';
    }


    const showPrompt = () => {
        rssPrompt.classList.add('visible');
    };

    const hidePrompt = () => {
        rssPrompt.classList.remove('visible');
    };

    const dismissPrompt = () => {
        hidePrompt();
        // Set a session cookie
        document.cookie = `${cookieName}=true; path=/`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy RSS URL';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const shareFeed = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Sanjay Nair\'s Blog RSS Feed',
                url: rssFeedUrl
            }).catch(err => {
                console.error('Error sharing feed:', err);
            });
        }
    };

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;

        // Show prompt when user is 85% of the way down the page
        if (scrollPosition + windowHeight >= bodyHeight * 0.85) {
            showPrompt();
            window.removeEventListener('scroll', handleScroll);
        }
    };

    window.addEventListener('scroll', handleScroll);
    dismissButton.addEventListener('click', dismissPrompt);
    copyButton.addEventListener('click', () => copyToClipboard(rssFeedUrl));
    shareButton.addEventListener('click', shareFeed);

    // Initial check in case the page is already scrolled to the bottom
    handleScroll();
});
