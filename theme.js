document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  
  // Elements
  const themeSelect = document.getElementById('theme-select');
  const modeToggle = document.getElementById('mode-toggle');

  // Load preferences from localStorage
  const savedTheme = localStorage.getItem('tuktuk-theme') || 'neutral';
  const savedMode = localStorage.getItem('tuktuk-mode') || 'light';

  // Initialize
  setTheme(savedTheme);
  setMode(savedMode);

  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      const currentMode = htmlEl.getAttribute('data-color-mode');
      const newMode = currentMode === 'light' ? 'dark' : 'light';
      setMode(newMode);
    });
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('tuktuk-theme', theme);
  }

  function setMode(mode) {
    htmlEl.setAttribute('data-color-mode', mode);
    localStorage.setItem('tuktuk-mode', mode);
    if (modeToggle) {
      modeToggle.textContent = mode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
  }
});
