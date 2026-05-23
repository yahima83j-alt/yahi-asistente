// ── ESTADO ──
const conversationHistory = [];
let isLoading = false;

// ── ELEMENTOS ──
const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

// ── SUGERENCIAS INICIALES ──
const suggestions = [
  "Me da pena salir en cámara 😳",
  "No sé qué publicar",
  "Quiero empezar en TikTok Shop",
  "¿Cómo creo contenido sin mostrar mi cara?",
  "Tengo miedo a que me critiquen",
  "¿Por dónde empiezo desde cero?",
  "Me siento bloqueada y no arranco",
  "¿Cómo funciona Amazon Influencer?",
];

// ── INICIALIZAR ──
function init() {
  renderSuggestions();
  userInput.addEventListener('keydown', handleKeyDown);
  userInput.addEventListener('input', autoResize);
  sendBtn.addEventListener('click', sendMessage);
}

function renderSuggestions() {
  const container = document.getElementById('suggestionsContainer');
  if (!container) return;
  suggestions.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = text;
    btn.onclick = () => {
      userInput.value = text;
      sendMessage();
    };
    container.appendChild(btn);
  });
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

// ── ENVIAR MENSAJE ──
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  // Ocultar sugerencias la primera vez
  const suggestionsArea = document.getElementById('suggestionsArea');
  if (suggestionsArea) suggestionsArea.style.display = 'none';

  // Agregar mensaje de la alumna
  addMessage('alumna', text);
  conversationHistory.push({ role: 'user', content: text });

  // Limpiar input
  userInput.value = '';
  userInput.style.height = 'auto';
  setLoading(true);

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();

    if (data.error) {
      addMessage('yahi', '❤️ Niña, algo salió mal de mi lado. Intenta de nuevo en un momento, ¿sí?');
    } else {
      addMessage('yahi', data.reply);
      conversationHistory.push({ role: 'assistant', content: data.reply });
    }

  } catch (error) {
    console.error('Error:', error);
    addMessage('yahi', '❤️ Niña, hubo un problema de conexión. Revisa tu internet y vuelve a intentarlo.');
  }

  setLoading(false);
}

// ── AGREGAR MENSAJE AL CHAT ──
function addMessage(sender, text) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${sender}`;
  avatar.textContent = sender === 'yahi' ? '🌸' : '✨';

  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.innerHTML = formatText(text);

  message.appendChild(avatar);
  message.appendChild(bubble);
  chat.appendChild(message);

  scrollToBottom();
}

// ── FORMATEAR TEXTO (saltos de línea, negritas) ──
function formatText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
    .replace(/\n/g, '<br>');
}

// ── LOADING ──
function setLoading(state) {
  isLoading = state;
  sendBtn.disabled = state;
  typingIndicator.classList.toggle('visible', state);
  if (state) scrollToBottom();
}

// ── SCROLL ──
function scrollToBottom() {
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, 50);
}

// ── ARRANCAR ──
document.addEventListener('DOMContentLoaded', init);
