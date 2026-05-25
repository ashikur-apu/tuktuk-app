document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;

  // =====================================================================
  // 1. VIEW SWITCHING LOGIC
  // =====================================================================
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const viewSections = document.querySelectorAll('.view-section');

  function switchView(targetViewId) {
    viewSections.forEach(section => section.classList.add('hidden'));
    const target = document.getElementById(targetViewId);
    if (target) target.classList.remove('hidden');
    sidebarLinks.forEach(link => {
      if (link.getAttribute('data-view') === targetViewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      if (targetView) switchView(targetView);
    });
  });

  // =====================================================================
  // 2. GLOBAL QUICK-SWITCH PANEL (Top-Right Header)
  // =====================================================================
  const globalThemeSelect = document.getElementById('global-theme-select');
  const globalModeToggle = document.getElementById('global-mode-toggle');
  const homeThemeSelect = document.getElementById('home-theme-select');

  // Load saved preferences
  const savedTheme = localStorage.getItem('tuktuk-theme') || 'neutral';
  const savedMode = localStorage.getItem('tuktuk-mode') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  htmlEl.setAttribute('data-color-mode', savedMode);

  // Sync all theme selectors on load
  if (globalThemeSelect) globalThemeSelect.value = savedTheme;
  if (homeThemeSelect) homeThemeSelect.value = savedTheme;
  updateModeIcon(savedMode);

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('tuktuk-theme', theme);
    // Sync all theme selectors
    if (globalThemeSelect) globalThemeSelect.value = theme;
    if (homeThemeSelect) homeThemeSelect.value = theme;
    // Sync profile radios
    const radios = document.querySelectorAll('input[name="theme"]');
    radios.forEach(r => { r.checked = (r.value === theme); });
  }

  function toggleDarkMode() {
    const currentMode = htmlEl.getAttribute('data-color-mode');
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-color-mode', newMode);
    localStorage.setItem('tuktuk-mode', newMode);
    updateModeIcon(newMode);
  }

  function updateModeIcon(mode) {
    if (globalModeToggle) {
      globalModeToggle.textContent = mode === 'light' ? '🌙' : '☀️';
      globalModeToggle.title = mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  // Global header event listeners
  if (globalThemeSelect) {
    globalThemeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  }
  if (globalModeToggle) {
    globalModeToggle.addEventListener('click', toggleDarkMode);
  }
  if (homeThemeSelect) {
    homeThemeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  }

  // Home mode toggle
  const homeModeToggle = document.getElementById('home-mode-toggle');
  if (homeModeToggle) {
    homeModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Settings mode toggle
  const settingsModeToggle = document.getElementById('settings-mode-toggle');
  if (settingsModeToggle) {
    settingsModeToggle.addEventListener('click', toggleDarkMode);
  }

  // =====================================================================
  // 3. STATE MANAGEMENT
  // =====================================================================
  let state = JSON.parse(localStorage.getItem('tuktuk_state')) || {
    goals: [],
    history: [],
    focusPoints: 0,
    audioAlerts: true
  };

  function saveState() {
    localStorage.setItem('tuktuk_state', JSON.stringify(state));
    renderAll();
  }

  // =====================================================================
  // 4. GOALS LOGIC (Vision Board)
  // =====================================================================
  const addGoalBtn = document.getElementById('add-goal-btn');
  const activeGoalsGrid = document.getElementById('active-goals-grid');
  const achievedGoalsList = document.getElementById('achieved-goals-list');

  addGoalBtn.addEventListener('click', () => {
    const title = prompt("Enter your new long-term milestone:");
    if (title && title.trim()) {
      state.goals.push({ id: Date.now(), title, progress: 0 });
      saveState();
    }
  });

  function renderGoals() {
    activeGoalsGrid.innerHTML = '';
    achievedGoalsList.innerHTML = '';

    state.goals.forEach(goal => {
      const isAchieved = goal.progress >= 100;
      const card = document.createElement('div');
      card.className = 'card glass flex flex-col gap-sm';
      card.innerHTML = `
        <div class="flex justify-between items-center">
          <h4 class="text-heading m-0" style="font-size: 1.2rem;">${goal.title}</h4>
          ${!isAchieved ? `
            <div class="flex gap-sm">
              <button class="btn" style="padding: 0.2rem 0.6rem;" onclick="updateGoalProgress(${goal.id}, -10)">-</button>
              <button class="btn btn-accent" style="padding: 0.2rem 0.6rem;" onclick="updateGoalProgress(${goal.id}, 10)">+</button>
            </div>
          ` : '<span class="text-accent font-bold">Achieved</span>'}
        </div>
        <div class="flex items-center gap-sm mt-sm">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${goal.progress}%;"></div>
          </div>
          <span class="text-body text-secondary font-bold" style="min-width: 45px;">${goal.progress}%</span>
        </div>
      `;

      if (isAchieved) {
        achievedGoalsList.appendChild(card);
      } else {
        activeGoalsGrid.appendChild(card);
      }
    });

    if (activeGoalsGrid.innerHTML === '') {
      activeGoalsGrid.innerHTML = '<p class="text-secondary">No active goals. Add one to begin your journey.</p>';
    }
  }

  window.updateGoalProgress = function(id, change) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.progress = Math.max(0, Math.min(100, goal.progress + change));
      saveState();
    }
  };

  // =====================================================================
  // 5. ADVANCED TASKS & "SIMULATED AI" LOGIC
  // =====================================================================
  const simplifyBtn = document.getElementById('simplify-btn');
  const inputField = document.getElementById('big-goal-input');
  const logo = document.getElementById('tuktuk-logo');
  const tasksContainer = document.getElementById('tasks-container');
  const loadingPhrasesEl = document.getElementById('loading-phrases');
  const microtaskBlock = document.getElementById('microtask-block');
  const masterGoalTitle = document.getElementById('master-goal-title');
  const goalPercentDisplay = document.getElementById('goal-percent-display');
  const masterProgressFill = document.getElementById('master-progress-fill');

  // File Upload Logic
  const fileUploadInput = document.getElementById('file-upload-input');
  const attachedFilesList = document.getElementById('attached-files-list');
  let attachedFiles = [];

  fileUploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      attachedFiles.push(file);
      renderAttachedFiles();
    });
    fileUploadInput.value = ''; // reset for re-selection
  });

  function renderAttachedFiles() {
    attachedFilesList.innerHTML = '';
    attachedFiles.forEach((file, idx) => {
      const tag = document.createElement('span');
      tag.className = 'file-tag';
      tag.innerHTML = `
        📄 ${file.name.length > 18 ? file.name.substring(0, 15) + '...' : file.name}
        <button class="file-tag-remove" data-idx="${idx}" title="Remove">&times;</button>
      `;
      tag.querySelector('.file-tag-remove').addEventListener('click', () => {
        attachedFiles.splice(idx, 1);
        renderAttachedFiles();
      });
      attachedFilesList.appendChild(tag);
    });
  }

  // Voice Recording Logic (simulated using browser)
  const voiceRecordBtn = document.getElementById('voice-record-btn');
  const voiceIcon = document.getElementById('voice-icon');
  const voiceLabel = document.getElementById('voice-label');
  let isRecording = false;
  let mediaRecorder = null;
  let voiceTranscript = '';

  voiceRecordBtn.addEventListener('click', () => {
    if (!isRecording) {
      // Start recording simulation
      isRecording = true;
      voiceRecordBtn.classList.add('voice-recording-active');
      voiceIcon.textContent = '🔴';
      voiceLabel.textContent = 'Recording...';

      // Use Web Speech API for real-time speech recognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          voiceTranscript = event.results[0][0].transcript;
          inputField.value = voiceTranscript;
        };

        recognition.onerror = () => {
          // Fallback: just simulate
          voiceTranscript = 'Organize my project files and prepare the final presentation';
          inputField.value = voiceTranscript;
        };

        recognition.onend = () => {
          stopRecording();
        };

        recognition.start();
        // Auto-stop after 8 seconds
        setTimeout(() => {
          if (isRecording) {
            recognition.stop();
          }
        }, 8000);
      } else {
        // Fallback for browsers without Speech Recognition
        setTimeout(() => {
          voiceTranscript = 'Organize my project files and prepare the final presentation';
          inputField.value = voiceTranscript;
          stopRecording();
        }, 2000);
      }
    } else {
      stopRecording();
    }
  });

  function stopRecording() {
    isRecording = false;
    voiceRecordBtn.classList.remove('voice-recording-active');
    voiceIcon.textContent = '🎙️';
    voiceLabel.textContent = 'Voice Note';
  }

  // Keyword Map for AI Simulation
  const keywordMap = {
    "write": ["Draft the initial outline", "Write the first rough paragraph", "Edit for clarity and flow", "Finalize the conclusion"],
    "read": ["Skim the headings first", "Read the first 5 pages", "Take notes on key points", "Summarize each chapter"],
    "study": ["Review the syllabus", "Gather all materials", "Focus on one chapter", "Create flashcards", "Practice active recall"],
    "design": ["Sketch a wireframe", "Pick a color palette", "Design the hero section", "Create the navigation layout"],
    "code": ["Set up the project structure", "Write a basic test", "Implement the core function", "Refactor and clean up", "Add documentation"],
    "present": ["Outline the key slides", "Design the slide deck", "Practice the delivery", "Prepare for Q&A"],
    "organize": ["Sort all files into folders", "Create a priority list", "Schedule time blocks", "Remove duplicates and clutter"],
    "report": ["Gather data sources", "Draft the executive summary", "Create supporting charts", "Review and proofread"],
    "project": ["Define project scope", "Break into milestones", "Assign deadlines", "Track progress daily"],
    "email": ["Draft the subject line", "Write the core message", "Add call to action", "Proofread before sending"],
    "plan": ["Identify key objectives", "Map out the timeline", "Allocate resources", "Set checkpoints"],
    "default": ["Clarify the core objective", "Break the hardest part into two pieces", "Set a 25-minute focus block", "Organize workspace for flow", "Take a deep breath and begin"]
  };

  // SIMPLIFY & ACHIEVE ⚡ — Main Action
  simplifyBtn.addEventListener('click', () => {
    const goalText = inputField.value.trim();
    const hasFiles = attachedFiles.length > 0;

    if (!goalText && !hasFiles) return;

    // Determine the goal context
    let contextText = goalText;
    if (hasFiles && !goalText) {
      // Use filename as context
      contextText = attachedFiles.map(f => f.name.replace(/\.[^/.]+$/, '')).join(' ');
    }

    // --- LOADING STATE ---
    simplifyBtn.disabled = true;
    logo.classList.add('pulse-animation');

    loadingPhrasesEl.classList.remove('hidden');
    const phrases = [
      "Deconstructing the complexity...",
      "One step at a time, you've got this...",
      "Analyzing your objective...",
      "Mapping out the micro-steps...",
      "Preparing your focus plan..."
    ];
    let pIdx = 0;
    loadingPhrasesEl.innerText = phrases[pIdx];
    loadingPhrasesEl.style.opacity = 1;

    const interval = setInterval(() => {
      loadingPhrasesEl.style.opacity = 0;
      setTimeout(() => {
        pIdx = (pIdx + 1) % phrases.length;
        loadingPhrasesEl.innerText = phrases[pIdx];
        loadingPhrasesEl.style.opacity = 1;
      }, 200);
    }, 700);

    setTimeout(() => {
      clearInterval(interval);
      simplifyBtn.disabled = false;
      logo.classList.remove('pulse-animation');
      loadingPhrasesEl.classList.add('hidden');
      loadingPhrasesEl.innerText = '';

      generateMicroTasks(contextText);
      inputField.value = '';
      attachedFiles = [];
      renderAttachedFiles();
      voiceTranscript = '';
    }, 3000);
  });

  // --- TASK GENERATION ---
  let currentMicroTasks = [];

  function generateMicroTasks(goalText) {
    const textLower = goalText.toLowerCase();
    let available = [];

    for (const [key, tasks] of Object.entries(keywordMap)) {
      if (key !== "default" && textLower.includes(key)) {
        available.push(...tasks);
      }
    }

    if (available.length < 3) {
      available.push(...keywordMap.default);
    }

    // Shuffle and pick 3 to 5 unique tasks
    const num = Math.floor(Math.random() * 3) + 3;
    const shuffled = available.sort(() => 0.5 - Math.random());
    currentMicroTasks = shuffled.slice(0, num).map((text, i) => ({
      id: Date.now() + i,
      text: text,
      completed: false,
      timeH: 0,
      timeM: 25,
      timeS: 0
    }));

    // Show the micro-task block
    microtaskBlock.classList.remove('hidden');
    microtaskBlock.classList.remove('fade-out-vanish');
    masterGoalTitle.textContent = `Goal: "${goalText.length > 50 ? goalText.substring(0, 47) + '...' : goalText}"`;

    renderMicroTasks();
    updateGoalPercent();
  }

  function renderMicroTasks() {
    tasksContainer.innerHTML = '';

    currentMicroTasks.forEach((task, index) => {
      const div = document.createElement('div');
      div.className = `task-item ${task.completed ? 'completed' : ''}`;
      div.id = `task-item-${task.id}`;

      div.innerHTML = `
        <input type="checkbox" class="task-checkbox" id="check-${task.id}" ${task.completed ? 'checked disabled' : ''}>
        <span class="task-label-text">${task.text}</span>
        <div class="task-time-config" title="Allocated time (hh:mm:ss)">
          <input type="number" class="time-input" value="${String(task.timeH).padStart(2, '0')}" min="0" max="99" data-task-id="${task.id}" data-unit="h" ${task.completed ? 'disabled' : ''}>
          <span class="time-separator">:</span>
          <input type="number" class="time-input" value="${String(task.timeM).padStart(2, '0')}" min="0" max="59" data-task-id="${task.id}" data-unit="m" ${task.completed ? 'disabled' : ''}>
          <span class="time-separator">:</span>
          <input type="number" class="time-input" value="${String(task.timeS).padStart(2, '0')}" min="0" max="59" data-task-id="${task.id}" data-unit="s" ${task.completed ? 'disabled' : ''}>
        </div>
      `;

      // Checkbox logic
      const checkbox = div.querySelector('.task-checkbox');
      if (!task.completed) {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            task.completed = true;
            checkbox.disabled = true;
            div.classList.add('completed');

            // Animated strike line
            const labelEl = div.querySelector('.task-label-text');
            const strikeLine = document.createElement('div');
            strikeLine.className = 'strike-line';
            strikeLine.style.width = labelEl.offsetWidth + 'px';
            div.appendChild(strikeLine);

            setTimeout(() => {
              if (strikeLine.parentNode) strikeLine.remove();
            }, 600);

            // Log to history
            const date = new Date();
            state.history.unshift({
              text: task.text,
              time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: date.toLocaleDateString()
            });

            // Add points
            state.focusPoints += 10;
            saveState();

            // Update progress
            updateGoalPercent();
          }
        });
      }

      // Time input change listeners
      div.querySelectorAll('.time-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
          const tid = parseInt(e.target.dataset.taskId);
          const unit = e.target.dataset.unit;
          const val = Math.max(0, parseInt(e.target.value) || 0);
          const t = currentMicroTasks.find(t => t.id === tid);
          if (t) {
            if (unit === 'h') t.timeH = val;
            if (unit === 'm') t.timeM = Math.min(59, val);
            if (unit === 's') t.timeS = Math.min(59, val);
          }
        });
      });

      tasksContainer.appendChild(div);
    });
  }

  function updateGoalPercent() {
    if (currentMicroTasks.length === 0) {
      goalPercentDisplay.textContent = '0%';
      masterProgressFill.style.width = '0%';
      return;
    }

    const completed = currentMicroTasks.filter(t => t.completed).length;
    const total = currentMicroTasks.length;
    const percent = Math.round((completed / total) * 100);

    goalPercentDisplay.textContent = `${percent}%`;
    masterProgressFill.style.width = `${percent}%`;

    // === AUTOMATIC VANISH ROUTINE ===
    if (percent === 100) {
      // All tasks completed — trigger vanish after a brief celebration pause
      setTimeout(() => {
        microtaskBlock.classList.add('fade-out-vanish');

        // After animation completes, fully hide and reset
        setTimeout(() => {
          microtaskBlock.classList.add('hidden');
          microtaskBlock.classList.remove('fade-out-vanish');
          currentMicroTasks = [];
          tasksContainer.innerHTML = '';
          goalPercentDisplay.textContent = '0%';
          masterProgressFill.style.width = '0%';
          masterGoalTitle.textContent = 'The Micro-Task Checklist';
        }, 2000);
      }, 800);
    }
  }

  // =====================================================================
  // 6. CIRCULAR TIMER LOGIC
  // =====================================================================
  let timerInterval = null;
  const TOTAL_TIME = 25 * 60;
  let timeLeft = TOTAL_TIME;
  let isTimerRunning = false;

  const timerDisplay = document.getElementById('timer-display');
  const timerPath = document.getElementById('timer-path');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const CIRCUMFERENCE = 2 * Math.PI * 120; // r=120

  function updateTimerUI() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
    const offset = CIRCUMFERENCE - (timeLeft / TOTAL_TIME) * CIRCUMFERENCE;
    timerPath.style.strokeDashoffset = offset;
  }

  timerToggleBtn.addEventListener('click', () => {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerToggleBtn.innerText = "Start Focus";
    } else {
      isTimerRunning = true;
      timerToggleBtn.innerText = "Pause";
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerUI();
        } else {
          clearInterval(timerInterval);
          isTimerRunning = false;
          timerToggleBtn.innerText = "Start Focus";
          if (state.audioAlerts) {
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
              oscillator.connect(audioCtx.destination);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) { /* silent fail */ }
          }
        }
      }, 1000);
    }
  });

  timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = TOTAL_TIME;
    timerToggleBtn.innerText = "Start Focus";
    updateTimerUI();
  });

  // =====================================================================
  // 7. ANALYTICS, HISTORY, REWARDS RENDERING
  // =====================================================================
  function renderAll() {
    renderGoals();

    // History
    const historyContainer = document.getElementById('history-timeline');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      if (state.history.length === 0) {
        historyContainer.innerHTML = '<p class="text-secondary">No completed tasks yet. Go crush some goals!</p>';
      }
      state.history.forEach(item => {
        historyContainer.innerHTML += `
          <div style="position: relative; padding-bottom: 1.5rem;">
            <div style="position: absolute; left: -2.35rem; top: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg-primary);"></div>
            <p class="text-body m-0" style="font-size: 1.1rem;">${item.text}</p>
            <p class="text-secondary m-0" style="font-size: 0.85rem; font-weight: bold;">${item.date} at ${item.time}</p>
          </div>
        `;
      });
    }

    // Rewards
    const fpDisplay = document.getElementById('focus-points-display');
    if (fpDisplay) fpDisplay.innerText = state.focusPoints;

    // Analytics
    const streakEl = document.getElementById('stat-streak');
    const hoursEl = document.getElementById('stat-hours');
    if (streakEl) {
      streakEl.innerText = state.history.length > 0 ? 1 : 0;
      hoursEl.innerText = ((state.history.length * 10) / 60).toFixed(1);
    }

    // Weekly chart bars
    const weeklyChart = document.getElementById('weekly-chart');
    if (weeklyChart) {
      weeklyChart.innerHTML = '';
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date().getDay(); // 0=Sun
      dayNames.forEach((_, i) => {
        const bar = document.createElement('div');
        const dayIdx = (i + 1) % 7; // Mon=1...Sun=0
        const isToday = dayIdx === today;
        const h = isToday ? Math.min(state.history.length * 15, 140) : Math.floor(Math.random() * 30);
        bar.style.cssText = `flex:1; background: var(--accent); border-radius: 4px 4px 0 0; height: ${Math.max(h, 4)}px; opacity: ${isToday ? 1 : 0.35}; transition: height 0.5s ease;`;
        weeklyChart.appendChild(bar);
      });
    }
  }

  // =====================================================================
  // 8. SETTINGS & PROFILE
  // =====================================================================

  // Audio settings
  const audioToggle = document.getElementById('audio-toggle');
  if (audioToggle) {
    audioToggle.innerText = state.audioAlerts ? "🔊 Audio: On" : "🔈 Audio: Off";
    audioToggle.addEventListener('click', () => {
      state.audioAlerts = !state.audioAlerts;
      audioToggle.innerText = state.audioAlerts ? "🔊 Audio: On" : "🔈 Audio: Off";
      saveState();
    });
  }

  // Reset Data
  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        state = { goals: [], history: [], focusPoints: 0, audioAlerts: true };
        saveState();
        currentMicroTasks = [];
        tasksContainer.innerHTML = '';
        microtaskBlock.classList.add('hidden');
        goalPercentDisplay.textContent = '0%';
        masterProgressFill.style.width = '0%';
      }
    });
  }

  // Profile Theme Radios (sync with global)
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(radio => {
    if (radio.value === savedTheme) radio.checked = true;
    radio.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
  });

  // =====================================================================
  // INITIALIZE
  // =====================================================================
  updateTimerUI();
  renderAll();
});
