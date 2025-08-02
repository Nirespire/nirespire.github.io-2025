function copyToClipboard(contentId, buttonElement) {
  const contentElement = document.getElementById(contentId);
  if (!contentElement) {
    console.error('Content element not found:', contentId);
    return;
  }
  
  const content = contentElement.innerText.trim();
  
  if (!content) {
    console.error('No content to copy');
    return;
  }
  
  // Use modern clipboard API with fallback
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(content).then(() => {
      showCopyFeedback(buttonElement, 'Copied!', true);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      showCopyFeedback(buttonElement, 'Error!', false);
    });
  } else {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopyFeedback(buttonElement, 'Copied!', true);
      } else {
        showCopyFeedback(buttonElement, 'Error!', false);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showCopyFeedback(buttonElement, 'Error!', false);
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

function showCopyFeedback(buttonElement, message, success) {
  const originalText = buttonElement.innerText;
  buttonElement.innerText = message;
  buttonElement.style.backgroundColor = success ? '#10B981' : '#EF4444';
  
  setTimeout(() => {
    buttonElement.innerText = originalText;
    buttonElement.style.backgroundColor = '';
  }, 2000);
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
