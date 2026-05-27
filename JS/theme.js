/**
 * TukTuk Theme & Color Mode Masculine/Feminine only
 */
window.TukTukThemeEngine = {
  init() {
    // musculine line
    let savedTheme = localStorage.getItem('tuktuk-theme');
    if (!savedTheme || savedTheme === 'default') {
      savedTheme = 'masculine';
    }
    const savedMode = localStorage.getItem('tuktuk-mode') || 'light';
    
    this.setTheme(savedTheme);
    this.setMode(savedMode);
    this.removeDefaultOptions();
  },

  setTheme(themeName) {
    // musculine convert
    if (themeName === 'default') themeName = 'masculine';
    
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('tuktuk-theme', themeName);
    
    document.querySelectorAll('#global-theme-select, .theme-select-trigger').forEach(select => {
      if (select) select.value = themeName;
    });
  },

  setMode(modeName) {
    document.documentElement.setAttribute('data-color-mode', modeName);
    localStorage.setItem('tuktuk-mode', modeName);
    
    document.querySelectorAll('#global-mode-toggle, .mode-toggle-trigger').forEach(btn => {
      if (btn) {
        btn.innerHTML = modeName === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
      }
    });
  },

  // option gone
  removeDefaultOptions() {
    setTimeout(() => {
      document.querySelectorAll('#global-theme-select option, .theme-select-trigger option').forEach(option => {
        if (option.value === 'default') {
          option.remove();
        }
      });
    }, 100);
  }
};


window.TukTukThemeEngine.init();