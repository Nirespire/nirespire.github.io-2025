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
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationHistory }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = chatWindow.querySelector('.assistant-message:last-child');
        assistantMessage.innerText = data.reply;
        conversationHistory.push({ role: 'assistant', content: data.reply });
    } catch (error) {
        console.error("Error fetching AI response:", error);
        const assistantMessage = chatWindow.querySelector('.assistant-message:last-child');
        assistantMessage.innerText = 'Sorry, I am having trouble connecting. Please try again later.';
        // Remove the user's message from history on failure to allow for a clean retry.
        conversationHistory.pop();
    }
}
