function copyToClipboard(contentId, buttonElement) {
  const content = document.getElementById(contentId).innerText;
  navigator.clipboard.writeText(content).then(() => {
    const originalText = buttonElement.innerText;
    buttonElement.innerText = 'Copied!';
    setTimeout(() => {
      buttonElement.innerText = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    const originalText = buttonElement.innerText;
    buttonElement.innerText = 'Error!';
    setTimeout(() => {
      buttonElement.innerText = originalText;
    }, 2000);
  });
}

function openLLM(tool, contentId) {
    const content = document.getElementById(contentId).innerText;
    const encodedContent = encodeURIComponent(content);
    let url;

    switch (tool) {
        case 'claude':
            url = `https://claude.ai/chats?text=${encodedContent}`;
            break;
        case 'chatgpt':
            url = `https://chat.openai.com/?text=${encodedContent}`;
            break;
        case 'gemini':
            url = `https://gemini.google.com/app?text=${encodedContent}`;
            break;
        default:
            console.error('Unknown tool:', tool);
            return;
    }

    window.open(url, '_blank');
}
