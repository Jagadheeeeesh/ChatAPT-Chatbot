const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const responseBox = document.getElementById("response");
const apiKeyInput = document.getElementById("api-key");
const apiWarning = document.getElementById("api-warning");
const apiSuccess = document.getElementById("api-success");
const modelSelect = document.getElementById("model");
const paramSettings = document.getElementById("param-settings");
const toggleParams = document.getElementById("toggle-params");
const tempSlider = document.getElementById("temperature");
const topPSlider = document.getElementById("top_p");
const maxTokensInput = document.getElementById("max_tokens");
const toggleParamsBtn = document.getElementById("toggle-params");
const paramPanel = document.getElementById("param-panel");
const closeParamPanelBtn = document.getElementById("close-param-panel");

// Parameters are now fixed for low cost
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_TOP_P = 0.7;
const DEFAULT_MAX_TOKENS = 256;

document.getElementById("temp-val").textContent = tempSlider.value;
tempSlider.oninput = () => {
  document.getElementById("temp-val").textContent = tempSlider.value;
};
document.getElementById("top_p-val").textContent = topPSlider.value;
topPSlider.oninput = () => {
  document.getElementById("top_p-val").textContent = topPSlider.value;
};

if (toggleParamsBtn && paramPanel) {
  toggleParamsBtn.addEventListener("click", () => {
    if (paramPanel.style.display === "none" || paramPanel.style.display === "") {
      paramPanel.style.display = "block";
    } else {
      paramPanel.style.display = "none";
    }
  });
}

if (closeParamPanelBtn && paramPanel) {
  closeParamPanelBtn.addEventListener("click", () => {
    paramPanel.style.display = "none";
  });
}
// Store chat history in sessionStorage
function saveChatHistory(userMsg, aiMsg) {
  let history = JSON.parse(sessionStorage.getItem('chatHistory') || '[]');
  history.push({ user: userMsg, ai: aiMsg });
  sessionStorage.setItem('chatHistory', JSON.stringify(history));
}

function renderChatHistory() {
  let history = JSON.parse(sessionStorage.getItem('chatHistory') || '[]');
  responseBox.innerHTML = '';
  for (const msg of history) {
    responseBox.innerHTML += `<div class="user-row"><div class="bubble user">${msg.user}<img src='public/userlogo.jpg' alt='User Logo' class='response-bot-logo' /></div></div>`;
    // Render Markdown from AI response into HTML
    const aiHtml = marked.parse(msg.ai);
    responseBox.innerHTML += `<div class="ai-row"><div class="bubble ai"><img src='public/botlogo.jpg' alt='Bot Logo' class='response-bot-logo' /><div class="content">${aiHtml}</div></div></div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderChatHistory();
  const savedKey = sessionStorage.getItem('groqApiKey');
  if (savedKey) {
    apiKeyInput.value = savedKey;
    apiSuccess.style.display = 'block';
    apiWarning.style.display = 'none';
  }
  const theme = sessionStorage.getItem('chatapt-theme');
  if (theme === 'light') setMode('light');
  else setMode('dark');
});

apiKeyInput.addEventListener('input', () => {
  if (apiKeyInput.value.trim()) {
    apiWarning.style.display = 'none';
    apiSuccess.style.display = 'block';
    sessionStorage.setItem('groqApiKey', apiKeyInput.value.trim());
  } else {
    apiSuccess.style.display = 'none';
    sessionStorage.removeItem('groqApiKey');
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = input.value.trim();
  const apiKey = apiKeyInput.value.trim();
  if (!prompt) return;
  input.value = ''; // Immediately clear input on submit
  if (!apiKey) {
    apiWarning.style.display = "block";
    apiSuccess.style.display = "none";
    responseBox.innerHTML = '';
    responseBox.innerHTML = `<div class="bubble ai">Please enter your Groq API key!</div>`;
    return;
  } else {
    apiWarning.style.display = "none";
    apiSuccess.style.display = "block";
  }
  responseBox.innerHTML += `<div class="user-row"><div class="bubble user">${prompt}<img src='/userlogo.jpg' alt='User Logo' class='response-bot-logo' /></div></div><div class="ai-row"><div class="bubble ai"><img src='/botlogo.jpg' alt='Bot Logo' class='response-bot-logo' /><em>Thinking...</em></div></div>`;
  const payload = {
    model: modelSelect.value,
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: prompt }
    ],
    temperature: parseFloat(tempSlider.value),
    top_p: parseFloat(topPSlider.value),
    max_tokens: parseInt(maxTokensInput.value)
  };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.choices && data.choices.length > 0) {
      // Save and render chat history
      saveChatHistory(prompt, data.choices[0].message.content);
      renderChatHistory();
    } else {
      responseBox.innerHTML += `<div class="bubble ai">Error: ${data.error ? data.error.message : 'Unknown error'}</div>`;
    }
  } catch (error) {
    responseBox.innerHTML += `<div class="bubble ai">Error: ${error.message}</div>`;
  }
});

// Theme mode switching
const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');

function setMode(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
    sessionStorage.setItem('chatapt-theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    darkModeBtn.classList.add('active');
    lightModeBtn.classList.remove('active');
    sessionStorage.setItem('chatapt-theme', 'dark');
  }
}

if (lightModeBtn && darkModeBtn) {
  lightModeBtn.addEventListener('click', () => setMode('light'));
  darkModeBtn.addEventListener('click', () => setMode('dark'));
}