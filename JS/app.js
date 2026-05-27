/**
 * TukTuk Core Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const sidebarTarget = document.getElementById('desktop-sidebar-target');
  const headerTarget = document.getElementById('global-header-target');
  const viewportWrapper = document.getElementById('view-viewport-wrapper');

  let activeView = 'view-dashboard';
  let timerInterval = null;
  let timerTimeLeft = 25 * 60; 
  let totalTimerDuration = 25 * 60;
  let isTimerRunning = false;

  async function initApp() {
    await loadComponent(sidebarTarget, 'components/sidebar.html');
    await loadComponent(headerTarget, 'components/header.html');
    await switchView(activeView);
    setupGlobalNavigation();
    setupGlobalThemeListeners();
    setupMobileMenuTrigger();
  }

  function setupMobileMenuTrigger() {
    const trigger = document.getElementById('mobile-menu-trigger');
    const dropdown = document.getElementById('mobile-style-dropdown');
    
    if (trigger && dropdown) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== trigger) {
          dropdown.classList.remove('show');
        }
      });
    }

    document.querySelectorAll('.mobile-dropdown-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-view'));
        if (dropdown) dropdown.classList.remove('show');
      });
    });
  }

  async function loadComponent(targetEl, filePath) {
    if (!targetEl) return;
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const htmlContent = await response.text();
      targetEl.innerHTML = htmlContent;
    } catch (error) {
      console.error(error);
      targetEl.innerHTML = `<p style="color:red; padding:1rem;">Error loading component</p>`;
    }
  }

  async function switchView(viewId) {
    activeView = viewId;
    const fileName = viewId.replace('view-', '');
    viewportWrapper.innerHTML = `<div class="card flex justify-center items-center" style="min-height:200px;"><p>Loading view...</p></div>`;
    await loadComponent(viewportWrapper, `views/${fileName}.html`);
    syncNavigationUI(viewId);
    attachViewSpecificListeners(fileName);
    
    // theme button
    if (window.TukTukThemeEngine) {
      const currentTheme = localStorage.getItem('tuktuk-theme') || 'default';
      const currentMode = localStorage.getItem('tuktuk-mode') || 'light';
      window.TukTukThemeEngine.setTheme(currentTheme);
      window.TukTukThemeEngine.setMode(currentMode);
    }
  }

  function syncNavigationUI(viewId) {
    document.querySelectorAll('.sidebar-link, .mobile-nav-btn').forEach(el => {
      if (el.getAttribute('data-view') === viewId) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function setupGlobalNavigation() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar-link');
      if (link) {
        e.preventDefault();
        switchView(link.getAttribute('data-view'));
      }
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.getAttribute('data-view')));
    });
  }

  function setupGlobalThemeListeners() {
    document.body.addEventListener('change', (e) => {
      if (e.target.classList.contains('theme-select-trigger') || e.target.id === 'global-theme-select') {
        window.TukTukThemeEngine.setTheme(e.target.value);
      }
    });

    document.body.addEventListener('click', (e) => {
      if (e.target.classList.contains('mode-toggle-trigger') || e.target.id === 'global-mode-toggle') {
        const currentMode = document.documentElement.getAttribute('data-color-mode') || 'light';
        const nextMode = currentMode === 'light' ? 'dark' : 'light';
        window.TukTukThemeEngine.setMode(nextMode);
      }
    });
  }

  function attachViewSpecificListeners(viewName) {
    if (viewName === 'history') renderHistoryLog();

    if (viewName === 'analytics') {
      const crushedCountEl = document.getElementById('stats-crushed-count');
      if (crushedCountEl) {
        const history = JSON.parse(localStorage.getItem('tuktuk-history') || '[]');
        crushedCountEl.textContent = history.length;
      }
    }

    if (viewName === 'profile') {
      const saveBtn = document.getElementById('save-profile-btn');
      const resetBtn = document.getElementById('reset-data-btn');
      const nameInput = document.getElementById('profile-name-input');
      const profInput = document.getElementById('profile-profession-input');
      const instInput = document.getElementById('profile-institution-input');
      const displayName = document.getElementById('profile-display-name');
      const displayProf = document.getElementById('profile-display-profession');
      const displayInst = document.getElementById('profile-display-institution');
      const avatar = document.getElementById('profile-avatar');

      const savedName = localStorage.getItem('tuktuk-user-name') || 'TukTuk Rider';
      const savedProf = localStorage.getItem('tuktuk-user-prof') || 'Premium Achiever Account';
      const savedInst = localStorage.getItem('tuktuk-user-inst') || '';

      if(displayName) displayName.textContent = savedName;
      if(displayProf) displayProf.textContent = savedProf;
      if(displayInst) displayInst.textContent = savedInst;
      if(nameInput) nameInput.value = savedName === 'TukTuk Rider' ? '' : savedName;
      if(profInput) profInput.value = savedProf === 'Premium Achiever Account' ? '' : savedProf;
      if(instInput) instInput.value = savedInst;
      if(avatar) avatar.textContent = savedName.charAt(0).toUpperCase();

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const newName = nameInput.value.trim() || 'TukTuk Rider';
          const newProf = profInput.value.trim() || 'Premium Achiever Account';
          const newInst = instInput.value.trim() || '';

          localStorage.setItem('tuktuk-user-name', newName);
          localStorage.setItem('tuktuk-user-prof', newProf);
          localStorage.setItem('tuktuk-user-inst', newInst);

          if(displayName) displayName.textContent = newName;
          if(displayProf) displayProf.textContent = newProf;
          if(displayInst) displayInst.textContent = newInst;
          if(avatar) avatar.textContent = newName.charAt(0).toUpperCase();
          alert('Profile saved successfully! 🎉');
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if(confirm('Are you sure you want to reset all data back to defaults?')) {
            localStorage.clear();
            window.location.reload();
          }
        });
      }
    }

    if (viewName === 'tasks') {
      const simplifyBtn = document.getElementById('simplify-btn');
      const bigGoalInput = document.getElementById('big-goal-input');
      const loadingPhrases = document.getElementById('loading-phrases');
      const microtaskBlock = document.getElementById('microtask-block');
      const masterGoalTitle = document.getElementById('master-goal-title');
      const tasksContainer = document.getElementById('tasks-container');

      if (simplifyBtn) {
        simplifyBtn.addEventListener('click', () => {
          const goalText = bigGoalInput.value.trim();
          if (!goalText) return alert("Please type a big goal first!");

          simplifyBtn.disabled = true;
          if(loadingPhrases) loadingPhrases.classList.remove('hidden');
          
          setTimeout(() => {
            if(loadingPhrases) loadingPhrases.classList.add('hidden');
            simplifyBtn.disabled = false;
            if(masterGoalTitle) masterGoalTitle.innerHTML = `Deconstructed: <strong>${goalText}</strong>`;
            if(microtaskBlock) microtaskBlock.classList.remove('hidden');
            if(tasksContainer) {
              generateMicroTasks(goalText, tasksContainer);
              updateProgressBar();
            }
          }, 1500);
        });
      }
      initCustomTimerFeatures();
    }
  }

  function generateMicroTasks(goalText, container) {
    const subTasks = [
      `Clean your workspace and remove distractions`,
      `Draft a lightning-fast, rough outline of "${goalText}"`,
      `Execute the very first atomic micro-action step`
    ];
    
    container.innerHTML = '';
    subTasks.forEach((taskDesc, idx) => {
      const item = document.createElement('div');
      item.className = 'task-item';
      item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 8px;";
      
      item.innerHTML = `
        <div class="flex items-center gap-sm" style="flex: 1; min-width: 250px;">
          <input type="checkbox" class="task-checkbox" id="task-${idx}" data-desc="${taskDesc}">
          <label for="task-${idx}" style="cursor:pointer; font-size: 1rem;">${taskDesc}</label>
        </div>
        <div class="flex items-center" style="gap: 6px;">
          <input type="number" id="task-min-input-${idx}" min="1" max="60" value="${idx === 0 ? 2 : idx === 1 ? 5 : 10}" class="quick-switch-select" style="width: 55px; text-align: center; padding: 4px;">
          <span style="font-size: 0.9rem; color: var(--text-secondary);">min</span>
          <button class="btn task-play-btn" data-index="${idx}" style="padding: 4px 10px; font-size: 0.85rem; border-color: var(--accent); color: var(--accent); margin-left: 8px;">⏳ Load</button>
        </div>
      `;
      container.appendChild(item);
    });

    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('task-checkbox')) {
        const itemBlock = e.target.closest('.task-item');
        if (e.target.checked) {
          if(itemBlock) itemBlock.classList.add('completed');
          saveToHistoryLog(e.target.getAttribute('data-desc'));
        } else {
          if(itemBlock) itemBlock.classList.remove('completed');
        }
        updateProgressBar();
      }
    });
  }

  function updateProgressBar() {
    const total = document.querySelectorAll('.task-checkbox').length;
    if (total === 0) return;
    const checked = document.querySelectorAll('.task-checkbox:checked').length;
    const percent = Math.round((checked / total) * 100);
    const fillEl = document.getElementById('master-progress-fill');
    const dispEl = document.getElementById('goal-percent-display');
    if(fillEl) fillEl.style.width = `${percent}%`;
    if(dispEl) dispEl.textContent = `${percent}%`;
  }

  function saveToHistoryLog(taskDesc) {
    const history = JSON.parse(localStorage.getItem('tuktuk-history') || '[]');
    const now = new Date();
    const timestamp = `${now.toLocaleDateString()} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    history.unshift({ desc: taskDesc, time: timestamp });
    localStorage.setItem('tuktuk-history', JSON.stringify(history));
  }

  function renderHistoryLog() {
    const container = document.getElementById('history-log-container');
    if (!container) return;
    container.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('tuktuk-history') || '[]');
    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.style.cssText = "display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-color);";
      div.innerHTML = `<span>✅ ${item.desc}</span><small style="color:var(--text-secondary);">${item.time}</small>`;
      container.appendChild(div);
    });
  }

  function initCustomTimerFeatures() {
    const setBtn = document.getElementById('set-timer-btn');
    const display = document.getElementById('timer-display');
    
    if(setBtn) {
      setBtn.addEventListener('click', () => {
        const mVal = document.getElementById('timer-minutes') ? parseInt(document.getElementById('timer-minutes').value) || 0 : 25;
        totalTimerDuration = mVal * 60;
        timerTimeLeft = totalTimerDuration;
        if(display) display.textContent = `${mVal.toString().padStart(2, '0')}:00`;
      });
    }
  }

  initApp();
});