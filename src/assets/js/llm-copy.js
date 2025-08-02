function copyToClipboard(contentId, buttonElement) {
  // Prevent multiple clicks while feedback is active
  if (buttonElement.dataset.copying === 'true') {
    return;
  }
  
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
  // Set copying state to prevent multiple concurrent operations
  buttonElement.dataset.copying = 'true';
  
  // Store original values only if not already stored
  if (!buttonElement.dataset.originalText) {
    buttonElement.dataset.originalText = buttonElement.innerText;
    buttonElement.dataset.originalClasses = buttonElement.className;
  }
  
  buttonElement.innerText = message;
  
  // Remove original classes and add feedback classes
  buttonElement.className = success 
    ? 'flex items-center gap-1 py-1 px-2 rounded text-xs transition-colors duration-300 border llm-copy-success'
    : 'flex items-center gap-1 py-1 px-2 rounded text-xs transition-colors duration-300 border llm-copy-error';
  
  // Clear any existing timeout
  if (buttonElement.dataset.timeoutId) {
    clearTimeout(parseInt(buttonElement.dataset.timeoutId));
  }
  
  // Set new timeout and store the ID
  const timeoutId = setTimeout(() => {
    buttonElement.innerText = buttonElement.dataset.originalText;
    buttonElement.className = buttonElement.dataset.originalClasses;
    
    // Clean up stored values and state
    delete buttonElement.dataset.copying;
    delete buttonElement.dataset.originalText;
    delete buttonElement.dataset.originalClasses;
    delete buttonElement.dataset.timeoutId;
  }, 2000);
  
  buttonElement.dataset.timeoutId = timeoutId.toString();
}
