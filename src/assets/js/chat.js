const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

let conversationHistory = [];

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        appendMessage('user', message);
        conversationHistory.push({ role: 'user', content: message });
        chatInput.value = '';
        getAIResponse();
    }
});

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerText = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function getAIResponse() {
    appendMessage('assistant', 'Thinking...');

    // Get the last user message to send to the worker
    const userMessage = conversationHistory[conversationHistory.length - 1];

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send the new message and the history separately
            body: JSON.stringify({ message: userMessage.content, conversationHistory: conversationHistory.slice(0, -1) }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = chatWindow.querySelector('.assistant-message:last-child');
        assistantMessage.innerText = data.message;
        conversationHistory.push({ role: 'assistant', content: data.message });
    } catch (error) {
        console.error("Error fetching AI response:", error);
        const assistantMessage = chatWindow.querySelector('.assistant-message:last-child');
        assistantMessage.innerText = 'Sorry, I am having trouble connecting. Please try again later.';
        // Remove the user's message from history on failure to allow for a clean retry.
        conversationHistory.pop();
    }
}
